import React from 'react';
import { DatasetStore } from '../model/DatasetStore';
import { ProviderType, SortedProviders } from '../model/Provider';
import { CancelablePromise, makeCancelable } from '../model/cancelablePromise';
import { Loader } from './Utils';
import { BulletinCards } from './List';
import { Badge, Col, Row } from 'react-bootstrap';

import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

// mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYmxpYWtoZXIiLCJhIjoiY2tyZGxscG83MDQyazJ2bGg2dDhqeWE1NyJ9.Veduz7A77r80wvBKV2UHJQ';

/**
 * Map header
 */
const MapHeader = () => {
    return (
        <>
            <Row className="p-2 text-center">
                <h2>Mapa úředních desek</h2>
                <p>Úřední desky jsou umístěné na adresu sídla poskytovatele desky.</p>
            </Row>
        </>
    );
}

/**
 * The state of Map component
 */
interface MapState {
    /** if data for map is loaded */
    loaded: boolean;

    /** IRI of selected provider om map */
    selected: string;
}

/**
 * Component that shows bulletins on the map
 * Uses mapboxGL for map
 */
export class Map extends React.Component<{}, MapState> {
    data: DatasetStore;
    providers: SortedProviders | null;
    map: mapboxgl.Map | null;
    markers: Array<mapboxgl.Marker>;
    mapContainer: React.RefObject<HTMLInputElement>;

    fetchDatasetsPromise: CancelablePromise | null;
    fetchProvidersPromise: CancelablePromise | null;
    fetchResidencesPromise: CancelablePromise | null;
    constructor(props: any) {
        super(props);
        this.data = new DatasetStore();
        this.providers = null;
        this.mapContainer = React.createRef();
        this.map = null;
        this.markers = [];
        this.state = { loaded: false, selected: "" };
        this.handleMarkerClick = this.handleMarkerClick.bind(this);
        this.fetchDatasetsPromise = null;
        this.fetchProvidersPromise = null;
        this.fetchResidencesPromise = null;
    }
    async componentDidMount() {
        this.fetchDatasetsPromise = makeCancelable(this.data.fetchDatasets());
        await this.fetchDatasetsPromise.promise;
        this.fetchProvidersPromise = makeCancelable(this.data.fetchProviderInfo());
        await this.fetchProvidersPromise.promise;

        // fetch all residence address points
        this.fetchResidencesPromise = makeCancelable(this.data.fetchProviderResidences());
        await this.fetchResidencesPromise.promise;
        this.providers = new SortedProviders(this.data.data);
        this.setState({ loaded: true });
        if (this.mapContainer.current) {
            this.map = new mapboxgl.Map({
                container: this.mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [15.3350758, 49.7417517],
                zoom: 6,
            });
            this.map.addControl(new mapboxgl.NavigationControl());
        }
        this.createMarkers();
        this.addMarkersToMap();
    }

    componentWillUnmount() {
        if (this.fetchDatasetsPromise) this.fetchDatasetsPromise.cancel();
        if (this.fetchProvidersPromise) this.fetchProvidersPromise.cancel();
        if (this.fetchResidencesPromise) this.fetchResidencesPromise.cancel();
    }
    private handleMarkerClick(providerIri: string) {
        this.setState({ selected: providerIri });
    }

    private createMarkers() {
        if (this.map !== null && this.providers !== null) {
            this.providers.providers.forEach(provider => {
                var residence = provider.residence;
                if (residence.X === -1 || residence.Y === -1) return;
                const marker = new mapboxgl.Marker(
                    this.getMarkerStyle(provider.type)
                )
                    .setLngLat([residence.X, residence.Y])
                    .setPopup(
                        new mapboxgl.Popup({
                            closeButton: false
                        })
                            .setText(provider.name)
                    );
                marker.getElement().addEventListener('click', () => this.handleMarkerClick(provider.iri));
                marker.getElement().addEventListener('mouseenter', () => (
                    marker.getPopup().toggleClassName('not_displayed')
                ))
                this.markers.push(marker);
            })
        }
    }
    private addMarkersToMap() {
        // sort markers by latitude from north to south
        this.markers.sort((a, b) => (
            a.getLngLat().lat === b.getLngLat().lat ? 0 :
                a.getLngLat().lat < b.getLngLat().lat ? 1 : -1));
        if (this.map !== null) {
            this.markers.forEach(marker => {
                if (this.map !== null) marker.addTo(this.map)
            });
        }
    }
    private getMarkerStyle(providerType: ProviderType) {
        var color = "#C0C0C0";
        switch (providerType) {
            case ProviderType.City:
                color = "#F89FAF";
                break;
            case ProviderType.CityPart:
                color = "#E3904A";
                break;
            case ProviderType.Region:
                color = "#36A8CA";
                break;
            case ProviderType.Government:
                color = "#78AA94";
                break;
        }
        return { color: color };
    }
    private renderProviderInfo() {
        var provider = this.providers?.getProvider(this.state.selected);
        var providerName = provider ? provider.name : "Klikněte na bod v mapě pro výběr poskytovatele";
        var bulletinsQ = this.providers?.getProviderBulletins(this.state.selected);
        var bulletins = bulletinsQ ? bulletinsQ : [];
        return (
            <>
                <Row className="text-center justify-content-md-center">
                    <h4>{providerName}</h4>
                </Row>
                {bulletins.length > 0 &&
                    <BulletinCards data={bulletins} />}
            </>
        )
    }
    render() {
        if (!this.state.loaded) {
            return (
                <>
                    <MapHeader />
                    <Loader />
                </>
            );
        }
        return (
            <>
                <MapHeader />
                <div className="text-center justify-content-md-center m-2">
                    <Badge pill bg="type-city" className="m-1">Obec</Badge>
                    <Badge pill bg="type-city-part" className="m-1">Městská část</Badge>
                    <Badge pill bg="type-region" className="m-1">Kraj</Badge>
                    <Badge pill bg="type-government" className="m-1">Organizační složka státu</Badge>
                    <Badge pill bg="type-unknown" className="m-1">Ostatní</Badge>
                </div>
                <Row className="text-center justify-content-md-center">
                    <Col className="col-12">
                        <div ref={this.mapContainer} className="map-container" style={{ height: 400 }} />
                    </Col>
                </Row>
                <hr />
                <Row className="justify-content-md-center">
                    <Col>
                        {this.renderProviderInfo()}
                    </Col>
                </Row>
            </>
        );
    }
}

