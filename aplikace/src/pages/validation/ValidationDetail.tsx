import React from 'react';
import { useLocation } from "react-router-dom";
import { BulletinData, MissingProperties } from '../../model/dataset';
import { DatasetStore } from '../../model/DatasetStore';
import { Card, ListGroup, ListGroupItem, Row, Button, Col, Tab, Tabs, Container } from 'react-bootstrap';
import { Loader } from '../Utils';
import { ShowDatasetButton } from '../forms/ShowDatasetButton';
import { InfoCardValidation } from '../detail/InfoCards';
import { BulletinComponentProps } from '../componentInterfaces';

/**
 * Validation detail wrapper component
 * Uses hook useLocation to get IRI of the bulletin from the query part of URL
 * Must be a functional component to use the hook
 */
export const ValidationDetail = () => {
    var params = new URLSearchParams(useLocation().search);
    var iriNull = params.get("iri");
    var iri = iriNull == null ? "" : iriNull;
    return (<ValidationDetailComplete iri={iri} />);
}

class ValidationDetailComplete extends React.Component<{ iri: string }, { loaded: boolean, invalidIri: boolean }> {
    data: BulletinData | null;
    constructor(props: any) {
        super(props);
        this.state = { loaded: false, invalidIri: false }
        this.data = null;
    }
    async componentDidMount() {
        var data = await DatasetStore.getBulletinByIri(this.props.iri);
        if (data === null) {
            this.setState({ loaded: true, invalidIri: true });
        } else {
            this.data = data;
            await this.data.fetchDistribution();
            this.setState({ loaded: true });
        }
    }
    render() {
        if (this.state.loaded) {
            if (!this.state.invalidIri && this.data != null) {
                return (
                    <Container>
                        <ValidationDetailHeader providerName={this.data.provider.name} bulletinName={this.data.name}
                            iri={this.data.iri} />
                        <ValidationBody data={this.data} />
                    </Container>);

            } else {
                return (
                    <Row className='justify-content-md-center text-center'>
                        <Button href="#/validace" className="mt-2  md-offset-2 col-auto" variant='secondary'>
                            Zp??t
                        </Button>
                        <p>Chyba: Nevalidn?? IRI datasetu - nelze na????st.</p>
                        <p>IRI: {this.props.iri}</p>
                    </Row>)
            }
        } else {
            return (<Loader />);
        }

    }
}

/**
 * Props of validation detail header
 */
interface ValidationDetailHeaderProps {
    /** name of provider */
    providerName: string;
    /** name of the bulletin */
    bulletinName: string;
    /** IRI of bulletin dataset */
    iri: string;
}

/**
 * Validation detail header
 */
const ValidationDetailHeader = (props: ValidationDetailHeaderProps) => {
    return (
        <>
            <Button href="#/validace" className="mt-2  md-offset-2 col" variant='secondary'>
                Zp??t
            </Button>
            <Row className="p-2 text-center ">
                <h2>Validace ????edn?? desky</h2>
            </Row>
            <Row className="p-2 text-center ">
                <h4>
                    {props.bulletinName}
                    <Button href={"#/detail?iri=" + props.iri} size="sm" variant="outline-primary" className="m-2  ">Zobrazit desku</Button>
                </h4>
            </Row>
            <Row className="text-center ">
                <p>Poskytovatel: {props.providerName}</p>
            </Row>

        </>
    );
}

/**
 * Component that encapsulates different kinds of validation results
 */

const ValidationBody = (props: BulletinComponentProps) => {
    var bulletin = props.data;
    var missing = bulletin.checkRecommendedProperties();
    var info = bulletin.getInfoRecords();
    var infoCount = info ? info.length : 0;
    var hasErrors = missing.bulletin.length > 0 || missing.information.length > 0 || !bulletin.hasValidSource;
    return (
        <>
            {/* distribution cannot be loaded */}
            {!bulletin.hasValidSource && (
                <>
                    <CenterOnHalfScreen element={
                        <ErrorCard bulletinIri={bulletin.iri} source={bulletin.source} error={bulletin.loadError.message} />
                    } />
                    <CenterOnHalfScreen element={
                        <ValidationCriteria />
                    } />
                </>
            )}

            {/* distribution is loaded and doesn't have missing properties */}
            {bulletin.hasValidSource && !hasErrors && (
                <>
                    <CenterOnHalfScreen element={
                        <SuccessCard bulletinIri={bulletin.iri} infoCount={infoCount} />
                    } />
                    <CenterOnHalfScreen element={
                        <ValidationCriteria />
                    } />
                </>
            )}

            {/* distribution is loaded and has missing properties */}
            {bulletin.hasValidSource && hasErrors && (
                <>
                    <CenterOnHalfScreen element={
                        <MissingCard bulletinIri={bulletin.iri} infoCount={infoCount} missing={missing} />
                    } />

                    <Tabs defaultActiveKey="vysvetlivka" className="justify-content-md-center m-3">
                        <Tab title="Jak validujeme?" eventKey="vysvetlivka" key="vysvetlivka">
                            <CenterOnHalfScreen element={
                                <ValidationCriteria />
                            } />
                        </Tab>
                        {missing.information.length > 0 &&
                            <Tab title="Informace s chyb??j??c??mi atributy" eventKey="info" key="info">
                                <Container>
                                    <Row className="justify-content-md-center text-center">
                                        {missing.information.map(info => (
                                            <InfoCardValidation data={info.info} />
                                        ))}
                                    </Row>
                                </Container>
                            </Tab>}
                    </Tabs>

                </>
            )}
        </>
    );
}

/**
 * Positioning component
 * Makes inner component half the size of the screen and centers it
 */
const CenterOnHalfScreen = (props: {
    element: any // any react component
}) => {
    return (
        <Row className="justify-content-md-center">
            <Col className="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-7 col-xxl-6">
                {props.element}
            </Col>
        </Row>
    );
}

/**
 * Card that displays validation result with missing recommended properties of bulletin distribution
 */
const MissingCard = (props: { missing: MissingProperties, infoCount: number, bulletinIri: string }) => {
    return (
        <Card border="warning" className="m-2">
            <Card.Header>Nalezeny nedostatky</Card.Header>
            <Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroupItem>
                        <Card.Title>????edn?? deska neobsahuje v??echny doporu??en?? atributy</Card.Title>
                    </ListGroupItem>

                    {props.missing.bulletin.length > 0 &&
                        <ListGroupItem>
                            <div className="fw-bold">Chyb??j??c?? atributy ????edn?? desky:</div>
                            <ul>
                                {props.missing.bulletin.map(property => (<li key={property}>{property}</li>))}
                            </ul>
                        </ListGroupItem>}

                    {props.missing.information.length > 0 &&
                        <ListGroupItem>
                            <div>Informac?? celkem: {props.infoCount}</div>
                            <div>Informac?? s chyb??j??c??mi doporu??en??mi atributy: {props.missing.information.length}</div>
                        </ListGroupItem>}

                </ListGroup>
                <ShowDatasetButton bulletinIri={props.bulletinIri} />
            </Card.Body>
        </Card>
    );
}

/**
 * Card that displays success validation result
 */
const SuccessCard = (props: { infoCount: number, bulletinIri: string }) => {
    return (
        <Card border="success" className="m-2">
            <Card.Header>Validace v po????dku</Card.Header>
            <Card.Body>
                <Card.Title className="m-1">????edn?? deska obsahuje v??echny doporu??en?? atributy</Card.Title>
                <Card.Text className="m-3">
                    Po??et informac?? na desce: {props.infoCount}
                </Card.Text>
                <ShowDatasetButton bulletinIri={props.bulletinIri} />

            </Card.Body>
        </Card>
    );
}

/**
 * Card that displays validation result where bulletin distribution cannot be fetched
 */
const ErrorCard = (props: { bulletinIri: string, source: string, error: string }) => {

    return (
        <Card border="danger" className="m-2">
            <Card.Header>Chyba distribuce</Card.Header>
            <Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroupItem>
                        <Card.Title>Nelze st??hnout data z ????edn?? desky</Card.Title>
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">Odkaz na distribuci:</div>
                        <a href={props.source} target="_blank" rel="noreferrer">{props.source}</a>
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">Chybov?? hl????ka:</div>
                        <div className="warning-text">{props.error}</div>
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">Jak postupovat?</div>
                        <ol>
                            <li className='p-1'>
                                Zkontrolujte, ??e odkaz je platn?? a vede na soubor s distribuc?? ????edn?? desky.
                            </li>
                            <li className='p-1'>
                                Zkontrolujte nastaven?? 'CORS' hlavi??ky 'Access-Control-Allow-Origin'.
                                Hlavi??ku je pot??eba nastavit tak, aby byl povolen strojov?? p????stup k distribuci po??adavkem z k??du.
                                V??ce o nastaven?? hlavi??ky <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin" target="_blank" rel="noreferrer">zde</a>.
                            </li>
                            <li className='p-1'>
                                <a href={"https://www.ssllabs.com/ssltest/analyze.html?d=" + props.source} target="_blank" rel="noreferrer">Zkontrolujte</a> platnost SSL certifik??tu.
                            </li>
                        </ol>
                    </ListGroupItem>
                </ListGroup>
                <ShowDatasetButton bulletinIri={props.bulletinIri} />
            </Card.Body>
        </Card>
    );
}

/**
 * Explanation of validation criteria
 */
const ValidationCriteria = (props: {}) => {
    return (
        <div className="m-3">
            <h3>Jak validujeme?</h3>
            <p>
                Validaci prov??d??me na z??klad?? <a href="https://ofn.gov.cz/????edn%C3%AD-desky/2021-07-20/" target="_blank" rel="noreferrer">specifikace</a> OFN pro ????edn?? desky.
                V??echny atributy definovan?? specifikac?? jsou nepovinn??.
                Nicm??n??, aby bylo mo??n?? data z ????edn?? desky smyslupln?? pou????vat, m??ly by obsahovat alespo?? minim??ln?? sadu atribut??.
                Tyto doporu??en?? atributy jsou vyjmenov??ny v <a href="https://ofn.gov.cz/????edn%C3%AD-desky/2021-07-20/#p??%C3%ADklady-jednoduch??-informace" target="_blank" rel="noreferrer">p????kladu</a> dat ve specifikaci.
            </p>
            <div className="m-2">
                <h5>Doporu??en?? atributy ????edn?? desky</h5>
                <p>
                    Jedn?? se o atributy, kter?? popisuj?? ????edn?? desku jako celek. Pat???? sem:
                </p>
                <ListGroup className="list-group-flush">
                    <ListGroupItem>
                        <div className="fw-bold">typ</div>
                        Typ dat, kter?? soubor obsahuje. Hodnota bude v??dy "????edn?? deska".
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">iri</div>
                        Jednozna??n?? identifik??tor souboru s daty.
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">str??nka</div>
                        URL str??nky, kde je ????edn?? deska zve??ejn??n?? v u??ivatelsky ??iteln?? form??.
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">provozovatel</div>
                        Org??n, kter?? provozuje ????edn?? desku, identifikovan?? pomoc?? I??O nebo ????sla OVM.
                    </ListGroupItem>
                </ListGroup>
            </div>
            <div className="m-2">
                <h5>Doporu??en?? atributy informace na ????edn?? desce</h5>
                <p>
                    Jedn?? se o atributy, kter?? se t??kaj?? jedn?? konkr??tn?? informace na ????edn?? desce.
                </p>
                <ListGroup className="list-group-flush">
                    <ListGroupItem>
                        <div className="fw-bold">typ</div>
                        Jak?? typ dat je informace - konkr??tn?? "Digit??ln?? objekt" a "Informace na ????edn?? desce".
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">url</div>
                        URL informace na str??nce ????edn?? desky.
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">n??zev</div>
                        N??zev informace.
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">vyv????en??</div>
                        Datum vyv????en?? informace na ????edn?? desku.
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">relevantn??_do</div>
                        Datum do kter??ho je informace vyv????en?? na ????edn?? desce relevantn??.
                        Pokud nem?? informace datum ukon??en?? platnosti, m??la by b??t hodnota atributu relevantn??_do nastaven?? jako nespecifikovan?? datum <a href="https://ofn.gov.cz/z%C3%A1kladn%C3%AD-datov%C3%A9-typy/2020-07-01/#example-49-nespecifikovany-casovy-okamzik-v-json-ld" target="_blank" rel="noreferrer">takto</a>.
                    </ListGroupItem>
                </ListGroup>
            </div>
        </div>
    );
}