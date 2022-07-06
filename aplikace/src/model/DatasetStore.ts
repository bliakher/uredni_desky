import { QueryResponse, BulletinData } from './dataset';
import { fetchAllBulletins, fetchOrganizationTypes, fetchBulletinByIri, fetchAddressPointsByIris, fetchAllOrganizationTypes } from './query';
import type { PointMap } from './query';
import { Provider, ProviderTypeCountMap, ProviderTypeLabelMap } from './Provider';

/* Wrapper for all bulletin datasets
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

    async fetchDatasets(): Promise<void> {
        this.metadata = await fetchAllBulletins();
        this.data = this.metadata.map((dataset) => new BulletinData(dataset));
        this.isLoaded = true;
    }

    async fetchAllDistibutions(): Promise<void> {
        if (!this.isLoaded) {
            return; // ToDo: error?
        }
        await Promise.all(this.data.map(d => d.fetchDistribution()));
    }

    getDatasets(): Array<BulletinData> {
        return this.data;
    }

    getIcoList(): Array<string> {
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

    getIcoListFromIri(): Array<string> {
        var result = this.data.map(bulletin => {
            return this.getIcoFromIri(bulletin);
        });
        return result;
    }

    getIcoFromIri(bulletin: BulletinData): string {
        return bulletin.provider.iri.substr("https://rpp-opendata.egon.gov.cz/odrpp/zdroj/orgán-veřejné-moci/".length, 8);
    }

    getResidenceIriList(): Array<string> {
        var iris = this.data.map(bulletin => bulletin.provider.residenceIri);
        var filtered = iris.filter(iri => iri !== "");
        var unique = new Set(filtered);
        return Array.from(unique);
    }

    async fetchProviderInfo() {
        var infoMap = await fetchOrganizationTypes(this.getIcoListFromIri());
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

    async fetchProviderResidences() {
        var pointMap = await fetchAddressPointsByIris(this.getResidenceIriList());
        if (pointMap !== null) {
            this.asignProviderResidences(pointMap);
        }
    }

    asignProviderResidences(pointmap: PointMap) {
        for (var bulletin of this.data) {
            var iri = bulletin.provider.residenceIri;
            var residencePoint = pointmap.get(iri);
            if (residencePoint) {
                bulletin.provider.residence = residencePoint;
            }
        }
    }

    getProviders(): Map<string, Provider> {
        var result = new Map<string, Provider>();
        for (var bulletin of this.data) {
            result.set(bulletin.provider.iri, bulletin.provider);
        }
        return result;
    }

    async filterInnerProvidersByType(): Promise<ProviderTypeCountMap> {
        console.log("start filter");
        var ico = this.getIcoList();
        // console.log(ico);
        var providerInfo = await fetchOrganizationTypes(ico);
        var typeToCount = new Map<string, number>();
        providerInfo.forEach((orgInfo, key) => {
            // if (orgInfo.typeNumber === "") console.log(orgInfo.name, key);
            var curCount = typeToCount.get(orgInfo.typeNumber);
            var newCount = curCount ? curCount + 1 : 1;
            typeToCount.set(orgInfo.typeNumber, newCount);
        });
        return typeToCount;
    }
    async getAllProviderTypes(): Promise<{ labels: ProviderTypeLabelMap, counts: ProviderTypeCountMap } | null> {
        return await fetchAllOrganizationTypes();
    }

    static async getBulletinByIri(iri: string): Promise<BulletinData | null> {
        var data = await fetchBulletinByIri(iri); // BulletinMetadata but without iri
        if (data == null || data.length == 0) return null;
        var dataWithIri: QueryResponse = { // add iri
            dataset: { value: iri },
            name: data[0].name,
            description: data[0].description,
            provider: data[0].provider,
            provider_iri: data[0].provider_iri,
            source: data[0].source
        }
        return new BulletinData(dataWithIri);
    }
}

