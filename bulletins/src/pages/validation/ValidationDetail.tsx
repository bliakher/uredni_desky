import React from 'react';
import { useLocation } from "react-router-dom";
import { BulletinData, InfoRecord, getBulletinByIri, MissingProperties } from '../../model/dataset';
import {Attachements, InfoCards } from '../detail/InfoCards';
import { Card, ListGroup, ListGroupItem, Row, Button, Col } from 'react-bootstrap';
import { HoverTooltip, Loader } from '../../Utils';
import { BsCalendar2Event as CalendarEventIcon, BsCalendar2XFill as CalendarXFillIcon } from 'react-icons/bs';

export const ValidationDetail = () => {
    var params = new URLSearchParams(useLocation().search);
    var iriNull = params.get("iri");
    var iri = iriNull == null? "" : iriNull;
    return (<ValidationDetailComplete iri={iri} />);
}

class ValidationDetailComplete extends React.Component<{iri: string}, {loaded: boolean, invalidIri: boolean}> {
    data: BulletinData | null;
    constructor(props: any) {
        super(props);
        this.state = {loaded: false, invalidIri: false }
        this.data = null;
    }
    async componentDidMount() {
        var data = await getBulletinByIri(this.props.iri);
        if (data == null) {
            this.setState({loaded: true, invalidIri: true});
        } else {
            this.data = data;
            await this.data.fetchDistribution();
            this.setState({loaded: true});
        }
    }
    render() {
        if (this.state.loaded) {
            if (!this.state.invalidIri && this.data != null) {
                return (
                    <>
                        <ValidationHeader provider={ this.data.provider.name} bulletinName={this.data.name}
                            iri={this.data.iri} />
                        <ValidationBody bulletin={this.data} />
                    </>);
                
            } else {
                return (
                    <Row className='justify-content-md-center text-center'>
                        <p>Chyba: Nevalidní IRI datasetu - nelze načíst.</p>
                        <p>IRI: {this.props.iri}</p>
                    </Row>)
            }
        } else {
            return (<Loader />);
        }
        
    }
}

class InfoCardValidation extends React.Component<{data: InfoRecord}> {
    constructor(props: {data: InfoRecord}) {
        super(props);
    }
    render() {
        var info = this.props.data;
        var name = info.getName()? info.getName() : "'Informace na úřední desce'";
        var url = info.getUrl();
        var issued = info.getDateIssued();
        var issuedStr = issued ? issued.to_string() : "Údaj chybí";
        var validTo = info.getDateValidTo();
        var validToStr = validTo ? validTo.to_string() : "Údaj chybí";
        var isValid = (validTo && validTo.date) ? validTo.date >= new Date() : true; // check valdity - validTo date is older than today
        var documents = info.getDocuments().filter(document => document.getUrl() !== null); // take only documents with url
        return (
            <>
                <Card style={{ width: '18rem' }} className="m-2">
                    <Card.Body>
                        <Card.Title>{name}</Card.Title>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                        <ListGroupItem>
                            <HoverTooltip tooltipText="Datum vyvěšení" innerElement={
                                <div>
                                    <CalendarEventIcon className="m-2"/>
                                    {issuedStr}
                                </div>
                            }/>
                            <HoverTooltip tooltipText="Relevantní do" innerElement={
                                <div>
                                    <CalendarXFillIcon className="m-2"/>
                                    {isValid && validToStr}
                                    {!isValid && <b>{validToStr}</b>}
                                </div>
                            }/>
                           
                        </ListGroupItem>
                    {documents.length > 0 && (
                        <>
                            <ListGroupItem>
                                <h6>Přílohy:</h6>
                                <Attachements documents={documents}/>
                            </ListGroupItem> 
                        </> )}
                        <ListGroupItem>
                            {url && <Button href={url} target="_blank" rel="noreferrer" variant="primary" >
                                        Informace
                                    </Button>}
                        </ListGroupItem>
                    </ListGroup>
                    
                </Card>
            </>
        );
    }
}


const ValidationHeader = (props: {provider: string, bulletinName: string, iri: string}) => {
    return (
        <>
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
                <p>Poskytovatel: {props.provider}</p>
            </Row>
            
        </>
    );
}

const CenterOnHalfScreen = (props: {element: any}) => {
    return (
        <Row className="justify-content-md-center">
            <Col className="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-7 col-xxl-6">
                { props.element }
            </Col>
        </Row>
    );
}

const ValidationBody = (props: {bulletin: BulletinData}) => {
    var bulletin = props.bulletin;
    var missing = bulletin.checkRecommendedProperties();
    var info = bulletin.getInfoRecords();
    var infoCount = info ? info.length : 0;
    var hasErrors = missing.bulletin.length > 0 || missing.information.length > 0 || !bulletin.hasValidSource;
    return (
        <>
            { !bulletin.hasValidSource && 
                    <CenterOnHalfScreen element={ 
                        <ErrorCard bulletinIri={bulletin.iri} source={bulletin.source} error={bulletin.loadError.message} />
                    } />
                }

            { bulletin.hasValidSource && !hasErrors &&
                <CenterOnHalfScreen element={ 
                    <SuccessCard bulletinIri={bulletin.iri} infoCount={infoCount} /> 
                } />
                }

            { bulletin.hasValidSource && hasErrors &&
                <CenterOnHalfScreen element={ 
                    <MissingCard bulletinIri={bulletin.iri} infoCount={infoCount} missing={missing} /> 
                } />
                }

            <CenterOnHalfScreen element={
                <ValidationCriteria />
            } />

            {/* { bulletin.hasValidSource && hasErrors && } */}

            {/* { bulletin.hasValidSource && renderRecommendedProps(missing.bulletin) }
            { bulletin.hasValidSource && renderRecommendedInfoProps(missing.information, infoCount) } */}

            {/* { bulletin.hasValidSource &&
                (<>
                    <Row className="p-2 text-center ">
                        <h4>Úřední deska</h4>
                    </Row>
                    <InfoCards data={info ? info : []} cardElement={InfoCardValidation}/>
                </>)
            } */}
            
        </>
    );
}

const ShowDatasetButton = (props: {bulletinIri: string}) => {
    return (
        <Button variant="outline-secondary" href={"https://data.gov.cz/datová-sada?iri=" + props.bulletinIri} target="_blank">
            Zobrazit dataset v NKOD
        </Button>
    );
}

const MissingCard = (props: {missing: MissingProperties, infoCount: number, bulletinIri: string}) => {
    return (
        <Card border="warning" className="m-2">
        <Card.Header>Nalezeny nedostatky</Card.Header>
        <Card.Body>
            <ListGroup className="list-group-flush">
                <ListGroupItem>
                    <Card.Title>Úřední deska neobsahuje všechny doporučené atributy</Card.Title>
                </ListGroupItem>

                { props.missing.bulletin.length > 0 &&
                <ListGroupItem>
                    <div className="fw-bold">Chybějící atributy úřední desky:</div>
                    <ul>
                        { props.missing.bulletin.map(property => (<li key={property}>{property}</li>)) }
                    </ul>
                </ListGroupItem> }

                { props.missing.information.length > 0 &&
                <ListGroupItem>
                    <div className="fw-bold">Informací celkem:</div>{props.infoCount}
                    <div className="fw-bold">Informací s chybějícími doporučenými atributy</div>{props.missing.information.length}
                </ListGroupItem> }

            </ListGroup>
            <ShowDatasetButton bulletinIri={props.bulletinIri} />
        </Card.Body>
    </Card>
    );
}

const SuccessCard = (props: {infoCount: number, bulletinIri: string}) => {
   return (
    <Card border="success" className="m-2">
        <Card.Header>Validace v pořádku</Card.Header>
        <Card.Body>
            <Card.Title className="m-1">Úřední deska obsahuje všechny doporučené atributy</Card.Title>
            <Card.Text className="m-3">
                    <div>Počet informací na desce: {props.infoCount}</div>
            </Card.Text>
            <ShowDatasetButton bulletinIri={props.bulletinIri} />
            
        </Card.Body>
    </Card>
   );
}

const ErrorCard = (props: {bulletinIri: string, source: string, error: string}) => {

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
                        <a href={props.source} target="_blank">{props.source}</a>
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
                                Více o nastavení hlavičky <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin" target="_blank">zde</a>.
                            </li>
                            <li className='p-1'>
                                Zkontrolujte platnost SSL certifikátu.
                            </li>
                        </ol>
                    </ListGroupItem>
                </ListGroup>
                <ShowDatasetButton bulletinIri={props.bulletinIri} />
            </Card.Body>
        </Card>
    );
}

const ValidationCriteria = (props: {}) => {
    return (
        <div className="m-3">
            <h3>Jak validujeme?</h3>
            <p>
                Validaci provádíme na základě <a href="https://ofn.gov.cz/úředn%C3%AD-desky/2021-07-20/">specifikace</a> OFN pro úřední desky. 
                Všechny atributy definované specifikací jsou nepovinné. 
                Nicméně, aby bylo možné data z úřední desky smysluplně používat, měly by obsahovat alespoň minimální sadu atributů.
                Tyto doporučené atributy jsou vyjmenovány v <a href="https://ofn.gov.cz/úředn%C3%AD-desky/2021-07-20/#př%C3%ADklady-jednoduchá-informace">příkladu</a> dat ve specifikaci.
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
                    </ListGroupItem>
                </ListGroup>
            </div>
        </div>
    );
}