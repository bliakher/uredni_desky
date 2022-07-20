import Spinner from 'react-bootstrap/Spinner';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


export const Loader = () => {
    return (
        <div className="text-center justify-content-md-center m-2">
            <Spinner animation="grow" size="sm" role="status"/> Načítá se...
        </div>);
}

export const HoverTooltip = (props: {tooltipText: string, innerElement: any}) => {
    const renderTooltip = (tooltipProps: any) => (
        <Tooltip id="button-tooltip" {...tooltipProps}>
          {props.tooltipText}
        </Tooltip>
      );

    return (
        <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}>
            {props.innerElement}
        </OverlayTrigger>
    );
}


