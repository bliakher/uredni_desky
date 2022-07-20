import { Row } from "react-bootstrap";

/**
 * Page displayed on incorrect URL
 */
const NoPage = () => {
    return (
        <Row className="justify-content-center text-center m-4">
            <h1>404</h1>
            <p>Stránka nenalezena.</p>
        </Row>
    );
}

export default NoPage;