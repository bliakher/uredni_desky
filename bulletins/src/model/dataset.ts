import  { fetchAllBulletins, fetchOrganizationTypes, fetchBulletinByIri }  from "./query";


/* Metadata of a bulletin dataset in NKOD
*/
interface BulletinMetadata {
    dataset: {value: string};
    name: {value: string};
    description: {value: string};
    provider: {value: string};
    provider_iri : {value: string};
    source: {value: string};
}

/* Class representing the bulletin board distribution 
* with parameters according to the OFN
*/
class BulletinDistribution {
    private data: any; // inner data object
    private recommendedProperties = ["@context", "typ", "iri", "stránka", "provozovatel"];
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

interface MissingProperties {
    bulletin: Array<string>;
    information: Array<{name:string, missing: Array<string>}>
}

/* Wrapper for bulletin board dataset
*/
class BulletinData {
    iri: string;
    name: string;
    provider: string;
    providerIri: string;
    source: string;
    hasValidSource: boolean;
    loadError: any;
    infoRecordsLoaded: boolean;
    distribution: BulletinDistribution | null; 
    infoRecords: Array<InfoRecord>;

    constructor(dataset: BulletinMetadata) {
        this.iri = dataset.dataset.value;
        this.name = dataset.name.value;
        this.provider = dataset.provider.value;
        this.providerIri = dataset.provider_iri.value;
        this.source = dataset.source.value;
        this.hasValidSource = true;
        this.loadError = null;
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
                    var name = record.getName()
                    if (!name) {
                        name = "";
                    }
                    missingPropInfo.push({ name: name, missing: recordMissing });
                }
            }
        }
        var missingPropBulletin = this.distribution != null ? this.distribution.getMissingRecommendedProperties() : [];
        return {bulletin: missingPropBulletin, information: missingPropInfo};

    }
}

interface Document {
    typ: string;
    název: {cs: string}
    url: string;
}

class TimeMoment {
    specified: boolean;
    date: Date | null;
    constructor(date: Date | null) {
        if (date == null) {
            this.specified = false;
            this.date = null;
        } else {
            this.specified = true;
            this.date = date;
        }
    }
    to_string(): string {
        if (this.specified && this.date != null) {
            return this.date.toLocaleDateString("cs-CZ");
        }
        return "nespecifikováno";
    }
}

/* Wrapper for information in bulletin board dataset
*/
class InfoRecord {
    private data: any; // inner data object
    private recommendedProperties = ["typ", "iri", "url", "název", "vyvěšení", "relevantní_do"];

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
    private getDate(dateProperty: string): TimeMoment | false { // ToDo: add nespecifikovany
        var dateObj = this.getProperty(dateProperty);
        if (dateObj) {
            if (dateObj.hasOwnProperty("nespecifikovaný") && dateObj["nespecifikovaný"] == true) {
                return new TimeMoment(null);
            }
            return new TimeMoment(new Date(dateObj.datum));
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
    getDateIssued(): TimeMoment | false {
        return this.getDate("vyvěšení");
    }
    getDateValidTo(): TimeMoment | false {
        return this.getDate("relevantní_do");
    }
    // returns array of missing recommended properties
    getMissingRecommendedProperties(): Array<string> {
        var missing: Array<string> = [];
        for (var property of this.recommendedProperties) {
            if (!this.hasProperty(property)) {
                missing.push(property);
            }
        }
        return missing;
    }

}

interface SortedBulletins {
    all: BulletinData[],
    cities: BulletinData[];
    cityParts: BulletinData[];
    regions: BulletinData[];
    government: BulletinData[];
    other: BulletinData[];
}

/* Wrapper for all bulletin datasets
*/
class Datasets {
    isLoaded: boolean;
    metadata: Array<BulletinMetadata>;
    data: Array<BulletinData>;
    dataCategories: SortedBulletins;

    constructor() {
        this.isLoaded = false;
        this.metadata = [];
        this.data = [];
        this.dataCategories = {all: [],cities: [], cityParts: [],regions: [], government: [], other: [] };
    }

    async fetchDatasets(): Promise<void> {
        this.metadata = await fetchAllBulletins();
        this.data = this.metadata.map((dataset) => new BulletinData(dataset));
        this.dataCategories.all = this.data;
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
        var icoList : string[] = this.data.map(bulletin => {
            var distribution = bulletin.getDistribution();
            if (distribution == null) return "";
            var publisher = distribution.getPublisher();
            return publisher ? publisher.ičo : "";
        });
        return icoList.filter(ico => ico != "");
    }

    async sortBulletinsByProviderType() {
        var typeMap = await fetchOrganizationTypes(this.getIcoList());
        var cities: BulletinData[] = [];
        var cityParts: BulletinData[] = [];
        var regions: BulletinData[]  = [];
        var stateOrganizations: BulletinData[]  = [];
        var other: BulletinData[]  = [];
        for (var bulletin of this.data) {
            var distribution = bulletin.getDistribution();
            if (distribution == null) {
                other.push(bulletin);
                continue;
            }
            var publisher = distribution.getPublisher();
            if (!publisher) {
                other.push(bulletin);
                continue;
            }
            var ico = publisher.ičo;
            var type = typeMap.get(ico);
            var category = other;
            if (type == "801") {
                category = cities;
            }
            if (type == "811") {
                category = cityParts;
            }
            if (type == "804") {
                category = regions;
            }
            if (type == "325") {
                category = stateOrganizations;
            }
            category.push(bulletin);
        }
        this.dataCategories = {all: this.data, cities, cityParts, regions, government: stateOrganizations, other };
    }
}

async function getBulletinByIri(iri: string): Promise<BulletinData | null> {
    var data = await fetchBulletinByIri(iri); // BulletinMetadata but without iri
    if (data == null) return null;
    var dataWithIri: BulletinMetadata = { // add iri
        dataset: {value: iri},
        name: data[0].name,
        description: data[0].description,
        provider: data[0].provider,
        provider_iri : data[0].provider_iri,
        source: data[0].source
    }
    return new BulletinData(dataWithIri);
}

export type { SortedBulletins, MissingProperties };
export { Datasets, BulletinData, InfoRecord, getBulletinByIri };