import './App.css';
import Chat from './components/Chat/Chat'
import Login from './components/Login/Login'
import Queue from './components/Queue/Queue'
import Search from './components/Search/Search'
import Upload from './components/Upload/Upload'
import Player from './components/Player/Player'
import UserSettings from './components/UserSettings/UserSettings'
import { fetchTextComments, fetchVoiceRecordings } from './components/Chat/network'
import { fetchVerifyToken } from './components/Login/network'
import { fetchStream } from './components/Player/network'
import { fetchListQueues } from './components/Queue/network'
import { fetchGetUserSettings } from './components/UserSettings/network'
import { store } from './utils/redux'

import { useEffect, useState } from "react";
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


function App() {

  // keeps track of the status of the webpage
  //  - initial: when the page is first loaded
  //  - unauthenticated: the client does NOT have a valid access token
  //  - authenticated: the client has a valid access token
  //  - ready: all API data has been loaded
  const [status, setStatus] = useState('initial');

  // componentDidMount
  useEffect(() => {
    async function loadData() {

      // verify authentication
      const authResponse = await fetchVerifyToken();
        if (!authResponse) {
          setStatus('unauthenticated');
          return;
        }
        console.log(authResponse);

      // set state
      setStatus('authenticated');

      // load stream
      const streamJsonResponse = await fetchStream();
      const stream = streamJsonResponse.data;

      await store.dispatch({
        type: 'stream/set',
        stream: stream,
      });

      // load queue
      const queueJsonResponse = await fetchListQueues();
      const { nextUpQueues, lastUpQueues } = queueJsonResponse.data;

      await store.dispatch({
        type: 'queue/listSet',
        lastUpQueues: lastUpQueues,
        nextUpQueues: nextUpQueues,
      });

      // load comments
      const textCommentsJsonResponse = await fetchTextComments();
      await store.dispatch({
        type: 'textComment/listSet',
        textComments: textCommentsJsonResponse.data,
      });

      // load voice recordings
      const voiceRecordingsJsonResponse = await fetchVoiceRecordings();
      await store.dispatch({
        type: 'voiceRecording/listSet',
        voiceRecordings: voiceRecordingsJsonResponse.data,
      });

      // get user settings
      const userSettingsJsonResponse = await fetchGetUserSettings();
      await store.dispatch({
        type: 'user/get-settings',
        userSettings: userSettingsJsonResponse.data,
      });

      setStatus('ready');
    }
    loadData();
  }, []);

  // as the page is loading, display nothing
  if(status === 'initial') {
    return (
      <Router>
        <Provider store={store}>
          <></>
        </Provider>
      </Router>
    );
  }

  // if the user is not authenticated, only display the login portal
  if(status === 'unauthenticated') {
    return (
      <Router>
        <Provider store={store}>
          <div className="app-main-container">
            <div className="app-main">
              <Login />
            </div>
          </div>
        </Provider>
      </Router>
    )
  }

  // if the user is not authenticated, only display the login portal
  if(status === 'authenticated') {
    return (
      <Router>
        <Provider store={store}>
          Loading...
        </Provider>
      </Router>
    )
  }

  // display the main UI now that everything is loaded up
  return (
    <Router>
      <Provider store={store}>

        {/* nav bar */}
        <nav>
          <ul>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
            <li>
              <Link to="/chat">Chat</Link>
            </li>
            <li>
              <Link to="/player">Player</Link>
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
        <div className="app-main-container">
          <div className="app-main">
            <Switch>
              <Route path="/settings">
                <UserSettings />
              </Route>
              <Route path="/chat">
                <Chat />
              </Route>
              <Route path="/player">
                <Player />
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
        </div>

      </Provider>
    </Router>
  );
}

export default App;
