import { query } from "./query.js";
import { displayDatasets } from "./views.js";

var nkod_sparql = "https://data.gov.cz/sparql";

class BulletinData {
    constructor(dataset) {
        this.provider = dataset.poskytovatel.value;
        this.source = dataset.zdroj.value;
    }
}

async function fetchDatasets() {
    const response = await fetch(nkod_sparql, {
        "headers": {
            "accept": "application/json",
            "content-type": "application/sparql-query",
        },
        "body": query,
        "method": "POST",
    });
    return await response.json();
}


window.onload = async function() {
    var container = document.getElementById("bulletins");
    var datasets = await fetchDatasets();
    var bulletins = datasets.results.bindings.map((dataset) => new BulletinData(dataset));
    displayDatasets(bulletins, container);
}