import React from 'react';
import { Link } from 'react-router-dom';
import { BulletinData, InfoRecord, SortedBulletins, ProviderType } from '../model/dataset';
import { SelectorOptions, OptionChangeCallback, RadioSelector, Loader, Paging } from '../Utils';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import {BulletinController } from './BulletinController';
import { Col } from 'react-bootstrap';
import Stack from 'react-bootstrap/Stack'


class Bulletin extends React.Component<{ data: BulletinData}> {
    constructor(props: { data: BulletinData}) {
        super(props);
    }

    getProviderTypeText(type: ProviderType) {
        switch (type) {
            case ProviderType.City:
                return "Obec";
            case ProviderType.CityPart:
                return "Městská část";
            case ProviderType.Region:
                return "Kraj";
            case ProviderType.Government:
                return "Organizační složka státu";
            default:
                return "Neznámý";
        }
    }

    
    render() {
        var bulletin = this.props.data; // BulletinData
        var linkToDataset = "https://data.gov.cz/datová-sada?iri=" + bulletin.iri;
        var insides;
        var badgeText = this.getProviderTypeText(bulletin.providerType);
        return (
                <Card className="flex-fill p-2" >
                    <Card.Header as="h5" className="d-inline">
                        {bulletin.provider}
                    </Card.Header>
                    <Card.Body>
                        <Card.Title as="h4">{bulletin.name}</Card.Title>

                        {bulletin.providerType !== ProviderType.Unknown && (
                            <h6><Badge pill bg="primary">
                                {badgeText}
                            </Badge></h6>)}
                    </Card.Body>
                    <Stack direction="horizontal">
                        <Button href={"#/detail?iri=" + bulletin.iri} variant="outline-primary" size="sm" className="m-1">
                            Zobrazit informace
                        </Button>
                        <Button href={linkToDataset} target="_blank" rel="noreferrer" variant="outline-primary" size="sm" className="m-1">
                            Dataset v NKOD
                        </Button>
                    </Stack>
                </Card>
        );
    }
}



class ProviderTypeSelector extends React.Component<{firstSelected: string, callback: OptionChangeCallback}> {
    selector: SelectorOptions;
    constructor(props: {firstSelected: string, callback: OptionChangeCallback}) {
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

class BulletinListOld extends React.Component<BulletinListProps, { search: string, category: ProviderCategories, data: BulletinData[] }> {
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
            // <div>
                <Container fluid className="p-0 ">
                    <Row>
                        <h2>Seznam úředních desek</h2>
                    </Row>
                    
                    <ProviderTypeSelector firstSelected={selected? selected : "vse"} callback={this.handleSelector} />
                    <form onSubmit={this.handleSubmit}>
                        <label htmlFor="finder">Vyhledávání desky:</label>
                        <input type="text" id="finder" onChange={this.handleChange}/>
                        <input type="submit" value="Najít"/>
                    </form>
                    <p>{message}</p>
                
                    <Row lg={3} md={2} sm={1} className="justify-content-md-center">
                        { bulletins }
                    </Row>
                </Container>
                
            // </div>
        );
    }
}

const BulletinListHeader = () => {
    return (
        <Row className="p-2 text-center ">
            <h2>Seznam úředních desek</h2>
            <hr />
        </Row>
    );
}

class BulletinList extends React.Component {
    render() {
        return (
            <BulletinController 
                headerElement={ BulletinListHeader }
                bulletinListElement={BulletinCards} />
        );
    }
}

class BulletinCards extends React.Component<{data: BulletinData[]}, {displayedCount: number}> {
    DISPLAY_INCREMENT = 20;
    constructor(props: {data: BulletinData[]}) {
        super(props);
        this.state = { displayedCount: this.DISPLAY_INCREMENT <= props.data.length ? this.DISPLAY_INCREMENT : props.data.length };
        this.setDisplayedCount = this.setDisplayedCount.bind(this);
    }
    setDisplayedCount(newCount: number): void {
        this.setState( {displayedCount: newCount} );
    }

    render() {
        return (
            <Container fluid className="p-3">
                <Row /*lg={3} md={2} sm={1}*/ className="justify-content-md-center">
                    { this.props.data
                        .slice(0, this.state.displayedCount)
                        .map((bul) => (
                            <Col key={bul.source + Math.random().toString()} 
                                className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 col-xxl-3 d-flex">
                                <Bulletin data={bul}/>
                            </Col>
                    ))}
                </Row>
                <Paging totalCount={ this.props.data.length }  increment={ this.DISPLAY_INCREMENT } setDisplayCount={ this.setDisplayedCount }/>
            </Container>
        );
    }
}

export { BulletinListOld, ProviderCategories, BulletinList };