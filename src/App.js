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
import { fetchGetUserSettings } from './components/UserSettings/network';
import { fetchQueueList } from './components/QueueApp/network'
import { store } from './utils/redux'
import Login from './components/Login/Login';
import PlaybackApp from './components/PlaybackApp/PlaybackApp';
import { useEffect, useState } from "react";
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from "react-router-dom";
import { SERVICE_JUKEBOX_RADIO, SERVICE_AUDIUS } from './config/services';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'


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

      // 1B: Fetch user settings!
      responseJson = await fetchGetUserSettings();
      await store.dispatch({
        type: 'user/get-settings',
        userSettings: responseJson.data,
      });

      // 2: Load stream.
      responseJson = await fetchStreamGet();
      await store.dispatch(responseJson.redux);

      // 2.5: Mount the stream for playback
      const state = store.getState(),
            stream = state.stream,
            queueMap = state.queueMap,
            nowPlaying = queueMap[stream.nowPlayingUuid];
      await store.dispatch({
        type: "playback/mount",
        payload: { stream },
      });

      // 3: Load the track now playing (conditionally).
      const nowPlayingTrack = nowPlaying?.track;
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
      if(nowPlayingTrack?.service === SERVICE_AUDIUS) {
        await store.dispatch({
          "type": "playback/loadAudius",
          "payload": {
            "id": nowPlayingTrack.externalId,
            "trackUuid": nowPlayingTrack.uuid,
          }
        });
      }

      // 4: Load the queue.
      responseJson = await fetchQueueList();
      await store.dispatch(responseJson.redux);

      // IMPORTANT: need to reload stream from state to get cleaned stream.
      if(nowPlaying?.track?.uuid) {
        // 5: Load relevant comments.
        const textCommentsJsonResponse = await fetchTextCommentList(nowPlaying?.track?.uuid);
        await store.dispatch(textCommentsJsonResponse.redux);

        // 6: Load relevant voice recordings. This will also generate the feed.
        const voiceRecordingsJsonResponse = await fetchVoiceRecordingList(nowPlaying?.track?.uuid);
        await store.dispatch(voiceRecordingsJsonResponse.redux);
      }

      // Update status.
      setStatus('ready');
    }
    TimeAgo.addDefaultLocale(en);
    loadData();

    // Start PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('worker.js', {scope: '.'}).then(function(registration) {
        console.log('Worker registration successful', registration.scope);
      });
    }
    // End PWA

    // Prestyle side bar
    store.dispatch({
      type: "sideBar/selectTab",
      payload: { tab: window.location.pathname.substring(5) },
    });

    // Define behavior for when the webpage is closed.
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      const state = store.getState(),
            stream = state.stream,
            queueMap = state.queueMap,
            nowPlaying = queueMap[stream.nowPlayingUuid];
      if(nowPlaying.status !== "played") {
        return;
      }
      fetchPauseTrack();
    });
  }, []);

  window.addEventListener('playbackStateDidChange', (event) => {
    console.log('apple loaded!!');
  });

  // When the page is initially loaded, display nothing.
  if(status === 'initial') {
    return <></>;
  }

  // If the user is NOT authenticated, display the login portal.
  if(status === 'unauthenticated') {
    return (
      <Router>
        <Provider store={store}>
          <Login />
        </Provider>
      </Router>
    )
  }

  // if the user is not authenticated, only display the login portal
  if(status === 'authenticated') {
    return (
      <Router>
        <Provider store={store}>
          <div style={{textAlign: "center", lineHeight: "100vh"}}>
            Loading...
          </div>
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
