import React from 'react';
import { Provider, Datasets, ProviderType, BulletinData } from '../model/dataset';
import { Loader } from '../Utils';
import { Bulletin } from './List';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { Col, Row } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { BulletinController } from './BulletinController';

mapboxgl.accessToken = 'pk.eyJ1IjoiYmxpYWtoZXIiLCJhIjoiY2tyZGxscG83MDQyazJ2bGg2dDhqeWE1NyJ9.Veduz7A77r80wvBKV2UHJQ';


// const BulletinMap = () => {
//     return (
//         <BulletinController headerElement={MapHeader} bulletinListElement={Map2}/>
//     );
// }

const MapHeader = () => {
    return (
        <>
        <Row className="p-2 text-center">
            <h2>Mapa úředních desek</h2>
        </Row>
        <hr />
        </>
    );
}

class Map extends React.Component<{}, {loaded: boolean, selected: BulletinData | null}> {
    data: Datasets;
    map: mapboxgl.Map | null;
    markers: Array<mapboxgl.Marker>;
    mapContainer: React.RefObject<HTMLInputElement>;
    constructor(props: any) {
        super(props);
        this.data = new Datasets();
        this.mapContainer = React.createRef();
        this.map = null;
        this.markers = [];
        this.state = {loaded: false, selected: null};
        this.handleMarkerClick = this.handleMarkerClick.bind(this);
    }
    async componentDidMount() {
        await this.data.fetchDatasets();
        await this.data.fetchProviderInfo();
        // fetch all residence address points
        await this.data.fetchProviderResidences();
        this.setState({loaded: true});
        if (this.mapContainer.current) {
            this.map = new mapboxgl.Map({
                container: this.mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [15.3350758, 49.7417517],
                zoom: 6,
            });
        }
        this.createMarkers();
        this.addMarkersToMap();
    }
    handleMarkerClick(bulletinIdx: number) {
        this.setState({selected: this.data.data[bulletinIdx]});
    }
    createMarkers() {
        if (this.map !== null) {
            for (let i = 0; i < this.data.data.length; i++) {
                var bulletin = this.data.data[i];
                var providerResidence = bulletin.provider.residence;
                if (providerResidence.X === -1 || providerResidence.Y === -1) continue;
                const marker = new mapboxgl.Marker(
                    this.getMarkerStyle(bulletin.provider.type)
                )
                    .setLngLat([providerResidence.X, providerResidence.Y]);
                marker.getElement().addEventListener('click', () => this.handleMarkerClick(i));
                this.markers.push(marker);
            }
        }
    }
    addMarkersToMap() {
        // sort markers by latitude from north to south
        this.markers.sort((a, b) => (
            a.getLngLat().lat == b.getLngLat().lat ? 0 : 
            a.getLngLat().lat < b.getLngLat().lat ? 1 : -1 ));
        if (this.map !== null) {
            this.markers.map(marker => {
                if (this.map !== null) marker.addTo(this.map)
            });
        }
    }
    removeMarkersFromMap() {
        this.markers.map(marker => marker.remove())
    }
    getMarkerStyle(providerType: ProviderType) {
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
        return {color: color};
    }
    renderProviderInfo() {
        if (this.state.selected) {
            var bulletin = this.state.selected;
            return (
                <Bulletin data={bulletin} />
            );
        }
        else {
            return (
                <Card>
                    <Card.Header as="h5">Úřední deska</Card.Header>
                    <Card.Body>
                        <Card.Title>Klikněte na bod v mapě pro zobrazení úřední desky</Card.Title>
                    </Card.Body>
                </Card>
            );
        }
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
                <Row className="justify-content-md-center">
                    <Col>
                        {this.renderProviderInfo()}
                    </Col>
                </Row>
                <Row className="text-center justify-content-md-center">
                    <Col className="col-12">
                        <div ref={this.mapContainer} className="map-container" style={{height:400}}/>
                    </Col>
                </Row>
                
            </>
        );
    }
}


export {  Map };