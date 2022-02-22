import React from 'react';

type SelectorChangeCallback = (selected: string) => void;

interface SelectorOptions { 
    options: {label: string, value: string}[];
    firstSelected: string;
    groupName: string;
    callback: SelectorChangeCallback;
}


class RadioSelector extends React.Component<SelectorOptions, {selected: string}> {
    constructor(props: SelectorOptions) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {selected: this.props.firstSelected}
    }
    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ selected: event.target.value })
        this.props.callback(event.target.value);
        
    }
    render() {
        return (
            <div onChange={this.handleChange}>
                {this.props.options.map(option => {
                    var radio = <input type="radio" id={option.value} value={option.value} name={this.props.groupName} />
                    if (option.value == this.state.selected) {
                        var radio = <input type="radio" id={option.value} value={option.value} name={this.props.groupName} checked />
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

export type { SelectorOptions, SelectorChangeCallback };
export { RadioSelector };