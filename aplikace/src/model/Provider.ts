import { Point } from '../services/query';
import { BulletinData } from './dataset';

/**
 * Types of providers (právní forma poskytovatele)
 */
export enum ProviderType {
    Unknown, City, CityPart, Region, Government, Error,
}

/**
 * Class representing a provider of data from bulletin boards
 */
export class Provider {
    /** Provider name  */
    name: string;
    /** Provider IRI */
    iri: string;
    /** Type of provider  */
    type: ProviderType;
    /** Coordinates of provider residence */
    residence: Point;
    /** IRI of provider residence data point */
    residenceIri: string

    /** Provider type number (číslo právní formy)  */
    typeNumber: string;
    constructor(name: string, iri: string, type: ProviderType, typeNum: string, residenceIri: string) {
        this.name = name;
        this.iri = iri;
        this.type = type;
        this.typeNumber = typeNum;
        this.residenceIri = residenceIri;
        this.residence = { X: -1, Y: -1 };
    }

    
    /** Get type of provider
     * @param  {string} typeCode provider type number (číslo právní formy)
     * @returns ProviderType provider type
     */
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

/** Map from provider type number to count of providers of this type*/
export type ProviderTypeCountMap = Map<string, number>;
/** Map from provider type number to the label of this type*/
export type ProviderTypeLabelMap = Map<string, string>;

/** Provider type number for cities (obce) */
export const CITY_CODE = "801";
/** Provider type number for city parts (mestske casti)*/
export const CITY_PART_CODE = "811";
/** Provider type number for regions (kraje)*/
export const REGION_CODE = "804";
/** Provider type number for government organizations (organizacni slozky statu)*/
export const GOVERNMENT_CODE = "325";

/**
 * Class that extracts providers form BulletinData objects and sorts them by types
 */
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
    getProvider(providerIri: string): Provider | null {
        var provider = this.providers.get(providerIri);
        return provider || null;
    }
    getProviderBulletins(providerIri: string): BulletinData[] | null {
        var bulletins = this.providerBulletins.get(providerIri);
        return bulletins || null;
    }
}