import React from 'react';
import { useLocation } from 'react-router';
import { BulletinData } from '../../model/dataset';
import { DatasetStore } from '../../model/DatasetStore';
import { CancelablePromise, makeCancelable } from '../../model/cancelablePromise';
import { fetchOrganizationNameByIco } from '../../services/query';
import { Loader } from '../../Utils';
import { InfoCards, InfoCard } from './InfoCards';
import znak from '../../statni_znak.png';
import { Container, Row, Col, Button, ListGroup, ListGroupItem, Form } from 'react-bootstrap';

export const BulletinDetail = () => {
    var params = new URLSearchParams(useLocation().search);
    var iriNull = params.get("iri");
    var iri = iriNull == null ? "" : iriNull;
    return (<BulletinDetailComplete iri={iri} />);
}

const DetailHeader = (props: {
    title: string,
    bulletinIri: string,
    url: string | null,
    providerName: string,
    ownerName: string | null
}) => {
    return (
        <>
            <div className="text-center">
                <img alt="logo" src={znak} width="50" height="60" className="d-inline-block align-top mt-2" />
            </div>
            <div className="text-center justify-content-md-center mb-4 mt-2">
                <h3>
                    {props.title + " "}
                </h3>
            </div>
            <Row className="text-center justify-content-md-center m-2">
                <Col className="col-6 col-sm-6 col-md-5 col-lg-4 col-xl-4 col-xxl-4" >
                    {/* <ListGroup className="list-group-flush border border-secondary rounded">
                        <ListGroupItem>Poskytovatel dat: {props.providerName}</ListGroupItem>
                        { props.ownerName != null &&
                        <ListGroupItem>
                            Provozovatel: {props.ownerName}
                        </ListGroupItem>}
                    </ListGroup> */}

                    <div>
                        <div>Poskytovatel dat: {props.providerName}</div>
                        {props.ownerName != null &&
                            <div>Provozovatel: {props.ownerName}</div>}
                    </div>

                </Col>
            </Row>
            <div className="text-center justify-content-md-center m-3">
                <span>
                    <Button variant="outline-secondary" href={"https://data.gov.cz/datová-sada?iri=" + props.bulletinIri} target="_blank" className="m-1">
                        Dataset v NKOD
                    </Button>
                    {props.url &&
                        <Button href={props.url} target="_blank" variant="outline-secondary" className="m-1">
                            Stránka desky
                        </Button>}
                </span>
            </div>
        </>
    );
}

interface BulletinDetailState {
    loaded: boolean;
    invalidIri: boolean;
    ownerName: string | null;
    finderOn: boolean;
    finderValue: string;
}

class BulletinDetailComplete extends React.Component<{ iri: string }, BulletinDetailState> {
    data: BulletinData | null;

    fetchBulletinPromise: CancelablePromise | null;
    fetchDistributionPromise: CancelablePromise | null;
    fetchOrganizationPromise: CancelablePromise | null;
    constructor(props: { iri: string }) {
        super(props);
        this.state = { loaded: false, invalidIri: false, ownerName: null, finderOn: false, finderValue: "" };
        this.data = null;
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.fetchBulletinPromise = null;
        this.fetchDistributionPromise = null;
        this.fetchOrganizationPromise = null;
    }
    async componentDidMount() {
        this.fetchBulletinPromise = makeCancelable(DatasetStore.getBulletinByIri(this.props.iri))
        var data = await this.fetchBulletinPromise.promise;
        if (data == null) {
            this.setState({ loaded: true, invalidIri: true });
        } else {
            this.data = data;
            this.fetchDistributionPromise = makeCancelable(data.fetchDistribution());
            await this.fetchDistributionPromise.promise;
            this.setState({ loaded: true });
            var distribution = data.getDistribution();
            var publisher = distribution?.getPublisher();
            if (publisher) {
                var ico = publisher.ičo;
                this.fetchOrganizationPromise = makeCancelable(fetchOrganizationNameByIco(ico));
                var name = await this.fetchOrganizationPromise.promise;
                this.setState({ ownerName: name });
            }
        }
    }

    componentWillUnmount() {
        if (this.fetchBulletinPromise) this.fetchBulletinPromise.cancel();
        if (this.fetchDistributionPromise) this.fetchDistributionPromise.cancel();
        if (this.fetchOrganizationPromise) this.fetchOrganizationPromise.cancel();
    }
    handleChange(event: any) {
        this.setState({ finderValue: event.target.value });
    }
    handleSubmit(event: any) {
        event.preventDefault();
        this.setState({ finderOn: true });
    }
    handleCancel(event: any) {
        this.setState({ finderValue: "", finderOn: false });
    }
    render() {
        if (this.state.loaded) {
            if (!this.state.invalidIri && this.data != null) {
                var infoRecordsOrFalse = this.data.getInfoRecords();
                var infoRecords = infoRecordsOrFalse ? infoRecordsOrFalse : [];
                var filteredRecords = infoRecords.filter(record => {
                    var name = record.getName();
                    return name && name.toLowerCase().includes(this.state.finderValue.toLowerCase());
                });
                var url = this.data.distribution?.getPageUrl() ?? null;
                return (
                    <>
                        <Container>
                            <DetailHeader title={this.data.name} bulletinIri={this.data.iri} url={url}
                                providerName={this.data.provider.name} ownerName={this.state.ownerName} />
                            <hr />
                            {/**  className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-xxl-3 d-flex"  */}
                            <Row className="text-center justify-content-md-center d-flex align-items-center">

                                <Col className="col-6 col-sm-6 col-md-5 col-lg-4 col-xl-4 col-xxl-3" >
                                    <ListGroup className="list-group-flush border border-secondary rounded">
                                        <ListGroupItem><h6>Vyhledávání informace:</h6></ListGroupItem>
                                        <ListGroupItem>
                                            <Form onSubmit={this.handleSubmit} >
                                                <Form.Group id="form-finder">

                                                    <Form.Control type="text" id="finder" onChange={this.handleChange} />
                                                    {/* <input type="submit" value="Najít"/>
                                                    <input type="cancel" value="Zrušit vyhledání" onClick={this.handleCancel}/> */}
                                                    <Button type="submit" variant="outline-primary" className="m-2">
                                                        Najít
                                                    </Button>
                                                    <Button type="reset" onClick={this.handleCancel} variant="outline-primary" className="m-2">
                                                        Zrušit vyhledání
                                                    </Button>
                                                </Form.Group>
                                            </Form>
                                        </ListGroupItem>
                                    </ListGroup>
                                </Col>
                            </Row>

                            {this.state.loaded && !this.data.hasValidSource && (
                                <Row className="text-center justify-content-md-center m-3 p-2 warning-text">
                                    <p>Data nebylo možné načíst.</p>
                                </Row>
                            )}

                            <InfoCards data={this.state.finderOn ? filteredRecords : infoRecords} cardElement={InfoCard} />

                            <Row className="text-center justify-content-md-center">
                                <Col>
                                    <Button href={"#/validace/detail?iri=" + this.data.iri} variant="outline-primary">
                                        Validovat úřední desku
                                    </Button>
                                </Col>
                            </Row>
                        </Container>

                    </>);

            } else {
                return (<p>Chyba: Nevalidní iri datasetu - nelze načíst.</p>)
            }
        } else {
            return (<Loader />);
        }
    }
}
