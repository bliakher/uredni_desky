import React from "react";
import { Button, Form } from "react-bootstrap";

/**
 * Component with form with text finder
 */
interface FinderFormProps {
    /** on change of textbox value */
    onTextChangeCallback: (event: any) => void;
    /** on cancel finder */
    onCancelCallback: () => void;
    /** on form submit */
    onSubmitCallback: (event: any) => void;
}

export class FinderForm extends React.Component<FinderFormProps> {
    constructor(props: FinderFormProps) {
        super(props);
    }
    render() {
        return (
            <Form onSubmit={this.props.onSubmitCallback} >
                <Form.Group id="form-finder">
                    <Form.Control type="text" id="finder" onChange={this.props.onTextChangeCallback} className="m-2" />
                    <Button type="submit" variant="outline-primary" className="m-2">
                        Najít
                    </Button>
                    <Button type="reset" onClick={this.props.onCancelCallback} variant="outline-primary" className="m-2">
                        Zrušit vyhledání
                    </Button>
                </Form.Group>
            </Form>
        );
    }
}