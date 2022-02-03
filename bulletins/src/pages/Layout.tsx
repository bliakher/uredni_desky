import React from 'react';
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
    return (
        <>
            <nav>
                <span>
                    <div>
                        <Link to="/">Domů</Link>
                    </div>
                    <div>
                        <Link to="/seznam">Seznam</Link>
                    </div>
                    <div>
                        <Link to="/validace">Validace</Link>
                    </div>
                </span>
            </nav>
            <Outlet />
        </>
    );
}

export default Layout;