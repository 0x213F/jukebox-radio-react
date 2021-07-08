import { store } from '../../../utils/redux';
import { fetchNextTrack, fetchPrevTrack } from './network';


export const onpause = function() {
  const reduxState = store.getState();
  if(reduxState.playback.action !== "paused") {
    // console.log('Paused, Hmm?');
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
    // console.log('Played, Hmm?');
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
    // console.log('Seeked, Hmm?');
    return;
  }
  const action = null;
  store.dispatch({
    type: "playback/action",
    payload: { action },
  });
}

export const handleNext = async function() {
  const reduxState = store.getState();

  store.dispatch({ type: 'main/actionStart' });
  store.dispatch({ type: 'main/disable' });
  store.dispatch({ type: 'stream/nextTrack' });

  const main = reduxState.main,
        action = main.actions[0];

  store.dispatch({ type: "feedApp/resetTextComment" });

  if(action.settings.pause) {
    store.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "pause",
          status: "kickoff",
          fake: true,
        },
      },
    });
  }

  if(action.settings.skip) {
    store.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "skip",
          status: "kickoff",
          fake: false,
        },
      },
    });
  }

  store.dispatch({
    type: "main/addAction",
    payload: {
      action: {
        name: "mount",
        // stream: stream,
        status: "kickoff",
        fake: true,  // symbolic, not functional
      },
    },
  });

  store.dispatch({
    type: "main/addAction",
    payload: {
      action: {
        name: "play",
        status: "kickoff",
        fake: { api: true, playback: !action.settings.play },
      },
    },
  });

  await fetchNextTrack(false);
  store.dispatch({ type: 'main/actionShift' });
}

export const handlePrev = async function() {
  store.dispatch({ type: 'main/actionStart' });
  store.dispatch({ type: 'main/disable' });
  store.dispatch({ type: 'stream/prevTrack' });

  store.dispatch({ type: "feedApp/resetTextComment" });

  store.dispatch({
    type: "main/addAction",
    payload: {
      action: {
        name: "pause",
        status: "kickoff",
        fake: true,
      },
    },
  });
  store.dispatch({
    type: "main/addAction",
    payload: {
      action: {
        name: "mount",
        // stream: stream,
        status: "kickoff",
        fake: true,  // symbolic, not functional
      },
    },
  });
  store.dispatch({
    type: "main/addAction",
    payload: {
      action: {
        name: "play",
        status: "kickoff",
        fake: { api: true },
      },
    },
  });

  await fetchPrevTrack(false);
  store.dispatch({ type: 'main/actionShift' });
}
