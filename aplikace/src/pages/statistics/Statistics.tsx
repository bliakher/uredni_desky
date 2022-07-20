import React from 'react';
import { Col, ProgressBar, Row, Tab, Tabs } from 'react-bootstrap';
import type { ProviderTypeCountMap, ProviderTypeLabelMap } from '../../model/Provider';
import { DatasetStore } from '../../model/DatasetStore';
import { CancelablePromise, makeCancelable } from '../../model/cancelablePromise';
import { ValidationStatistics } from './ValidationStatistics';
import { ProviderStatistics } from './ProviderStatistics';


const Header = () => {
    return (
        <>
            <Row className="text-center justify-content-center m-2">
                <h2>Statistiky</h2>
            </Row>
            <Row className="text-center justify-content-center m-2">
                <p>Upozornění: pro získání statistik je nutné stažení všech distribucí úředních desek</p>
            </Row>
        </>
    );
}


const Progress = (props: { done: number, total: number }) => {
    var percentage = Math.round(props.done / props.total * 10000) / 100;
    // className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8 col-xxl-6 d-flex p-2 m-2"
    return (
        <Row className="text-center justify-content-center">
            <Col className="col-11 col-sm-11 col-md-8 col-lg-6 col-xl-6 col-xxl-5 p-2 m-2">
                <ProgressBar now={percentage} label={props.done + " z " + props.total} />
            </Col>
        </Row>

    );
}

export class Statistics extends React.Component<{}, { loaded: boolean, downloadCount: number }> {
    data: DatasetStore;
    providerCounts: ProviderTypeCountMap;
    maxProviderCounts: ProviderTypeCountMap;
    providerLabels: ProviderTypeLabelMap;

    fetchDatasetsPromise: CancelablePromise | null;
    fetchDistributionsPromise: CancelablePromise | null;

    constructor(props: any) {
        super(props);
        this.state = { loaded: false, downloadCount: 0 };
        this.data = new DatasetStore();
        this.providerCounts = new Map();
        this.maxProviderCounts = new Map();
        this.providerLabels = new Map();
        this.fetchDatasetsPromise = null;
        this.fetchDistributionsPromise = null;
    }
    async componentDidMount() {
        this.fetchDatasetsPromise = makeCancelable(this.data.fetchDatasets())
        await this.fetchDatasetsPromise.promise;
        this.fetchDistributionsPromise = makeCancelable(Promise.all(
            this.data.data.map(async d => {
                await d.fetchDistribution(25000); // set timeout to 15s
                this.setState({ downloadCount: this.state.downloadCount + 1 });
            })));
        await this.fetchDistributionsPromise.promise;
        // console.log("all downloaded");
        this.providerCounts = await this.data.filterInnerProvidersByType();
        var maps = await this.data.getAllProviderTypes();
        if (maps) {
            this.maxProviderCounts = maps.counts;
            this.providerLabels = maps.labels;
        }

        this.setState({ loaded: true });
    }
    componentWillUnmount() {
        if (this.fetchDatasetsPromise) this.fetchDatasetsPromise.cancel();
        if (this.fetchDistributionsPromise) this.fetchDistributionsPromise.cancel();
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
                            providerLabels={this.providerLabels} />
                    </Tab>
                </Tabs>

            </>
        );

    }
}




