import { InfoRecord } from './InfoRecord';
import { Provider, ProviderType } from './Provider';

/**
 * Interface representing metadata of a dataset in NDC
 * Data we get as a respense from a SPARQL query to NDC
 */
export interface QueryResponse {
    /** Dataset IRI */
    dataset: { value: string };
    /** Dataset name */
    name: { value: string };
    /** Dataset description */
    description: { value: string };
    /** Dataset provider name */
    provider: { value: string };
    /** Dataset provider IRI */
    provider_iri: { value: string };
    /** Download URL of dataset distribution */
    source: { value: string };
}

/**
 * Missing recommended properties of bulletin distribution
 */
export interface MissingProperties {

    /** Missing recommended properties of the whole bulletin */
    bulletin: Array<string>;
    /** Missing recommended properties of information on the bulletin */
    information: Array<{ info: InfoRecord, missing: Array<string> }>
}

/**
 * Wrapper class for bulletin board dataset
 */
export class BulletinData {
    /** Bulletin dataset IRI */
    iri: string;
    /** Bulletin dataset name */
    name: string;
    /** Bulletin dataset provider */
    provider: Provider;
    /** Download URL of dataset distribution */
    source: string;
    /** Indicator that the distribtion is downloadable */
    hasValidSource: boolean;
    /** Error from distribution download */
    loadError: Error;
    private distribution: BulletinDistribution | null;
    private infoRecords: Array<InfoRecord>;
    private infoRecordsLoaded: boolean;

    constructor(dataset: QueryResponse) {
        this.iri = dataset.dataset.value;
        this.name = dataset.name.value;
        this.provider = new Provider(dataset.provider.value, dataset.provider_iri.value, ProviderType.Unknown, "", "");
        this.source = dataset.source.value;
        this.hasValidSource = true;
        this.loadError = new Error();
        this.infoRecordsLoaded = false;
        this.distribution = null;
        this.infoRecords = [];
    }

    
    /** Fetch distribution from source
     * @param  {number} timeOut? Optional timeout of request, default value set to 50s
     * @returns Promise<void>
     */
    async fetchDistribution(timeOut?: number): Promise<void> {
        const controller = new AbortController();
        const timeOutId = setTimeout(() => controller.abort(), timeOut ? timeOut : 50000); // if timeout not specified set to 50s
        try {
            const response = await fetch(this.source, { signal: controller.signal });
            clearTimeout(timeOutId);
            var distributionObj = await response.json();
            this.distribution = new BulletinDistribution(distributionObj);
        }
        catch (error: any) {
            if (controller.signal.aborted) console.log("aborted fetch on timeout: ", this.source);
            this.hasValidSource = false;
            this.loadError = error;
        }
    }
    /** Get distribution
     * fetchDistribution should be called before calling this
     * @returns BulletinDistribution distribution, if it is fetched, otherwise null
     */
    getDistribution(): BulletinDistribution | null {
        return this.distribution;
    }

    /** Returns a list of information records from the bulletin
     * fetchDistribution should be called before calling this
     * @returns Array
     */
    getInfoRecords(): Array<InfoRecord> | null {
        if (this.distribution == null) {
            return null;
        }

        if (!this.infoRecordsLoaded) {
            var information = this.distribution.getInformation();
            if (information) {
                this.infoRecords = information.map(info => new InfoRecord(info));
            }
            this.infoRecordsLoaded = true;
        }
        return this.infoRecords;
    }
    
    /** Check if bulletin has all recommended properties
     * fetchDistribution should be called before calling this
     * @returns MissingProperties missing recommended properties
     */
    checkRecommendedProperties(): MissingProperties {
        var missingPropInfo = [];
        var infoRecords = this.getInfoRecords();
        if (infoRecords) {
            for (var record of infoRecords) {
                var recordMissing = record.getMissingRecommendedProperties();
                if (recordMissing.length > 0) {
                    missingPropInfo.push({ info: record, missing: recordMissing });
                }
            }
        }
        var missingPropBulletin = this.distribution != null ? this.distribution.getMissingRecommendedProperties() : [];
        return { bulletin: missingPropBulletin, information: missingPropInfo };

    }
}

/**
 * Class representing the bulletin board distribution with parameters according to the OFN
 */
class BulletinDistribution {
    private recommendedProperties = ["@context", "typ", "iri", "stránka", "provozovatel"];
    constructor(
        private data: any // inner data object
    ) {
    }
    private hasProperty(propertyName: string): boolean {
        return this.data.hasOwnProperty(propertyName);
    }
    private getProperty(propertyName: string): any | undefined {
        if (this.hasProperty(propertyName)) {
            return this.data[propertyName];
        }
        return undefined;
    }
    getIri(): string | undefined {
        return this.getProperty("iri");
    }
    getPageUrl(): string | undefined {
        const page = "stránka";
        return this.getProperty(page);
    }
    getPublisher(): { ičo: string, identifikátor_ovm: string } | undefined {
        const publisher = "provozovatel";
        return this.getProperty(publisher);

    }
    getInformation(): Array<any> | undefined {
        const info = "informace";
        return this.getProperty(info);
    }
    getMissingRecommendedProperties(): Array<string> {
        var missing: string[] = [];
        for (var property of this.recommendedProperties) {
            if (!this.hasProperty(property)) {
                missing.push(property);
            }
        }
        return missing;
    }

}

