import React, { useEffect, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { BulletinData, InfoRecord } from '../model/dataset';
import NoPage from './NoPage';
import formurlencoded from 'form-urlencoded';
import {Md5} from 'ts-md5/dist/md5';
import { MissingProperties } from '../model/dataset';
import { stat } from 'fs';

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

function renderRecommendedInfoProps(missingInfoProps: Array<{name:string, missing: Array<string>}>) {
    return (
        <>
            <h4>Doporučené atributy informací na desce:</h4>
            <p>Každá informace na úřední desce by také měla obsahovat tyto atributy:</p>
            <ul>
                {["typ", "iri", "url", "název", "vyvěšení", "relevantní_do"].map(prop => <li key={prop}>{prop}</li>)}
            </ul>
            { missingInfoProps.length > 0 &&
                <>
                    <p style={{color: 'red'}}>Informace s chybějícími atributy:</p>
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

function renderHeader(provider: string, bulletinName: string) {
    return (
        <>
            <h2>Validace úřední desky</h2>
            <h3>{bulletinName}</h3>
            <p>Poskytovatel: {provider}</p>
        </>
    );
}

function renderValidation(missing: MissingProperties) {
    var hasErrors = missing.bulletin.length > 0 || missing.information.length > 0;
    return (
        <>
            <h4>Shrnutí:</h4>
            { hasErrors && <p style={{color: 'red'}}>Nalezeny chyby</p> }
            { !hasErrors && <p style={{color: 'green'}}>Validace v pořádku</p> }

            { renderRecommendedProps(missing.bulletin) }
            { renderRecommendedInfoProps(missing.information) }
        </>
    );
}

const ValidationDetail = (props: {data: BulletinData[], distributionLoaded: boolean}) => {
    var { id } = useParams();

    // var [loading, setLoading] = useState([true]);

    // useEffect(() => {
    //     while(!bulletin.getDistribution()) {}
    //     setLoading([false]);
    // }, [])

    var data = props.data.filter((bul) => {
        var curId = Md5.hashStr(bul.source);
        var result = id == curId;
        return result;
    });
    if (data.length == 0) {
        return (<p>Načítá se...</p>);
    }
    var bulletin = data[0];
    var provider = bulletin.provider;
    var name = bulletin.name;
    var distribution = bulletin.getDistribution();
    //var stillLoading = distribution == null;
    var loading = !props.distributionLoaded;

    var missing = bulletin.checkRecommendedProperties();
    return (
        <>
            { renderHeader(provider, name) }
            { loading && <p>Načítá se...</p> }
            { !loading && renderValidation(missing) }
            
        </>
    );
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
        var name = this.props.data.name;
        var source = this.props.data.source;
        var info = this.props.data.getInfoRecords();
        var infoCount = info ? info.length : this.noValue;
        var missing = this.props.data.checkRecommendedProperties();
        var missingBulletin = missing.bulletin.length == 0 ? this.ok : this.notOk;
        var missingInfo = missing.information.length == 0 ? this.ok : this.notOk;
        
        return (
            <tr>
                <td>{provider}</td>
                <td>{name}</td>
                <td>{distribution? this.ok : this.notOk }</td>
                <td>{distribution? missingBulletin : this.noValue }</td>
                <td>{infoCount}</td>
                <td>{distribution? missingInfo : this.noValue }</td>
                <td>
                    <Link to={Md5.hashStr(source)}>Detail</Link>
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

class Validation extends React.Component<{data: BulletinData[]}> {
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
            <table>
                { header }
                { bulletins.map(bul => <ValidationRow data={bul} />) }
            </table>
        );
    }
}


export { Validation, ValidationDetail };