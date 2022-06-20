import React from 'react';
import { BulletinData } from '../../model/dataset';
import { CancelablePromise, makeCancelable } from '../../model/cancelablePromise';
import { Col, Row } from 'react-bootstrap';
import { BulletinController } from '../BulletinController';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { SimplePaging } from '../../Utils';
import { AiOutlineInfoCircle as InfoIcon } from 'react-icons/ai';

export const Validation = () => {
    return (
        <BulletinController headerElement={ValidationHeader} bulletinListElement={ValidationTable}/>
    );
}

const ValidationHeader = () => {
    return (
        <>
            <Row className="p-2 text-center ">
                <h2>Validace</h2>
            </Row>
            <Row className="justify-content-md-center text-center">
                <Col clasName="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                    <p>
                        Tato část se věnuje kvalitě poskytovaných dat z jednotlivých úředních desek. 
                        Souhrné statistiky jsou v sekci <a href="#/statistiky">Statistiky</a>
                    </p>
                </Col>
            </Row>
            <Row className="d-lg-none text-center warning-text">
                    <p><InfoIcon /> Tabulku doporučujeme pro přehlednost prohlížet na větší obrazovce.</p>
            </Row>
        </>
    );
}

class ValidationRow extends React.Component<{data: BulletinData}, {loaded: boolean}> {
    ok = "Ano";
    notOk = "Ne";
    noValue = "-";

    fetchDistributionPromise: CancelablePromise | null;
    constructor(props: {data: BulletinData}) {
        super(props);
        this.state = {loaded: false};
        this.fetchDistributionPromise = null;
    }
    async componentDidMount() {
        this.fetchDistributionPromise = makeCancelable(this.props.data.fetchDistribution());
        await this.fetchDistributionPromise.promise;
        this.setState({loaded: true});
    }
    componentWillUnmount() {
        if (this.fetchDistributionPromise) this.fetchDistributionPromise.cancel();
    }
    renderWaiting() {
        var provider = this.props.data.provider;
        var name = this.props.data.name;
        return (
            <tr>
                <td>{provider.name}</td>
                <td>{name}</td>
                <td colSpan={6}>Načítá se...</td>
            </tr>
        );
    }
    renderLoaded() {
        var distribution = this.props.data.getDistribution();
        var provider = this.props.data.provider;
        var iri = this.props.data.iri;
        var name = this.props.data.name;
        var source = this.props.data.source;
        var info = this.props.data.getInfoRecords();
        var infoCount = info ? info.length : this.noValue;
        var missing = this.props.data.checkRecommendedProperties();
        var missingBulletin = missing.bulletin.length == 0 ? this.ok : this.notOk;
        var missingInfo = missing.information.length == 0 ? this.ok : this.notOk;
        var errorLevelClass = distribution === null ? "validation-severe" :
                            (missing.bulletin.length > 0 || missing.information.length > 0) ? "validation-warning" :
                            "validation-ok";
        
        return (
            <tr className={"p-2 " + errorLevelClass}>
                <td>{provider.name}</td>
                <td>{name}</td>
                <td className="text-center">{distribution? this.ok : this.notOk }</td>
                <td className="text-center">{distribution? missingBulletin : this.noValue }</td>
                <td className="text-center">{infoCount}</td>
                <td className="text-center">{distribution? missingInfo : this.noValue }</td>
                <td className="text-center">
                    {/* <Link to={"detail?iri=" + iri}>Detail</Link> */}
                    <Button href={"#/validace/detail?iri=" + iri} variant="outline-secondary" size="sm"> + </Button>
                </td>
            </tr>
        );
    }
    render() {
        if (this.state.loaded) {
            return this.renderLoaded();
        }
        return this.renderWaiting();
    }
}

class TableExplanation extends React.Component {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <>
                <div>
                    <div>
                        <b>Distribuce </b> 
                        - uvádí, jestli bylo možné stáhnout distribuci datové sady z URL uvedeného v <a href="https://data.gov.cz/" target="_blank">NKOD</a>
                    </div>
                    <div>
                        <b>Doporučené atributy </b> 
                        - jestli metadata úřední desky obsahují všechny doporučené atributy podle <a href="https://ofn.gov.cz/%C3%BA%C5%99edn%C3%AD-desky/2021-07-20/#p%C5%99%C3%ADklady-jednoduch%C3%A1-informace" target="_blank">specifikace</a> 
                        (název desky, poskytovatel, URL atd.)
                    </div>
                    <div>
                        <b>Počet informací </b> 
                        - počet informací zveřejněných na dané úřední desce
                    </div>
                    <div>
                        <b>Doporučené atributy informace </b> 
                        - jestli všechny informace zveřejněné na desce obsahují ve svých metadatech všechny doporučené atributy podle <a href="https://ofn.gov.cz/%C3%BA%C5%99edn%C3%AD-desky/2021-07-20/#p%C5%99%C3%ADklady-jednoduch%C3%A1-informace" target="_blank">specifikace</a> 
                        (název informace, URL, IRI atd.)
                    </div>
                </div>
            </>
        );
    }

}


class ValidationTable extends React.Component<{data: BulletinData[]}, {displayedCount: number}> {
    ROW_QUANTUM = 30;
    constructor(props: {data: BulletinData[]}) {
        super(props);
        this.state = { displayedCount: props.data.length > this.ROW_QUANTUM ? this.ROW_QUANTUM : props.data.length };
        this.handleShowMore = this.handleShowMore.bind(this);
        this.handleShowAll = this.handleShowAll.bind(this);
    }
    renderHeaderRow() {
        return (
            <tr>
                <th>Poskytovatel</th>
                <th>Úřední deska</th>
                <th>Distribuce</th>
                <th>Doporučené atributy</th>
                <th>Počet informací</th>
                <th>Doporučené atributy informací</th>
                <th>Podrobnosti</th>
            </tr>
        );
    }

    handleShowMore() {
        var total = this.props.data.length;
        var displayed = this.state.displayedCount;
        var increment = this.ROW_QUANTUM;
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
        var bulletins = this.props.data;
        // console.log(bulletins.length);
        var header = this.renderHeaderRow();
        var displayed = this.state.displayedCount < this.props.data.length ? this.state.displayedCount : this.props.data.length;
        return (
            <>
                <TableExplanation />
                <Table bordered hover responsive>
                    <thead>
                        { header }
                    </thead>
                    <tbody>
                        { bulletins.slice(0, displayed)
                            .map(bul => <ValidationRow data={bul} key={bul.iri + Math.random().toString()}/>) }
                    </tbody>
                </Table>
                <SimplePaging displayed={displayed} total={this.props.data.length}
                    handleMore={this.handleShowMore} handleAll={this.handleShowAll} />
                
            </>
        );
    }
}


