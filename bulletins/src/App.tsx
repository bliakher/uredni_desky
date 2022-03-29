import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BulletinData, Datasets, SortedBulletins } from './model/dataset';
import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import { BulletinList, ProviderCategories } from "./pages/List";
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import { Validation, ValidationDetail } from './pages/Validation';
import { BulletinDetail } from './pages/Detail';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component<{}, {data: SortedBulletins, selectedProvider: ProviderCategories}> {
  datasets: Datasets;

  constructor(props: {}) {
    super(props)
    this.datasets = new Datasets();
    this.setSelectedProviderType = this.setSelectedProviderType.bind(this);
    this.state = {data: this.datasets.dataCategories, selectedProvider: ProviderCategories.All}
  }
  async componentDidMount() {
    await this.datasets.fetchDatasets();
    this.setState({ data: this.datasets.dataCategories });

    await this.datasets.sortBulletinsByProviderType();
    this.setState({ data: this.datasets.dataCategories});
  }
  setSelectedProviderType(newProviderType: ProviderCategories) {
    this.setState({selectedProvider: newProviderType});
  }
  render() {
    var datasets = this.state.data;
    return (
      <>
        <HashRouter>
          <Layout/>
          <Routes>
              <Route index element={ <BulletinList data={datasets} selected={this.state.selectedProvider} setSelected={this.setSelectedProviderType} /> } />
              <Route path="detail" element={ <BulletinDetail /> } />
              <Route path="validace">
                <Route index element={ <Validation data={datasets.all} /> } />
                <Route path="detail" element={ <ValidationDetail /> }/>
              </Route>
              <Route path="about" element={ <Home /> } />
              <Route path="*" element={ <NoPage /> } />
          </Routes>
        </HashRouter>
      </>

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
