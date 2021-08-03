import { store } from '../../../utils/redux';


/*
 * Main user interface which pauses a track.
 */
export const pause = function(config = null) {
  // Clean the config
  if(!config) {
    config = {};
  }
  if(!config.fake) {
    config.fake = { api: false, playback: false };
  }

  // Prepare the action object
  const action = {
    name: "pause",
    status: "kickoff",
    fake: config.fake.api,
  }

  // Dispatch action
  store.dispatch({
    type: "main/addAction",
    payload: { action },
  });
}

/*
 * Main user interface which plays a track.
 */
export const play = function(config = null) {
  // Clean the config
  if(!config) {
    config = {};
  }
  if(!config.fake) {
    config.fake = { api: false, playback: false };
  }

  // Prepare the action object
  const action = {
    name: "play",
    status: "kickoff",
    fake: config.fake,
  }
  if(config.hasOwnProperty('progress')) {
    action.timestampMilliseconds = config.progress;
  }

  // Dispatch action
  store.dispatch({
    type: "main/addAction",
    payload: { action },
  });
}

/*
 * Main user interface which skips to the next track.
 */
export const next = function(config = null) {
  // Prepare the action object
  const action = {
    name: "next",
    status: "kickoff",
    fake: false,
    settings: {
      pause: config.pause,
      skip: false,
      play: true,
    },
  };

  // Dispatch action
  store.dispatch({
    type: "main/addAction",
    payload: { action },
  });
}

/*
 * Main user interface which goes back to the previous track
 */
export const prev = function(config = null) {
  // Dispatch action
  store.dispatch({
    type: "main/addAction",
    payload: {
      action: {
        name: "prev",
        status: "kickoff",
        fake: false,
      },
    },
  });
}
