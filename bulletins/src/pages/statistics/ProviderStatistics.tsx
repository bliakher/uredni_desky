import React from 'react';
import { Col, ListGroup, ProgressBar, Row, Tab, Tabs, Button, ListGroupItem, Stack } from 'react-bootstrap';
import type { ProviderTypeCountMap, ProviderTypeLabelMap } from '../../model/dataset';
import { CITY_CODE, CITY_PART_CODE, REGION_CODE, GOVERNMENT_CODE } from '../../model/dataset';
import Plotly from 'plotly.js-dist-min';


interface ProviderStatProps {
    providerCounts: ProviderTypeCountMap;
    maxProviderCounts: ProviderTypeCountMap;
    providerLabels: ProviderTypeLabelMap;
}

export class ProviderStatistics extends React.Component<ProviderStatProps> {
    pieContainerLeft: React.RefObject<HTMLInputElement>;
    pieContainerRight: React.RefObject<HTMLInputElement>;

    legendContainer: React.RefObject<HTMLInputElement>;
    pieContainerCity: React.RefObject<HTMLInputElement>;
    pieContainerCityPart: React.RefObject<HTMLInputElement>;
    pieContainerRegion: React.RefObject<HTMLInputElement>;
    pieContainerGovernment: React.RefObject<HTMLInputElement>;
    pieContainerFond: React.RefObject<HTMLInputElement>;
    
    constructor(props: ProviderStatProps) {
        super(props);
        this.pieContainerLeft = React.createRef();
        this.pieContainerRight = React.createRef();

        this.legendContainer = React.createRef();
        this.pieContainerCity = React.createRef();
        this.pieContainerCityPart = React.createRef();
        this.pieContainerRegion = React.createRef();
        this.pieContainerGovernment = React.createRef();
        this.pieContainerFond = React.createRef();
    }
    componentDidMount() {
        // console.log(this.props.providerCounts);
        // this.createProviderCharts();
        this.createProviderChartsIndividual();
    }
    getProvidersCount() {
        var result = new Map(); // map: provider type number -> [count of all OVM, count of providers]
        this.props.providerCounts.forEach((count, providerType) => {
            if (providerType !== "") {
                var totalVal = this.props.maxProviderCounts.get(providerType);
                var total = totalVal ? totalVal : -1;
                var remainingCount = total - count;
                // console.log(count, maxCount, total, count / total, maxCount / total);
                var countPerc = Math.round(count / total * 10000) / 100;
                var remCountPerc = Math.round(remainingCount / total * 10000) / 100;
                result.set(providerType, {perc: [remCountPerc, countPerc], count: [remainingCount.toString(), count.toString()]});
            }
        });
        return result;
    }
    getPieData(typeCode: string) {
        var total = this.props.maxProviderCounts.get(typeCode);
        var providerCount = this.props.providerCounts.get(typeCode);
        if (!total || !providerCount) return null;
        var remainingCount = total - providerCount;
        var countPerc = Math.round(providerCount / total * 10000) / 100;
        var remCountPerc = Math.round(remainingCount / total * 10000) / 100;
        return {perc: [remCountPerc, countPerc], count: [remainingCount, providerCount]}
    }
    getRegionData() { return this.getPieData(REGION_CODE); }
    getGovernmentData() { return this.getPieData(GOVERNMENT_CODE); }
    // createPieChart(values: IterableIterator<Plotly.Data>, texts: number[], title: string, container: React.RefObject<HTMLInputElement>) {
    //     var labels = ["OVM neposkytující úřední desku", "OVM poskytující úřední desku jako otevřená data"];
    //     var layout: { height: number, width: number} = {
    //         height: 600,
    //         width: 400,
    //     };
    //     if(container.current) {
    //         Plotly.newPlot(container.current, {
    //             values: values,
    //             labels: labels,
    //             text: texts,


    //         })
    //     }
    // }
    createProviderChartsIndividual() {
        var labels = ["OVM neposkytující úřední desku", "OVM poskytující úřední desku jako otevřená data"];
        
        var layoutWithLegend: { height: number, width: number, legend: {xanchor: 'center'}} = {
            height: 600,
            width: 500,
            legend: {
                xanchor: 'center'
            }
        };
        var grey = 'RGB(208, 212, 205)';
        var green = 'RGB(132, 217, 67)';
        var colors = [grey, green];
        var cityData =  this.getPieData(CITY_CODE);
        if (this.pieContainerCity.current) {
            Plotly.newPlot(this.pieContainerCity.current, [{
                values: cityData?.perc,
                labels: labels,
                text: cityData?.count,
                marker: {colors: colors},
                type: 'pie',
                // title: {text: "Obec", font: {size: 14}, position: "bottom center"}
            }], layoutWithLegend)
        }

        var layout: { height: number, width: number} = {
            height: 300,
            width: 300,
        };
        var cityPartData = this.getPieData(CITY_PART_CODE);
        if (this.pieContainerCityPart.current) {
            Plotly.newPlot(this.pieContainerCityPart.current, [{
                values: cityPartData?.perc,
                labels: labels,
                text: cityPartData?.count,
                showlegend: false,
                marker: {colors: colors},
                type: 'pie',
                // title: {text: "Městská část, městský obvod", font: {size: 12}, position: "bottom center"}
            }], layout)
        }
        var regionData = this.getPieData(REGION_CODE);
        if (this.pieContainerRegion.current) {
            Plotly.newPlot(this.pieContainerRegion.current, [{
                values: regionData?.perc,
                labels: labels,
                text: regionData?.count,
                showlegend: false,
                marker: {colors: colors},
                type: 'pie',
                // title: {text: "Kraj", font: {size: 12}, position: "bottom center"}
            }], layout)
        }
        var governmentData = this.getPieData(GOVERNMENT_CODE);
        if (this.pieContainerGovernment.current) {
            Plotly.newPlot(this.pieContainerGovernment.current, [{
                values: governmentData?.perc,
                labels: labels,
                text: governmentData?.count,
                showlegend: false,
                marker: {colors: colors},
                type: 'pie',
                // title: {text: "Organizační složka státu", font: {size: 12}, position: "bottom center"}
            }], layout)
        }
    }
    createProviderCharts() {
        var labels = ["OVM neposkytující úřední desku", "OVM poskytující úřední desku jako otevřená data"];
        var dataLeft: { values: number[], labels: string[], text: string[], type: 'pie' | undefined, 
                title: {text: string, font: {size: number}}, domain: { row: number, col: number} }[] = [];
        var dataRight: { values: number[], labels: string[], text: string[], type: 'pie' | undefined, 
                title: {text: string, font: {size: number}}, domain: { row: number, col: number} }[] = [];
        var valueMap = this.getProvidersCount();
        var chartCount = valueMap.size % 2 == 0 ? valueMap.size : valueMap.size + 1;
        var rowCount = chartCount / 2;
        var curChart = 0;
        valueMap.forEach((obj, type) => {
            var typeName = this.props.providerLabels.get(type);
            var dataObj: { values: number[], labels: string[], text: string[], type: 'pie' | undefined, 
                title: {text: string, font: {size: number}}, domain: { row: number, col: number} } = 
                {
                values: obj.perc,
                labels: labels,
                text: obj.count,
                type: 'pie',
                title: {text: typeName? typeName : "", font: {size: 14}},
                domain: {
                    row: curChart % rowCount,
                    col: 0
                } 
            }
            if (curChart < rowCount) {
                dataLeft.push(dataObj);
            } else {
                dataRight.push(dataObj);
            }
            curChart++;
        });
        
        var layout: { height: number, width: number, grid: {rows: number, columns: number}} = {
            height: 900,
            width: 600,
            grid: {rows: rowCount, columns: 1},
        };
        if (this.pieContainerLeft.current) {
            Plotly.newPlot(this.pieContainerLeft.current, dataLeft, layout);
        }
        if (this.pieContainerRight.current) {
            Plotly.newPlot(this.pieContainerRight.current, dataRight, layout);
        }
        // console.log(dataLeft);
    }
    renderOtherOrganizations(){
        var values: number[] = [];
        var labels: string[] = [];
        // collect organization types that have no providers of bulletins
        this.props.maxProviderCounts.forEach((count, providerType) => {
            if (!this.props.providerCounts.has(providerType)) {
                var label = this.props.providerLabels.get(providerType);
                if (label) {
                    values.push(count);
                    labels.push(label);
                }
            }
        });
        
        return (
            <Row className="text-center justify-content-md-center">
                <Col className="col-11 col-sm-11 col-md-5 col-lg-5 col-xl-5 col-xxl-5 p-2 m-2">
                    <ListGroup>
                        {values.map((val, i) => (
                        <ListGroupItem>
                            <div className="fw-bold">{labels[i] + ": "}</div> {val}
                        </ListGroupItem>))}
                    </ListGroup>
                </Col>
            </Row>
        );
    }
    render() {
        return (
            <>
                <Row className="text-center justify-content-md-center">
                    <h4>Statistika poskytovatelů úředních desek</h4>
                </Row>
                <Row className="text-center justify-content-md-center">
                    <Col className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-6 d-flex p-2 m-2">
                        <p>
                            Poskytovatele dat z úředních desek můžeme rozdělit do kategorií podle jejich právní formy. 
                            Data o právní formě orgánů veřejné moci získáváme z Registu práv a povinností (<a href="https://www.szrcr.cz/cs/registr-prav-a-povinnosti">RPP</a>).
                            Tato statistika udává, kolik z existujících orgánů veřejné moci v každé kategorii zveřejňuje svoji úřední desku jako otevřená data.
                            Jednotlivé úřední desky je možné si prohlédnout v sekci <a href="#/seznam">Seznam</a>.
                        </p>
                    </Col>
                </Row>
                {/* <Row className="text-center justify-content-md-center">
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                        <div ref={this.pieContainerLeft} />
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                        <div ref={this.pieContainerRight} />
                    </Col>
                </Row> */}
                <Row className="text-center justify-content-md-center">
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex">
                        <div>
                            <h6>Obec</h6>
                            <div ref={this.pieContainerCity} />
                        </div>
                    </Col>
                </Row>
                <Row className="text-center justify-content-md-center">
                    <Col className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 col-xxl-3">
                        <div>
                            <h6>Městská část, městský obvod</h6>
                            <div ref={this.pieContainerCityPart} />
                        </div>
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 col-xxl-3">
                        <div>
                            <h6>Kraj</h6>
                            <div ref={this.pieContainerRegion} />
                        </div>
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 col-xxl-3">
                        <div>
                            <h6>Organizační složka státu</h6>
                            <div ref={this.pieContainerGovernment} />
                        </div>
                    </Col>
                </Row>
                <Row className="text-center justify-content-md-center m-3">
                    <h6>Ostatní orgány veřejné moci, které neposkytují data z úředních desek</h6>
                </Row>
                { this.renderOtherOrganizations() }
            </>
        );
    }
}