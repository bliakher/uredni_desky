import React from 'react';
import { Link } from 'react-router-dom';
import { BulletinData, InfoRecord, SortedBulletins } from '../model/dataset';
import { SelectorOptions, SelectorChangeCallback, RadioSelector, Loader } from '../Utils';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';


class Bulletin extends React.Component<{ data: BulletinData}> {
    constructor(props: { data: BulletinData}) {
        super(props);
    }

    
    render() {
        var bulletin = this.props.data; // BulletinData
        var linkToDataset = "https://data.gov.cz/datová-sada?iri=" + bulletin.iri;
        var insides;
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

                <Card style={{ width: '30rem' }}>
                    <Card.Header as="h5">
                        {bulletin.provider}
                    </Card.Header>
                    <Card.Body>
                        <Card.Title as="h4">{bulletin.name}</Card.Title>
                        <Button href={"#/detail?iri=" + bulletin.iri} variant="outline-primary">
                            Zobrazit informace
                        </Button>
                        <Button href={linkToDataset} target="_blank" rel="noreferrer" variant="outline-primary">
                            Dataset v NKOD
                        </Button>
                    </Card.Body>
                </Card>
            </>
                    );
    }
}



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
                <Container>
                    <Row className="justify-content-md-center">
                        { bulletins }
                    </Row>
                </Container>
                
            </div>
        );
    }
}

export { BulletinList, ProviderCategories };