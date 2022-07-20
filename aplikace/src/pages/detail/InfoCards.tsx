import React from 'react';
import { InfoRecord, Document } from '../../model/InfoRecord';
import { HoverTooltip } from '../Utils';
import { SimplePaging } from '../forms/SimplePaging';
import { Card, Row, Button, ListGroup, ListGroupItem, Col } from 'react-bootstrap';
import { BsCalendar2Event as CalendarEventIcon, BsCalendar2XFill as CalendarXFillIcon } from 'react-icons/bs';
import { InfoComponentProps, PaginatedComponentState } from '../componentInterfaces';

/**
 * Props of the InfoCards component
 */
interface InfoCardsProps {
    /** list of information to display */
    data: Array<InfoRecord>;
    /**
     * React component type
     * Inner component that can display 1 bulletin info
     * It should have props of interface InfoComponentProps
     */
    cardElement: any;
}

/**
 * Component that displays paginated list of infos from bulletin
 * Visualization of data is done by a component that is given as props
 */
export class InfoCards extends React.Component<InfoCardsProps, PaginatedComponentState> {
    INFO_QUANTUM = 20; // number of infos loaded on one load
    constructor(props: { data: Array<InfoRecord>, cardElement: any }) {
        super(props);
        this.state = {
            displayedCount: this.props.data.length >= this.INFO_QUANTUM ? this.INFO_QUANTUM : this.props.data.length,
        };
        this.handleShowMore = this.handleShowMore.bind(this);
        this.handleShowAll = this.handleShowAll.bind(this);
    }
    private handleShowMore() {
        var total = this.props.data.length;
        var displayed = this.state.displayedCount;
        var increment = this.INFO_QUANTUM;
        if (displayed + increment <= total) {
            displayed += increment;
        } else {
            displayed += (total - displayed);
        }
        this.setState({ displayedCount: displayed });
    }
    private handleShowAll() {
        var total = this.props.data.length;
        this.setState({ displayedCount: total });
    }
    render() {
        var infoRecords = this.props.data;
        infoRecords.sort(InfoRecord.compare); // sort by date issued
        infoRecords.reverse(); // reverse so the newest show first
        var displayed = this.state.displayedCount < this.props.data.length ? this.state.displayedCount : this.props.data.length;
        return (
            <>
                <Row className="text-center justify-content-center">

                    {infoRecords.slice(0, displayed).map(record => (
                        <Col className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 col-xxl-3 d-flex "
                            key={(record.getName() || "") + Math.random().toString()}>
                            <this.props.cardElement data={record} />
                        </Col>
                    ))}

                </Row>
                <SimplePaging displayed={displayed} total={this.props.data.length} handleMore={this.handleShowMore} handleAll={this.handleShowAll} />
            </>
        );
    }
}

/**
 * Component displaying 1 bulletin info in bulletin detail
 */
export class InfoCard extends React.Component<InfoComponentProps> {
    constructor(props: { data: InfoRecord }) {
        super(props);
    }
    render() {
        var info = this.props.data;
        var name = info.getName() ? info.getName() : "'Informace na úřední desce'";
        var url = info.getUrl();
        var issued = info.getDateIssued();
        var issuedStr = issued ? issued.to_string() : "Údaj chybí";
        var validTo = info.getDateValidTo();
        var validToStr = validTo ? validTo.to_string() : "Údaj chybí";
        var isValid = (validTo && validTo.date) ? validTo.date >= new Date() : true; // check valdity - validTo date is older than today
        var documents = info.getDocuments().filter(document => document.getUrl() !== null); // take only documents with url
        return (
            <>
                <Card className="m-1">
                    <Card.Body>
                        <Card.Title>{name}</Card.Title>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                        <ListGroupItem>
                            <HoverTooltip tooltipText="Datum vyvěšení" innerElement={
                                <div>
                                    <CalendarEventIcon className="m-2" />
                                    {issuedStr}
                                </div>
                            } />
                            <HoverTooltip tooltipText="Relevantní do" innerElement={
                                <div>
                                    <CalendarXFillIcon className="m-2" />
                                    {isValid && validToStr}
                                    {!isValid && <b className="warning-text">{validToStr}</b>}
                                </div>
                            } />

                        </ListGroupItem>

                        <ListGroupItem>
                            {documents.length > 0 && (
                                <>
                                    <h6>Přílohy:</h6>
                                    <Attachements documents={documents} />
                                </>
                            )}
                            {documents.length == 0 && (
                                <>
                                    <h6>Bez příloh</h6>
                                </>
                            )}
                        </ListGroupItem>

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

/**
 * Attachements of a bulletin info
 * There can be 0, 1 or more attachements
 */
export const Attachements = (props: { documents: Array<Document> }) => {
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
    return (
        <Row className="text-center justify-content-center">
            {props.documents.filter(document => document.getUrl() !== null)
                .map((document, index) => {
                    return (<Button href={document.getUrl() ?? ""} target="_blank" rel="noreferrer" variant="outline-primary"
                        className="m-1 col-auto" key={document.getUrl() ?? ""}>
                        {index + 1}
                    </Button>);
                })}
        </Row>
    );
}

/**
 * Component displaying missing properties of 1 bulletin info in validation detail
 */
export class InfoCardValidation extends React.Component<InfoComponentProps> {
    constructor(props: { data: InfoRecord }) {
        super(props);
    }
    render() {
        var info = this.props.data;
        var name = info.getName() ? info.getName() : "'Informace na úřední desce'";
        var url = info.getUrl();
        var missing = info.getMissingRecommendedProperties();

        return (
            <>
                <Card border="danger" className="m-2" style={{ width: '12rem' }}>
                    <Card.Body>
                        <Card.Title>{name}</Card.Title>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                        <ListGroupItem>
                            <div className="fw-bold warning-text">Chybí:</div>
                            <ul className="align-left">
                                {missing.map(property => (<li key={property}>{property}</li>))}
                            </ul>
                        </ListGroupItem>
                        <ListGroupItem>
                            {url && <Button href={url} target="_blank" rel="noreferrer" variant="outline-primary" >
                                Informace
                            </Button>}
                        </ListGroupItem>
                    </ListGroup>

                </Card>
            </>
        );
    }
}
