import React from 'react';
import { InfoRecord, Document } from '../../model/dataset';
import { SimplePaging, HoverTooltip } from '../../Utils';
import { Card, Row, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { BsCalendar2Event as CalendarEventIcon, BsCalendar2X as CalendarXIcon,
    BsCalendar2PlusFill as CalendarPlusIcon, BsCalendar2XFill as CalendarXFillIcon, BsLink45Deg as LinkIcon } from 'react-icons/bs';


export class InfoCards extends React.Component<{ data: Array<InfoRecord>, cardElement: any}, {displayedCount: number}> {
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


export class InfoCard extends React.Component<{data: InfoRecord}> {
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
                                    {!isValid && <b className="warning-text">{validToStr}</b>}
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

export const Attachements = (props: {documents: Array<Document>}) => {
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