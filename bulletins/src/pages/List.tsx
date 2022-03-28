import React from 'react';
import { Link } from 'react-router-dom';
import { BulletinData, InfoRecord, SortedBulletins } from '../model/dataset';
import { SelectorOptions, SelectorChangeCallback, RadioSelector } from '../Utils';
import { BsLink45Deg as LinkIcon } from 'react-icons/bs';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';


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
            <>
                {/* <div className="bulletin">
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
                </div> */}

                <Card>
                    <Card.Header as="h3">
                        {bulletin.provider}
                        <a href={linkToDataset} target="_blank" rel="noreferrer"><LinkIcon/></a>
                    </Card.Header>
                    <Card.Body>
                        <Card.Title>{bulletin.name}</Card.Title>
                        {/* <Card.Text>
                            With supporting text below as a natural lead-in to additional content.
                        </Card.Text> */}
                        <Button href={"#/seznam/detail?iri=" + bulletin.iri} variant="primary">Detail</Button>
                    </Card.Body>
                </Card>
            </>
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

// TODO: add first selected to props
class ProviderTypeSelector extends React.Component<{firstSelected: string, callback: SelectorChangeCallback}> {
    selector: SelectorOptions;
    constructor(props: {firstSelected: string, callback: SelectorChangeCallback}) {
        super(props);
        this.selector = {
            groupName: "bulletin_type",
            firstSelected: props.firstSelected,
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


interface BulletinListProps {
    data: SortedBulletins;
    selected: ProviderCategories;
    setSelected: (selected: ProviderCategories) => void;
}

class BulletinList extends React.Component<BulletinListProps, { search: string, category: ProviderCategories, data: BulletinData[] }> {
    providerMapToEnum : Map<string, ProviderCategories>;
    providerMapFromEnum : Map<ProviderCategories, string>;
    constructor(props: BulletinListProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelector = this.handleSelector.bind(this);
        this.state = { search: "", category: props.selected, data: this.props.data.all}
        this.providerMapToEnum = new Map<string, ProviderCategories>();
        this.providerMapToEnum.set("vse", ProviderCategories.All);
        this.providerMapToEnum.set("obce", ProviderCategories.City);
        this.providerMapToEnum.set("casti", ProviderCategories.CityPart);
        this.providerMapToEnum.set("kraje", ProviderCategories.Region);
        this.providerMapToEnum.set("stat", ProviderCategories.Government);
        this.providerMapToEnum.set("ostatni", ProviderCategories.Other);

        this.providerMapFromEnum = new Map<ProviderCategories, string>();
        this.providerMapFromEnum.set(ProviderCategories.All, "vse");
        this.providerMapFromEnum.set(ProviderCategories.City, "obce");
        this.providerMapFromEnum.set(ProviderCategories.CityPart, "casti");
        this.providerMapFromEnum.set(ProviderCategories.Region, "kraje");
        this.providerMapFromEnum.set(ProviderCategories.Government, "stat");
        this.providerMapFromEnum.set(ProviderCategories.Other, "ostatni");
    }
    handleSelector(selected: string) {
        var selectedCategory = this.providerMapToEnum.get(selected);
        var newCategory = selectedCategory ? selectedCategory : ProviderCategories.All;
        var displayedData = this.getSellectedBulletins(newCategory);
        this.props.setSelected(newCategory);
        this.setState({category: newCategory, data: displayedData});
    }
    handleSubmit(event: any) {

    }
    handleChange(event: any) {

    }
    getSellectedBulletins(category: ProviderCategories): BulletinData[] {
        switch(category) {
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
        var bulletinData = this.getSellectedBulletins(this.state.category);
        const bulletins = bulletinData.map((bul) => (<Bulletin key={bul.source + Math.random().toString()} data={bul}/>))
        var message = bulletins.length == 0 ? "Načítá se..." : `Zobrazeno desek v kategorii: ${bulletins.length}`;
        var selected = this.providerMapFromEnum.get(this.state.category);
        return (
            <div>
                <h2>Úřední desky</h2>
                <ProviderTypeSelector firstSelected={selected? selected : "vse"} callback={this.handleSelector} />
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

export { BulletinList, InfoList, ProviderCategories };