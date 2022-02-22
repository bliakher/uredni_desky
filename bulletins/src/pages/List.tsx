import React from 'react';
import { BulletinData, InfoRecord, SortedBulletins } from '../model/dataset';
import { SelectorOptions, SelectorChangeCallback, RadioSelector } from '../Utils';


class Bulletin extends React.Component<{ data: BulletinData}, {opened: boolean}> {
    constructor(props: { data: BulletinData}) {
        super(props);
        this.state = {
            opened: false,
        };
        this.handleClick = this.handleClick.bind(this);
    }
    
    handleClick() {
        this.setState(prevState => ({opened: !prevState.opened}));
    }

    renderErrorElement() {
        return (
            <div>
                <p>Problém při načítání</p>
                {/* <p>{this.props.data.loadError}</p> */}
            </div>
        );
    }


    render() {
        var bulletin = this.props.data; // BulletinData
        var bulletinData = bulletin.getDistribution();
        var infoRecords = bulletin.getInfoRecords();
        var insides;
        if (!infoRecords) {
            insides = this.renderErrorElement();
        } else {
            insides = (<InfoList data={infoRecords} />);
        }
        return (
            <div className="bulletin">
                <span>
                    <h3>{bulletin.provider}</h3>
                    <a href={bulletin.source} target="_blank">odkaz</a>
                </span>
                <button onClick={this.handleClick}>
                    {this.state.opened ? '^' : 'v'}
                </button>
                {this.state.opened && insides}
            </div>
        );
    }
}

class InfoList extends React.Component<{ data: Array<InfoRecord>}, {infoDisplayed: number}> {
    INFO_QUANTUM = 3; // number of infos loaded on one load
    constructor(props: { data: Array<InfoRecord>}) {
        super(props);
        this.state = {
            infoDisplayed: this.INFO_QUANTUM,
        };
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
        var infoCount = this.props.data.length;
        var displayed = this.state.infoDisplayed
        if ( displayed + this.INFO_QUANTUM <= infoCount) {
            displayed += this.INFO_QUANTUM;
        } else {
            displayed += (infoCount - displayed);
        }
        this.setState({infoDisplayed: displayed});
    }
    render() {
        var infoRecords = this.props.data;
        return (
            <>
                <ul>
                    {infoRecords.slice(0, this.state.infoDisplayed).map(record => (<li><BulletinInfo data={record} /></li>))}
                </ul>
                <p>Zobrazeno: {this.state.infoDisplayed} z {infoRecords.length}</p>
                { this.state.infoDisplayed != infoRecords.length && 
                <button onClick={this.handleClick} >Načíst další</button>}
            </>
        );
    }
}

class BulletinInfo extends React.Component<{data: InfoRecord}> {
    constructor(props: {data: InfoRecord}) {
        super(props);
    }
    render() {
        var info = this.props.data;
        var name = info.getName()? info.getName() : "'Informace na úřední desce'";
        var url = info.getUrl();
        var issued = info.getDateIssued();
        var validTo = info.getDateValidTo();
        return (
            <div>
                <span>
                    <h4>{name}</h4>
                    {url && <a href={url} target="_blank" rel="noreferrer">odkaz</a>}
                </span>
                {issued && <p>Datum vyvěšení: {issued.toLocaleDateString("cs-CZ")}</p>}
                {validTo && <p>Relevantní do: {validTo.toLocaleDateString("cs-CZ")}</p>}
            </div>

        );
    }
}

class ProviderTypeSelector extends React.Component<{callback: SelectorChangeCallback}> {
    selector: SelectorOptions;
    constructor(props: {callback: SelectorChangeCallback}) {
        super(props);
        this.selector = {
            groupName: "bulletin_type",
            firstSelected: "vse",
            options: [
                    {label: "Vše", value: "vse"},
                    {label: "Obce", value: "obce"}, 
                    {label: "Městské části", value: "casti"}, 
                    {label: "Kraje", value: "kraje"},
                    {label: "Organizační složky státu", value: "stat"},
                    {label: "Ostatní", value: "ostatni"}],
            callback: props.callback,
        }
    }
    render() {
        return (
            <>
                <p>Vyberte poskytovatele</p>
                <RadioSelector groupName={this.selector.groupName} options={this.selector.options} 
                    firstSelected={this.selector.firstSelected} callback={this.selector.callback} />
            </>
        );
    }
}

enum ProviderCategories {
    All,
    City,
    CityPart,
    Region,
    Government,
    Other,
}

class BulletinList extends React.Component<{data: SortedBulletins}, { search: string, category: ProviderCategories }> {
    constructor(props: {data: SortedBulletins}) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelector = this.handleSelector.bind(this);
        this.state = { search: "", category: ProviderCategories.All}
    }
    handleSelector(selected: string) {
        var newCategory = ProviderCategories.All;
        switch (selected) {
            case "obce":
                newCategory = ProviderCategories.City;
                break;
            case "casti":
                newCategory = ProviderCategories.CityPart;
                break;
            case "kraje":
                newCategory = ProviderCategories.Region;
                break;
            case "stat":
                newCategory = ProviderCategories.Government;
                break;
            case "ostatni":
                newCategory = ProviderCategories.City;
                break;  
        }
        this.setState({category: newCategory});
    }
    handleSubmit(event: any) {

    }
    handleChange(event: any) {

    }
    getSellectedBulletins(): BulletinData[] {
        switch(this.state.category) {
            case ProviderCategories.All:
                return this.props.data.all;
            case ProviderCategories.City:
                return this.props.data.cities;
            case ProviderCategories.CityPart:
                return this.props.data.cityParts; 
            case ProviderCategories.Region:
                return this.props.data.regions;
            case ProviderCategories.Government:
                return this.props.data.government;
            case ProviderCategories.Other:
                return this.props.data.other;
        }
    }
    render() {
        const bulletinData = this.getSellectedBulletins();
        const bulletins = bulletinData.map((bul) => (<Bulletin key={bul.source} data={bul}/>))
        return (
            <div>
                <h2>Úřední desky</h2>
                <ProviderTypeSelector callback={this.handleSelector} />
                <form onSubmit={this.handleSubmit}>
                    <label htmlFor="finder">Vyhledávání desky:</label>
                    <input type="text" id="finder" onChange={this.handleChange}/>
                    <input type="submit" value="Najít"/>
                </form>
                { bulletins }
            </div>
        );
    }
}

export default BulletinList;