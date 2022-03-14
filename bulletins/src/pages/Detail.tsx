import React from 'react';
import { useLocation } from 'react-router';
import { BulletinData, getBulletinByIri } from '../model/dataset';
import { InfoList } from './List';

const BulletinDetail = () => {
    var params = new URLSearchParams(useLocation().search);
    var iriNull = params.get("iri");
    var iri = iriNull == null? "" : iriNull;
    return (<BulletinDetailComplete iri={iri} />);
}

class BulletinDetailComplete extends React.Component<{iri: string}, {loaded: boolean, invalidIri: boolean}> {
    data: BulletinData | null;
    constructor(props: {iri: string}) {
        super(props);
        this.state = {loaded: false, invalidIri: false}
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
        }
    }
    render() {
        if (this.state.loaded) {
            if (!this.state.invalidIri && this.data != null) {
                var infoRecords = this.data.getInfoRecords();
                return ( 
                    <>
                        <h3>{this.data.name}</h3>
                        <p>Poskytovatel: {this.data.provider}</p>
                        <InfoList data={ infoRecords? infoRecords : []} />
                    </>);
                
            } else {
                return (<p>Chyba: Nevalidní iri datasetu - nelze načíst.</p>)
            }
        } else {
            return (<p>Načítá se...</p>);
        }
    }
}


export { BulletinDetail };