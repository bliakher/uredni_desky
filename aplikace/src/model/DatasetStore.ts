import { QueryResponse, BulletinData } from './dataset';
import { fetchAllBulletins, fetchOrganizationTypes, fetchOrganizationTypesByParts,
     fetchBulletinByIri, fetchAddressPointsByIris, fetchAllOrganizationTypes } from '../services/query';
import type { PointMap } from '../services/query';
import { Provider, ProviderTypeCountMap, ProviderTypeLabelMap } from './Provider';

/**
 * Class that retrieves an stores data from bulletin datasets
 */
export class DatasetStore {
    isLoaded: boolean;
    metadata: Array<QueryResponse>;
    data: Array<BulletinData>;

    constructor() {
        this.isLoaded = false;
        this.metadata = [];
        this.data = [];
    }
    /**
     * Fetch all datasets
     */
    async fetchDatasets(): Promise<void> {
        this.metadata = await fetchAllBulletins();
        this.data = this.metadata.map((dataset) => new BulletinData(dataset));
        this.isLoaded = true;
    }
    /**
     * Fetch distributions of all stored bulletin datasets
     * @returns 
     */
    async fetchAllDistibutions(): Promise<void> {
        if (!this.isLoaded) {
            return; 
        }
        await Promise.all(this.data.map(d => d.fetchDistribution()));
    }
    /**
     * Get all fetched bulletin datasets
     * @returns bulletins
     */
    getDatasets(): Array<BulletinData> {
        return this.data;
    }

    private getIcoList(): Array<string> {
        var icoList: string[] = this.data.map(bulletin => {
            var distribution = bulletin.getDistribution();
            if (distribution == null) {
                return this.getIcoFromIri(bulletin);
            }
            var publisher = distribution.getPublisher();
            if (publisher) {
                if (publisher.ičo) return publisher.ičo;
                if (publisher.identifikátor_ovm) {
                    return publisher.identifikátor_ovm;
                }
            }
            console.log(bulletin.iri);
            return "";
        });
        return icoList.filter(ico => ico != "");
    }

    private getIcoListFromIri(): Array<string> {
        var result = this.data.map(bulletin => {
            return this.getIcoFromIri(bulletin);
        });
        return result;
    }

    private getIcoFromIri(bulletin: BulletinData): string {
        return bulletin.provider.iri.substr("https://rpp-opendata.egon.gov.cz/odrpp/zdroj/orgán-veřejné-moci/".length, 8);
    }

    private getResidenceIriList(): Array<string> {
        var iris = this.data.map(bulletin => bulletin.provider.residenceIri);
        var filtered = iris.filter(iri => iri !== "");
        var unique = new Set(filtered);
        return Array.from(unique);
    }

    /**
     * Fetch information about providers such as provider type and residence adress
     */
    async fetchProviderInfo() {
        var infoMap = await fetchOrganizationTypesByParts(this.getIcoListFromIri());
        for (var bulletin of this.data) {
            var ico = this.getIcoFromIri(bulletin);
            var providerInfo = infoMap.get(ico);
            var typeNumber = providerInfo ? providerInfo.typeNumber : "";
            bulletin.provider.typeNumber = typeNumber;
            var type = Provider.getProviderType(typeNumber);
            bulletin.provider.type = type;
            bulletin.provider.residenceIri = providerInfo ? providerInfo.residenceIri : "";
        }
    }

    /**
     * Fetch all coordinates of provider residences from address point IRIs
     */
    async fetchProviderResidences() {
        var pointMap = await fetchAddressPointsByIris(this.getResidenceIriList());
        if (pointMap !== null) {
            this.asignProviderResidences(pointMap);
        }
    }

    private asignProviderResidences(pointmap: PointMap) {
        for (var bulletin of this.data) {
            var iri = bulletin.provider.residenceIri;
            var residencePoint = pointmap.get(iri);
            if (residencePoint) {
                bulletin.provider.residence = residencePoint;
            }
        }
    }

    /**
     * Filter inner providers (the ones written inside bulletin distribution) by type 
     * and count how many there are in each type
     * @returns counts of types of bulletin providers
     */
    async filterInnerProvidersByType(): Promise<ProviderTypeCountMap> {
        // console.log("start filter");
        var ico = this.getIcoList();
        // console.log(ico);
        var providerInfo = await fetchOrganizationTypesByParts(ico);
        var typeToCount = new Map<string, number>();
        providerInfo.forEach((orgInfo, key) => {
            // if (orgInfo.typeNumber === "") console.log(orgInfo.name, key);
            var curCount = typeToCount.get(orgInfo.typeNumber);
            var newCount = curCount ? curCount + 1 : 1;
            typeToCount.set(orgInfo.typeNumber, newCount);
        });
        return typeToCount;
    }
    /**
     * Get counts of all organizations in each type, not only bulletin providers
     * @returns counts and labels of all organizations
     */
    async getAllProviderTypes(): Promise<{ labels: ProviderTypeLabelMap, counts: ProviderTypeCountMap } | null> {
        return await fetchAllOrganizationTypes();
    }

    /**
     * Fetch specific bulletin based on its IRI
     * @param iri IRI of bulletin dataset
     * @returns fetched bulletin
     */
    static async getBulletinByIri(iri: string): Promise<BulletinData | null> {
        var data = await fetchBulletinByIri(iri); // QueryResponse but without iri
        if (data == null) return null;
        var dataWithIri: QueryResponse = { // add iri
            dataset: { value: iri },
            name: data.name,
            description: data.description,
            provider: data.provider,
            provider_iri: data.provider_iri,
            source: data.source
        }
        return new BulletinData(dataWithIri);
    }
}

