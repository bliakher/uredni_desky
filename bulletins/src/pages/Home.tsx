import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { FaGithub as GitHubIcon } from 'react-icons/fa';

class Home extends React.Component<{}, {}> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            // <div>Vizualizace dat z úředních desek</div>
            <Container>
                    <div>
                        <h3>O projektu</h3>
                        <div>
                            Tento projekt byl vytvořen v rámci bakalářské práce na MFF UK v roce 2022.
                        </div>
                    </div>
                    <div>
                        <h3>GitHub <GitHubIcon /></h3>
                        <div>
                            Projekt je verzovaný na GitHubu a hostovaný na GitHub Pages.
                        </div>
                        <Button href="https://github.com/bliakher/uredni_desky" variant="outline-primary" >Zobrazit repozitář</Button>
                    </div>
                    <div>
                        <h3>Dokumentace</h3>
                        <div>
                            Uživatelská dokumentace
                        </div>
                        <Button href="" variant="outline-primary" >Dokumentace</Button>
                    </div>
                    <div>
                        <h3>Něco nefunguje?</h3>
                        <div>
                            Našli jste v aplikaci něco, co nefunguje, nebo máte nápad, co by se dalo vylepšit? Dejte mi vědět vytvořením Issue na GitHubu.
                        </div>
                        <Button href="https://github.com/bliakher/uredni_desky/issues/new" variant="outline-primary" >Vytvořit issue</Button>
                    </div>
                    
            </Container>
        );
    }
}

export default Home;