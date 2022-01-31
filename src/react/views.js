
export class Bulletin extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const bulletin = this.props.data;
        return (
            <div>
                <h3>{bulletin.provider}</h3>
                <p>{bulletin.source}</p>
            </div>
        );
    }
}

export class BulletinList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const bulletins = this.props.data;
        return bulletins.map((bul) => (<Bulletin key={bul.source} data={bul}/>));
    }
}

export function displayDatasets(bulletins, element) {
    // var header = document.createElement("h2");
    // header.textContent = "Úřední desky";
    // element.appendChild(header);
    // for (var dataset of datasets) {
    //     displayBulletin(dataset.poskytovatel, dataset.zdroj, element);
    // }
    var bulletinList = (<BulletinList data={bulletins} />);
    ReactDOM.render(bulletinList, element);
}