import React from 'react';
import { useLocation } from 'react-router';
import { BulletinData } from '../../model/dataset';
import { DatasetStore } from '../../model/DatasetStore';
import { CancelablePromise, makeCancelable } from '../../model/cancelablePromise';
import { fetchOrganizationNameByIco } from '../../services/query';
import { Loader } from '../Utils';
import { InfoCards, InfoCard } from './InfoCards';
import znak from '../../statni_znak.png';
import { Container, Row, Col, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FinderForm } from '../forms/FinderForm';

/**
 * Bulletin detail wrapper component
 * Uses hook useLocation to get IRI of the bulletin from the query part of URL
 * Must be a functional component to use the hook
 */
export const BulletinDetail = () => {
    var params = new URLSearchParams(useLocation().search);
    var iriNull = params.get("iri");
    var iri = iriNull == null ? "" : iriNull;
    return (<BulletinDetailComplete iri={iri} />);
}

interface DetailHeaderProps {
    /** name of the bulletin */
    title: string;
    /** IRI of bulletin dataset */
    bulletinIri: string;
    /** URL where bulletin is posted */
    url: string | null;
    /** name of bulletin data provider to NDC  */
    providerName: string;
    /** name of the owner of the bulletin */
    ownerName: string | null;
}

/**
 * Header of the bulletin detail page
 */
const DetailHeader = (props: DetailHeaderProps) => {
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

            <div className="text-center justify-content-md-center m-2">
                <div>Poskytovatel dat: {props.providerName}</div>
                {props.ownerName != null &&
                    <div>Provozovatel: {props.ownerName}</div>}
            </div>

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

/**
 * Props of the BulletinDetail component
 */
interface BulletinDetailProps {
    /** IRI of bulletin dataset, used to load the dataset from NDC */
    iri: string;
}

/**
 * State of the BulletinDetail component
 */
interface BulletinDetailState {
    /** has data loaded */
    loaded: boolean;
    /** flag if the IRI is invalid */
    invalidIri: boolean;
    /** 
     * name of the owner of the bulletin 
     * is taken from inside of distribution - can be null if distribution cannot be loaded
     */
    ownerName: string | null;
    /** value in finder text box */
    finderOn: boolean;
    /** flag if finding is on */
    finderValue: string;
}

/** 
 * Component that shows bulletin detail with a list of info cards
 */
class BulletinDetailComplete extends React.Component<BulletinDetailProps, BulletinDetailState> {
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
    private handleChange(event: any) {
        this.setState({ finderValue: event.target.value });
    }
    private handleSubmit(event: any) {
        event.preventDefault();
        this.setState({ finderOn: true });
    }
    private handleCancel() {
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
                var url = this.data.getDistribution()?.getPageUrl() ?? null;
                return (
                    <>
                        <Container>
                            <Button href="#/" className="mt-2 md-offset-2 col" variant='secondary'>
                                Zpět
                            </Button>
                            <DetailHeader title={this.data.name} bulletinIri={this.data.iri} url={url}
                                providerName={this.data.provider.name} ownerName={this.state.ownerName} />
                            
                            <Row className="justify-content-center">

                                    <ListGroup className="list-group-flush border border-secondary rounded col-auto d-block m-4" >
                                        <ListGroupItem><h6>Vyhledávání informace:</h6></ListGroupItem>
                                        <ListGroupItem>
                                            <FinderForm onTextChangeCallback={this.handleChange} 
                                                        onCancelCallback={this.handleCancel}
                                                        onSubmitCallback={this.handleSubmit} />
                                        </ListGroupItem>
                                    </ListGroup>
                            </Row>

                            <hr />

                            {this.state.loaded && !this.data.hasValidSource && (
                                <Row className="text-center justify-content-md-center m-3 p-2 warning-text">
                                    <p>Data nebylo možné načíst.</p>
                                </Row>
                            )}

                            <InfoCards data={this.state.finderOn ? filteredRecords : infoRecords} cardElement={InfoCard} />

                            <Row className="text-center justify-content-md-center m-2">
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
