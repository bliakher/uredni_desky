import formurlencoded from 'form-urlencoded';

const nkod_sparql = "https://data.gov.cz/sparql";
const rpp_sparql = "https://rpp-opendata.egon.gov.cz/odrpp/sparql";

const queryAllBulletinBoards = "PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
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

function getQueryForOrganizationTypeWithIco(icoList: Array<string>) {
    var query = "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
    PREFIX l-sgov-sbírka-111-2009-pojem: <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/> \
    PREFIX a-sgov-104-pojem: <https://slovník.gov.cz/agendový/104/pojem/> \
    SELECT * WHERE { \
      ?OrganVerejneMoci a l-sgov-sbírka-111-2009-pojem:orgán-veřejné-moci . \
      OPTIONAL { ?OrganVerejneMoci l-sgov-sbírka-111-2009-pojem:má-název-orgánu-veřejné-moci ?MaNazevOrganuVerejneMoci . FILTER (langMatches(LANG(?MaNazevOrganuVerejneMoci),'cs')) } \
      OPTIONAL { ?OrganVerejneMoci l-sgov-sbírka-111-2009-pojem:má-identifikační-číslo-osoby-orgánu-veřejné-moci ?ico . } \
      OPTIONAL { \
        ?OrganVerejneMoci l-sgov-sbírka-111-2009-pojem:má-právní-formu-osoby ?pravniForma . \
        ?pravniForma skos:notation ?cisloPravniFormy ; \
                            skos:prefLabel ?nazevPravniFormy . \
      } \
      FILTER ( STR(?ico) IN ( ";
    var first = true;
    for (var ico of icoList) {
        if (!first) query += ' , ';
        query += "'" + ico + "'";
        first = false;
    }
    query += ") )}";
    return query;
}

function getSparqlQueryObj(query: string) {
    return {
        "headers": {
            "accept": "application/json",
            "content-type": "application/sparql-query",
        },
        "body": query,
        "method": "POST",
    };
}

async function fetchAllBulletins(){
    const response = await fetch(nkod_sparql, getSparqlQueryObj(queryAllBulletinBoards));
    return (await response.json()).results.bindings;
}

async function fetchOrganizationTypes(icoList: Array<string>): Promise<Map<string, string>>  {
    var query = getQueryForOrganizationTypeWithIco(icoList);
    const response = await fetch(rpp_sparql, {
        "headers": {
            "accept": "application/sparql-results+json",
            "content-type": "application/x-www-form-urlencoded",
        },
        "body": formurlencoded({query : query}),
        "method": "POST",
    });
    var typedOrganizations = (await response.json()).results.bindings;
    var orgTypeMap = new Map(); 
    for (var org of typedOrganizations) {
        var ico: string = org.ico.value;
        var type: string = org.cisloPravniFormy.value;
        orgTypeMap.set(ico, type);
    }
    return orgTypeMap;
}

export { fetchAllBulletins, fetchOrganizationTypes };