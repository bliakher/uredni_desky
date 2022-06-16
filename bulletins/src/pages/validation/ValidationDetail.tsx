import React from 'react';
import { useLocation } from "react-router-dom";
import { BulletinData, InfoRecord, getBulletinByIri } from '../../model/dataset';
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
                return (<p>Chyba: Nevalidní iri datasetu - nelze načíst.</p>)
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
                            {/* <div>{"Datum vyvěšení: " + issuedStr}</div>
                            <div>{"Relevantní do: " + validToStr}</div> */}
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


function renderRecommendedProps(missingBulletinProps: Array<string>) {
    return (
        <>
            <h4>Doporučené atributy desky:</h4>
            <p>Aby bylo možné data z úřední desky smysluplně používat, měla by obsahovat následující atributy:</p>
            <ul>
                {["@context", "typ", "iri", "stránka", "provozovatel"].map(prop => <li key={prop}>{prop}</li>)}
            </ul>
            <p>Viz <a href="https://ofn.gov.cz/úředn%C3%AD-desky/2021-07-20/#př%C3%ADklady-jednoduchá-informace" target="_blank" rel="noreferrer" >dokumentace</a></p>
            
            { missingBulletinProps.length > 0 &&
                <>
                    <p style={{color: 'red'}}>Chybí atributy:</p>
                    <ul>
                        {missingBulletinProps.map(bulProp => (<li key={bulProp}>{bulProp}</li>))}
                    </ul>
                </>
            }
            { missingBulletinProps.length == 0 && 
                <p style={{color: 'green'}}>Obsahuje všechny doporučené atributy.</p>
            }
        </>
    );
}

function renderRecommendedInfoProps(missingInfoProps: Array<{name:string, missing: Array<string>}>, infoCount: number) {
    return (
        <>
            <h4>Doporučené atributy informací na desce:</h4>
            <p>Každá informace na úřední desce by také měla obsahovat tyto atributy:</p>
            <ul>
                {["typ", "iri", "url", "název", "vyvěšení", "relevantní_do"].map(prop => <li key={prop}>{prop}</li>)}
            </ul>
            { missingInfoProps.length > 0 &&
                <>
                    <p>Informací celkem: {infoCount}</p>
                    <p style={{color: 'red'}}>Informace s chybějícími atributy: {missingInfoProps.length}</p>
                    {/* <ul>
                        {missingInfoProps.map(info => (
                            <li key={info.name}>
                                {info.name}
                                <ul>
                                    {info.missing.map(prop => <li key={prop}>{prop}</li>)}
                                </ul>
                            </li>))}
                    </ul> */}
                </>
            }
            { missingInfoProps.length == 0 && 
                <p style={{color: 'green'}}>Všechny informace na desce obsahují doporučené atributy.</p>
            }
        </>
    );
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

const ValidationBody = (props: {bulletin: BulletinData}) => {
    var bulletin = props.bulletin;
    var missing = bulletin.checkRecommendedProperties();
    var info = bulletin.getInfoRecords();
    var infoCount = info ? info.length : 0;
    var hasErrors = missing.bulletin.length > 0 || missing.information.length > 0 || !bulletin.hasValidSource;
    return (
        <>
            {/* <h4>Shrnutí:</h4>
            { hasErrors && <p style={{color: 'red'}}>Nalezeny chyby</p> }
            { !hasErrors && <p style={{color: 'green'}}>Validace v pořádku</p> } */}

            { !bulletin.hasValidSource && 
                (
                    <Row className="justify-content-md-center">
                        <Col className="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-7 col-xxl-6">
                            <ErrorCard bulletinIri={bulletin.iri} source={bulletin.source} error={bulletin.loadError.message} />
                        </Col>
                    </Row>
                )
                }

            { bulletin.hasValidSource && renderRecommendedProps(missing.bulletin) }
            { bulletin.hasValidSource && renderRecommendedInfoProps(missing.information, infoCount) }

            { bulletin.hasValidSource &&
                (<>
                    <Row className="p-2 text-center ">
                        <h4>Úřední deska</h4>
                    </Row>
                    <InfoCards data={info ? info : []} cardElement={InfoCardValidation}/>
                </>)
            }
            
        </>
    );
}

const ErrorCard = (props: {bulletinIri: string, source: string, error: string}) => {

    return (
        <Card border="danger" className="m-2">
            <Card.Header>Chyba distribuce</Card.Header>
            <Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroupItem>
                        <Card.Title>Distribuci nebylo možné stáhnout</Card.Title>
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
                        </ol>
                    </ListGroupItem>
                </ListGroup>
                
                <Button variant="outline-secondary" href={"https://data.gov.cz/datová-sada?iri=" + props.bulletinIri} target="_blank">Zobrazit datasetv NKOD</Button>
            </Card.Body>
        </Card>
    );
}