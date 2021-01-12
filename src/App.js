import './App.css';
import Chat from './components/Chat/Chat'
import Login from './components/Login/Login'
import Queue from './components/Queue/Queue'
import Search from './components/Search/Search'
import Upload from './components/Upload/Upload'
import Player from './components/Player/Player'
import { fetchTextComments, fetchVoiceRecordings } from './components/Chat/network'
import { fetchVerifyToken } from './components/Login/network'
import { fetchStream } from './components/Player/network'
import { fetchListQueues } from './components/Queue/network'
import { store } from './utils/redux'

import { useEffect } from "react";
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


function App() {

  // componentDidMount
  useEffect(() => {
    async function loadData() {

      // verify authentication
      const authResponse = await fetchVerifyToken();
      console.log(authResponse);

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
    }
    loadData();
  }, []);

  return (
    <Router>
      <Provider store={store}>

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
              <Route path="/login">
                <Login />
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
