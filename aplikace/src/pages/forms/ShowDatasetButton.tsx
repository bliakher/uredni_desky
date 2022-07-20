import { Button } from "react-bootstrap";

/**
 * Button that links to the bulletin dataset in NDC with ist IRI
 */
export const ShowDatasetButton = (props: { bulletinIri: string }) => {
    return (
        <Button variant="outline-secondary" href={"https://data.gov.cz/datová-sada?iri=" + props.bulletinIri} target="_blank" className="m-1">
            Zobrazit dataset v NKOD
        </Button>
    );
}