import './App.css';
import Chat from './components/Chat/Chat'
import Login from './components/Login/Login'
import Queue from './components/Queue/Queue'
import Search from './components/Search/Search'
import Upload from './components/Upload/Upload'
import Player from './components/Player/Player'
import UserSettings from './components/UserSettings/UserSettings'
import {
  fetchTextCommentList,
  fetchVoiceRecordingList,
} from './components/Chat/network';
import { fetchVerifyToken } from './components/Login/network'
import { fetchStreamGet, fetchNextTrack } from './components/Player/network';
import { fetchQueueList } from './components/Queue/network'
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

const SpotifyWebApi = require('spotify-web-api-js');


function App() {

  const state = store.getState();

  // keeps track of the status of the webpage
  //  - initial: when the page is first loaded
  //  - unauthenticated: the client does NOT have a valid access token
  //  - authenticated: the client has a valid access token
  //  - ready: all API data has been loaded
  const [status, setStatus] = useState('initial');

  const [playerIsPlaying, setPlayerIsPlaying] = useState(false);
  const [shouldScheduleNextTrack, setShouldScheduleNextTrack] = useState(false);
  const [shouldScheduleReset, setShouldScheduleReset] = useState(false);

  const [nextTrackReduxJson, setNextTrackReduxJson] = useState({});

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
        type: 'player/spotify',
        payload: { spotifyApi: spotifyApi },
      });

      setStatus('ready');
    }
    loadData();
  }, []);

  const start = function() {
    setPlayerIsPlaying(true);

    const progress = Date.now() - state.stream.startedAt;

    state.spotifyApi.play({
      uris: [state.stream.nowPlaying.track.externalId],
      position_ms: progress,
    });

    setShouldScheduleNextTrack(true);
  }

  const nextTrack = async function() {
    const responseJsonNextTrack = await fetchNextTrack();
    setNextTrackReduxJson(responseJsonNextTrack.redux);
    setShouldScheduleReset(true);
    addToQueue(state);
  }

  const resetNextTrack = async function() {
    await store.dispatch(nextTrackReduxJson);
    await setNextTrackReduxJson({});
    await setShouldScheduleNextTrack(true);
  }

  const addToQueue = function() {
    const nextUpQueues = state.nextUpQueues,
          nextUp = (
            nextUpQueues.length ?
              (nextUpQueues[0].children.length ?
                nextUpQueues[0].children[0] :
                nextUpQueues[0]) :
              undefined
          );

    state.spotifyApi.queue(nextUp.track.externalId);
  }

  // Will schedule task to queue up the next track near the end of the
  // currently playing track.
  useEffect(() => {

    // check
    if(!shouldScheduleNextTrack) {
      return;
    }
    setShouldScheduleNextTrack(false);

    // calculations
    const nowPlayingDuration = state.stream.nowPlaying.totalDurationMilliseconds,
          progress = Date.now() - state.stream.startedAt,
          timeout = nowPlayingDuration - progress - 5000;

    // schedule
    setTimeout(() => {
      nextTrack();
    }, timeout);
  // eslint-disable-next-line
  }, [shouldScheduleNextTrack]);

  // Will schedule a task to reset the cycle at the end of the currently
  // playing track.
  useEffect(() => {
    if(!shouldScheduleReset) {
      return;
    }
    setShouldScheduleReset(false);
    const nowPlayingDuration = state.stream.nowPlaying.totalDurationMilliseconds,
          progress = Date.now() - state.stream.startedAt,
          timeout = nowPlayingDuration - progress;

    setTimeout(() => {
      resetNextTrack();
    }, timeout);
  // eslint-disable-next-line
  }, [shouldScheduleReset]);

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

  // TODO: play the music!
  if(state.stream.isPlaying && !playerIsPlaying) {
    start();
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
