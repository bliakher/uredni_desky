import React from 'react';
import logo from './logo.svg';
import './App.css';
import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import { BulletinList } from "./pages/List";
import Home from './pages/Home';
import { Map } from './pages/Map';
import NoPage from './pages/NoPage';
import { Validation } from './pages/validation/Validation';
import { ValidationDetail } from './pages/validation/ValidationDetail';
import { BulletinDetail } from './pages/Detail';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Statistics } from './pages/statistics/Statistics';

class App extends React.Component {

  constructor(props: {}) {
    super(props)
  }

  render() {
    return (
      <>
        <HashRouter>
          <Layout />
          <Routes>
            <Route index element={<BulletinList />} />
            <Route path="detail" element={<BulletinDetail />} />
            <Route path="mapa" element={<Map />} />
            <Route path="validace">
              <Route index element={<Validation />} />
              <Route path="detail" element={<ValidationDetail />} />
            </Route>
            <Route path="statistiky" element={<Statistics />} />
            <Route path="about" element={<Home />} />
            <Route path="*" element={<NoPage />} />
          </Routes>
        </HashRouter>
      </>

    );
  }
}


export default App;
