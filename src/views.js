var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

export var Bulletin = function (_React$Component) {
    _inherits(Bulletin, _React$Component);

    function Bulletin(props) {
        _classCallCheck(this, Bulletin);

        return _possibleConstructorReturn(this, (Bulletin.__proto__ || Object.getPrototypeOf(Bulletin)).call(this, props));
    }

    _createClass(Bulletin, [{
        key: "render",
        value: function render() {
            var bulletin = this.props.data;
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "h3",
                    null,
                    bulletin.provider
                ),
                React.createElement(
                    "p",
                    null,
                    bulletin.source
                )
            );
        }
    }]);

    return Bulletin;
}(React.Component);

export var BulletinList = function (_React$Component2) {
    _inherits(BulletinList, _React$Component2);

    function BulletinList(props) {
        _classCallCheck(this, BulletinList);

        return _possibleConstructorReturn(this, (BulletinList.__proto__ || Object.getPrototypeOf(BulletinList)).call(this, props));
    }

    _createClass(BulletinList, [{
        key: "render",
        value: function render() {
            var bulletins = this.props.data;
            return bulletins.map(function (bul) {
                return React.createElement(Bulletin, { key: bul.source, data: bul });
            });
        }
    }]);

    return BulletinList;
}(React.Component);

export function displayDatasets(bulletins, element) {
    // var header = document.createElement("h2");
    // header.textContent = "Úřední desky";
    // element.appendChild(header);
    // for (var dataset of datasets) {
    //     displayBulletin(dataset.poskytovatel, dataset.zdroj, element);
    // }
    var bulletinList = React.createElement(BulletinList, { data: bulletins });
    ReactDOM.render(bulletinList, element);
}