import React from 'react';
import { Link } from 'react-router-dom';
import { BulletinData, InfoRecord, SortedBulletins, ProviderType } from '../model/dataset';
import { SelectorOptions, OptionChangeCallback, RadioSelector, Paging } from '../Utils';
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

class BulletinList extends React.Component {
    render() {
        return (
            <BulletinController 
                headerElement={ BulletinListHeader }
                bulletinListElement={BulletinCards} />
        );
    }
}

const BulletinListHeader = () => {
    return (
        <Row className="p-2 text-center ">
            <h2>Seznam úředních desek</h2>
        </Row>
    );
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

export { BulletinList };