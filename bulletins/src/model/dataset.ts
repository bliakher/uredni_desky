import  query  from "./query";

var nkod_sparql = "https://data.gov.cz/sparql";

/* Metadata of a bulletin dataset in NKOD
*/
interface BulletinMetadata {
    název: {value: string};
    popis: {value: string};
    poskytovatel: {value: string};
    zdroj: {value: string};
}

/* OFN standard for bulletin boards - essential data
*/
interface BulletinStandard {
    iri: string;
    stránka: string;
    provozovatel: { ičo: string};
    informace: Array<InfoStandard>;
}

/* Standard for information on bulletin board - essential data
*/
interface InfoStandard {
    typ: Array<string>;
    iri: string;
    url: string;
    název: { cs: string };
    vyvěšení: { datum: string };
    relevantní_do: { datum: string };
}

/* Wrapper for bulletin board dataset
*/
class BulletinData {
    provider: string;
    source: string;
    hasValidSource: boolean;
    loadError: any;
    infoRecordsLoaded: boolean;
    distribution: BulletinStandard | null; 
    infoRecords: Array<InfoRecord>;

    constructor(dataset: BulletinMetadata) {
        this.provider = dataset.poskytovatel.value;
        this.source = dataset.zdroj.value;
        this.hasValidSource = true;
        this.loadError = "";
        this.infoRecordsLoaded = false;
        this.distribution = null;
        this.infoRecords = [];
    }

    async fetchDistribution(): Promise<void> {
        try {
            const response = await fetch(this.source);
            this.distribution = await response.json();
        }
        catch (error) {
            this.hasValidSource = false;
            this.loadError = error
        } 
    }

    getDistribution(): BulletinStandard | null {
        return this.distribution;
    }

    getInfoRecords(): Array<InfoRecord> | false {
        if (this.distribution == null) {
            return false;
        } 

        if (!this.infoRecordsLoaded) {
            if (this.distribution.informace) {
                this.infoRecords = this.distribution.informace.map(info => new InfoRecord(info));
            }
            this.infoRecordsLoaded = true;
        }
        return this.infoRecords;
    }
}

/* Wrapper for information in bulletin board dataset
*/
class InfoRecord {
    name: string;
    issued: Date;
    valid_to: Date;
    info: InfoStandard;

    constructor(info: InfoStandard) {
        this.info = info;
        this.name = info.název.cs;
        this.issued = new Date(info.vyvěšení.datum);
        this.valid_to = new Date(info.relevantní_do.datum);
    }
}

/* Wrapper for all bulletin datasets
*/
class Datasets {
    isLoaded: boolean;
    metadata: Array<BulletinMetadata>;
    data: Array<BulletinData>;

    constructor() {
        this.isLoaded = false;
        this.metadata = [];
        this.data = [];
    }

    async fetchDatasets(): Promise<void> {
        const response = await fetch(nkod_sparql, {
            "headers": {
                "accept": "application/json",
                "content-type": "application/sparql-query",
            },
            "body": query,
            "method": "POST",
        });
        this.metadata = (await response.json()).results.bindings; // Todo: type?
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
}

export { Datasets, BulletinData, InfoRecord };