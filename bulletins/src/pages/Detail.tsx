import React from 'react';
import { useLocation } from 'react-router';
import { BulletinData, getBulletinByIri, InfoRecord, TimeMoment } from '../model/dataset';
import { fetchOrganizationNameByIco } from '../model/query';
import { Loader, Paging } from '../Utils';
import znak from '../statni_znak.png';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack'
import { info } from 'console';
import { Col, ListGroup, ListGroupItem } from 'react-bootstrap';

const BulletinDetail = () => {
    var params = new URLSearchParams(useLocation().search);
    var iriNull = params.get("iri");
    var iri = iriNull == null? "" : iriNull;
    return (<BulletinDetailComplete iri={iri} />);
}

class BulletinDetailComplete extends React.Component<{iri: string}, {loaded: boolean, invalidIri: boolean, ownerName: string | null}> {
    data: BulletinData | null;
    constructor(props: {iri: string}) {
        super(props);
        this.state = {loaded: false, invalidIri: false, ownerName: null }
        this.data = null;
    }
    async componentDidMount() {
        var data = await getBulletinByIri(this.props.iri);
        if (data == null) {
            this.setState({loaded: true, invalidIri: true});
        } else {
            this.data = data;
            await this.data.fetchDistribution();
            this.setState({loaded: true});
            var distribution = data.getDistribution();
            var publisher = distribution?.getPublisher();
            if (publisher) {
                var ico = publisher.ičo;
                var name = await fetchOrganizationNameByIco(ico);
                this.setState({ownerName: name});
            }
        }
    }
    render() {
        if (this.state.loaded) {
            if (!this.state.invalidIri && this.data != null) {
                var infoRecords = this.data.getInfoRecords();
                return ( 
                    <>
                        <Container>
                            <div className="text-center">
                                <img alt="logo" src={znak} width="50" height="60" className="d-inline-block align-top" />
                            </div>
                            <div className="text-center justify-content-md-center">
                                <h3>{this.data.name}</h3>
                            </div>

                            <Row>
                                <Col md={{ span: 4, offset: 4 }}>
                                    <ListGroup className="list-group-flush border border-secondary rounded">
                                        <ListGroupItem>Poskytovatel dat: {this.data.provider}</ListGroupItem>
                                        { this.state.ownerName != null &&
                                        <ListGroupItem>
                                            Provozovatel: {this.state.ownerName}
                                        </ListGroupItem>}
                                    </ListGroup>
                                </Col>
                            
                            </Row>
                            
                            <InfoCards data={ infoRecords? infoRecords : []} />
                        </Container>

                    </>);
                
            } else {
                return (<p>Chyba: Nevalidní iri datasetu - nelze načíst.</p>)
            }
        } else {
            return (<Loader />);
        }
    }
}

class InfoCards extends React.Component<{ data: Array<InfoRecord>}, {infoDisplayed: number}> {
    INFO_QUANTUM = 10; // number of infos loaded on one load
    constructor(props: { data: Array<InfoRecord>}) {
        super(props);
        this.state = {
            infoDisplayed: this.props.data.length >= this.INFO_QUANTUM ? this.INFO_QUANTUM : this.props.data.length,
        };
        this.setDisplayedCount = this.setDisplayedCount.bind(this);
    }
    setDisplayedCount(newCount: number): void {
        this.setState( {infoDisplayed: newCount} );
    }
    render() {
        var infoRecords = this.props.data;
        infoRecords.sort(InfoRecord.compare); // sort by date issued
        infoRecords.reverse(); // reverse so the newest show first
        return (
            <>
                    <Row className="text-center justify-content-md-center">
                        {infoRecords.slice(0, this.state.infoDisplayed).map(record => 
                            (<InfoCard data={record} key={(record.getName() || "") + Math.random().toString()} />))}
                    </Row>
                    <Paging totalCount={ infoRecords.length }  increment={ this.INFO_QUANTUM } setDisplayCount={ this.setDisplayedCount } />
            </>
        );
    }
}

class InfoCard extends React.Component<{data: InfoRecord}> {
    constructor(props: {data: InfoRecord}) {
        super(props);
    }
    render() {
        var info = this.props.data;
        var name = info.getName()? info.getName() : "'Informace na úřední desce'";
        var url = info.getUrl();
        var issued = info.getDateIssued();
        var issuedStr = issued ? issued.to_string() : "Údaj chybí";
        var validTo = info.getDateValidTo();
        var validToStr = validTo ? validTo.to_string() : "Údaj chybí";
        var documents = info.getDocuments().filter(document => document.getUrl() !== null); // take only documents with url
        return (
            <>
                {/* <div>
                    <span>
                        <h4>{name}</h4>
                        {url && <a href={url} target="_blank" rel="noreferrer">odkaz</a>}
                    </span>
                    {issued && <p>Datum vyvěšení: {issuedStr}</p>}
                    {validTo && <p>Relevantní do: {validToStr}</p>}
                </div> */}

                <Card style={{ width: '18rem' }}>
                    {/* <Card.Header>{name}</Card.Header> */}
                    <Card.Body>
                        <Card.Title>{name}</Card.Title>
                        {/* <Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle> */}
                        <Card.Text>
                            {issued && ("Datum vyvěšení: " + issuedStr + '\n')}
                            {validTo && ("Relevantní do: " + validToStr)}
                        </Card.Text>
                    </Card.Body>
                    <Card.Body>
                        {documents.length > 0 && 
                            <ListGroup className="list-group-flush">
                                <ListGroupItem>Přílohy</ListGroupItem>
                                {documents.map(document => (
                                    <ListGroupItem key={document.getUrl() ?? ""}>
                                        <Button href={document.getUrl() ?? ""} target="_blank" rel="noreferrer" variant="light">Dokument</Button>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        }
                    </Card.Body>
                    <Card.Body>
                        {url && <Button href={url} target="_blank" rel="noreferrer" variant="outline-primary" /*className="position-absolute bottom-0"*/>
                                    Informace
                                </Button>}
                    </Card.Body>
                    
                </Card>
            </>
        );
    }
}

export { BulletinDetail };