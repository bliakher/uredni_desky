import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BulletinData, Datasets, SortedBulletins } from './model/dataset';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import { BulletinList } from "./pages/List";
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import { Validation, ValidationDetail } from './pages/Validation';
import { BulletinDetail } from './pages/Detail';

class App extends React.Component<{}, {data: SortedBulletins, distributionLoaded: boolean}> {
  datasets: Datasets;

  constructor(props: {}) {
    super(props)
    this.datasets = new Datasets();
    this.state = {data: this.datasets.dataCategories, distributionLoaded: false}
  }
  async componentDidMount() {
    await this.datasets.fetchDatasets();
    // var data = this.datasets.getDatasets();
    this.setState({ data: this.datasets.dataCategories });

    // await this.datasets.fetchAllDistibutions();
    // await this.datasets.sortBulletinsByProviderType();
    // // var data = this.datasets.getDatasets();
    // this.setState({ data: this.datasets.dataCategories, distributionLoaded: true });
  }
  render() {
    var datasets = this.state.data;
    return (
      <BrowserRouter>
        <Routes>
          <Route path="uredni_desky" element={ <Layout /> }>
            <Route index element={ <Home /> } />
            <Route path="seznam" >
              <Route index element={ <BulletinList data={datasets} /> } />
              <Route path="detail" element={ <BulletinDetail /> } />
            </Route>
            <Route path="validace">
              <Route index element={ <Validation data={datasets.all} /> } />
              <Route path="detail" element={ <ValidationDetail /> }/>
            </Route>
            <Route path="*" element={ <NoPage /> } />
          </Route>
        </Routes>
      </BrowserRouter>

      // <BrowserRouter>
      // <Routes>
      //   <Route path="/" element={ <Layout /> }>
      //     <Route index element={ <Home /> } />
      //     <Route path="seznam" element={ <BulletinList data={datasets} /> } />
      //     <Route path="validace" element={ <Validation data={datasets.all} /> } />
      //     <Route path="*" element={ <NoPage /> } />
      //   </Route>
      // </Routes>
      // </BrowserRouter>

    );
  }
}


export default App;
