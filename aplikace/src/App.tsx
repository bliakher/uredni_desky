import React from 'react';
import './App.css';
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import { BulletinCards, BulletinListHeader } from "./pages/List";
import { About } from './pages/About';
import { Map } from './pages/Map';
import NoPage from './pages/NoPage';
import { ValidationHeader, ValidationTable } from './pages/validation/Validation';
import { ValidationDetail } from './pages/validation/ValidationDetail';
import { BulletinDetail } from './pages/detail/Detail';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Statistics } from './pages/statistics/Statistics';
import { ProviderType } from './model/Provider';
import { BulletinController } from './pages/BulletinController';

/**
 * State of the App component
 */
interface AppState {
    /** checked provider types in list */
    listChecked: Set<ProviderType>;
    /** If finder is turned on in list */
    listFinderOn: boolean;
    /** Current value of finder in list */
    listFinderValue: string;
    /** checked provider types in validation */
    validationChecked: Set<ProviderType>;
    /** If finder is turned on in validation */
    validationFinderOn: boolean;
    /** Current value of finder in validation */
    validationFinderValue: string;

}

/**
 * Root component of the application
 * Manages routing with HashRouter
 * Holds state of finder forms in application
 */
class App extends React.Component<{}, AppState> {

    constructor(props: {}) {
        super(props);
        this.state = { // all checked at start
            listChecked: new Set<ProviderType>([ProviderType.City, ProviderType.CityPart,
            ProviderType.Government, ProviderType.Region, ProviderType.Unknown]),
            listFinderOn: false,
            listFinderValue: "",
            validationChecked: new Set<ProviderType>([ProviderType.City, ProviderType.CityPart,
            ProviderType.Government, ProviderType.Region, ProviderType.Unknown]),
            validationFinderOn: false,
            validationFinderValue: ""
        }
        this.handleListCheckChange = this.handleListCheckChange.bind(this);
        this.handleValidationCheckChange = this.handleValidationCheckChange.bind(this);
        this.handleListFinderStateChange = this.handleListFinderStateChange.bind(this);
        this.handleValidationFinderStateChange = this.handleValidationFinderStateChange.bind(this);
        this.handleListValueChange = this.handleListValueChange.bind(this);
        this.handleValidationValueChange = this.handleValidationValueChange.bind(this);
    }

    private updateProviderSet(check: ProviderType, set: Set<ProviderType>) {
        var updatedSet = new Set(set);
        if (updatedSet.has(check)) {
            updatedSet.delete(check);
        } else {
            updatedSet.add(check);
        }
        return updatedSet;
    }
    private handleListCheckChange(check: ProviderType) {
        this.setState({ listChecked: this.updateProviderSet(check, this.state.listChecked) });
    }
    private handleValidationCheckChange(check: ProviderType) {
        this.setState({ validationChecked: this.updateProviderSet(check, this.state.validationChecked) });
    }

    private handleListFinderStateChange(isOn: boolean) {
        this.setState({ listFinderOn: isOn });
    }
    private handleValidationFinderStateChange(isOn: boolean) {
        this.setState({ validationFinderOn: isOn });
    }

    private handleListValueChange(newValue: string) {
        this.setState({ listFinderValue: newValue });
    }
    private handleValidationValueChange(newValue: string) {
        this.setState({ validationFinderValue: newValue });
    }

    /**
     * Renders the component for the list of bulletins
     * Uses BulletinController for filter forms 
     * @returns list component
     */
    private renderList() {
        return (
            <BulletinController
                headerElement={BulletinListHeader}
                bulletinListElement={BulletinCards}
                setCheckChange={this.handleListCheckChange}
                checkedProviders={this.state.listChecked}
                finderOn={this.state.listFinderOn}
                finderValue={this.state.listFinderValue}
                setFinderStatus={this.handleListFinderStateChange}
                setFinderValue={this.handleListValueChange}
            />
        );
    }

    /**
     * Renders the component for the validation table
     * Uses BulletinController for filter forms 
     * @returns validation component
     */
    private renderValidation() {
        return (
            <BulletinController
                headerElement={ValidationHeader}
                bulletinListElement={ValidationTable}
                setCheckChange={this.handleValidationCheckChange}
                checkedProviders={this.state.validationChecked}
                finderOn={this.state.validationFinderOn}
                finderValue={this.state.validationFinderValue}
                setFinderStatus={this.handleValidationFinderStateChange}
                setFinderValue={this.handleValidationValueChange}
            />
        );
    }

    render() {
        return (
            <>
                <HashRouter>
                    <Layout />
                    <Routes>
                        <Route index element={this.renderList()} />
                        <Route path="detail" element={<BulletinDetail />} />
                        <Route path="mapa" element={<Map />} />
                        <Route path="validace">
                            <Route index element={this.renderValidation()} />
                            <Route path="detail" element={<ValidationDetail />} />
                        </Route>
                        <Route path="statistiky" element={<Statistics />} />
                        <Route path="about" element={<About />} />
                        <Route path="*" element={<NoPage />} />
                    </Routes>
                </HashRouter>
            </>

        );
    }
}


export default App;
