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
    isLoaded: boolean;
    distribution: BulletinStandard | null; 
    infoRecords: Array<InfoRecord> | null;

    constructor(dataset: BulletinMetadata) {
        this.provider = dataset.poskytovatel.value;
        this.source = dataset.zdroj.value;
        this.isLoaded = false;
        this.distribution = null;
        this.infoRecords = null;
    }

    async fetchDistribution(): Promise<BulletinStandard> {
        const response = await fetch(this.source);
        return await response.json();
    }

    async getDistribution(): Promise<BulletinStandard> {
        if (this.distribution == null) {
            this.distribution = await this.fetchDistribution();
        }
        return this.distribution;
    }

    async getInfoRecords(): Promise<Array<InfoRecord>> {
        if (this.infoRecords == null) {
            var distribution = await this.getDistribution();
            this.infoRecords = distribution.informace.map(info => new InfoRecord(info));
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
    }

    getDatasets(): Array<BulletinData> {
        return this.data;
    }
}

export { Datasets, BulletinData, InfoRecord };