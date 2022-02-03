import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BulletinData, Datasets } from './model/dataset';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import BulletinList from "./pages/List";
import Home from './pages/Home';
import NoPage from './pages/NoPage';

class App extends React.Component<{}, { bulletinData: Array<BulletinData> }> {
  datasets: Datasets;

  constructor(props: {}) {
    super(props)
    this.datasets = new Datasets();
    this.state = { bulletinData: [] }
  }
  async componentDidMount() {
    await this.datasets.fetchDatasets();
    var data = this.datasets.getDatasets();
    this.setState({ bulletinData: data });
  }
  render() {
    var datasets = this.state.bulletinData;
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <Layout /> }>
            <Route index element={ <Home /> } />
            <Route path="seznam" element={ <BulletinList data={datasets} /> } />
            <Route path="*" element={ <NoPage /> } />
          </Route>
        </Routes>
      </BrowserRouter>




      // <div className="App">
      //   <header className="App-header">
      //     <img src={logo} className="App-logo" alt="logo" />
      //     <p>
      //       Edit <code>src/App.tsx</code> and save to reload.
      //     </p>
      //     <a
      //       className="App-link"
      //       href="https://reactjs.org"
      //       target="_blank"
      //       rel="noopener noreferrer"
      //     >
      //       Learn React
      //     </a>
      //   </header>
      // </div>
    );
  }
}


export default App;
