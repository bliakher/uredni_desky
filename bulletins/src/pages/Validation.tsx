import React from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import { BulletinData, InfoRecord, getBulletinByIri } from '../model/dataset';
import { MissingProperties } from '../model/dataset';
import { RouterProps } from "react-router";
import { BulletinDetail } from "./Detail";
import { Row } from 'react-bootstrap';
import { BulletinController } from './BulletinController';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

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
                    <ul>
                        {missingInfoProps.map(info => (
                            <li key={info.name}>
                                {info.name}
                                <ul>
                                    {info.missing.map(prop => <li key={prop}>{prop}</li>)}
                                </ul>
                            </li>))}
                    </ul>
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
            <h2>Validace úřední desky</h2>
            <h3>
                {bulletinName} 
                <Link to={"/detail?iri=" + iri} >detail</Link>
            </h3>
            <p>Poskytovatel: {provider}</p>
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
                <p>Distribuci nebylo možné stáhnout z odkazu:
                    <a href={bulletin.source} target="_blank"> {bulletin.source} </a>
                </p>}

            { bulletin.hasValidSource && renderRecommendedProps(missing.bulletin) }
            { bulletin.hasValidSource && renderRecommendedInfoProps(missing.information, infoCount) }
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
                        { renderHeader(this.data.provider, this.data.name, this.data.iri) }
                        { renderValidation(this.data) }
                    </>);
                
            } else {
                return (<p>Chyba: Nevalidní iri datasetu - nelze načíst.</p>)
            }
        } else {
            return (<p>Načítá se...</p>);
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
                <td>{provider}</td>
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
                <td>{provider}</td>
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


class ValidationTable extends React.Component<{data: BulletinData[]}> {
    constructor(props: {data: BulletinData[]}) {
        super(props);
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
    
    render() {
        var bulletins = this.props.data;
        var header = this.renderHeaderRow();
        return (
            <>
                <TableExplanation />
                <Table bordered hover responsive>
                    <thead>
                        { header }
                    </thead>
                    <tbody>
                        { bulletins.map(bul => <ValidationRow data={bul} />) }
                    </tbody>
                </Table>
            </>
        );
    }
}


export { Validation, ValidationDetail };