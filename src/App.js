import './App.css';
import {
  fetchTextCommentList,
  fetchVoiceRecordingList,
} from './components/Chat/network';
import { fetchVerifyToken } from './components/Login/network'
import { fetchStreamGet } from './components/Player/network';
import { fetchQueueList } from './components/Queue/network'
import { fetchGetUserSettings } from './components/UserSettings/network'
import { store } from './utils/redux'
import Login from './components/Login/Login';
import PlaybackWrapper from './components/PlaybackWrapper/PlaybackWrapper';
import { useEffect, useState } from "react";
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Link
} from "react-router-dom";

const SpotifyWebApi = require('spotify-web-api-js');


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
      let responseJson;

      // verify authentication
      const authResponse = await fetchVerifyToken();
        if (!authResponse) {
          setStatus('unauthenticated');
          return;
        }

      // set state
      setStatus('authenticated');

      // load stream
      responseJson = await fetchStreamGet();
      await store.dispatch(responseJson.redux);

      // load queue
      responseJson = await fetchQueueList();
      await store.dispatch(responseJson.redux);

      // load comments
      const textCommentsJsonResponse = await fetchTextCommentList();
      await store.dispatch(textCommentsJsonResponse.redux);

      // load voice recordings
      const voiceRecordingsJsonResponse = await fetchVoiceRecordingList();
      await store.dispatch(voiceRecordingsJsonResponse.redux);

      // get user settings
      const userSettingsJsonResponse = await fetchGetUserSettings();
      await store.dispatch({
        type: 'user/get-settings',
        userSettings: userSettingsJsonResponse.data,
      });

      // initialize Spotify player
      const spotifyApi = new SpotifyWebApi();
      spotifyApi.setAccessToken(userSettingsJsonResponse.data.spotify.accessToken);
      await store.dispatch({
        type: 'playback/spotify',
        payload: { spotifyApi: spotifyApi },
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
            <PlaybackWrapper />
          </div>
        </div>

      </Provider>
    </Router>
  );
}

export default App;
