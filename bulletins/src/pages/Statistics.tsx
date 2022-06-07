import React from 'react';
import { Row } from 'react-bootstrap';
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
    constructor(props: any) {
        super(props);
        this.state = {loaded : false};
        this.data = new Datasets();
    }
    async componentDidMount() {
        await this.data.fetchDatasets();
        await this.data.fetchAllDistibutions();
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
                <ValidationStatistics data={this.data.data} />
                <ProviderStatistics />
            </>
        );

    }
}

class ProviderStatistics extends React.Component {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <Row>
                <h3>Statistika poskytovatelů úředních desek</h3>
            </Row>
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
        var data = [this.params.correctPerc]
    }
    render() {
        return (
            <>
                <Row>
                    <h3>Validace úředních desek - statistika</h3>
                </Row>
                <ul>
                    <li>
                        {"Celkem úředních desek: " + this.params.count}
                    </li>
                    <li>
                        {"Nelze načíst distribuci u " + this.params.notLoaded + " desek (" + this.params.notLoadedPerc + " %)."}
                    </li>
                    <li>
                        {"Z načtených, nalezeny nedostatky u " + this.params.incorrectLoaded + " desek (" + this.params.incorrectLoadedPerc + " %)."}
                    </li>
                    <li>
                        {"Z toho " + this.params.bulletinError + " desek (" + this.params.bulletinPerc + " %) nemá všechny doporučené atributy v metadatech celé desky."}
                    </li>
                    <li>
                        {"A " + this.params.infoError + " desek (" + this.params.infoPerc + " %) nemá všechny doporučené atributy u všech informací, zveřejněných na desce." }
                    </li>
                    <li>
                        {"Celkem úředních desek s nedostatky: " + this.params.withErrors + " (" + this.params.withErrorsPerc + " %)"}
                    </li>
                </ul>
            </>
        );
        
    }
}

export { Statistics };