import React from 'react';
import { Col, ListGroup, Row, ListGroupItem } from 'react-bootstrap';
import type { ProviderTypeCountMap, ProviderTypeLabelMap } from '../../model/Provider';
import { CITY_CODE, CITY_PART_CODE, REGION_CODE, GOVERNMENT_CODE } from '../../model/Provider';
import Plotly from 'plotly.js-dist-min';

/**
 * State of ProviderStatistics component
 */
interface ProviderStatProps {
    /** counts of bulletin data providers in each organization type */
    providerCounts: ProviderTypeCountMap;
    /** counts of all existing organizations in each organization type */
    maxProviderCounts: ProviderTypeCountMap;

    /** labels of organization types */
    providerLabels: ProviderTypeLabelMap;
}

/**
 * Component that displayes statistics about providers
 * How many organizations from every organization type provide bulletin data
 */
export class ProviderStatistics extends React.Component<ProviderStatProps> {
    pieContainerLeft: React.RefObject<HTMLInputElement>;
    pieContainerRight: React.RefObject<HTMLInputElement>;

    legendContainer: React.RefObject<HTMLInputElement>;
    pieContainerCity: React.RefObject<HTMLInputElement>;
    pieContainerCityPart: React.RefObject<HTMLInputElement>;
    pieContainerRegion: React.RefObject<HTMLInputElement>;
    pieContainerGovernment: React.RefObject<HTMLInputElement>;
    pieContainerFond: React.RefObject<HTMLInputElement>;

    constructor(props: ProviderStatProps) {
        super(props);
        this.pieContainerLeft = React.createRef();
        this.pieContainerRight = React.createRef();

        this.legendContainer = React.createRef();
        this.pieContainerCity = React.createRef();
        this.pieContainerCityPart = React.createRef();
        this.pieContainerRegion = React.createRef();
        this.pieContainerGovernment = React.createRef();
        this.pieContainerFond = React.createRef();
    }
    componentDidMount() {
        this.createProviderChartsIndividual();
    }
    private getOtherProvidersData() {
        console.log(this.props.providerCounts);
        var result: { label: string, providerCount: number, maxCount: number }[] = [];
        this.props.providerCounts.forEach((value, key) => {
            if (key !== CITY_CODE && key !== CITY_PART_CODE && key !== REGION_CODE && key != GOVERNMENT_CODE) {
                var label = this.props.providerLabels.get(key);
                var maxCount = this.props.maxProviderCounts.get(key);
                var provider = { label: label ? label : "Poskytovatelé bez právní formy", providerCount: value, maxCount: maxCount ? maxCount : 0 };
                result.push(provider);
            }
        })
        return result;
    }
    private getPieData(typeCode: string) {
        var total = this.props.maxProviderCounts.get(typeCode);
        var providerCount = this.props.providerCounts.get(typeCode);
        if (!total || !providerCount) return null;
        var remainingCount = total - providerCount;
        var countPerc = Math.round(providerCount / total * 10000) / 100;
        var remCountPerc = Math.round(remainingCount / total * 10000) / 100;
        return { perc: [remCountPerc, countPerc], count: [remainingCount, providerCount] }
    }

    private createProviderChartsIndividual() {
        var labels = ["OVM neposkytující úřední desku", "OVM poskytující úřední desku jako otevřená data"];

        var layoutWithLegend: { height: number, width: number, legend: { xanchor: 'center' } } = {
            height: 600,
            width: 500,
            legend: {
                xanchor: 'center'
            }
        };
        var grey = 'RGB(208, 212, 205)';
        var green = 'RGB(132, 217, 67)';
        var colors = [grey, green];
        var cityData = this.getPieData(CITY_CODE);
        if (this.pieContainerCity.current) {
            Plotly.newPlot(this.pieContainerCity.current, [{
                values: cityData?.perc,
                labels: labels,
                text: cityData?.count,
                marker: { colors: colors },
                type: 'pie',
            }], layoutWithLegend)
        }

        var layout: { height: number, width: number } = {
            height: 300,
            width: 300,
        };
        var cityPartData = this.getPieData(CITY_PART_CODE);
        if (this.pieContainerCityPart.current) {
            Plotly.newPlot(this.pieContainerCityPart.current, [{
                values: cityPartData?.perc,
                labels: labels,
                text: cityPartData?.count,
                showlegend: false,
                marker: { colors: colors },
                type: 'pie',
            }], layout)
        }
        var regionData = this.getPieData(REGION_CODE);
        if (this.pieContainerRegion.current) {
            Plotly.newPlot(this.pieContainerRegion.current, [{
                values: regionData?.perc,
                labels: labels,
                text: regionData?.count,
                showlegend: false,
                marker: { colors: colors },
                type: 'pie',
            }], layout)
        }
        var governmentData = this.getPieData(GOVERNMENT_CODE);
        if (this.pieContainerGovernment.current) {
            Plotly.newPlot(this.pieContainerGovernment.current, [{
                values: governmentData?.perc,
                labels: labels,
                text: governmentData?.count,
                showlegend: false,
                marker: { colors: colors },
                type: 'pie',
            }], layout)
        }
    }

    private renderOtherProviders() {
        var otherProviders = this.getOtherProvidersData();
        if (otherProviders.length === 0) return null;
        return (
            <ListGroup>
                <ListGroupItem>
                    <div className="fw-bold text-center">Ostatní poskytovatelé úředních desek</div>
                </ListGroupItem>
                {otherProviders.map(provider => (
                    <ListGroupItem key={provider.label}>
                        <div className="fw-bold">{provider.label}</div>
                        <div>Poskytovatelů úředních desek: {provider.providerCount}</div>
                        <div>OVM celkem: {provider.maxCount}</div>
                    </ListGroupItem>
                ))}
            </ListGroup>
        );
    }

    private renderOtherOrganizations() {
        var values: number[] = [];
        var labels: string[] = [];
        // collect organization types that have no providers of bulletins
        this.props.maxProviderCounts.forEach((count, providerType) => {
            if (!this.props.providerCounts.has(providerType)) {
                var label = this.props.providerLabels.get(providerType);
                if (label) {
                    values.push(count);
                    labels.push(label);
                }
            }
        });

        return (
            <ListGroup>
                <ListGroupItem>
                    <div className="fw-bold text-center">Ostatní OVM bez poskytovatelů úřednich desek</div>
                </ListGroupItem>
                {values.map((val, i) => (
                    <ListGroupItem>
                        <div className="fw-bold">{labels[i] + ": "}</div> {val}
                    </ListGroupItem>))}
            </ListGroup>
        );
    }
    render() {
        return (
            <>
                <Row className="text-center justify-content-center">
                    <h4>Statistika poskytovatelů úředních desek</h4>
                </Row>
                <Row className="text-center justify-content-center">
                    <Col className="col-11 col-sm-11 col-md-6 col-lg-6 col-xl-6 col-xxl-6 d-flex p-2 m-2">
                        <p>
                            Poskytovatele dat z úředních desek můžeme rozdělit do kategorií podle jejich právní formy.
                            Data o právní formě orgánů veřejné moci získáváme z Registu práv a povinností (<a href="https://www.szrcr.cz/cs/registr-prav-a-povinnosti">RPP</a>).
                            Tato statistika udává, kolik z existujících orgánů veřejné moci v každé kategorii zveřejňuje svoji úřední desku jako otevřená data.
                            Jednotlivé úřední desky je možné si prohlédnout v sekci <a href="#/seznam">Seznam</a>.
                        </p>
                    </Col>
                </Row>

                <Row className="text-center justify-content-center">
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex">
                        <div>
                            <h6>Obec</h6>
                            <div ref={this.pieContainerCity} />
                        </div>
                    </Col>
                </Row>
                <Row className="text-center justify-content-center">
                    <Col className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 col-xxl-3">
                        <div>
                            <h6>Městská část, městský obvod</h6>
                            <div ref={this.pieContainerCityPart} />
                        </div>
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 col-xxl-3">
                        <div>
                            <h6>Kraj</h6>
                            <div ref={this.pieContainerRegion} />
                        </div>
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 col-xxl-3">
                        <div>
                            <h6>Organizační složka státu</h6>
                            <div ref={this.pieContainerGovernment} />
                        </div>
                    </Col>
                </Row>
                <Row className="text-center justify-content-center m-3">
                    <h6>Ostatní právní formy orgánů veřejné moci (OVM)</h6>
                </Row>
                <Row className="justify-content-center">
                    <Col className="col-11 col-sm-11 col-md-5 col-lg-5 col-xl-5 col-xxl-5 p-2 m-2">
                        {this.renderOtherProviders()}
                    </Col>
                    <Col className="col-11 col-sm-11 col-md-5 col-lg-5 col-xl-5 col-xxl-5 p-2 m-2">
                        {this.renderOtherOrganizations()}
                    </Col>
                </Row>

            </>
        );
    }
}