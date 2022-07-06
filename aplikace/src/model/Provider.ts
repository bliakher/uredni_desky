import { Point } from './query';
import { BulletinData } from './dataset';

export enum ProviderType {
    Unknown, City, CityPart, Region, Government, Error,
}

export class Provider {
    name: string;
    iri: string;
    type: ProviderType;
    typeNumber: string;
    residence: Point;
    residenceIri: string
    constructor(name: string, iri: string, type: ProviderType, typeNum: string, residenceIri: string) {
        this.name = name;
        this.iri = iri;
        this.type = type;
        this.typeNumber = typeNum;
        this.residenceIri = residenceIri;
        this.residence = { X: -1, Y: -1 };
    }

    static getProviderType(typeCode: string): ProviderType {
        var result = ProviderType.Unknown;
        if (typeCode === CITY_CODE) {
            result = ProviderType.City;
        }
        else if (typeCode === CITY_PART_CODE) {
            result = ProviderType.CityPart;
        }
        else if (typeCode === REGION_CODE) {
            result = ProviderType.Region;
        }
        else if (typeCode === GOVERNMENT_CODE) {
            result = ProviderType.Government;
        }
        else {
            result = ProviderType.Unknown;
        }
        return result;
    }
}

export type ProviderTypeCountMap = Map<string, number>;
export type ProviderTypeLabelMap = Map<string, string>;

export const CITY_CODE = "801";
export const CITY_PART_CODE = "811";
export const REGION_CODE = "804";
export const GOVERNMENT_CODE = "325";

export class SortedProviders {
    providers: Map<string, Provider>;
    providerBulletins: Map<string, Array<BulletinData>>;
    constructor(bulletins: BulletinData[]) {
        this.providers = new Map();
        this.providerBulletins = new Map();
        this.sortBulletinsByProviders(bulletins);
    }
    sortBulletinsByProviders(bulletins: BulletinData[]) {
        for (var bulletin of bulletins) {
            var iri = bulletin.provider.iri;
            this.providers.set(iri, bulletin.provider);
            var curBulletins = this.providerBulletins.get(iri);
            if (curBulletins) {
                curBulletins.push(bulletin);
                this.providerBulletins.set(iri, curBulletins);
            } else {
                this.providerBulletins.set(iri, [bulletin]);
            }
        }
    }
    getProviderIris(): IterableIterator<string> {
        return this.providers.keys();
    }
    getProvider(providerIri: string): Provider | null {
        var provider = this.providers.get(providerIri);
        return provider || null;
    }
    getProviderBulletins(providerIri: string): BulletinData[] | null {
        var bulletins = this.providerBulletins.get(providerIri);
        return bulletins || null;
    }
}