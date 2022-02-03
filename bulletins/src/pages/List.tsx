import React from 'react';
import { Datasets, BulletinData, InfoRecord } from '../model/dataset';

interface BulletinState {
    opened: boolean;
    infoDisplayed: number;
}

class Bulletin extends React.Component<{ data: BulletinData}, BulletinState> {
    constructor(props: { data: BulletinData}) {
        super(props);
        this.state = {
            opened: false,
            infoDisplayed: 0,
        };
        this.handleClick = this.handleClick.bind(this);
    }
    
    async handleClick() {
        // var bulletin = this.props.data;
        // var distribution = await bulletin.getDistribution();
        // if (!this.state.opened) {
        //     if (this.state.infoDisplayed == 0) {
        //         this.setState( {infoDisplayed: Math.min(3, distribution.length)} );
        //     }
        // }
        // this.setState(prevState => ({opened: !prevState.opened}));
    }

    render() {
        var bulletin = this.props.data; // BulletinData
        //var records = await bulletin.getInfoRecords();
        return (
            <div className="bulletin">
                <h3>{bulletin.provider}</h3>
                <p>{bulletin.source}</p>
                <button onClick={this.handleClick}>
                    {this.state.opened ? '^' : 'v'}
                </button>
                {/* {this.state.opened && 
                    (<ul>
                        {records.slice(0, this.state.infoDisplayed).map(record => (<li><BulletinInfo data={record} /></li>))}
                    </ul>)} */}
            </div>
        );
    }
}

class BulletinInfo extends React.Component<{data: InfoRecord}> {
    constructor(props: {data: InfoRecord}) {
        super(props);
    }
    render() {
        var info = this.props.data;
        return (
            <div>
                {info.name}
            </div>
        );
    }
}

class BulletinList extends React.Component<{data: BulletinData[]}> {
    constructor(props: {data: BulletinData[]}) {
        super(props);
    }
    render() {
        const bulletinData = this.props.data;
        const bulletins = bulletinData.map((bul) => (<Bulletin key={bul.source} data={bul}/>))
        return (
            <div>
                <p>Úřední desky</p>
                { bulletins }
            </div>
        );
    }
}

export default BulletinList;