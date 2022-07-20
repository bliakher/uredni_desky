import React from "react";
import { Button, Stack } from "react-bootstrap";

/**
 * Props of the SimplePaging component
 */
interface SimplePagingProps {
    /** count of currently displayed items */
    displayed: number;
    /** total count of items */
    total: number;
    /** callback for show more */
    handleMore: () => void;
    /** callback for show all */
    handleAll: () => void;
}

/**
 * Component for simple paging - show more / show all
 */
export class SimplePaging extends React.Component<SimplePagingProps>{
    render() {
        return (
            <Stack className="text-center justify-content-center m-2">
                <div className="m-2">
                    <p>Zobrazeno: {this.props.displayed} z {this.props.total}</p>
                </div>
                { this.props.displayed !== this.props.total && 
                    <Stack direction="horizontal" className="text-center justify-content-center">
                        <div className="m-2">
                                <Button variant="outline-secondary" onClick={this.props.handleMore}>Zobrazit další</Button>
                        </div>
                        <div className="m-2">
                                <Button variant="outline-secondary" onClick={this.props.handleAll}>Zobrazit vše</Button>
                        </div>
                    </Stack> }
            </Stack> 
        );
    }
}

