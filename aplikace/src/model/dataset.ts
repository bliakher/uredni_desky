import { InfoRecord } from './InfoRecord';
import { Provider, ProviderType } from './Provider';

/* Metadata of a bulletin dataset in NKOD
*/
export interface QueryResponse {
    dataset: { value: string };
    name: { value: string };
    description: { value: string };
    provider: { value: string };
    provider_iri: { value: string };
    source: { value: string };
}


export interface MissingProperties {
    bulletin: Array<string>;
    information: Array<{ info: InfoRecord, missing: Array<string> }>
}

/* Wrapper for bulletin board dataset
*/
export class BulletinData {
    iri: string;
    name: string;
    provider: Provider;
    source: string;
    hasValidSource: boolean;
    loadError: Error;
    infoRecordsLoaded: boolean;
    distribution: BulletinDistribution | null;
    infoRecords: Array<InfoRecord>;

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

    getDistribution(): BulletinDistribution | null {
        return this.distribution;
    }
    // fetchDistribution() should be called before calling this
    getInfoRecords(): Array<InfoRecord> | false {
        if (this.distribution == null) {
            return false;
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
    // fetchDistribution() should be called before calling this
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

/* Class representing the bulletin board distribution 
* with parameters according to the OFN
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
    getInformation(): Array<any> | undefined { // ToDo: type
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

