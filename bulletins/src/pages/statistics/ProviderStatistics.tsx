import React from 'react';
import { Col, ListGroup, ProgressBar, Row, Tab, Tabs, Button, ListGroupItem, Stack } from 'react-bootstrap';
import type { ProviderTypeCountMap, ProviderTypeLabelMap } from '../../model/dataset';
import { BulletinData, Datasets } from '../../model/dataset';
import Plotly from 'plotly.js-dist-min';


interface ProviderStatProps {
    providerCounts: ProviderTypeCountMap;
    maxProviderCounts: ProviderTypeCountMap;
    providerLabels: ProviderTypeLabelMap;
}

export class ProviderStatistics extends React.Component<ProviderStatProps> {
    pieContainerLeft: React.RefObject<HTMLInputElement>;
    pieContainerRight: React.RefObject<HTMLInputElement>;

    pieContainerCity: React.RefObject<HTMLInputElement>;
    pieContainerCityPart: React.RefObject<HTMLInputElement>;
    pieContainerRegion: React.RefObject<HTMLInputElement>;
    pieContainerGovernment: React.RefObject<HTMLInputElement>;
    pieContainerFond: React.RefObject<HTMLInputElement>;
    
    constructor(props: ProviderStatProps) {
        super(props);
        this.pieContainerLeft = React.createRef();
        this.pieContainerRight = React.createRef();

        this.pieContainerCity = React.createRef();
        this.pieContainerCityPart = React.createRef();
        this.pieContainerRegion = React.createRef();
        this.pieContainerGovernment = React.createRef();
        this.pieContainerFond = React.createRef();
    }
    componentDidMount() {
        // console.log(this.props.providerCounts);
        this.createProviderCharts();
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
    createProviderChartsIndividual() {
        var labels = ["OVM neposkytující úřední desku", "OVM poskytující úřední desku jako otevřená data"];
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
            width: 450,
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
                <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 p-2 m-2">
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
                <Row className="text-center justify-content-md-center">
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                        <div ref={this.pieContainerLeft} />
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                        <div ref={this.pieContainerRight} />
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