import React, { ComponentClass, ReactComponentElement } from 'react';
import { useLocation } from "react-router-dom";


type SelectorChangeCallback = (selected: string) => void;

interface SelectorOptions { 
    options: {label: string, value: string}[];
    firstSelected: string;
    groupName: string;
    callback: SelectorChangeCallback;
}


class RadioSelector extends React.Component<SelectorOptions> {
    constructor(props: SelectorOptions) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.props.callback(event.target.value);
        
    }
    render() {
        return (
            <div onChange={this.handleChange}>
                {this.props.options.map(option => {
                    var radio = <input type="radio" id={option.value} value={option.value} name={this.props.groupName} />
                    if (option.value == this.props.firstSelected) {
                        var radio = <input type="radio" id={option.value} value={option.value} name={this.props.groupName} defaultChecked />
                    }
                    return (
                        <div key={option.value}>
                            {radio}
                            <label htmlFor={option.value}>{option.label}</label>
                        </div>
                        )}
                )}
            </div>
        );
    }
}

const OutletWithQueryParam = (param: string, element: ComponentClass<{param: string}, any>) => {
    var params = new URLSearchParams(useLocation().search);
    var paramValueOrNull = params.get(param);
    var paramValue = paramValueOrNull == null? "" : paramValueOrNull;
    return React.createElement(element, {param: paramValue} );
}

export type { SelectorOptions, SelectorChangeCallback };
export { RadioSelector };