import React from 'react';
import { Col, Container, ListGroup, ListGroupItem, Row, Button } from 'react-bootstrap';
import { DatasetStore } from '../model/DatasetStore';
import { ProviderType } from '../model/Provider';
import { CancelablePromise, makeCancelable } from '../model/cancelablePromise';
import { Loader, CheckboxGroup, OptionChangeCallback } from '../Utils';
import Form from 'react-bootstrap/Form';


interface BulletinControllerProps {
    headerElement: any;
    bulletinListElement: any;
    checkedProviders: Set<ProviderType>;
    setCheckChange: (check: ProviderType) => void;
    finderValue: string;
    setFinderValue: (newValue: string) => void
    finderOn: boolean;
    setFinderStatus: (isOn: boolean) => void

}

interface BulletinControllerState {
    loaded: boolean;
}

class BulletinController extends React.Component<BulletinControllerProps, BulletinControllerState> {
    datasets: DatasetStore;
    fetchDatasetsPromise: CancelablePromise | null;
    fetchProvidersPromise: CancelablePromise | null;
    constructor(props: BulletinControllerProps) {
        super(props);
        this.state = {
            loaded: false
        };
        this.datasets = new DatasetStore();
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.fetchDatasetsPromise = null;
        this.fetchProvidersPromise = null;
    }
    async componentDidMount() {
        this.fetchDatasetsPromise = makeCancelable(this.datasets.fetchDatasets());
        await this.fetchDatasetsPromise.promise;
        this.fetchProvidersPromise = makeCancelable(this.datasets.fetchProviderInfo());
        await this.fetchProvidersPromise.promise;
        this.setState({ loaded: true });
    }
    componentWillUnmount() {
        if (this.fetchDatasetsPromise) this.fetchDatasetsPromise.cancel();
        if (this.fetchProvidersPromise) this.fetchProvidersPromise.cancel();
    }
    handleCheckboxChange(checkboxValue: string) {
        var type: ProviderType;
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
        this.props.setCheckChange(type);
    }
    handleSubmit(event: any) {
        event.preventDefault();
        this.props.setFinderStatus(true);
    }
    handleChange(event: any) {
        this.props.setFinderValue(event.target.value);
    }
    handleCancel() {
        this.props.setFinderStatus(false);
        this.props.setFinderValue("");
    }

    render() {
        var data = this.datasets.data.filter(dataset => this.props.checkedProviders.has(dataset.provider.type));
        if (this.props.finderOn) {
            data = data.filter(dataset => (dataset.name.toLowerCase().includes(this.props.finderValue.toLowerCase())
                || dataset.provider.name.toLowerCase().includes(this.props.finderValue.toLowerCase())));
        }
        var optionsList = [
            { label: "Obce", value: "obce", checked: this.props.checkedProviders.has(ProviderType.City) },
            { label: "Městské části", value: "casti", checked: this.props.checkedProviders.has(ProviderType.CityPart) },
            { label: "Kraje", value: "kraje", checked: this.props.checkedProviders.has(ProviderType.Region) },
            { label: "Organizační složky státu", value: "stat", checked: this.props.checkedProviders.has(ProviderType.Government) },
            { label: "Ostatní", value: "ostatni", checked: this.props.checkedProviders.has(ProviderType.Unknown) }];

        if (!this.state.loaded) {
            return (
                <Container>
                    <this.props.headerElement />
                    <Loader />
                </Container>
            );
        }
        return (
            <Container className="justify-content-md-center">
                <this.props.headerElement />
                <Row className="justify-content-center">
                    {/* <Col className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-xxl-3 d-block p-2"> */}
                        <ListGroup className="list-group-flush border border-secondary rounded  col-11 col-sm-10 col-md-5 col-lg-4 m-2 filter-form">
                            <ListGroupItem><h6>Vyberte právní formu poskytovatele:</h6></ListGroupItem>
                            <ListGroupItem>
                                <CheckboxGroup options={optionsList} callback={this.handleCheckboxChange} />
                            </ListGroupItem>
                        </ListGroup>

                    {/* </Col> */}
                    {/* <Col className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-xxl-3 d-block p-2 col-sm-auto"> */}
                        <ListGroup className="list-group-flush border border-secondary rounded col-11 col-sm-10 col-md-5 col-lg-4 m-2 filter-form">
                            <ListGroupItem><h6>Vyhledávání desky:</h6></ListGroupItem>
                            <ListGroupItem>
                                <Form onSubmit={this.handleSubmit} >
                                    <Form.Group id="form-finder">

                                        <Form.Control type="text" id="finder" onChange={this.handleChange} className="m-2" defaultValue={this.props.finderValue}/>

                                        <Button type="submit" variant="outline-primary" className="m-2">
                                            Najít
                                        </Button>
                                        <Button type="reset" onClick={this.handleCancel} variant="outline-primary" className="m-2">
                                            Zrušit vyhledání
                                        </Button>
                                    </Form.Group>
                                </Form>
                            </ListGroupItem>
                        </ListGroup>

                    {/* </Col> */}
                </Row>
                <hr />
                <this.props.bulletinListElement data={data} />
            </Container>
        );
    }
}

class ProviderCheckbox extends React.Component<{ callback: OptionChangeCallback }> {
    constructor(props: { callback: OptionChangeCallback }) {
        super(props);
    }
    render() {
        var optionsList = [
            { label: "Obce", value: "obce", checked: true },
            { label: "Městské části", value: "casti", checked: true },
            { label: "Kraje", value: "kraje", checked: true },
            { label: "Organizační složky státu", value: "stat", checked: true },
            { label: "Ostatní", value: "ostatni", checked: true }];
        return (
            <>
                <p>Vyberte poskytovatele</p>
                <CheckboxGroup options={optionsList} callback={this.props.callback} />
            </>
        );
    }
}

export { BulletinController };