
var query = "PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
PREFIX dcterms: <http://purl.org/dc/terms/> \
PREFIX dcat: <http://www.w3.org/ns/dcat#> \
PREFIX l-sgov-sbírka-111-2009-pojem: <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/> \
SELECT DISTINCT ?název ?popis ?poskytovatel ?zdroj \
WHERE { \
    ?s a dcat:Dataset ; \
        dcat:distribution ?distribuce ; \
        dcterms:conformsTo <https://ofn.gov.cz/úřední-desky/2021-07-20/> ; \
        dcterms:title ?název ; \
        dcterms:description ?popis; \
        dcterms:publisher ?poskytovatel_iri . \
    ?distribuce a dcat:Distribution ; \
        dcterms:format <http://publications.europa.eu/resource/authority/file-type/JSON_LD> ; \
        dcat:downloadURL ?zdroj . \
  FILTER (langMatches(LANG(?název), 'cs')) \
  FILTER (langMatches(LANG(?popis), 'cs')) \
  OPTIONAL { \
       ?poskytovatel_iri l-sgov-sbírka-111-2009-pojem:má-název-orgánu-veřejné-moci ?ovm_název_poskytovatele \
  } \
  OPTIONAL { \
       ?poskytovatel_iri foaf:name ?nkod_název_poskytovatele \
  } \
  BIND(COALESCE(?ovm_název_poskytovatele, ?nkod_název_poskytovatele) AS ?poskytovatel) \
}";

export { query };