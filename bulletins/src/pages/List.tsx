import React from 'react';
import { Link } from 'react-router-dom';
import { BulletinData, InfoRecord, SortedBulletins } from '../model/dataset';
import { SelectorOptions, SelectorChangeCallback, RadioSelector } from '../Utils';


class Bulletin extends React.Component<{ data: BulletinData}, {opened: boolean, loaded: boolean}> {
    constructor(props: { data: BulletinData}) {
        super(props);
        this.state = {
            opened: false,
            loaded: false,
        };
        this.handleClick = this.handleClick.bind(this);
    }

    async componentDidMount() {
        
    }
    
    async handleClick() {
        this.setState(prevState => ({opened: !prevState.opened}));
        if (!this.state.loaded) {
            await this.props.data.fetchDistribution();
            this.setState({loaded: true});
        }
    }

    renderErrorElement() {
        return (
            <div>
                <p>Problém při načítání</p>
                {/* <p>{this.props.data.loadError}</p> */}
            </div>
        );
    }
    renderInfo() {
        var bulletin = this.props.data; 
        var infoRecords = bulletin.getInfoRecords();
        return (<InfoList data={infoRecords? infoRecords : []} />);
    }
    renderLoading() {
        return (<p>Načítá se...</p>);
    }

    render() {
        var bulletin = this.props.data; // BulletinData
        var linkToDataset = "https://data.gov.cz/datová-sada?iri=" + bulletin.iri;
        var insides;
        if( this.state.loaded ) {
            if (bulletin.loadError == null) {
                insides = this.renderInfo();
            } else {
                insides = this.renderErrorElement();
            }
        } else {
            insides = this.renderLoading();
        }
        return (
            <div className="bulletin">
                <span>
                    <h3>{bulletin.provider}</h3>
                    <a href={linkToDataset} target="_blank" rel="noreferrer">odkaz</a>
                    <Link to={"detail?iri=" + bulletin.iri}>detail</Link>
                </span>
                <h4>{bulletin.name}</h4>
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
            infoDisplayed: this.props.data.length >= this.INFO_QUANTUM ? this.INFO_QUANTUM : this.props.data.length,
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
                { this.state.infoDisplayed !== infoRecords.length && 
                <button onClick={this.handleClick} >Zobrazit další</button>}
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
        var issuedStr = issued ? issued.to_string() : "Údaj chybí";
        var validTo = info.getDateValidTo();
        var validToStr = validTo ? validTo.to_string() : "Údaj chybí";
        return (
            <div>
                <span>
                    <h4>{name}</h4>
                    {url && <a href={url} target="_blank" rel="noreferrer">odkaz</a>}
                </span>
                {issued && <p>Datum vyvěšení: {issuedStr}</p>}
                {validTo && <p>Relevantní do: {validToStr}</p>}
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

class BulletinList extends React.Component<{data: SortedBulletins}, { search: string, category: ProviderCategories, data: BulletinData[] }> {
    constructor(props: {data: SortedBulletins}) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelector = this.handleSelector.bind(this);
        this.state = { search: "", category: ProviderCategories.All, data: this.props.data.all}
    }
    handleSelector(selected: string) {
        var newCategory = ProviderCategories.All;
        var displayedData = this.props.data.all;
        switch (selected) {
            case "obce":
                newCategory = ProviderCategories.City;
                displayedData = this.props.data.cities;
                break;
            case "casti":
                newCategory = ProviderCategories.CityPart;
                displayedData = this.props.data.cityParts;
                break;
            case "kraje":
                newCategory = ProviderCategories.Region;
                displayedData = this.props.data.regions;
                break;
            case "stat":
                newCategory = ProviderCategories.Government;
                displayedData = this.props.data.government;
                break;
            case "ostatni":
                newCategory = ProviderCategories.Other;
                displayedData = this.props.data.other;
                break;  
        }
        this.setState({category: newCategory, data: displayedData});
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
        var bulletinData = this.getSellectedBulletins();
        const bulletins = bulletinData.map((bul) => (<Bulletin key={bul.source + Math.random().toString()} data={bul}/>))
        var message = bulletins.length == 0 ? "Načítá se..." : `Zobrazeno desek v kategorii: ${bulletins.length}`;
        return (
            <div>
                <h2>Úřední desky</h2>
                <ProviderTypeSelector callback={this.handleSelector} />
                <form onSubmit={this.handleSubmit}>
                    <label htmlFor="finder">Vyhledávání desky:</label>
                    <input type="text" id="finder" onChange={this.handleChange}/>
                    <input type="submit" value="Najít"/>
                </form>
                <p>{message}</p>
                { bulletins }
            </div>
        );
    }
}

export { BulletinList, InfoList };