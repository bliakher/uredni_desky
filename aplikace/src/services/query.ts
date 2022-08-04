import formurlencoded from 'form-urlencoded';
import { QueryResponse } from '../model/dataset';
import type { ProviderTypeCountMap, ProviderTypeLabelMap } from '../model/Provider';

/** SPARQL endpoint of the National Data Catalog */
const nkod_sparql = "https://data.gov.cz/sparql";

/** SPARQL endpoint of Registr Prav a Povinnosti */
const rpp_sparql = "https://rpp-opendata.egon.gov.cz/odrpp/sparql";

/** SPARQL endpoint of the RUIAN */
const cuzk_sparql = "https://linked.cuzk.cz.opendata.cz/sparql";

/**
 * SPARQL query that gets all datasets that conform to bulletin OFN specification
 */
const queryAllBulletinBoards: string = "PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
PREFIX dcterms: <http://purl.org/dc/terms/> \
PREFIX dcat: <http://www.w3.org/ns/dcat#> \
PREFIX l-sgov-sbírka-111-2009-pojem: <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/> \
SELECT DISTINCT ?dataset ?name ?description ?provider ?provider_iri ?source \
WHERE { \
    ?dataset a dcat:Dataset ; \
        dcat:distribution ?distribuce ; \
        dcterms:conformsTo <https://ofn.gov.cz/úřední-desky/2021-07-20/> ; \
        dcterms:title ?name ; \
        dcterms:description ?description; \
        dcterms:publisher ?provider_iri . \
    ?distribuce a dcat:Distribution ; \
        dcterms:format <http://publications.europa.eu/resource/authority/file-type/JSON_LD> ; \
        dcat:downloadURL ?source . \
  FILTER (langMatches(LANG(?name), 'cs')) \
  FILTER (langMatches(LANG(?description), 'cs')) \
  OPTIONAL { \
       ?provider_iri l-sgov-sbírka-111-2009-pojem:má-název-orgánu-veřejné-moci ?ovm_název_poskytovatele \
  } \
  OPTIONAL { \
       ?provider_iri foaf:name ?nkod_název_poskytovatele \
  } \
  BIND(COALESCE(?ovm_název_poskytovatele, ?nkod_název_poskytovatele) AS ?provider) \
}";

/**
 * Creates a SPARQL query that gets information for all organizations specified by their IČO
 * @param icoList list of IČO of organizations to query
 * @returns query
 */
function getQueryForOrganizationTypeWithIco(icoList: Array<string>): string {
    var query = "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
    PREFIX l-sgov-sbírka-111-2009-pojem: <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/> \
    PREFIX a-sgov-104-pojem: <https://slovník.gov.cz/agendový/104/pojem/> \
    SELECT DISTINCT * WHERE { \
      ?OrganVerejneMoci a l-sgov-sbírka-111-2009-pojem:orgán-veřejné-moci . \
      OPTIONAL { ?OrganVerejneMoci l-sgov-sbírka-111-2009-pojem:má-název-orgánu-veřejné-moci ?nazev . FILTER (langMatches(LANG(?nazev),'cs')) } \
      OPTIONAL { ?OrganVerejneMoci l-sgov-sbírka-111-2009-pojem:má-identifikační-číslo-osoby-orgánu-veřejné-moci ?ico . } \
      OPTIONAL { ?OrganVerejneMoci l-sgov-sbírka-111-2009-pojem:má-identifikátor-orgánu-veřejné-moci ?cisloOVM . } \
      OPTIONAL { ?OrganVerejneMoci l-sgov-sbírka-111-2009-pojem:má-adresu-sídla-orgánu-veřejné-moci ?sidlo . } \
      OPTIONAL { \
        ?OrganVerejneMoci l-sgov-sbírka-111-2009-pojem:má-právní-formu-osoby ?pravniForma . \
        ?pravniForma skos:notation ?cisloPravniFormy ; \
                            skos:prefLabel ?nazevPravniFormy . \
      } \
      FILTER ( STR(?cisloOVM) IN ( ";
    var first = true;
    for (var ico of icoList) {
        if (!first) query += ' , ';
        query += "'" + ico + "'";
        first = false;
    }
    query += ") )}";
    return query;
}

/**
 * Create a SPARQL query to fetch one bulletin dataset from NDC by its IRI
 * @param iri IRI of bulletin dataset
 * @returns query
 */
function getQueryBulletinByIri(iri: string): string {
    return "PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
    PREFIX dcterms: <http://purl.org/dc/terms/> \
    PREFIX dcat: <http://www.w3.org/ns/dcat#> \
    PREFIX l-sgov-sbírka-111-2009-pojem: <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/> \
    SELECT DISTINCT ?name ?description ?provider ?provider_iri ?source \
    WHERE { <" + iri + "> a dcat:Dataset ; \
            dcat:distribution ?distribuce ; \
            dcterms:title ?name ; \
            dcterms:description ?description; \
            dcterms:publisher ?provider_iri . \
        ?distribuce a dcat:Distribution ; \
            dcterms:format <http://publications.europa.eu/resource/authority/file-type/JSON_LD> ; \
            dcat:downloadURL ?source . \
      FILTER (langMatches(LANG(?name), 'cs')) \
      FILTER (langMatches(LANG(?description), 'cs')) \
      OPTIONAL { \
           ?provider_iri l-sgov-sbírka-111-2009-pojem:má-název-orgánu-veřejné-moci ?ovm_název_poskytovatele \
      } \
      OPTIONAL { \
           ?provider_iri foaf:name ?nkod_název_poskytovatele \
      } \
      BIND(COALESCE(?ovm_název_poskytovatele, ?nkod_název_poskytovatele) AS ?provider) \
    }";
}

/**
 * Create a SPARQL query to fetch information about 1 organization specified by ICO
 * @param ico ICO of organization to query
 * @returns query
 */
function getQueryOrganizationInfoByIco(ico: string): string {
    var identifier = "'" + ico + "'";
    return "PREFIX l-sgov-sbírka-111-2009-pojem: <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/> \
    PREFIX a-sgov-104-pojem: <https://slovník.gov.cz/agendový/104/pojem/> \
    SELECT DISTINCT ?nazev ?ico ?pravni_forma \
    WHERE { \
      ?organ a l-sgov-sbírka-111-2009-pojem:orgán-veřejné-moci . \
      OPTIONAL { ?organ l-sgov-sbírka-111-2009-pojem:má-název-orgánu-veřejné-moci ?nazev . FILTER (LANG(?nazev) = 'cs') } \
      OPTIONAL { ?organ l-sgov-sbírka-111-2009-pojem:má-identifikační-číslo-osoby-orgánu-veřejné-moci ?ico .  } \
      OPTIONAL { ?organ l-sgov-sbírka-111-2009-pojem:má-právní-formu-osoby ?pravni_forma . } \
      FILTER ( STR(?ico) = " + identifier + " ) \
    }";
}

/**
 * Create a SPARQL query to fetch coordinates of a list of address points from RUIAN
 * @param iriList list of IRIs of address points
 * @returns query
 */
function getQueryAddressPointsByIris(iriList: Array<string>): string {
    var query = "PREFIX l-sgov-sbírka-111-2009-pojem: <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/> \
    PREFIX schema: <http://schema.org/> \
    PREFIX locn: <http://www.w3.org/ns/locn#> \
    SELECT DISTINCT * \
    WHERE { \
     ?iri a schema:Place ; \
         locn:geometry ?geometrie . \
      VALUES ?iri {";
    for (var iri of iriList) {
        query += "<" + iri + ">" + " ";
    }
    query += "} }";
    return query;
}

/**
 * Create a SPARQL query to fetch counts of organizations in each org. type
 */
const queryAllOrganizationTypes = "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
PREFIX l-sgov-sbírka-111-2009-pojem: <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/> \
PREFIX a-sgov-104-pojem: <https://slovník.gov.cz/agendový/104/pojem/> \
SELECT ?cislo ?nazev (COUNT(?ovm) AS ?pocetOvm) WHERE { \
  ?ovm a l-sgov-sbírka-111-2009-pojem:orgán-veřejné-moci ; \
   					l-sgov-sbírka-111-2009-pojem:má-právní-formu-osoby ?pravniForma . \
  ?pravniForma skos:notation ?cislo ; \
                            skos:prefLabel ?nazev . FILTER (langMatches(LANG(?nazev), 'cs')) \
} \
GROUP BY ?pravniForma ?cislo ?nazev";

/**
 * Get query object for fetch from NDC
 * @param query SPARQL query
 * @returns query object
 */
function getNKODQueryObj(query: string) {
    return {
        "headers": {
            "accept": "application/json",
            "content-type": "application/sparql-query",
        },
        "body": query,
        "method": "POST",
    };
}

/**
 * Get query object for fetch from RPP
 * query must be encoded
 * @param query SPARQL query
 * @returns query object
 */

function getRPPQueryObj(query: string) {
    return {
        "headers": {
            "accept": "application/sparql-results+json",
            "content-type": "application/x-www-form-urlencoded",
        },
        "body": formurlencoded({ query: query }),
        "method": "POST",
    };
}

/**
 * Fetch all bulletin datasets from NDC
 * @returns list of bulletins
 */
async function fetchAllBulletins(): Promise<QueryResponse[]> {
    const response = await fetch(nkod_sparql, getNKODQueryObj(queryAllBulletinBoards));
    return (await response.json()).results.bindings;
}

/**
 * Organization information
 */
interface OrganizationInfo {
    /** name of org. */
    name: string;
    /** type of org. (cislo pravni formy) */
    typeNumber: string;
    /** IRI of org. residence address point */
    residenceIri: string;
}

/**
 * fetch data about organizations specified by ICO
 * @param icoList list of org. ICO
 * @returns map from org. ico to its info
 */
async function fetchOrganizationTypes(icoList: Array<string>): Promise<Map<string, OrganizationInfo>> {
    icoList = Array.from(new Set(icoList));
    var query = getQueryForOrganizationTypeWithIco(icoList);
    const response = await fetch(rpp_sparql, getRPPQueryObj(query));
    var typedOrganizations = (await response.json()).results.bindings;
    var orgMap = new Map();
    for (var org of typedOrganizations) {
        var cisloOVM: string = org.cisloOVM.value;
        var type: string = org.cisloPravniFormy ? org.cisloPravniFormy.value : "";
        var residence = org.sidlo ? org.sidlo.value : "";
        var orgInfo: OrganizationInfo = { name: org.nazev.value, typeNumber: type, residenceIri: residence };
        orgMap.set(cisloOVM, orgInfo);
    }
    return orgMap;
}

function divideList(list: string[], chunkSize: number): string[][]  {
    var result: string[][] = [];
    var chunkCount = Math.floor(list.length / chunkSize);
    for (var i = 0; i < chunkCount; i++) {
        const chunkStart = i * chunkSize;
        const chunk = list.slice(chunkStart, chunkStart + chunkSize);
        result.push(chunk);
    }
    if (list.length > 0 && list.length % chunkSize > 0) {
        const lastChunk = list.slice(i * chunkSize);
        result.push(lastChunk);
    }
    return result;
}

function mergeMaps(mapList: Map<any, any>[]): Map<any, any> {
    if (mapList.length === 0) return new Map();
    var result = mapList[0];
    for (var i = 1; i < mapList.length; i++) {
        var nextChunk = mapList[i];
        nextChunk.forEach((value, key) => {
            result.set(key, value);
        });
    }
    return result;
}

const ICO_CHUNK_SIZE = 30;
async function fetchOrganizationTypesByParts(icoList: Array<string>): Promise<Map<string, OrganizationInfo>> {
    icoList = Array.from(new Set(icoList));
    const icoChunks = divideList(icoList, ICO_CHUNK_SIZE);
    const resultChunks = await Promise.all(icoChunks.map(chunk => fetchOrganizationTypes(chunk)));
    const result = mergeMaps(resultChunks);
    return result;
}

/**
 * Fetch 1 bulletin dataset specified by its IRI form NDC
 * @param iri IRI of bulletin dataset
 * @returns bulletin dataset or null
 */
async function fetchBulletinByIri(iri: string): Promise<QueryResponse | null> {
    try {
        const response = await fetch(nkod_sparql, getNKODQueryObj(getQueryBulletinByIri(iri)));
        var parsed = await response.json();
        var data = parsed.results.bindings;
        return data.length > 0 ? data[0] : null
    } catch (error) {
        return null;
    }

}

/**
 * Fetch name of certain organization
 * @param ico ICO of this organization
 * @returns name or null
 */
async function fetchOrganizationNameByIco(ico: string): Promise<string | null> {
    var query = getQueryOrganizationInfoByIco(ico);
    try {
        const response = await fetch(rpp_sparql, getRPPQueryObj(query));
        var parsed = await response.json();
        return parsed.results.bindings[0].nazev.value;
    } catch (error) {
        return null;
    }
}

/**
 * Geographical point with coordinates 
 */
type Point = { X: number, Y: number };
type PointMap = Map<string, Point>;

/**
 * Parse point from WKT representation
 * @param point 
 * @returns 
 */
function parsePoint(point: string): Point {
    // format: POINT(14.438098371192977 50.07599430418954)
    var openBracketPos = point.indexOf("(");
    var closeBracketPos = point.indexOf(")");
    point = point.substring(openBracketPos + 1, closeBracketPos);
    var x = parseFloat(point.split(" ")[0]);
    var y = parseFloat(point.split(" ")[1]);
    return { X: x, Y: y };
}

/**
 * Fetch coordinates of a list of address points from RUIAN
 * @param iriList list IRIs of address points
 * @returns map from IRI of address point to its coordinates
 */
async function fetchAddressPointsByIris(iriList: Array<string>): Promise<PointMap | null> {
    var query = getQueryAddressPointsByIris(iriList);
    var result = new Map<string, Point>();
    try {
        const response = await fetch(cuzk_sparql, getNKODQueryObj(query));
        const parsed = await response.json();
        for (var obj of parsed.results.bindings) {
            var iri = obj.iri.value;
            var point = parsePoint(obj.geometrie.value);
            result.set(iri, point);
        }
        return result;
    } catch (error) {
        return null;
    }
}

/**
 * Fetch counts of organizations in each org. type
 * @returns counts of organizations in types and type labels
 */
async function fetchAllOrganizationTypes(): Promise<{ labels: ProviderTypeLabelMap, counts: ProviderTypeCountMap } | null> {
    try {
        const response = await fetch(rpp_sparql, getRPPQueryObj(queryAllOrganizationTypes));
        const parsed = await response.json();
        var labelMap = new Map();
        var countMap = new Map();
        for (var obj of parsed.results.bindings) {
            var type = obj.cislo.value;
            var label = obj.nazev.value;
            var count = parseInt(obj.pocetOvm.value);
            labelMap.set(type, label);
            countMap.set(type, count);
        }
        return { labels: labelMap, counts: countMap };
    } catch (error) {
        return null;
    }
}

export type { Point, PointMap };
export { fetchAllBulletins, fetchOrganizationTypes, fetchOrganizationTypesByParts, fetchBulletinByIri, fetchOrganizationNameByIco, fetchAddressPointsByIris, fetchAllOrganizationTypes };