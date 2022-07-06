import formurlencoded from 'form-urlencoded';
import type { ProviderTypeCountMap, ProviderTypeLabelMap } from '../model/Provider';

const nkod_sparql = "https://data.gov.cz/sparql";
const rpp_sparql = "https://rpp-opendata.egon.gov.cz/odrpp/sparql";
const cuzk_sparql = "https://linked.cuzk.cz.opendata.cz/sparql";

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

function getQueryForOrganizationTypeWithIco(icoList: Array<string>): string {
    var query = "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
    PREFIX l-sgov-sbírka-111-2009-pojem: <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/> \
    PREFIX a-sgov-104-pojem: <https://slovník.gov.cz/agendový/104/pojem/> \
    SELECT * WHERE { \
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



async function fetchAllBulletins() {
    const response = await fetch(nkod_sparql, getNKODQueryObj(queryAllBulletinBoards));
    return (await response.json()).results.bindings;
}

interface OrganizationInfo {
    name: string;
    typeNumber: string;
    residenceIri: string;
}

async function fetchOrganizationTypes(icoList: Array<string>): Promise<Map<string, OrganizationInfo>> {
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

async function fetchBulletinByIri(iri: string) {
    try {
        const response = await fetch(nkod_sparql, getNKODQueryObj(getQueryBulletinByIri(iri)));
        var parsed = await response.json();
        return parsed.results.bindings;
    } catch (error) {
        return null;
    }

}

async function fetchOrganizationNameByIco(ico: string) {
    var query = getQueryOrganizationInfoByIco(ico);
    try {
        const response = await fetch(rpp_sparql, getRPPQueryObj(query));
        var parsed = await response.json();
        return parsed.results.bindings[0].nazev.value;
    } catch (error) {
        return null;
    }
}

type Point = { X: number, Y: number };
type PointMap = Map<string, Point>;

function parsePoint(point: string): Point {
    // format: POINT(14.438098371192977 50.07599430418954)
    var openBracketPos = point.indexOf("(");
    var closeBracketPos = point.indexOf(")");
    point = point.substring(openBracketPos + 1, closeBracketPos);
    var x = parseFloat(point.split(" ")[0]);
    var y = parseFloat(point.split(" ")[1]);
    return { X: x, Y: y };
}

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
export { fetchAllBulletins, fetchOrganizationTypes, fetchBulletinByIri, fetchOrganizationNameByIco, fetchAddressPointsByIris, fetchAllOrganizationTypes };