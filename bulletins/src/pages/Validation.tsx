import React from 'react';
import { BulletinData, InfoRecord } from '../model/dataset';


class ValidationDetail extends React.Component<{data: BulletinData}> {
    constructor(props: {data: BulletinData}) {
        super(props);
    }
    renderBulletinMissingTable(bulletinMissing: Array<string>) {
        return (
            <ul>
                {bulletinMissing.map(bulProp => (<li key={bulProp}>bulProp</li>))}
            </ul>
        );
    }
    renderInfoMissingTable(infoMissing: Array<{name:string, missing: Array<string>}>) {

    }
    render() {
        var provider = this.props.data.provider;
        var name = this.props.data.name;
        var missing = this.props.data.checkRecommendedProperties();
        var bulletinTable = this.renderBulletinMissingTable(missing.bulletin);
        var infoTable = this.renderInfoMissingTable(missing.information);
        return (
            <>
                <h2>{name}</h2>
                <p>Poskytovatel: {provider}</p>
                {bulletinTable}
                {infoTable}
            </>
        );
    }
}

class ValidationRow extends React.Component<{data: BulletinData}> {
    ok = "Ano";
    notOk = "Ne";
    noValue = "-";
    constructor(props: {data: BulletinData}) {
        super(props);
    }
    render() {
        var distribution = this.props.data.getDistribution();
        var provider = this.props.data.provider;
        var name = this.props.data.name;
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
                <td></td>
            </tr>
        );
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


export { Validation };