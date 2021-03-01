import './App.css';
import {
  fetchTextCommentList,
  fetchVoiceRecordingList,
} from './components/FeedApp/network';
import { fetchVerifyToken } from './components/Login/network';
import {
  fetchStreamGet,
  fetchPauseTrack,
  fetchTrackGetFiles,
} from './components/PlaybackApp/Player/network';
import { fetchQueueList } from './components/QueueApp/network'
import { fetchGetUserSettings } from './components/UserSettings/network';
import { playbackControlPause } from './components/PlaybackApp/controls';
import { store } from './utils/redux'
import Login from './components/Login/Login';
import PlaybackApp from './components/PlaybackApp/PlaybackApp';
import { useEffect, useState } from "react";
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from "react-router-dom";
import { SERVICE_JUKEBOX_RADIO } from './config/services';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

const SpotifyWebApi = require('spotify-web-api-js');


function App() {

  // Keeps track of the status of the webpage
  //
  //    - initial:          When the page is first loaded
  //    - unauthenticated:  The client does NOT have a valid access token
  //    - authenticated:    The client has a valid access token
  //    - ready:            All API data has been loaded
  const [status, setStatus] = useState('initial');

  //////////////////////
  // componentDidMount
  useEffect(() => {
    async function loadData() {
      let responseJson;

      // 1: Verify authentication.
      const authResponse = await fetchVerifyToken();
      if (!authResponse) {
        setStatus('unauthenticated');
        return;
      }

      // Update status.
      setStatus('authenticated');

      // 2: Load stream.
      responseJson = await fetchStreamGet();
      await store.dispatch(responseJson.redux);

      // 3: Load the track now playing (conditionally).
      const payload = responseJson.redux.payload,
            nowPlayingTrack = payload.stream.nowPlaying?.track;
      if(nowPlayingTrack?.service === SERVICE_JUKEBOX_RADIO) {
        const trackUuid = nowPlayingTrack.uuid;
        responseJson = await fetchTrackGetFiles(trackUuid);
        await store.dispatch(responseJson.redux);
        // NOTE: the above only works in production setups. This is because of
        // how the file is served. the below setup can be adapted for a local
        // setup.
        //
        // var request = new XMLHttpRequest();
        // request.open("GET", responseJson.redux.payload.track.audioUrl, true);
        // request.responseType = "blob";
        // request.onload = () => {
        //   if(this.status !== 200) {
        //     return;
        //   }
        //   const audio = new Audio(URL.createObjectURL(this.response));
        //   responseJson.redux.payload.track.audio = audio;
        //   store.dispatch(responseJson.redux);
        // }
        // request.send();
      }

      // 4: Load the queue.
      responseJson = await fetchQueueList();
      await store.dispatch(responseJson.redux);

      // 5: Load relevant comments.
      const textCommentsJsonResponse = await fetchTextCommentList();
      await store.dispatch(textCommentsJsonResponse.redux);

      // 6: Load relevant voice recordings. This will also generate the feed.
      const voiceRecordingsJsonResponse = await fetchVoiceRecordingList();
      await store.dispatch(voiceRecordingsJsonResponse.redux);

      // 7: Get user settings.
      const userSettingsJsonResponse = await fetchGetUserSettings();
      await store.dispatch({
        type: 'user/get-settings',
        userSettings: userSettingsJsonResponse.data,
      });

      // 8: Initialize the Spotify player (conditionally).
      const spotifyAccessToken = userSettingsJsonResponse.data.spotify.accessToken;
      if(spotifyAccessToken) {
        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(userSettingsJsonResponse.data.spotify.accessToken);
        await store.dispatch({
          type: 'playback/spotify',
          payload: { spotifyApi: spotifyApi },
        });
      }

      // Enable playback controls.
      store.dispatch({ type: 'playback/enable' });

      // Update status.
      setStatus('ready');
    }
    TimeAgo.addDefaultLocale(en);
    loadData();

    // Define behavior for when the webpage is closed.
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      const state = store.getState();
      if(!state.stream.isPlaying) {
        return;
      }
      fetchPauseTrack();
      playbackControlPause(state.playback, state.stream);
    });
  }, []);

  // When the page is initially loaded, display nothing.
  if(status === 'initial') {
    return <></>;
  }

  // If the user is NOT authenticated, display the login portal.
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

  /*
   * 🎨
   */
  return (
    <Router>
      <Provider store={store}>
        <div className="app-main-container">
            <PlaybackApp />
        </div>
      </Provider>
    </Router>
  );
}


export default App;
