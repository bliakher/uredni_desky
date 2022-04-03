import React from 'react';
import { useLocation } from 'react-router';
import { BulletinData, getBulletinByIri, InfoRecord, TimeMoment } from '../model/dataset';
import { fetchOrganizationNameByIco } from '../model/query';
import { Loader } from '../Utils';
import znak from '../statni_znak.png';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack'
import { info } from 'console';

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
                        
                            <p>Poskytovatel dat: {this.data.provider}</p>
                            { this.state.ownerName != null && <p>Provozovatel: {this.state.ownerName}</p>}
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
        this.handleShowMore = this.handleShowMore.bind(this);
        this.handleShowAll = this.handleShowAll.bind(this);
    }
    handleShowMore() {
        var infoCount = this.props.data.length;
        var displayed = this.state.infoDisplayed
        if ( displayed + this.INFO_QUANTUM <= infoCount) {
            displayed += this.INFO_QUANTUM;
        } else {
            displayed += (infoCount - displayed);
        }
        this.setState({infoDisplayed: displayed});
    }
    handleShowAll() {
        var infoCount = this.props.data.length;
        this.setState({infoDisplayed: infoCount});
    }  
    render() {
        var infoRecords = this.props.data;
        infoRecords.sort(InfoRecord.compare); // sort by date issued
        infoRecords.reverse(); // reverse so the newest show first
        return (
            <>
                <Container>
                    <Row  /*md={2} sm={1}*/ className="text-center justify-content-md-center">
                        {infoRecords.slice(0, this.state.infoDisplayed).map(record => (<InfoCard data={record} key={record.getName() || undefined} />))}
                    </Row>
                    <Stack className="text-center justify-content-md-center">
                        <div>
                            <p>Zobrazeno: {this.state.infoDisplayed} z {infoRecords.length}</p>
                        </div>
                        <Stack direction="horizontal" className="text-center justify-content-md-center">
                            <div>
                                { this.state.infoDisplayed !== infoRecords.length && 
                                    <Button variant="light" onClick={this.handleShowMore}>Zobrazit další</Button>}
                            </div>
                            <div>
                                { this.state.infoDisplayed !== infoRecords.length && 
                                    <Button variant="light" onClick={this.handleShowAll}>Zobrazit vše</Button>}
                            </div>
                        </Stack>
                    </Stack>
                </Container>
                
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
                        {url && <Button variant="light" /*className="position-absolute bottom-0"*/>
                                    <a href={url} target="_blank" rel="noreferrer">Informace</a>
                                </Button>}
                    </Card.Body>
                </Card>
            </>
        );
    }
}

export { BulletinDetail };