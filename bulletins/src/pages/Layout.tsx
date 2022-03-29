import React from 'react';
import { Outlet, Link } from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar';
import { Container, Nav } from 'react-bootstrap';
import logo from '../logo.png'

const Layout = () => {
    return (
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                <Navbar.Brand href="#/">
                    <img alt="logo" src={logo} width="30" height="30" className="d-inline-block align-top" />{' '}
                    Úřední desky
                </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#/">Seznam</Nav.Link>
                        <Nav.Link href="#/validace">Validace</Nav.Link>
                        <Nav.Link href="#/about">O projektu</Nav.Link>
                        {/* <Link to="">Domů</Link>
                        <Link to="seznam">Seznam</Link>
                        <Link to="validace">Validace</Link> */}
                    </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            {/* <nav>
                    <div>
                        <Link to="">Domů</Link>
                    </div>
                    <div>
                        <Link to="seznam">Seznam</Link>
                    </div>
                    <div>
                        <Link to="validace">Validace</Link>
                    </div>
            </nav> */}
        </>
    );
}

export default Layout;