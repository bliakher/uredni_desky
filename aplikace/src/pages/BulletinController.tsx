import React from 'react';
import { Container, ListGroup, ListGroupItem, Row, Button } from 'react-bootstrap';
import { DatasetStore } from '../model/DatasetStore';
import { ProviderType } from '../model/Provider';
import { CancelablePromise, makeCancelable } from '../model/cancelablePromise';
import { Loader } from './Utils';
import { FinderForm } from './forms/FinderForm';
import { CheckboxGroup } from './forms/CheckboxGroup';

/**
 * Props of the BulletinController component
 */
interface BulletinControllerProps {
    /**
     * React component type
     * Component that is displayed as header before filter forms
     * It should have no props
     */
    headerElement: any;
    /**
     * React component type
     * Component that visualizes the filtered data
     * It should have props of interface BulletinListComponentProps
     */
    bulletinListElement: any;
    /** provider type chosen in filter */
    checkedProviders: Set<ProviderType>;
    /** callback to set new filter state in parent component on filter change */
    setCheckChange: (check: ProviderType) => void;
    /** value in finder text box */
    finderValue: string;
    /** callback to set new finder value in parent component on change */
    setFinderValue: (newValue: string) => void
    /** flag if finding is on */
    finderOn: boolean;
    /** callback to set flag in parent component on change */
    setFinderStatus: (isOn: boolean) => void

}

/**
 * State of the BulletinController component
 */
interface BulletinControllerState {
    loaded: boolean;
}

/**
 * Component that wraps functionality of getting bulletin data and filtering it according to user inputs
 * Visualization of data is done by components that are given as props
 */
export class BulletinController extends React.Component<BulletinControllerProps, BulletinControllerState> {
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
    /**
     * After the mount of component data are queried
     */
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
    private handleCheckboxChange(checkboxValue: string) {
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
    private handleSubmit(event: any) {
        event.preventDefault();
        this.props.setFinderStatus(true);
    }
    private handleChange(event: any) {
        this.props.setFinderValue(event.target.value);
    }
    private handleCancel() {
        this.props.setFinderStatus(false);
        this.props.setFinderValue("");
    }

    render() {
        // filter data by selected provider types
        var data = this.datasets.data.filter(dataset => this.props.checkedProviders.has(dataset.provider.type));
        if (this.props.finderOn) {
            // filter data - only bulletins that have the finder value in name or provider name
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
                    <ListGroup className="list-group-flush border border-secondary rounded  col-11 col-sm-10 col-md-5 col-lg-4 m-2 filter-form">
                        <ListGroupItem><h6>Vyberte právní formu poskytovatele:</h6></ListGroupItem>
                        <ListGroupItem>
                            <CheckboxGroup options={optionsList} callback={this.handleCheckboxChange} />
                        </ListGroupItem>
                    </ListGroup>

                    <ListGroup className="list-group-flush border border-secondary rounded col-11 col-sm-10 col-md-5 col-lg-4 m-2 filter-form">
                        <ListGroupItem><h6>Vyhledávání desky:</h6></ListGroupItem>
                        <ListGroupItem>
                            <FinderForm onTextChangeCallback={this.handleChange} 
                                        onCancelCallback={this.handleCancel}
                                        onSubmitCallback={this.handleSubmit} />
                        </ListGroupItem>
                    </ListGroup>

                </Row>
                <hr />
                <this.props.bulletinListElement data={data} />
            </Container>
        );
    }
}


