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
import {
  fetchStreamGet,
  fetchNextTrack,
  fetchPrevTrack,
  fetchScanBackward,
  fetchScanForward,
  fetchPauseTrack,
  fetchPlayTrack,
} from './components/Player/network';
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

  // eslint-disable-next-line
  const [nextTrackTimeoutId, setNextTrackTimeoutId] = useState(undefined);
  // eslint-disable-next-line
  const [resetNextTrackTimeoutId, setResetNextTrackTimeoutId] = useState(undefined);

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
    const state = store.getState();

    setPlayerIsPlaying(true);

    const progress = Date.now() - state.stream.startedAt;

    state.spotifyApi.play({
      uris: [state.stream.nowPlaying.track.externalId],
      position_ms: progress,
    });

    setShouldScheduleNextTrack(true);
  }

  const nextTrack = async function(forced = false) {
    const state = store.getState();
    const responseJsonNextTrack = await fetchNextTrack();
    if(forced) {
      await store.dispatch(responseJsonNextTrack.redux);
      await setNextTrackReduxJson({});
      await setPlayerIsPlaying(false);
      return;
    }
    setNextTrackReduxJson(responseJsonNextTrack.redux);
    setShouldScheduleReset(true);
    addToQueue(state);
  }

  const prevTrack = async function() {
    const responseJsonPrevTrack = await fetchPrevTrack();
    await store.dispatch(responseJsonPrevTrack.redux);
    await setNextTrackReduxJson({});
    await setPlayerIsPlaying(false);
    return;
  }

  const seek = async function(direction) {
    const state = store.getState();
    let startedAt;
    const stream = state.stream;
    if(direction === 'forward') {
      const response = await fetchScanForward();

      if(response.system.status === 400) {
        return;
      }

      startedAt = stream.startedAt - (10000);
    } else if(direction === 'backward') {
      await fetchScanBackward();

      const date = new Date(),
            epochNow = date.getTime();

      const proposedStartedAt = stream.startedAt + 10000,
            proposedProgress = epochNow - proposedStartedAt;

      startedAt = proposedProgress > 0 ? proposedStartedAt : epochNow;
    }

    await store.dispatch({
      type: 'stream/set',
      payload: {stream: { ...stream, startedAt: startedAt }},
    });

    const progress = Date.now() - startedAt;
    state.spotifyApi.seek(progress);

    setNextTrackTimeoutId(prev => {
      clearTimeout(prev);
      return undefined;
    });

    setResetNextTrackTimeoutId(prev => {
      clearTimeout(prev);
      return undefined;
    });

    setShouldScheduleNextTrack(true);
  }

  const pause = async function() {
    const state = store.getState();
    const jsonResponse = await fetchPauseTrack();
    store.dispatch(jsonResponse.redux);

    // NOTE: this is not called because it would "start" the song again
    // setPlayerIsPlaying(false);

    setNextTrackTimeoutId(prev => {
      clearTimeout(prev);
      return undefined;
    });

    setResetNextTrackTimeoutId(prev => {
      clearTimeout(prev);
      return undefined;
    });

    state.spotifyApi.pause();
  }

  const play = async function() {
    const state = store.getState();
    const jsonResponse = await fetchPlayTrack();
    await store.dispatch(jsonResponse.redux);

    if(!playerIsPlaying) {
      // TODO this case isn't working needs refactor
      return;
    }

    state.spotifyApi.play();
    // NOTE: this is not called because it would "start" the song again
    // setPlayerIsPlaying(true);
    setShouldScheduleNextTrack(true);
  }

  const resetNextTrack = async function() {
    await store.dispatch(nextTrackReduxJson);
    await setNextTrackReduxJson({});
    await setShouldScheduleNextTrack(true);
  }

  const addToQueue = function() {
    const state = store.getState();
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
    const state = store.getState();

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
    const timeoutId = setTimeout(() => {
      nextTrack();
    }, timeout);

    setNextTrackTimeoutId(timeoutId);

  // eslint-disable-next-line
  }, [shouldScheduleNextTrack]);

  // Will schedule a task to reset the cycle at the end of the currently
  // playing track.
  useEffect(() => {
    const state = store.getState();
    if(!shouldScheduleReset) {
      return;
    }
    setShouldScheduleReset(false);
    const nowPlayingDuration = state.stream.nowPlaying.totalDurationMilliseconds,
          progress = Date.now() - state.stream.startedAt,
          timeout = nowPlayingDuration - progress;

    const timeoutId = setTimeout(() => {
      resetNextTrack();
    }, timeout);

    setResetNextTrackTimeoutId(timeoutId);

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

  // Play the music.
  const state = store.getState();
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
                <Player nextTrack={nextTrack}
                        prevTrack={prevTrack}
                        seek={seek}
                        pause={pause}
                        play={play} />
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
