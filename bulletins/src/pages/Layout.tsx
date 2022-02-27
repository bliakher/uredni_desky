import React from 'react';
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
    return (
        <>
            <nav>
                    <div>
                        <Link to="">Domů</Link>
                    </div>
                    <div>
                        <Link to="seznam">Seznam</Link>
                    </div>
                    <div>
                        <Link to="validace">Validace</Link>
                    </div>
            </nav>
            <Outlet />
        </>
    );
}

export default Layout;