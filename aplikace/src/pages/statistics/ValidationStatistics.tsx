import React from 'react';
import { Col, ListGroup, Row, ListGroupItem } from 'react-bootstrap';
import { BulletinData } from '../../model/dataset';
import Plotly from 'plotly.js-dist-min';
import { BulletinListComponentProps } from '../componentInterfaces';

/**
 * Class that encapsulates all validation statistic data
 */
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

/**
 * Component that displayes validation statistics in text and pie plot using Plotly
 */
export class ValidationStatistics extends React.Component<BulletinListComponentProps, {}> {
    pieContainer: React.RefObject<HTMLInputElement>;
    params: ValidationParams;
    constructor(props: { data: BulletinData[] }) {
        super(props);
        this.pieContainer = React.createRef();
        this.params = this.initParams();
    }
    componentDidMount() {
        var values = [this.params.correctPerc, this.params.notLoadedPerc, this.params.incorrectLoadedPerc];
        var labels = ["Bez nedostatků", "Nelze stáhnout distribuci", "Chybějící doporučené atributy"];
        var data: { values: number[], labels: string[], type: ("pie" | undefined) }[] = [{
            values: values,
            labels: labels,
            type: 'pie'
        }];
        var layout = {
            height: 300,
            width: 450
        };
        if (this.pieContainer.current) {
            Plotly.newPlot(this.pieContainer.current, data, layout);
        }
    }
    private initParams() {
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
    private renderStatText() {
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
                                {"A " + this.params.infoError + " desek (" + this.params.infoPerc + " %) nemá všechny doporučené atributy u všech informací, zveřejněných na desce."}
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
                <Row className="text-center justify-content-center">
                    <h4>Validace úředních desek</h4>
                </Row>
                <Row className="text-center justify-content-center">
                    <Col className="col-11 col-sm-11 col-md-6 col-lg-6 col-xl-6 col-xxl-6 d-flex p-2 m-2">
                        <p>
                            Validaci provádíme na základě <a href="https://ofn.gov.cz/úředn%C3%AD-desky/2021-07-20/">specifikace</a> OFN pro úřední desky, která obsahuje seznam doporučených atributů, které by zveřejněná deska měla obsahovat.
                            Podrobnější informace a validaci konkrétních úředních desek naleznete v sekci <a href="#/validace">Validace</a>.
                        </p>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col className="col-11 col-sm-11 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex m-2">
                        {this.renderStatText()}
                    </Col>
                    <Col className="col-11 col-sm-11 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                        <div ref={this.pieContainer} />
                    </Col>
                </Row>
                <Row className="text-center justify-content-center">
                    <Col className="col-11 col-sm-11 col-md-6 col-lg-6 col-xl-6 col-xxl-6 d-flex p-2 m-2">
                        <p>
                            V této části se zobrazují pouze úřední desky, u kterých byly nalezeny nedostatky. Kliknutím na název úřední desky se zobrazí podrobnosti z validace úřední desky.
                        </p>
                    </Col>
                </Row>
                <Row className="justify-content-center m-2">
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

/**
 * Displayes all bulletins that have some problems - not loadable distribution or missing params
 */
const ProblematicBulletins = (props: { header: string, bulletins: BulletinData[] }) => {
    return (
        <ListGroup>
            <ListGroupItem>
                <div className="fw-bold text-center">{props.header}</div>
            </ListGroupItem>
            {props.bulletins.map(bulletin => (
                <ListGroupItem key={bulletin.iri + Math.random().toString()}>
                    <div>
                        <div className="fw-bold">{bulletin.provider.name}</div>
                        <a href={"#/validace/detail?iri=" + bulletin.iri}>{bulletin.name}</a>
                    </div>
                </ListGroupItem>))}
        </ListGroup>
    );
}