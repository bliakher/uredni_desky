import React from 'react';
import { FaGithub as GitHubIcon } from 'react-icons/fa';
import { Col, Row, Button, Container } from 'react-bootstrap';

/**
 * Component that displays information about the project
 */
export class About extends React.Component<{}, {}> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <Container fluid>
                <Row className="justify-content-md-center m-3 mt-10">
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                        <div>
                            <h3>O projektu</h3>
                            <div>
                                Tento projekt byl vytvořen v rámci bakalářské práce na MFF UK v roce 2022.
                            </div>
                        </div>
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                        <div>
                            <h3>GitHub <GitHubIcon /></h3>
                            <div>
                                Projekt je verzovaný na GitHubu a hostovaný na GitHub Pages.
                            </div>
                            <Button href="https://github.com/bliakher/uredni_desky" variant="outline-primary" >Zobrazit repozitář</Button>
                        </div>
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                        <div>
                            <h3>Dokumentace</h3>
                            <div>
                                Uživatelská dokumentace
                            </div>
                            <Button href="https://bliakher.github.io/uredni_desky_docs/uzivatelska" variant="outline-primary" >Dokumentace</Button>

                        </div>
                    </Col>
                    <Col className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 d-flex p-2 m-2">
                        <div>
                            <h3>Něco nefunguje?</h3>
                            <div>
                                Našli jste v aplikaci něco, co nefunguje, nebo máte nápad, co by se dalo vylepšit? Dejte mi vědět vytvořením Issue na GitHubu.
                            </div>
                            <Button href="https://github.com/bliakher/uredni_desky/issues/new" variant="outline-primary" >Vytvořit issue</Button>

                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}
