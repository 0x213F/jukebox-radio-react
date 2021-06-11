import { useEffect, useState } from "react";

import { connect } from 'react-redux';
import YouTube from 'react-youtube';

import MainApp from '../MainApp/MainApp';
import { fetchGetUserSettings } from '../UserSettings/network';
import {
  SERVICE_YOUTUBE,
} from '../../config/services';
import { appendScript } from '../../utils/async';
import { store } from '../../utils/redux';

import {
  playbackControlStart,
  playbackControlSeek,
  playbackControlPause,
} from './controls';
import { getPositionMilliseconds, updateSpotifyPlayer } from './utils';
import styles from './PlaybackApp.module.css';


const SpotifyWebApi = require('spotify-web-api-js');


function PlaybackApp(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        playback = props.playback,
        userSettings = props.userSettings,
        feedApp = props.feedApp,
        sideBar = props.sideBar;

  const queueMap = props.queueMap,
        nowPlaying = queueMap[playback.nowPlayingUuid];

  // Convenience values to help clarify setting up playback SDKs.
  const [appleMusicSDKReady, setAppleMusicSDKReady] = useState(false);
  const [spotifySDKReady, setSpotifySDKReady] = useState(false);
  const [spotifySDKDeviceID, setSpotifySDKDeviceID] = useState(undefined);

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// PLAYBACK INTERFACE

  /*
   * Seek to the expected position in the track. This may be called in 2 cases:
   *   1: a user prompts a manual seek event.
   *   2: a seekTimeout event is triggered, meaning the now playing track must
   *      seek to the new expected track progress (in the case of a muted
   *      interval).
   */
  const seek = async function(timestampMilliseconds = undefined) {
    if(!nowPlaying) {
      // A queue must be mounted to the playback engine.
      return false;
    }
    if(!playback.isPlaying) {
      // That something in must also currently be playing.
      return false;
    }
    if(playback.action) {
      // No other action can be in progress, like playing a new track.
      return false;
    }

    // Valid conditions, so we seek.
    const action = 'played';
    props.dispatch({
      type: 'playback/action',
      payload: { action },
    });

    // Clear scheduled "seek"
    props.dispatch({ type: 'playback/clearSeekTimeoutId' });

    const startedAt = (
      timestampMilliseconds === undefined ?
      nowPlaying.startedAt : Date.now() - timestampMilliseconds
    );
    nowPlaying.startedAt = startedAt;
    playbackControlSeek(playback, nowPlaying, startedAt);

    // We need to update the queue object as well.
    props.dispatch({
      type: 'queue/update',
      payload: {
        queues: [
          {
            ...nowPlaying,
            startedAt,
            statusAt: Date.now(),
            status: "played",
          }
        ]
      },
    });

    // Let the caller know that seek was initiated.
    return true;
  }

  /*
   * Toggling the player from "playing" to "paused."
   */
  const pause = async function() {
    if(!nowPlaying) {
      // A queue must be mounted to the playback engine.
      return false;
    }
    if(!playback.isPlaying) {
      // That something in must also currently be playing.
      return false;
    }
    if(playback.action) {
      // No other action can be in progress, like playing a new track.
      return false;
    }

    // Valid conditions, so we pause.
    const action = 'paused';
    props.dispatch({
      type: 'playback/action',
      payload: { action },
    });

    // Clear scheduled "seek"
    props.dispatch({ type: 'playback/clearSeekTimeoutId' });

    playbackControlPause(playback, nowPlaying);

    // We need to update the queue object as well.
    props.dispatch({
      type: 'queue/update',
      payload: {
        queues: [
          {
            ...nowPlaying,
            statusAt: Date.now(),
            status: "paused",
          }
        ]
      },
    });

    // Let the caller know that pause was initiated.
    return true;
  }

  /*
   * Toggling the player from the "paused" to "playing" state.
   */
  const play = async function(timestampMilliseconds = undefined) {
    if(!nowPlaying) {
      // A queue must be mounted to the playback engine.
      return false;
    }
    if(playback.isPlaying) {
      // That something must also not be currently playing.
      return false;
    }
    if(playback.action) {
      // No other action can be in progress, like playing a new track.
      return false;
    }

    // Valid conditions, so we play.
    const action = 'played';
    props.dispatch({
      type: 'playback/action',
      payload: { action },
    });

    const now = Date.now(),
          startedAt = (
            timestampMilliseconds ?
            now - timestampMilliseconds : now
          );
    nowPlaying.status = 'played';
    nowPlaying.statusAt = now;
    nowPlaying.startedAt = startedAt;

    playbackControlStart(playback, nowPlaying);

    // We need to update the queue object as well.
    props.dispatch({
      type: 'queue/update',
      payload: {
        queues: [
          {
            ...nowPlaying,
            startedAt,
            statusAt: now,
            status: "played",
          }
        ]
      },
    });

    return true;
  }

  /*
   * Passed down to child components so they can have a handle on playback.
   */
  const playbackControls = { seek, pause, play };

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// PLAYBACK ENGINE
  useEffect(() => {

    // debouncer
    const needsToScheduleAddToQueue = (
      nowPlaying?.status === "played" &&
      playback.isPlaying &&
      !playback.seekTimeoutId
    );
    if(!needsToScheduleAddToQueue) {
      return;
    }

    // Schedule task that modifies playback due to configured intervals.
    const arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt),
          seekTimeoutDuration = arr[1];
    if(seekTimeoutDuration) {
      const timeoutId = setTimeout(function() {
        const action = {
          name: "seek",
          status: "kickoff",
          fake: true,
        };
        props.dispatch({
          type: "main/addAction",
          payload: { action },
        });
      }, seekTimeoutDuration);
      props.dispatch({
        type: 'playback/setSeekTimeoutId',
        payload: { timeoutId },
      });
    }

  // eslint-disable-next-line
  }, [playback]);


  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// LOAD SDKs
  useEffect(() => {
    appendSpotifySDK();
    appendAppleMusicSDK();
  }, []);

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// SPOTIFY

  /*
   * Loads the Spotify SDK.
   */
  const appendSpotifySDK = function() {
    window.onSpotifyWebPlaybackSDKReady = () => {
      setSpotifySDKReady(true);
    };
    appendScript("https://sdk.scdn.co/spotify-player.js");
  };

  /*
   * Spotify SDK script has been loaded. Now initialize the SDK.
   */
  useEffect(() => {
    if(!spotifySDKReady) {
      return;
    }

    // Define the Spotify Web SDK.
    const player = new window.Spotify.Player({
      name: 'Jukebox Radio',
      getOAuthToken: (cb) => {
        fetchGetUserSettings()
          .then(responseJson => {
            const spotifyAccessToken = responseJson.data.spotify.accessToken;
            if(spotifyAccessToken) {
              // Spotify's SDK automatically refreshes the access token
              // periodically so it always has a valid token.
              cb(spotifyAccessToken);
              // The SpotifyWebApi interface must be updated as well.
              const spotifyApi = new SpotifyWebApi();
              spotifyApi.setAccessToken(responseJson.data.spotify.accessToken);
              props.dispatch({
                type: 'playback/spotify',
                payload: { spotifyApi: spotifyApi },
              });
            }
          });
      }
    });

    // Once player is ready, tranfer playback to Spotify Web SDK.
    player.addListener('ready', ({ device_id }) => {
      setSpotifySDKDeviceID(device_id);
    });

    // TODO: Listen to Spotify events.
    player.addListener('player_state_changed', (state) => {
      if(!state) {
        return;
      }
      // console.log(`Time delta: ${Date.now() - state.timestamp}`)
      // console.log(state)
      const reduxState = store.getState(),
            reduxPlayback = reduxState.playback;
      if(!reduxPlayback.loaded.spotify) {
        props.dispatch({
          type: "playback/loaded",
          payload: { service: "spotify" },
        });
      }

      // let shouldCheckPosition = !state.paused;

      // Release lock!
      // console.log("action (in spotify event listner)", reduxState.playback.action)
      if(reduxState.playback.action === "paused" && state.paused) {
        // shouldCheckPosition = true;
        const action = null;
        props.dispatch({
          type: "playback/action",
          payload: { action },
        });
      } else if(reduxState.playback.action === "played" && !state.paused) {
        // shouldCheckPosition = true;
        const action = null;
        props.dispatch({
          type: "playback/action",
          payload: { action },
        });
      } else if(reduxState.playback.action === "seek") {
        const action = null;
        props.dispatch({
          type: "playback/action",
          payload: { action },
        });
      }

      // Release lock after seek as successfully taken place.
      // TODO: the following!
      // if(shouldCheckPosition) {
      //   const delay = Date.now() - state.timestamp,
      //         reduxNowPlaying = reduxState.queueMap[reduxState.playback.nowPlayingUuid],
      //         arr = getPositionMilliseconds(reduxNowPlaying, reduxNowPlaying.startedAt),
      //         enginePosition = arr[0],
      //         spotifyPosition = state.position + delay,
      //         delta = enginePosition - spotifyPosition;
      //   console.log(enginePosition, spotifyPosition, enginePosition - spotifyPosition, (delta > 5 || delta < -5));
      //
      //   if(delta > 5 || delta < -5) {
      //     const startedAt = nowPlaying.startedAt - delta;
      //     props.dispatch({
      //       type: 'queue/update',
      //       payload: { queues: [{ ...nowPlaying, startedAt }] },
      //     });
      //   }
      // }
    });

    // Kick off initialization.
    player.connect();

  // eslint-disable-next-line
  }, [spotifySDKReady]);

  useEffect(() => {
    if(!spotifySDKDeviceID) {
      return;
    }
    updateSpotifyPlayer(playback, spotifySDKDeviceID);
    props.dispatch({ type: 'playback/enable' });
  // eslint-disable-next-line
  }, [spotifySDKDeviceID])

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// APPLE MUSIC

  const appendAppleMusicSDK = function() {
    appendScript("https://js-cdn.music.apple.com/musickit/v1/musickit.js")
      .then(() => {
        setAppleMusicSDKReady(true);
      });
  };

  useEffect(() => {
    if(!appleMusicSDKReady) {
      return;
    }

    window.addEventListener('musickitloaded', () => {
      props.dispatch({
        type: "playback/loaded",
        payload: { service: "appleMusic" },
      });
    })

    // Define the Apple Music Web SDK.
    const player = window.MusicKit.configure({
      developerToken: userSettings.appleMusic.token,
      app: {
        name: 'Jukebox Radio',
        build: '0.0.1',
      },
    });

    // TODO: Listen to Apple Music events.
    player.addEventListener("playbackStateDidChange", (e) => {
      const reduxState = store.getState(),
            playbackStates = window.MusicKit.PlaybackStates;

      const didPlay = (
        (
          (playbackStates[e.oldState] === "seeking" && playbackStates[e.state] === "playing") ||
          (playbackStates[e.oldState] === "waiting" && playbackStates[e.state] === "playing")
        ) &&
        reduxState.playback.action === "played"
      )
      if(didPlay) {
        const action = null;
        props.dispatch({
          type: "playback/action",
          payload: { action },
        });
      }

      const didPause = (
        playbackStates[e.oldState] === "playing" &&
        playbackStates[e.state] === "paused" &&
        reduxState.playback.action === "paused"
      )
      if(didPause) {
        const action = null;
        props.dispatch({
          type: "playback/action",
          payload: { action },
        });
      }
    });

  // eslint-disable-next-line
  }, [appleMusicSDKReady]);

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// YOUTUBE
  let youTubeContainerStyle = {},
      youTubeWidth = 300,
      youTubeHeight = 169;
  if(nowPlaying?.track?.service === SERVICE_YOUTUBE) {
    if(stream.nowPlayingUuid === playback.nowPlayingUuid) {
      if(sideBar.tab === "feed" && feedApp.contentContainer) {
        const containerRect = feedApp.contentContainer;
        youTubeWidth = containerRect.width - 88;
        youTubeHeight = youTubeWidth / 16 * 9;
        youTubeContainerStyle = {
          position: "absolute",
          width: youTubeWidth,
          height: youTubeHeight,
          top: `${95 + 44}px`,
          left: `${341 + 44}px`,
          zIndex: 16,
        }
      } else {
        youTubeContainerStyle = {
          position: "absolute",
          width: 300,
          height: 169,
          top: "95px",
          right: "57px",
          boxShadow: "4px 4px 12px rgba(0, 0, 0, 0.15)",
        };
      }
    } else {
      console.log('pop up queue view')
      youTubeContainerStyle = {
        position: "fixed",
        top: "295px",
        right: "257px",
      };
    }
  } else {
    youTubeContainerStyle = {
      display: "none",
    };
  }

  const currentQueue = nowPlaying,
        isYouTube = currentQueue?.track?.service === SERVICE_YOUTUBE;

  const youTubeStart = isYouTube ? Math.floor(currentQueue.playbackIntervals[0].startPosition / 1000) : null,
        youTubeVideoId = isYouTube ? currentQueue?.track?.externalId : null,
        youTubeOpts = {
          width: "100%",
          height: "100%",
          playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 0,   // the initial video will automatically start to play
            controls: 0,   // hide playback controls
            disablekb: 1,  // disable keyboard controls
            fs: 0,         // disable full screen
            iv_load_policy: 3,
            modestbranding: 1,  // minimal YT branding
            origin: 'jukeboxrad.io',
            playsinline: 1,
            start: youTubeStart,
          },
        };

  const onYouTubeReady = function(e) {
    const youTubeApi = e.target;

    props.dispatch({
      type: "playback/loaded",
      payload: { service: "youtube" },
    });

    if(playback.youTubeAutoplay) {
      youTubeApi.playVideo();
      props.dispatch({
        type: 'playback/youTubeTriggerAutoplay',
        payload: { autoplay: false },
      });
    }

    props.dispatch({
      type: 'playback/youTube',
      payload: { youTubeApi },
    });
  }

  const onYouTubePause = function() {
    // console.log(playback.youTubeApi.getCurrentTime())
    if(!playback.action) {
      return;
    }
    const action = null;
    props.dispatch({
      type: "playback/action",
      payload: { action },
    });
  }

  const onYouTubePlay = function() {
    // console.log(playback.youTubeApi.getCurrentTime())
    if(!playback.action) {
      return;
    }
    const action = null;
    props.dispatch({
      type: "playback/action",
      payload: { action },
    });
  }


  /*
   * 🎨
   */
  return (
    <>
      <div className={styles.YouTubeContainer}
           style={youTubeContainerStyle}>
          <YouTube videoId={youTubeVideoId}
                   opts={youTubeOpts}
                   onReady={onYouTubeReady}
                   onPause={onYouTubePause}
                   onPlay={onYouTubePlay} />
      </div>
      <MainApp playbackControls={playbackControls}/>
    </>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
    playback: state.playback,
    queueMap: state.queueMap,
    lastUpQueueUuids: state.lastUpQueueUuids,
    nextUpQueueUuids: state.nextUpQueueUuids,
    userSettings: state.userSettings,
    feedApp: state.feedApp,
    sideBar: state.sideBar,
});


export default connect(mapStateToProps)(PlaybackApp);
