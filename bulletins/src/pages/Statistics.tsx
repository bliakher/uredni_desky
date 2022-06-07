import React from 'react';
import { Col, ListGroup, Row } from 'react-bootstrap';
import type { ProviderTypeCountMap, ProviderTypeLabelMap } from '../model/dataset';
import { BulletinData, Datasets } from '../model/dataset';
import { Loader } from '../Utils';

import Plotly from 'plotly.js-dist-min';


const Header = () => {
    return (
        <>
            <Row className="text-center justify-content-md-center">
                <h2>Statistiky</h2>
            </Row>
            <Row className="text-center justify-content-md-center">
                <p>Upozornění: pro získání statistik je nutné stažení všech distribucí úředních desek</p>
            </Row>
        </>
    );
}

class Statistics extends React.Component<{}, {loaded: boolean}> {
    data: Datasets;
    providerCounts: ProviderTypeCountMap;
    maxProviderCounts: ProviderTypeCountMap;
    providerLabels: ProviderTypeLabelMap;
    
    constructor(props: any) {
        super(props);
        this.state = {loaded : false};
        this.data = new Datasets();
        this.providerCounts = new Map();
        this.maxProviderCounts = new Map();
        this.providerLabels = new Map();
    }
    async componentDidMount() {
        await this.data.fetchDatasets();
        await this.data.fetchAllDistibutions();
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
                    <Loader />
                </>
            );
        }
        return (
            <>
                <Header />
                <hr />
                <ValidationStatistics data={this.data.data} />
                <hr />
                <ProviderStatistics providerCounts={this.providerCounts} maxProviderCounts={this.maxProviderCounts} 
                    providerLabels={this.providerLabels}/>
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
    multiplePieContainer: React.RefObject<HTMLInputElement>;
    otherPieContainer: React.RefObject<HTMLInputElement>;
    constructor(props: ProviderStatProps) {
        super(props);
        this.multiplePieContainer = React.createRef();
        this.otherPieContainer = React.createRef();
    }
    componentDidMount() {
        // console.log(this.props.providerCounts);
        this.createCharts();
    }
    getProvidersCount() {
        var result = new Map(); // map: provider type number -> [count of all OVM, count of providers]
        this.props.providerCounts.forEach((count, providerType) => {
            if (providerType !== "") {
                var maxCountVal = this.props.maxProviderCounts.get(providerType);
                var maxCount = maxCountVal ? maxCountVal : -1;
                var total = count + maxCount;
                // console.log(count, maxCount, total, count / total, maxCount / total);
                var countPerc = Math.round(count / total * 10000) / 100;
                var maxCountPerc = Math.round(maxCount / total * 10000) / 100;
                result.set(providerType, [maxCountPerc, countPerc]);
            }
        });
        return result;
    }
    createCharts() {
        var labels = ["OVM celkem", "OVM poskytující úřední desku jako otevřená data"];
        var data: {
            values: number[],
            labels: string[],
            type: 'pie' | undefined,
            title: {text: string},
            domain: {
                row: number,
                col: number
            } 
        }[] = [];
        var valueMap = this.getProvidersCount();
        var curChart = 0;
        valueMap.forEach((counts, type) => {
            var typeName = this.props.providerLabels.get(type);
            var dataObj: {
                values: number[],
                labels: string[],
                type: 'pie' | undefined,
                title: {text: string},
                domain: {
                    row: number,
                    col: number
                } 
            } = {
                values: counts,
                labels: labels,
                type: 'pie',
                title: {text: typeName? typeName : ""},
                domain: {
                    row: Math.floor(curChart / 2),
                    col: curChart % 2
                } 
            }
            data.push(dataObj);
            curChart++;
        });
        var chartCount = valueMap.size % 2 == 0 ? valueMap.size : valueMap.size + 1;
        var rowCount = chartCount / 2;
        console.log(rowCount);
        var layout: {
            height: number,
            width: number,
            grid: {rows: number, columns: number, xgap: number},
            xaxis: {domain: number[]}
        } = {
            height: 800,
            width: 1000,
            grid: {rows: rowCount, columns: 2, xgap: 0.1},
            xaxis: {domain: [0, 0.5]}
        };
        if (this.multiplePieContainer.current) {
            Plotly.newPlot(this.multiplePieContainer.current, data, layout);
        }
        console.log(data);
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
                <Row>
                    <div ref={this.multiplePieContainer} />
                </Row>
            </>
        );
    }
}

class ValidationParams {
    count: number;
    notLoaded: number;
    correctCount: number;
    bulletinError: number;
    infoError: number;

    correctPerc: number;
    notLoadedPerc: number;
    incorrectLoaded: number;
    incorrectLoadedPerc: number;
    bulletinPerc: number;
    infoPerc: number;
    withErrors: number;
    withErrorsPerc: number;
    constructor(count: number, notLoaded: number, correctCount: number, bulletinError: number, infoError: number) {
        this.count = count;
        this.notLoaded = notLoaded;
        this.correctCount = correctCount;
        this.bulletinError = bulletinError;
        this.infoError = infoError;

        this.correctPerc = Math.round(correctCount / count * 10000) / 100;
        this.notLoadedPerc = Math.round(notLoaded / count * 10000) / 100;
        this.incorrectLoaded = count - notLoaded - correctCount;
        this.incorrectLoadedPerc = Math.round(this.incorrectLoaded / count * 10000) / 100;
        this.bulletinPerc = Math.round(bulletinError / this.incorrectLoaded * 10000) / 100;
        this.infoPerc = Math.round(infoError / this.incorrectLoaded * 10000) / 100;
        this.withErrors = notLoaded + this.incorrectLoaded;
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
        var allMissing = [];
        var notLoaded = 0;
        for (var bulletin of this.props.data) {
            if (bulletin.getDistribution() !== null) {
                var missing = bulletin.checkRecommendedProperties();
                allMissing.push(missing);
            } else {
                notLoaded++;
            }
        }
        var correctCount = 0;
        var bulletinError = 0;
        var infoError = 0;
        for (var missing of allMissing) {
            if (missing.bulletin.length == 0 && missing.information.length == 0) {
                correctCount++;
            } else {
                if (missing.bulletin.length > 0 ) {
                bulletinError++;
                } 
                if (missing.information.length >= 0) {
                    infoError++;
                }
            }
        }
        var count = this.props.data.length;
        return new ValidationParams(count, notLoaded, correctCount, bulletinError, infoError);
    }
    getPieData() {
        var values = [this.params.correctPerc, this.params.notLoadedPerc, this.params.incorrectLoaded];
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
                    {"Celkem úředních desek: " + this.params.count}
                </ListGroup.Item>
                <ListGroup.Item>
                    {"Nelze načíst distribuci u " + this.params.notLoaded + " desek (" + this.params.notLoadedPerc + " %)."}
                </ListGroup.Item>
                <ListGroup.Item>
                    {"Z načtených, nalezeny nedostatky u " + this.params.incorrectLoaded + " desek (" + this.params.incorrectLoadedPerc + " %)."}
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
            </>
        );
        
    }
}

export { Statistics };