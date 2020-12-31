import './App.css';
import Chat from './components/Chat/Chat'
import Login from './components/Login/Login'
import Queue from './components/Queue/Queue'
import Search from './components/Search/Search'
import Upload from './components/Upload/Upload'
import NowPlaying from './components/NowPlaying/NowPlaying'

import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">

        {/* nav bar */}
        <nav>
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/chat">Chat</Link>
            </li>
            <li>
              <Link to="/nowplaying">Now playing</Link>
            </li>
            <li>
              <Link to="/queue">Queue</Link>
            </li>
            <li>
              <Link to="/search">Search</Link>
            </li>
            <li>
              <Link to="/upload">Upload</Link>
            </li>
          </ul>
        </nav>

        {/* main section */}
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/chat">
            <Chat />
          </Route>
          <Route path="/nowplaying">
            <NowPlaying />
          </Route>
          <Route path="/queue">
            <Queue />
          </Route>
          <Route path="/search">
            <Search />
          </Route>
          <Route path="/upload">
            <Upload />
          </Route>
        </Switch>

      </div>
    </Router>
  );
}

export default App;
