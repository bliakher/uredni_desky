import { query } from "./query.js";

var nkod_sparql = "https://data.gov.cz/sparql";

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

function displayDatasets(datasets, element) {
    var header = document.createElement("h2");
    header.textContent = "Úřední desky";
    element.appendChild(header);
    for (var dataset of datasets) {
        displayBulletin(dataset.poskytovatel, dataset.zdroj, element);
    }
}

function displayBulletin(publisher, source, parent) {
    var container = document.createElement("div");
    var header = document.createElement("h3");
    header.textContent = publisher.value;

    var content = document.createElement("p");
    content.textContent = source.value;

    container.appendChild(header);
    container.appendChild(content);

    parent.appendChild(container);
}

window.onload = async function() {
    var container = document.getElementById("bulletins");
    var datasets = await fetchDatasets();
    displayDatasets(datasets.results.bindings, container);
}