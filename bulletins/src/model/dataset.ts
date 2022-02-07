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

/* Class representing the bulletin board distribution 
* with parameters according to the OFN
*/
class BulletinDistribution {
    private data: any; // inner data object
    constructor(data: any) {
        this.data = data;
    }
    private hasProperty(propertyName: string): boolean {
        return this.data.hasOwnProperty(propertyName);
    }
    private getProperty(propertyName: string): any | false {
        if (this.hasProperty(propertyName)) {
            return this.data[propertyName];
        }
        return false;
    }
    getIri(): string | false {
        return this.getProperty("iri");
    }
    getPageUrl(): string | false {
        const page = "stránka";
        return this.getProperty(page);
    }
    getPublisher(): { ičo: string} | false {
        const publisher = "provozovatel";
        return this.getProperty(publisher);
        
    }
    getInformation(): Array<any> | false { // ToDo: type
        const info = "informace";
        return this.getProperty(info);
    }
    
}

/* Wrapper for bulletin board dataset
*/
class BulletinData {
    provider: string;
    source: string;
    hasValidSource: boolean;
    loadError: any;
    infoRecordsLoaded: boolean;
    distribution: BulletinDistribution | null; 
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
            var distributionObj = await response.json();
            this.distribution = new BulletinDistribution(distributionObj);
        }
        catch (error) {
            this.hasValidSource = false;
            this.loadError = error
        } 
    }

    getDistribution(): BulletinDistribution | null {
        return this.distribution;
    }

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
}

interface Document {
    typ: string;
    název: {cs: string}
    url: string;
}

/* Wrapper for information in bulletin board dataset
*/
class InfoRecord {
    private data: any; // inner data object

    constructor(info: any) {
        this.data = info;
    }
    private hasProperty(propertyName: string): boolean {
        return this.data.hasOwnProperty(propertyName);
    }
    private getProperty(propertyName: string): any | false {
        if (this.hasProperty(propertyName)) {
            return this.data[propertyName];
        }
        return false;
    }
    private getDate(dateProperty: string): Date | false { // ToDo: add nespecifikovany
        var dateObj = this.getProperty(dateProperty);
        if (dateObj) {
            return new Date(dateObj.datum);
        }
        return false;
    }
    getName(): string | false {
        const nameProp = "název";
        var name = this.getProperty(nameProp);
        if (name) {
            return name.cs;
        }
        return false;
    }
    getUrl(): string | false {
        return this.getProperty("url");
    }
    getDateIssued(): Date | false {
        return this.getDate("vyvěšení");
    }
    getDateValidTo(): Date | false {
        return this.getDate("relevantní_do");
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