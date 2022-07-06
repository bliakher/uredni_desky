
/* Wrapper for information in bulletin board dataset
*/
export class InfoRecord {
    private data: any; // inner data object
    private recommendedProperties = ["typ", "iri", "url", "název", "vyvěšení", "relevantní_do"];

    constructor(info: any) {
        this.data = info;
    }
    static compare(a: InfoRecord, b: InfoRecord): number {
        var aDate = a.getDateIssued() ?? new TimeMoment(null);
        var bDate = b.getDateIssued() ?? new TimeMoment(null);
        return TimeMoment.compare(aDate, bDate);
    }

    private hasProperty(propertyName: string): boolean {
        return this.data.hasOwnProperty(propertyName);
    }
    private getProperty(propertyName: string): any | null {
        if (this.hasProperty(propertyName)) {
            return this.data[propertyName];
        }
        return null;
    }
    private getDate(dateProperty: string): TimeMoment | null {
        var dateObj = this.getProperty(dateProperty);
        if (dateObj) {
            if (dateObj.hasOwnProperty("nespecifikovaný") && dateObj["nespecifikovaný"] == true) {
                return new TimeMoment(null);
            }
            if (dateObj.hasOwnProperty("datum_a_čas")) {
                return new TimeMoment(new Date(dateObj["datum_a_čas"]));
            }
            return new TimeMoment(new Date(dateObj["datum"]));
        }
        return null;
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
    getDateIssued(): TimeMoment | null {
        return this.getDate("vyvěšení");
    }
    getDateValidTo(): TimeMoment | null {
        return this.getDate("relevantní_do");
    }
    private getDocumentObjects(): Array<any> {
        return this.getProperty("dokument") ?? [];
    }
    getDocuments(): Array<Document> {
        var documents: Array<any> = this.getDocumentObjects();
        return documents.map((document) => new Document(document));
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
        if (this.specified && this.date !== null) {
            return this.date.toLocaleDateString('cs-CZ');
        }
        return "nespecifikováno";
    }
    static compare(a: TimeMoment, b: TimeMoment): number {
        if (a.date === null && b.date === null) {
            return 0;
        } else if (a.date === null) {
            return -1;
        } else if (b.date === null) {
            return 1;
        } else if (a.date === b.date) {
            return 0;
        } else if (a.date > b.date) {
            return 1;
        } else {
            return -1;
        }
    }
}

export class Document {
    data: any;
    constructor(documentObj: any) {
        this.data = documentObj
    }
    private hasProperty(propertyName: string): boolean {
        return this.data.hasOwnProperty(propertyName);
    }
    private getProperty(propertyName: string): any | null {
        if (this.hasProperty(propertyName)) {
            return this.data[propertyName];
        }
        return null;
    }
    getName(): string | null {
        var nameObj = this.getProperty("název");
        return nameObj?.cs ?? null;
    }
    getUrl(): string | null {
        var url = this.getProperty("url");
        return url;
    }
}
