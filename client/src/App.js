import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import './styles/bootstrap.min.css'
import Home from './components/Home';
import VacationList from './components/VacationsList';
import VacationListManagment from './components/VacationsListManagement';

const App = () => {
  const [authorization, setAuthorization] = useState({isAuth: false, username: 'none'});

  useEffect(() => {
      fetch('/api/authorization', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
          if(data.success){
            setAuthorization({isAuth: true, username: data.username});
          }
        })
  }, [])

  const changeAuthorization = (value) =>{
    setAuthorization(value);
  }
  
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/">
            <Home/>
          </Route>
          <Route exact path="/vacations">
            <VacationList/>
          </Route>
          <Route path="/vacations/managment">
            <VacationListManagment/>
          </Route>
        </Switch>
      </div>
    </Router>
    
  );
}

export default App;
