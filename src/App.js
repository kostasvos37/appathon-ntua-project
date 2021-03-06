import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Header from './Header';
import Location from './Location';
import Main from './SearchView';
import Home from './Home';
import Results from './Results' 
import { UserProvider } from './UserContext';
import './App.css'

class App extends Component {

  render() {
    return (
        <React.Fragment>
          <UserProvider value={this.state}>
            <Router>
            
                <Route render = {({location}) => (
                  <React.Fragment>
                  <Header />
                      <Switch location = {location}>
            
                        <Route path="/main" component ={Main} />
                        <Route path="/result" component ={Results} />
                        <Route path="/location" component = {Location}/>
                        <Route exact path="/" component={Home} />
                      </Switch>
                    
                </React.Fragment>
                )} />
            </Router>
          </UserProvider>
        </React.Fragment>
    );
  }
}

export default App;
