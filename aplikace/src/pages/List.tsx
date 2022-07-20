import React from 'react';
import { Link } from 'react-router-dom';
import { BulletinData } from '../model/dataset';
import { ProviderType } from '../model/Provider';
import { SimplePaging } from '../Utils';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import { BulletinController } from './BulletinController';
import { Col } from 'react-bootstrap';
import Stack from 'react-bootstrap/Stack'
import { stat } from 'fs';


class Bulletin extends React.Component<{ data: BulletinData }> {
    constructor(props: { data: BulletinData }) {
        super(props);
    }

    getProviderTypeTextandClass(type: ProviderType): { text: string, className: string } {
        switch (type) {
            case ProviderType.City:
                return { text: "Obec", className: "type-city" };
            case ProviderType.CityPart:
                return { text: "Městská část", className: "type-city-part" };
            case ProviderType.Region:
                return { text: "Kraj", className: "type-region" };
            case ProviderType.Government:
                return { text: "Organizační složka státu", className: "type-government" };
            default:
                return { text: "Neznámý", className: "type-unknown" };
        }
    }

    render() {
        var bulletin = this.props.data; // BulletinData
        var linkToDataset = "https://data.gov.cz/datová-sada?iri=" + bulletin.iri;
        var badge = this.getProviderTypeTextandClass(bulletin.provider.type);
        return (
            <Card >
                <Card.Header as="h5" className="d-inline">
                    {bulletin.provider.name}
                </Card.Header>
                <Card.Body>
                    {bulletin.provider.type !== ProviderType.Unknown && (
                        <h6><Badge pill bg={badge.className}>
                            {badge.text}
                        </Badge></h6>)}
                    <Card.Title as="h4">{bulletin.name}</Card.Title>


                </Card.Body>
                <Stack direction="horizontal" className="justify-content-md-center">
                    <Button href={"#/detail?iri=" + bulletin.iri} variant="outline-primary" size="sm" className="m-1">
                        Zobrazit informace
                    </Button>
                    <Button href={linkToDataset} target="_blank" rel="noreferrer" variant="outline-secondary" size="sm" className="m-1">
                        Dataset v NKOD
                    </Button>
                </Stack>
            </Card>
        );
    }
}

class BulletinList extends React.Component {
    render() {
        return (
            <BulletinController
                headerElement={BulletinListHeader}
                bulletinListElement={BulletinCards} />
        );
    }
}

const BulletinListHeader = () => {
    return (
        <>
            <Row className="p-2 text-center ">
                <h2>Seznam úředních desek</h2>
            </Row>
            <Row className="p-2 text-center ">
                <p>
                    Úřední desky je možné filtrovat na základě právní formy poskytovatele nebo vyhledat podle názvu poskytovatele.
                </p>
            </Row>
        </>
    );
}

class BulletinCards extends React.Component<{ data: BulletinData[] }, { displayedCount: number }> {
    DISPLAY_INCREMENT = 20;
    constructor(props: { data: BulletinData[] }) {
        super(props);
        this.state = { displayedCount: this.DISPLAY_INCREMENT <= props.data.length ? this.DISPLAY_INCREMENT : props.data.length };
        this.setDisplayedCount = this.setDisplayedCount.bind(this);
        this.handleShowMore = this.handleShowMore.bind(this);
        this.handleShowAll = this.handleShowAll.bind(this);
    }
    setDisplayedCount(newCount: number): void {
        this.setState({ displayedCount: newCount });
    }

    handleShowMore() {
        var total = this.props.data.length;
        var displayed = this.state.displayedCount;
        var increment = this.DISPLAY_INCREMENT;
        if (displayed + increment <= total) {
            displayed += increment;
        } else {
            displayed += (total - displayed);
        }
        this.setState({ displayedCount: displayed });
    }
    handleShowAll() {
        var total = this.props.data.length;
        this.setState({ displayedCount: total });
    }

    render() {
        var displayed = this.state.displayedCount < this.props.data.length ? this.state.displayedCount : this.props.data.length;

        return (
            <Container fluid className="p-3">
                <Row /*lg={3} md={2} sm={1}*/ className="justify-content-md-center">
                    {this.props.data
                        .slice(0, displayed)
                        .map((bul) => (
                            <Col key={bul.source + Math.random().toString()}
                                className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 col-xxl-3 d-flex p-2">
                                <Bulletin data={bul} />
                            </Col>
                        ))}
                </Row>
                {/* <Paging displayedCount={displayedCount} totalCount={ this.props.data.length }  
                    increment={ this.DISPLAY_INCREMENT } setDisplayCount={ this.setDisplayedCount }/> */}
                <SimplePaging displayed={displayed} total={this.props.data.length}
                    handleMore={this.handleShowMore} handleAll={this.handleShowAll} />
            </Container>
        );
    }
}

export { BulletinList, Bulletin, BulletinCards };