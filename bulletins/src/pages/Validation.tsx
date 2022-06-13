import React from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import { BulletinData, InfoRecord, getBulletinByIri } from '../model/dataset';
import { MissingProperties } from '../model/dataset';
import { RouterProps } from "react-router";
import { BulletinDetail, Attachements, InfoCards } from "./Detail";
import { Card, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { BulletinController } from './BulletinController';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { SimplePaging, HoverTooltip, Loader } from '../Utils';
import { BsCalendar2Event as CalendarEventIcon, BsCalendar2X as CalendarXIcon,
    BsCalendar2PlusFill as CalendarPlusIcon, BsCalendar2XFill as CalendarXFillIcon } from 'react-icons/bs';

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

function renderHeader(provider: string, bulletinName: string, iri: string) {
    return (
        <>
            <Row className="p-2 text-center ">
                <h2>Validace úřední desky</h2>
            </Row>
            <Row className="p-2 text-center ">
                <h4>
                    {bulletinName} 
                    <Button href={"#/detail?iri=" + iri} size="sm" variant="outline-primary" className="m-2  ">Zobrazit desku</Button>
                </h4>
            </Row>
            <Row className="text-center ">
                <p>Poskytovatel: {provider}</p>
            </Row>
            
        </>
    );
}

function renderValidation(bulletin: BulletinData) {
    var missing = bulletin.checkRecommendedProperties();
    var info = bulletin.getInfoRecords();
    var infoCount = info ? info.length : 0;
    var hasErrors = missing.bulletin.length > 0 || missing.information.length > 0 || !bulletin.hasValidSource;
    return (
        <>
            <h4>Shrnutí:</h4>
            { hasErrors && <p style={{color: 'red'}}>Nalezeny chyby</p> }
            { !hasErrors && <p style={{color: 'green'}}>Validace v pořádku</p> }

            { !bulletin.hasValidSource && 
                (
                    <>
                        <p>Distribuci nebylo možné stáhnout z odkazu: 
                            <a href={bulletin.source} target="_blank">{bulletin.source}</a>
                        </p>
                        <p>
                            {"Chybová hláška: " + bulletin.loadError.message}
                        </p>
                        
                    </>
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

interface PropsWithLocation {
    location: RouterProps["location"];
}

const ValidationDetail = () => {
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
                        { renderHeader(this.data.provider.name, this.data.name, this.data.iri) }
                        { renderValidation(this.data) }
                    </>);
                
            } else {
                return (<p>Chyba: Nevalidní iri datasetu - nelze načíst.</p>)
            }
        } else {
            return (<Loader />);
        }
        
    }
}

class ValidationRow extends React.Component<{data: BulletinData}, {loaded: boolean}> {
    ok = "Ano";
    notOk = "Ne";
    noValue = "-";
    constructor(props: {data: BulletinData}) {
        super(props);
        this.state = {loaded: false};
    }
    async componentDidMount() {
        await this.props.data.fetchDistribution();
        this.setState({loaded: true});
    }
    renderWaiting() {
        var provider = this.props.data.provider;
        var name = this.props.data.name;
        return (
            <tr>
                <td>{provider.name}</td>
                <td>{name}</td>
                <td colSpan={6}>Načítá se...</td>
            </tr>
        );
    }
    renderLoaded() {
        var distribution = this.props.data.getDistribution();
        var provider = this.props.data.provider;
        var iri = this.props.data.iri;
        var name = this.props.data.name;
        var source = this.props.data.source;
        var info = this.props.data.getInfoRecords();
        var infoCount = info ? info.length : this.noValue;
        var missing = this.props.data.checkRecommendedProperties();
        var missingBulletin = missing.bulletin.length == 0 ? this.ok : this.notOk;
        var missingInfo = missing.information.length == 0 ? this.ok : this.notOk;
        var errorLevelClass = distribution === null ? "validation-severe" :
                            (missing.bulletin.length > 0 || missing.information.length > 0) ? "validation-warning" :
                            "validation-ok";
        
        return (
            <tr className={"p-2 " + errorLevelClass}>
                <td>{provider.name}</td>
                <td>{name}</td>
                <td className="text-center">{distribution? this.ok : this.notOk }</td>
                <td className="text-center">{distribution? missingBulletin : this.noValue }</td>
                <td className="text-center">{infoCount}</td>
                <td className="text-center">{distribution? missingInfo : this.noValue }</td>
                <td className="text-center">
                    {/* <Link to={"detail?iri=" + iri}>Detail</Link> */}
                    <Button href={"#/validace/detail?iri=" + iri} variant="outline-secondary" size="sm"> + </Button>
                </td>
            </tr>
        );
    }
    render() {
        if (this.state.loaded) {
            return this.renderLoaded();
        }
        return this.renderWaiting();
    }
}

const Validation = () => {
    return (
        <BulletinController headerElement={ValidationHeader} bulletinListElement={ValidationTable}/>
    );
}

const ValidationHeader = () => {
    return (
        <Row className="p-2 text-center ">
            <h2>Validace</h2>
            <p>Tato část se věnuje kvalitě poskytovaných dat.</p>
        </Row>
    );
}

class TableExplanation extends React.Component {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <>
                <div>
                    <div>
                        <b>Distribuce </b> 
                        - uvádí, jestli bylo možné stáhnout distribuci datové sady z URL uvedeného v 
                        <a href="https://data.gov.cz/" target="_blank"> NKOD</a>
                    </div>
                    <div>
                        <b>Doporučené atributy </b> 
                        - jestli metadata úřední desky obsahují všechny doporučené atributy podle 
                        <a href="https://ofn.gov.cz/%C3%BA%C5%99edn%C3%AD-desky/2021-07-20/#p%C5%99%C3%ADklady-jednoduch%C3%A1-informace" target="_blank"> specifikace</a> 
                        (název desky, poskytovatel, URL atd.)
                    </div>
                    <div>
                        <b>Počet informací </b> 
                        - počet informací zveřejněných na dané úřední desce
                    </div>
                    <div>
                        <b>Doporučené atributy informace </b> 
                        - jestli všechny informace zveřejněné na desce obsahují ve svých metadatech všechny doporučené atributy podle 
                        <a href="https://ofn.gov.cz/%C3%BA%C5%99edn%C3%AD-desky/2021-07-20/#p%C5%99%C3%ADklady-jednoduch%C3%A1-informace" target="_blank"> specifikace</a> 
                        (název informace, URL, IRI atd.)
                    </div>
                </div>
            </>
        );
    }

}


class ValidationTable extends React.Component<{data: BulletinData[]}, {displayedCount: number}> {
    ROW_QUANTUM = 30;
    constructor(props: {data: BulletinData[]}) {
        super(props);
        this.state = { displayedCount: props.data.length > this.ROW_QUANTUM ? this.ROW_QUANTUM : props.data.length };
        this.handleShowMore = this.handleShowMore.bind(this);
        this.handleShowAll = this.handleShowAll.bind(this);
    }
    renderHeaderRow() {
        return (
            <tr>
                <th>Poskytovatel</th>
                <th>Úřední deska</th>
                <th>Distribuce</th>
                <th>Doporučené atributy</th>
                <th>Počet informací</th>
                <th>Doporučené atributy informací</th>
                <th>Podrobnosti</th>
            </tr>
        );
    }

    handleShowMore() {
        var total = this.props.data.length;
        var displayed = this.state.displayedCount;
        var increment = this.ROW_QUANTUM;
        if ( displayed + increment <= total) {
            displayed += increment;
        } else {
            displayed += (total - displayed);
        }
        this.setState({displayedCount: displayed});
    }
    handleShowAll() {
        var total = this.props.data.length;
        this.setState({displayedCount: total});
    }
    
    render() {
        var bulletins = this.props.data;
        // console.log(bulletins.length);
        var header = this.renderHeaderRow();
        var displayed = this.state.displayedCount < this.props.data.length ? this.state.displayedCount : this.props.data.length;
        return (
            <>
                <TableExplanation />
                <Table bordered hover responsive>
                    <thead>
                        { header }
                    </thead>
                    <tbody>
                        { bulletins.slice(0, displayed)
                            .map(bul => <ValidationRow data={bul} key={bul.iri + Math.random().toString()}/>) }
                    </tbody>
                </Table>
                <SimplePaging displayed={displayed} total={this.props.data.length}
                    handleMore={this.handleShowMore} handleAll={this.handleShowAll} />
                
            </>
        );
    }
}


export { Validation, ValidationDetail };