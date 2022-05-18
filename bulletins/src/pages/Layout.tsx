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
                        <Nav.Link href="#/mapa">Mapa</Nav.Link>
                        <Nav.Link href="#/validace">Validace</Nav.Link>
                        <Nav.Link href="#/about">O projektu</Nav.Link>
                    </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

        </>
    );
}

export default Layout;