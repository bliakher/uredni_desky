import React from 'react';
import { useLocation } from 'react-router';
import { BulletinData, getBulletinByIri, InfoRecord, TimeMoment, Document } from '../model/dataset';
import { fetchOrganizationNameByIco } from '../model/query';
import { Loader, Paging, HoverTooltip, SimplePaging } from '../Utils';
import znak from '../statni_znak.png';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack'
import { Col, Form, ListGroup, ListGroupItem } from 'react-bootstrap';
import { BsCalendar2Event as CalendarEventIcon, BsCalendar2X as CalendarXIcon,
    BsCalendar2PlusFill as CalendarPlusIcon, BsCalendar2XFill as CalendarXFillIcon } from 'react-icons/bs';

const BulletinDetail = () => {
    var params = new URLSearchParams(useLocation().search);
    var iriNull = params.get("iri");
    var iri = iriNull == null? "" : iriNull;
    return (<BulletinDetailComplete iri={iri} />);
}

interface BulletinDetailState {
    loaded: boolean;
    invalidIri: boolean;
    ownerName: string | null;
    finderOn: boolean;
    finderValue: string;
}

class BulletinDetailComplete extends React.Component<{iri: string}, BulletinDetailState> {
    data: BulletinData | null;
    constructor(props: {iri: string}) {
        super(props);
        this.state = {loaded: false, invalidIri: false, ownerName: null, finderOn: false, finderValue: "" };
        this.data = null;
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
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
    handleChange(event: any) {
        this.setState({finderValue: event.target.value});
    }
    handleSubmit() {
        this.setState({finderOn: true});
    }
    handleCancel(event: any) {
        this.setState({finderValue: "", finderOn: false});
    }
    render() {
        if (this.state.loaded) {
            if (!this.state.invalidIri && this.data != null) {
                var infoRecordsOrFalse = this.data.getInfoRecords();
                var infoRecords = infoRecordsOrFalse ? infoRecordsOrFalse : [];
                var filteredRecords = infoRecords.filter(record => {
                    var name = record.getName();
                    return name && name.toLowerCase().includes(this.state.finderValue.toLowerCase());
                });
                return ( 
                    <>
                        <Container>
                            <div className="text-center">
                                <img alt="logo" src={znak} width="50" height="60" className="d-inline-block align-top m-2" />
                            </div>
                            <div className="text-center justify-content-md-center m-2">
                                <h3>{this.data.name}</h3>
                            </div>
                            {/**  className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-xxl-3 d-flex"  */}
                            <Row className="text-center justify-content-md-center d-flex align-items-center">
                                <Col className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-xxl-3 d-flex" >
                                    <ListGroup className="list-group-flush border border-secondary rounded">
                                        <ListGroupItem>Poskytovatel dat: {this.data.provider.name}</ListGroupItem>
                                        { this.state.ownerName != null &&
                                        <ListGroupItem>
                                            Provozovatel: {this.state.ownerName}
                                        </ListGroupItem>}
                                    </ListGroup>
                                    
                                </Col>
                                <Col className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-xxl-3 d-flex" >
                                    <ListGroup className="list-group-flush border border-secondary rounded">
                                        <ListGroupItem><h6>Vyhledávání informace:</h6></ListGroupItem>
                                        <ListGroupItem>
                                            <Form onSubmit={this.handleSubmit} >
                                                <Form.Group id="form-finder">
                                                    
                                                    <Form.Control type="text" id="finder" onChange={this.handleChange}/>
                                                    {/* <input type="submit" value="Najít"/>
                                                    <input type="cancel" value="Zrušit vyhledání" onClick={this.handleCancel}/> */}
                                                    <Button type="submit" variant="outline-primary" className="m-2">
                                                        Najít
                                                    </Button>
                                                    <Button type="reset" onClick={this.handleCancel} variant="outline-primary"  className="m-2">
                                                        Zrušit vyhledání
                                                    </Button>
                                                </Form.Group>
                                            </Form>
                                        </ListGroupItem>
                                    </ListGroup>
                                </Col>
                            </Row>

                            {this.state.loaded && !this.data.hasValidSource && (
                                <Row className="text-center justify-content-md-center">
                                    <p>Data nebylo možné načíst.</p>
                                </Row>
                            )}
                            
                            <InfoCards data={ this.state.finderOn ? filteredRecords : infoRecords} cardElement={InfoCard}/>

                            <Row className="text-center justify-content-md-center">
                                <Col>
                                    <Button href={"#/validace/detail?iri=" + this.data.iri} variant="outline-primary">
                                        Validovat úřední desku
                                    </Button>
                                </Col>
                            </Row>
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

class InfoCards extends React.Component<{ data: Array<InfoRecord>, cardElement: any}, {displayedCount: number}> {
    INFO_QUANTUM = 10; // number of infos loaded on one load
    constructor(props: { data: Array<InfoRecord>, cardElement: any}) {
        super(props);
        this.state = {
            displayedCount: this.props.data.length >= this.INFO_QUANTUM ? this.INFO_QUANTUM : this.props.data.length,
        };
        this.handleShowMore = this.handleShowMore.bind(this);
        this.handleShowAll = this.handleShowAll.bind(this);
    }
    handleShowMore() {
        var total = this.props.data.length;
        var displayed = this.state.displayedCount;
        var increment = this.INFO_QUANTUM;
        if ( displayed + increment <= total) {
            displayed += increment;
        } else {
            displayed += (total - displayed);
        }
        this.setState({displayedCount: displayed});
    }
    handleShowAll() {
        var total = this.props.data.length;
        this.setState({displayedCount: total});
    }
    render() {
        var infoRecords = this.props.data;
        infoRecords.sort(InfoRecord.compare); // sort by date issued
        infoRecords.reverse(); // reverse so the newest show first
        var displayed = this.state.displayedCount < this.props.data.length ? this.state.displayedCount : this.props.data.length;
        return (
            <>
                    <Row className="text-center justify-content-md-center">
                        {infoRecords.slice(0, displayed).map(record => 
                            (<this.props.cardElement data={record} key={(record.getName() || "") + Math.random().toString()} />))}
                    </Row>
                    <SimplePaging displayed={displayed} total={this.props.data.length} handleMore={this.handleShowMore} handleAll={this.handleShowAll} />
            </>
        );
    }
}



const Attachements = (props: {documents: Array<Document>}) => {
    if (props.documents.length === 0) {
        return (
            <div></div>
        );
    }
    if (props.documents.length == 1) {
        var document = props.documents[0];
        return (
            <Button href={document.getUrl() ?? ""} target="_blank" rel="noreferrer" variant="outline-primary" className="m-1">Dokument</Button>
        );
    }
    var counter = 0;
    return (
        <Row className="text-center justify-content-md-center">
            { props.documents.map( document => {
                counter++;
                return ( <Button href={document.getUrl() ?? ""} target="_blank" rel="noreferrer" variant="outline-primary" className="m-1 col-3">
                            {counter}
                        </Button> ); 
                }) }
        </Row>
    );
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
        var isValid = (validTo && validTo.date) ? validTo.date >= new Date() : true; // check valdity - validTo date is older than today
        var documents = info.getDocuments().filter(document => document.getUrl() !== null); // take only documents with url
        return (
            <>
                <Card style={{ width: '18rem' }} className="m-2">
                    <Card.Body>
                        <Card.Title>{name}</Card.Title>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                        <ListGroupItem>
                            <HoverTooltip tooltipText="Datum vyvěšení" innerElement={
                                <div>
                                    <CalendarEventIcon className="m-2"/>
                                    {issuedStr}
                                </div>
                            }/>
                            <HoverTooltip tooltipText="Relevantní do" innerElement={
                                <div>
                                    <CalendarXFillIcon className="m-2"/>
                                    {isValid && validToStr}
                                    {!isValid && <b className="outdated">{validToStr}</b>}
                                </div>
                            }/>
                           
                        </ListGroupItem>
                    {documents.length > 0 && (
                        <>
                            <ListGroupItem>
                                <h6>Přílohy:</h6>
                                <Attachements documents={documents}/>
                            </ListGroupItem> 
                        </> )}
                        <ListGroupItem>
                            {url && <Button href={url} target="_blank" rel="noreferrer" variant="primary" >
                                        Informace
                                    </Button>}
                        </ListGroupItem>
                    </ListGroup>
                    
                </Card>
            </>
        );
    }
}

export { BulletinDetail, Attachements, InfoCards };