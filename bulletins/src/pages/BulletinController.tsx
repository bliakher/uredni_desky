import React from 'react';
import { Col, Container, ListGroup, ListGroupItem, Row, Button } from 'react-bootstrap';
import { BulletinData, Datasets, ProviderType } from '../model/dataset';
import { Loader, CheckboxGroup, OptionChangeCallback } from '../Utils';
import Form from 'react-bootstrap/Form';


interface BulletinControllerProps {
    headerElement: any;
    bulletinListElement: any;
    //setSelected: (selected: ProviderCategories) => void;
}

interface BulletinControllerState {
    loaded: boolean;
    checkedProviders: Set<ProviderType>;
    finderValue: string;
    finderOn: boolean;
}

class BulletinController extends React.Component<BulletinControllerProps, BulletinControllerState> {
    datasets: Datasets;
    constructor(props: BulletinControllerProps) {
        super(props);
        this.state = { 
            loaded: false,
            // on load all provider types are checked
            checkedProviders: new Set<ProviderType>(
                [ProviderType.City, ProviderType.CityPart, ProviderType.Government, ProviderType.Region, ProviderType.Unknown]),
            finderValue: "",
            finderOn: false,
        };
        this.datasets = new Datasets();
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }
    async componentDidMount() {
        await this.datasets.fetchDatasets();
        await this.datasets.assignProviderTypes();
        this.setState({loaded: true});
    }
    handleCheckboxChange(checkboxValue: string) {
        var type : ProviderType;
        switch (checkboxValue) {
            case "obce":
                type = ProviderType.City;
                break;
            case "casti":
                type = ProviderType.CityPart;
                break;
            case "kraje":
                type = ProviderType.Region;
                break;
            case "stat":
                type = ProviderType.Government;
                break;
            case "ostatni":
                type = ProviderType.Unknown;
                break;
            default:
                type = ProviderType.Error;
        }
        if (type === ProviderType.Error) {
            return;
        }
        var updatedSet = new Set(this.state.checkedProviders);
        if (updatedSet.has(type)) {
            updatedSet.delete(type);
        } else {
            updatedSet.add(type);
        }
        this.setState({ checkedProviders: updatedSet });
    }
    handleSubmit() {
        this.setState({finderOn: true});
    }
    handleChange(event: any) {
        this.setState({finderValue: event.target.value});
    }
    handleCancel(event: any) {
        this.setState({finderValue: "", finderOn: false});
    }

    render() {
        var data = this.datasets.data.filter(dataset => this.state.checkedProviders.has(dataset.providerType) );
        if (this.state.finderOn){
            data = data.filter(dataset => (dataset.name.toLowerCase().includes(this.state.finderValue.toLowerCase())
                                || dataset.provider.toLowerCase().includes(this.state.finderValue.toLowerCase())));
        }
        var optionsList = [
            {label: "Obce", value: "obce", checked: this.state.checkedProviders.has(ProviderType.City)}, 
            {label: "Městské části", value: "casti", checked: this.state.checkedProviders.has(ProviderType.CityPart)}, 
            {label: "Kraje", value: "kraje", checked: this.state.checkedProviders.has(ProviderType.Region)},
            {label: "Organizační složky státu", value: "stat", checked: this.state.checkedProviders.has(ProviderType.Government)},
            {label: "Ostatní", value: "ostatni", checked: this.state.checkedProviders.has(ProviderType.Unknown)}];

        if (!this.state.loaded) {
            return (
                <Container>
                    <this.props.headerElement />
                    <Loader />
                </Container>
            );
        } 
        return (
            <Container>
                <this.props.headerElement />
                <Row className="justify-content-md-center">
                    <Col className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-xxl-3 d-flex">
                        <ListGroup className="list-group-flush border border-secondary rounded">
                            <ListGroupItem><h6>Vyberte poskytovatele:</h6></ListGroupItem>
                            <ListGroupItem>
                                <CheckboxGroup options={optionsList} callback={this.handleCheckboxChange}/>
                            </ListGroupItem>
                        </ListGroup>
                        {/* <div>Vyberte poskytovatele:</div>
                        <CheckboxGroup options={optionsList} callback={this.handleCheckboxChange}/> */}
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-xxl-3 d-flex">
                        <ListGroup className="list-group-flush border border-secondary rounded">
                            <ListGroupItem><h6>Vyhledávání desky:</h6></ListGroupItem>
                            <ListGroupItem>
                                <Form onSubmit={this.handleSubmit} >
                                    <Form.Group id="form-finder">
                                        
                                        <Form.Control type="text" id="finder" onChange={this.handleChange}/>
                                        {/* <input type="submit" value="Najít"/>
                                        <input type="cancel" value="Zrušit vyhledání" onClick={this.handleCancel}/> */}
                                        <Button type="submit" variant="outline-primary" className="m-2">
                                            Najít
                                        </Button>
                                        <Button type="reset" onClick={this.handleCancel} variant="outline-primary"  className="m-2">
                                            Zrušit vyhledání
                                        </Button>
                                    </Form.Group>
                                </Form>
                            </ListGroupItem>
                        </ListGroup>
                        
                    </Col>
                </Row>
                <hr />
                <this.props.bulletinListElement data={data} />
            </Container>
        );
    }
}

class ProviderCheckbox extends React.Component<{callback: OptionChangeCallback}> {
    constructor(props: {callback: OptionChangeCallback}) {
        super(props);
    }
    render() {
        var optionsList = [
            {label: "Obce", value: "obce", checked: true}, 
            {label: "Městské části", value: "casti", checked: true}, 
            {label: "Kraje", value: "kraje", checked: true},
            {label: "Organizační složky státu", value: "stat", checked: true},
            {label: "Ostatní", value: "ostatni", checked: true}];
        return (
            <>
                <p>Vyberte poskytovatele</p>
                <CheckboxGroup options={optionsList} callback={this.props.callback}/>
            </>
        );
    }
}

export { BulletinController };