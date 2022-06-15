import React from 'react';
import { Col, ListGroup, ProgressBar, Row, Tab, Tabs, Button, ListGroupItem, Stack } from 'react-bootstrap';
import type { ProviderTypeCountMap, ProviderTypeLabelMap } from '../model/dataset';
import { BulletinData, Datasets } from '../model/dataset';
import { Loader } from '../Utils';

import Plotly from 'plotly.js-dist-min';


const Header = () => {
    return (
        <>
            <Row className="text-center justify-content-md-center m-2">
                <h2>Statistiky</h2>
            </Row>
            <Row className="text-center justify-content-md-center m-2">
                <p>Upozornění: pro získání statistik je nutné stažení všech distribucí úředních desek</p>
            </Row>
        </>
    );
}


const Progress = (props: {done: number, total: number}) => {
    var percentage = Math.round(props.done / props.total * 10000) / 100;
    // className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8 col-xxl-6 d-flex p-2 m-2"
    return (
        <Row className="text-center justify-content-md-center">
            <Col className="col-11 col-sm-11 col-md-8 col-lg-6 col-xl-6 col-xxl-5 p-2 m-2"> 
                <ProgressBar now={percentage} label={props.done + " z " + props.total}/>    
             </Col>
        </Row>
        
    );
}

class Statistics extends React.Component<{}, {loaded: boolean, downloadCount: number}> {
    data: Datasets;
    providerCounts: ProviderTypeCountMap;
    maxProviderCounts: ProviderTypeCountMap;
    providerLabels: ProviderTypeLabelMap;
    
    constructor(props: any) {
        super(props);
        this.state = {loaded : false, downloadCount : 0};
        this.data = new Datasets();
        this.providerCounts = new Map();
        this.maxProviderCounts = new Map();
        this.providerLabels = new Map();
    }
    async componentDidMount() {
        await this.data.fetchDatasets();
        await Promise.all(this.data.data.map(async d => {
            await d.fetchDistribution();
            this.setState({downloadCount : this.state.downloadCount + 1});
        }));
        console.log("all downloaded");
        this.providerCounts = await this.data.filterInnerProvidersByType();
        var maps = await this.data.getAllProviderTypes();
        if (maps) {
            this.maxProviderCounts = maps.counts;
            this.providerLabels = maps.labels;
        }

        this.setState({loaded: true});
    }
    render() {
        if (!this.state.loaded) {
            return (
                <>
                    <Header />
                    {/* <Loader /> */}
                    <Progress done={this.state.downloadCount} total={this.data.data.length} />
                </>
            );
        }
        return (
            <>
                <Header />
                <Tabs defaultActiveKey="validation" className="mb-3 justify-content-md-center">
                    <Tab eventKey="validation" title="Validace" key="validation">
                        <ValidationStatistics data={this.data.data} />
                    </Tab>
                    <Tab eventKey="providers" title="Poskytovatelé" key="providers">
                        <ProviderStatistics providerCounts={this.providerCounts} maxProviderCounts={this.maxProviderCounts} 
                            providerLabels={this.providerLabels}/>
                    </Tab>
                </Tabs>
                
            </>
        );

    }
}

interface ProviderStatProps {
    providerCounts: ProviderTypeCountMap;
    maxProviderCounts: ProviderTypeCountMap;
    providerLabels: ProviderTypeLabelMap;
}

class ProviderStatistics extends React.Component<ProviderStatProps> {
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

class ValidationParams {
    count: number;
    notLoaded: BulletinData[];
    correctCount: number;
    bulletinError: number;
    infoError: number;

    correctPerc: number;
    notLoadedPerc: number;
    loadedIncorrect: BulletinData[];
    incorrectLoadedPerc: number;
    bulletinPerc: number;
    infoPerc: number;
    withErrors: number;
    withErrorsPerc: number;
    constructor(count: number, notLoaded: BulletinData[], loadedIncorrect: BulletinData[], bulletinError: number, infoError: number) {
        this.count = count;
        this.notLoaded = notLoaded;
        this.loadedIncorrect = loadedIncorrect;
        this.correctCount = count - (notLoaded.length + loadedIncorrect.length);
        this.bulletinError = bulletinError;
        this.infoError = infoError;

        this.correctPerc = Math.round(this.correctCount / count * 10000) / 100;
        this.notLoadedPerc = Math.round(notLoaded.length / count * 10000) / 100;
        this.incorrectLoadedPerc = Math.round(this.loadedIncorrect.length / count * 10000) / 100;
        this.bulletinPerc = Math.round(bulletinError / this.loadedIncorrect.length * 10000) / 100;
        this.infoPerc = Math.round(infoError / this.loadedIncorrect.length * 10000) / 100;
        this.withErrors = notLoaded.length + this.loadedIncorrect.length;
        this.withErrorsPerc = Math.round(this.withErrors / count * 10000) / 100;
    }
}

class ValidationStatistics extends React.Component<{data: BulletinData[]}> {
    pieContainer: React.RefObject<HTMLInputElement>;
    params: ValidationParams;
    constructor(props: {data: BulletinData[]}) {
        super(props);
        this.pieContainer = React.createRef();
        this.params = this.initParams();
    }
    componentDidMount() {
        var values = [this.params.correctPerc, this.params.notLoadedPerc, this.params.incorrectLoadedPerc];
        var labels = ["Bez nedostatků", "Nelze stáhnout distribuci", "Chybějící doporučené atributy"];
        var data: {values: number[], labels: string[], type: ("pie" | undefined)}[] = [{
            values: values,
            labels: labels,
            type: 'pie'
        }];
        // {height: number, width: number, grid: { rows: number, columns: number, pattern: ('independent' | 'coupled') }}
        var layout = {
            height: 300,
            width: 500
          };
        if (this.pieContainer.current) {
            Plotly.newPlot(this.pieContainer.current, data, layout);
        }
    }
    initParams() {
        var notLoaded = [];
        var loadedIncorrect = [];
        var bulletinError = 0;
        var infoError = 0;
        for (var bulletin of this.props.data) {
            if (bulletin.getDistribution() === null) {
                notLoaded.push(bulletin);
            } else {
                var missing = bulletin.checkRecommendedProperties();
                if (missing.bulletin.length > 0 || missing.information.length > 0) {
                    loadedIncorrect.push(bulletin);
                    bulletinError += (missing.bulletin.length > 0 ? 1 : 0);
                    infoError += (missing.information.length > 0 ? 1 : 0);
                } 
            }
        }
        var count = this.props.data.length;
        return new ValidationParams(count, notLoaded, loadedIncorrect, bulletinError, infoError);
    }
    getPieData() {
        var values = [this.params.correctPerc, this.params.notLoadedPerc, this.params.loadedIncorrect];
        var labels = ["Bez nedostatků", "Nelze stáhnout distribuci", "Chybějící doporučené atributy"];
        return [{
            values: values,
            labels: labels,
            type: "pie"
        }];
    }
    renderStatText() {
        return (
            <>
            <ListGroup>
                <ListGroup.Item>
                    <div className="fw-bold text-center">Shrnutí</div>
                </ListGroup.Item>
                <ListGroup.Item>
                    {"Celkem úředních desek: " + this.params.count}
                </ListGroup.Item>
                <ListGroup.Item>
                    {"Nelze načíst distribuci u " + this.params.notLoaded.length + " desek (" + this.params.notLoadedPerc + " %)."}
                </ListGroup.Item>
                <ListGroup.Item>
                    {"Z načtených, nalezeny nedostatky u " + this.params.loadedIncorrect.length + " desek (" + this.params.incorrectLoadedPerc + " %)."}
                    <ul>
                        <li>
                            {"Z toho " + this.params.bulletinError + " desek (" + this.params.bulletinPerc + " %) nemá všechny doporučené atributy v metadatech celé desky."}
                        </li>
                        <li>
                            {"A " + this.params.infoError + " desek (" + this.params.infoPerc + " %) nemá všechny doporučené atributy u všech informací, zveřejněných na desce." }
                        </li>
                    </ul>
                </ListGroup.Item>
                <ListGroup.Item>
                    {"Celkem úředních desek s nedostatky: " + this.params.withErrors + " (" + this.params.withErrorsPerc + " %)"}
                </ListGroup.Item>
            </ListGroup>
            </>
        );
    }
    render() {
        return (
            <>
                <Row className="text-center justify-content-md-center">
                    <h4>Validace úředních desek</h4>
                </Row>
                <Row className="text-center justify-content-md-center">
                    <Col className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-6 d-flex p-2 m-2">
                        <p>
                            Validaci provádíme na základě <a href="https://ofn.gov.cz/úředn%C3%AD-desky/2021-07-20/">specifikace</a> OFN pro úřední desky, která obsahuje seznam doporučených atributů, které by zveřejněná deska měla obsahovat.
                            Podrobnější informace a validaci konkrétních úředních desek naleznete v sekci <a href="#/validace">Validace</a>.
                        </p>
                    </Col>
                </Row>
                <Row className="justify-content-md-center">
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex">
                        { this.renderStatText() }
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                        <div ref={ this.pieContainer } />
                    </Col>
                </Row>
                <Row className="text-center justify-content-md-center">
                    <Col className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-6 d-flex p-2 m-2">
                        <p>
                            V této části se zobrazují pouze úřední desky, u kterých byly nalezeny nedostatky. Kliknutím na tlačítko Detail se zobrazí podrobnosti z validace úřední desky.
                        </p>
                    </Col>
                </Row>
                <Row className="justify-content-md-center m-2">
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                        <ProblematicBulletins header="Nelze načíst distribuci" bulletins={this.params.notLoaded} />
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 p-2 m-2">
                        <ProblematicBulletins header="Chybí doporučené parametry" bulletins={this.params.loadedIncorrect} />
                    </Col>
                </Row>
            </>
        );
        
    }
}

const ProblematicBulletins = (props: {header: string, bulletins: BulletinData[]}) => {
    return (
        <ListGroup>
            <ListGroupItem>
                <div className="fw-bold text-center">{props.header}</div>
            </ListGroupItem>
            {props.bulletins.map(bulletin => (
            <ListGroupItem key={bulletin.iri + Math.random().toString()}>
                <Stack direction="horizontal" className="d-flex">
                    <div>
                        <div className="fw-bold">{bulletin.provider.name}</div>
                        {bulletin.name + " "}
                    </div>
                        
                    <Button href={"#/validace/detail?iri=" + bulletin.iri} variant="outline-secondary" size="sm" 
                            className="align-self-end">
                        Detail
                    </Button>
                </Stack>
            </ListGroupItem>))}
        </ListGroup>
    );
}

export { Statistics };