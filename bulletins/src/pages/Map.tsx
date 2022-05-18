import React from 'react';
import { Provider, Datasets, ProviderType } from '../model/dataset';
import { Loader } from '../Utils';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { Col, Row } from 'react-bootstrap';

mapboxgl.accessToken = 'pk.eyJ1IjoiYmxpYWtoZXIiLCJhIjoiY2tyZGxscG83MDQyazJ2bGg2dDhqeWE1NyJ9.Veduz7A77r80wvBKV2UHJQ';


class Map extends React.Component<{}, {loaded: boolean}> {
    data: Datasets;
    map: mapboxgl.Map | null;
    mapContainer: React.RefObject<HTMLInputElement>;
    constructor(props: any) {
        super(props);
        this.data = new Datasets();
        this.mapContainer = React.createRef();
        this.map = null;
        this.state = {loaded: false};
    }
    async componentDidMount() {
        await this.data.fetchDatasets();
        await this.data.fetchProviderInfo();
        // fetch all residence address points
        await Promise.all(this.data.data.map(bulletin => bulletin.provider.fetchProviderResidence() )); 
        this.setState({loaded: true});
        if (this.mapContainer.current) {
            this.map = new mapboxgl.Map({
                container: this.mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [15.3350758, 49.7417517],
                zoom: 6,
            });
        }
        if (this.map !== null) {
            for (var bulletin of this.data.data) {
                var providerResidence = bulletin.provider.residence;
                if (providerResidence.X === -1 || providerResidence.Y === -1) continue;
                const marker = new mapboxgl.Marker(
                    this.getMarkerStyle(bulletin.provider.type)
                )
                    .setLngLat([providerResidence.X, providerResidence.Y])
                    .addTo(this.map);
            }
        }
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
    render() {
        if (!this.state.loaded) {
            return (
                <Loader />
            );
        }
        return (
            <Row className="text-center justify-content-md-center">
                <Col className="col-12">
                    <div ref={this.mapContainer} className="map-container" style={{height:400}}/>
                </Col>
            </Row>
            // <div>
            //     {this.data.data.map(bulletin => (
            //         <div>
            //             {bulletin.provider.name + ": " + bulletin.provider.residence.X + ", " + bulletin.provider.residence.Y}
            //         </div>
            //     ))}
            // </div>
        );
    }
}

export { Map };