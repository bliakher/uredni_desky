import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BulletinData, Datasets, SortedBulletins } from './model/dataset';
import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import { BulletinList} from "./pages/List";
import Home from './pages/Home';
import { Map } from './pages/Map';
import NoPage from './pages/NoPage';
import { Validation, ValidationDetail } from './pages/Validation';
import { BulletinDetail } from './pages/Detail';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component {

  constructor(props: {}) {
    super(props)
  }

  render() {
    return (
      <>
        <HashRouter>
          <Layout/>
          <Routes>
              <Route index element={ <BulletinList /> } />
              <Route path="detail" element={ <BulletinDetail /> } />
              <Route path="mapa" element={ <Map /> } />
              <Route path="validace">
                <Route index element={ <Validation /> } />
                <Route path="detail" element={ <ValidationDetail /> }/>
              </Route>
              <Route path="about" element={ <Home /> } />
              <Route path="*" element={ <NoPage /> } />
          </Routes>
        </HashRouter>
      </>

    );
  }
}


export default App;
