import React from "react";
import { Form } from "react-bootstrap";

type OptionChangeCallback = (selected: string) => void;

/**
 * Props of the CheckboxGroup component
 */
interface CheckboxProps {
    /**
     * list of options shown on the checkbox group
     */
    options: {
        label: string,
        value: string,
        checked: boolean
    }[];
    /** on change of a switch */
    callback: OptionChangeCallback;
}

/**
 * Form with switches (checkboxes) - multiple can be selected
 */
export class CheckboxGroup extends React.Component<CheckboxProps> {
    private handleChange(optionValue: string) {
        this.props.callback(optionValue);
    }
    render() {
        return (
            <div >
                {this.props.options.map((option) => {

                    if (option.checked) {
                        var checkbox = <Form.Check type="switch" defaultChecked id={option.value} value={option.value} name={option.value}
                            onChange={() => this.handleChange(option.value)}
                            label={option.label} />
                    } else {
                        var checkbox = <Form.Check type="switch" id={option.value} value={option.value} name={option.value}
                            onChange={() => this.handleChange(option.value)}
                            label={option.label} />
                    }
                    return (
                        <div key={option.value}>
                            {checkbox}
                        </div>
                    )
                }
                )}
            </div>
        );
    }
}