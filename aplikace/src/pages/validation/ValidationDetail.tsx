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
                            Zpět
                        </Button>
                        <p>Chyba: Nevalidní IRI datasetu - nelze načíst.</p>
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
                Zpět
            </Button>
            <Row className="p-2 text-center ">
                <h2>Validace úřední desky</h2>
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
                            <Tab title="Informace s chybějícími atributy" eventKey="info" key="info">
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
                        <Card.Title>Úřední deska neobsahuje všechny doporučené atributy</Card.Title>
                    </ListGroupItem>

                    {props.missing.bulletin.length > 0 &&
                        <ListGroupItem>
                            <div className="fw-bold">Chybějící atributy úřední desky:</div>
                            <ul>
                                {props.missing.bulletin.map(property => (<li key={property}>{property}</li>))}
                            </ul>
                        </ListGroupItem>}

                    {props.missing.information.length > 0 &&
                        <ListGroupItem>
                            <div>Informací celkem: {props.infoCount}</div>
                            <div>Informací s chybějícími doporučenými atributy: {props.missing.information.length}</div>
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
            <Card.Header>Validace v pořádku</Card.Header>
            <Card.Body>
                <Card.Title className="m-1">Úřední deska obsahuje všechny doporučené atributy</Card.Title>
                <Card.Text className="m-3">
                    Počet informací na desce: {props.infoCount}
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
                        <Card.Title>Nelze stáhnout data z úřední desky</Card.Title>
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">Odkaz na distribuci:</div>
                        <a href={props.source} target="_blank" rel="noreferrer">{props.source}</a>
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">Chybová hláška:</div>
                        <div className="warning-text">{props.error}</div>
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">Jak postupovat?</div>
                        <ol>
                            <li className='p-1'>
                                Zkontrolujte, že odkaz je platný a vede na soubor s distribucí úřední desky.
                            </li>
                            <li className='p-1'>
                                Zkontrolujte nastavení 'CORS' hlavičky 'Access-Control-Allow-Origin'.
                                Hlavičku je potřeba nastavit tak, aby byl povolen strojový přístup k distribuci požadavkem z kódu.
                                Více o nastavení hlavičky <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin" target="_blank" rel="noreferrer">zde</a>.
                            </li>
                            <li className='p-1'>
                                <a href={"https://www.ssllabs.com/ssltest/analyze.html?d=" + props.source} target="_blank" rel="noreferrer">Zkontrolujte</a> platnost SSL certifikátu.
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
                Validaci provádíme na základě <a href="https://ofn.gov.cz/úředn%C3%AD-desky/2021-07-20/" target="_blank" rel="noreferrer">specifikace</a> OFN pro úřední desky.
                Všechny atributy definované specifikací jsou nepovinné.
                Nicméně, aby bylo možné data z úřední desky smysluplně používat, měly by obsahovat alespoň minimální sadu atributů.
                Tyto doporučené atributy jsou vyjmenovány v <a href="https://ofn.gov.cz/úředn%C3%AD-desky/2021-07-20/#př%C3%ADklady-jednoduchá-informace" target="_blank" rel="noreferrer">příkladu</a> dat ve specifikaci.
            </p>
            <div className="m-2">
                <h5>Doporučené atributy úřední desky</h5>
                <p>
                    Jedná se o atributy, které popisují úřední desku jako celek. Patří sem:
                </p>
                <ListGroup className="list-group-flush">
                    <ListGroupItem>
                        <div className="fw-bold">typ</div>
                        Typ dat, které soubor obsahuje. Hodnota bude vždy "Úřední deska".
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">iri</div>
                        Jednoznačný identifikátor souboru s daty.
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">stránka</div>
                        URL stránky, kde je úřední deska zveřejněná v uživatelsky čitelné formě.
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">provozovatel</div>
                        Orgán, který provozuje úřední desku, identifikovaný pomocí IČO nebo čísla OVM.
                    </ListGroupItem>
                </ListGroup>
            </div>
            <div className="m-2">
                <h5>Doporučené atributy informace na úřední desce</h5>
                <p>
                    Jedná se o atributy, které se týkají jedné konkrétní informace na úřední desce.
                </p>
                <ListGroup className="list-group-flush">
                    <ListGroupItem>
                        <div className="fw-bold">typ</div>
                        Jaký typ dat je informace - konkrétně "Digitální objekt" a "Informace na úřední desce".
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">url</div>
                        URL informace na stránce úřední desky.
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">název</div>
                        Název informace.
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">vyvěšení</div>
                        Datum vyvěšení informace na úřední desku.
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className="fw-bold">relevantní_do</div>
                        Datum do kterého je informace vyvěšená na úřední desce relevantní.
                        Pokud nemá informace datum ukončení platnosti, měla by být hodnota atributu relevantní_do nastavená jako nespecifikované datum <a href="https://ofn.gov.cz/z%C3%A1kladn%C3%AD-datov%C3%A9-typy/2020-07-01/#example-49-nespecifikovany-casovy-okamzik-v-json-ld" target="_blank" rel="noreferrer">takto</a>.
                    </ListGroupItem>
                </ListGroup>
            </div>
        </div>
    );
}