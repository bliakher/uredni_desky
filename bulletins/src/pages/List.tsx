import React from 'react';
import { Datasets, BulletinData, InfoRecord } from '../model/dataset';


class Bulletin extends React.Component<{ data: BulletinData}, {opened: boolean}> {
    constructor(props: { data: BulletinData}) {
        super(props);
        this.state = {
            opened: false,
        };
        this.handleClick = this.handleClick.bind(this);
    }
    
    handleClick() {
        this.setState(prevState => ({opened: !prevState.opened}));
    }

    renderErrorElement() {
        return (
            <div>
                <p>Problém při načítání</p>
                {/* <p>{this.props.data.loadError}</p> */}
            </div>
        );
    }


    render() {
        var bulletin = this.props.data; // BulletinData
        var bulletinData = bulletin.getDistribution();
        var infoRecords = bulletin.getInfoRecords();
        var insides;
        if (!infoRecords) {
            insides = this.renderErrorElement();
        } else {
            insides = (<InfoList data={infoRecords} />);
        }
        return (
            <div className="bulletin" id={bulletinData?.iri}>
                <span>
                    <h3>{bulletin.provider}</h3>
                    <a href={bulletin.source} target="_blank">odkaz</a>
                </span>
                <button onClick={this.handleClick}>
                    {this.state.opened ? '^' : 'v'}
                </button>
                {this.state.opened && insides}
            </div>
        );
    }
}

class InfoList extends React.Component<{ data: Array<InfoRecord>}, {infoDisplayed: number}> {
    INFO_QUANTUM = 3; // number of infos loaded on one load
    constructor(props: { data: Array<InfoRecord>}) {
        super(props);
        this.state = {
            infoDisplayed: this.INFO_QUANTUM,
        };
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
        var infoCount = this.props.data.length;
        var displayed = this.state.infoDisplayed
        if ( displayed + this.INFO_QUANTUM <= infoCount) {
            displayed += this.INFO_QUANTUM;
        } else {
            displayed += (infoCount - displayed);
        }
        this.setState({infoDisplayed: displayed});
    }
    render() {
        var infoRecords = this.props.data;
        return (
            <>
                <ul>
                    {infoRecords.slice(0, this.state.infoDisplayed).map(record => (<li><BulletinInfo data={record} /></li>))}
                </ul>
                <p>Zobrazeno: {this.state.infoDisplayed} z {infoRecords.length}</p>
                { this.state.infoDisplayed != infoRecords.length && 
                <button onClick={this.handleClick} >Načíst další</button>}
            </>
        );
    }
}

class BulletinInfo extends React.Component<{data: InfoRecord}> {
    constructor(props: {data: InfoRecord}) {
        super(props);
    }
    render() {
        var info = this.props.data;
        //var url = info.hasOwnProperty("url") ? ((void)info)['url'] : null;
        return (
            <div>
                {info.name}
            </div>
        );
    }
}

class BulletinList extends React.Component<{data: BulletinData[]}, { search: string}> {
    constructor(props: {data: BulletinData[]}) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = { search: ""}
    }
    handleSubmit(event: any) {

    }
    handleChange(event: any) {

    }
    render() {
        const bulletinData = this.props.data;
        const bulletins = bulletinData.map((bul) => (<Bulletin key={bul.source} data={bul}/>))
        return (
            <div>
                <h2>Úřední desky</h2>
                <form onSubmit={this.handleSubmit}>
                    <label htmlFor="finder">Vyhledávání desky:</label>
                    <input type="text" id="finder" onChange={this.handleChange}/>
                    <input type="submit" value="Najít"/>
                </form>
                { bulletins }
            </div>
        );
    }
}

export default BulletinList;