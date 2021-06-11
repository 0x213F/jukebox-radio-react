import { store } from '../../utils/redux';


export const onpause = function() {
  const reduxState = store.getState();
  if(reduxState.playback.action !== "paused") {
    console.log('Paused, Hmm?');
    return;
  }
  const action = null;
  store.dispatch({
    type: "playback/action",
    payload: { action },
  });
}

export const onplay = function() {
  const reduxState = store.getState();
  if(reduxState.playback.action !== "played") {
    console.log('Played, Hmm?');
    return;
  }
  const action = null;
  store.dispatch({
    type: "playback/action",
    payload: { action },
  });
}

export const onseeked = function() {
  const reduxState = store.getState();

  // TODO: should be "seeked"
  if(reduxState.playback.action !== "played") {
    console.log('Seeked, Hmm?');
    return;
  }
  const action = null;
  store.dispatch({
    type: "playback/action",
    payload: { action },
  });
}
