import { useEffect, useState } from "react";

import { connect } from 'react-redux';
import YouTube from 'react-youtube';

import StreamEngine from '../StreamEngine/StreamEngine';
import { fetchGetUserSettings } from '../../ModalApp/UserSettings/network';
import * as services from '../../../config/services';
import { appendScript } from '../../../utils/async';
import { store } from '../../../utils/redux';

import * as controls from './controls';
import { getPositionMilliseconds, updateSpotifyPlayer } from '../utils';
import styles from './PlaybackEngine.module.css';


const SpotifyWebApi = require('spotify-web-api-js');


function PlaybackEngine(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        playback = props.playback,
        userSettings = props.userSettings,
        feedApp = props.feedApp,
        sideBar = props.sideBar,
        modal = props.modal;

  const queueMap = props.queueMap,
        nowPlaying = queueMap[playback.nowPlayingUuid];

  // Convenience values to help clarify setting up playback SDKs.
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
  const seek = function(timestampMilliseconds = undefined) {
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
    controls.seek(playback, nowPlaying, startedAt);

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
  const pause = function() {
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

    controls.pause(playback, nowPlaying);

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
  const play = function(timestampMilliseconds = undefined, fake = false) {
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
    if(!nowPlaying.track?.uuid) {
      return false;
      // The now playing item is an empty queue.
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

    if(!fake) {
      controls.start(playback, nowPlaying);
    } else {
      // NOTE: if faking a MusicKit play, then we must update the playback
      //       action as complete.
      if(nowPlaying.track.service === services.APPLE_MUSIC) {
        props.dispatch({
          type: 'playback/action',
          payload: { action: null },
        });
      }
    }

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

  const queue = function(queueUuid) {
    const queue = queueMap[queueUuid],
          shouldQueueAppleMusic = (
            nowPlaying.track.service === services.APPLE_MUSIC &&
            queue.track.service === services.APPLE_MUSIC
          ),
          shouldQueueSpotify = (
            nowPlaying.track.service === services.SPOTIFY &&
            queue.track.service === services.SPOTIFY &&
            queue.playbackIntervals[0].startPosition === 0
          );

    if(!(shouldQueueAppleMusic || shouldQueueSpotify)) {
      return false;
    }

    controls.queue(playback, queue);
    console.log('queued!')

    return true;
  }

  /*
   *
   */
  const skip = function() {
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
    // if(!playback.onDeckUuid) {
    //   // There must be a track "on deck," previously pre-loaded via a playback
    //   // service (like MusicKit or Spotify).
    //   return false;
    // }

    // Valid conditions, so we skip.
    // const action = 'skipped';
    // props.dispatch({
    //   type: 'playback/action',
    //   payload: { action },
    // });

    // Clear scheduled "seek"
    props.dispatch({ type: 'playback/clearSeekTimeoutId' });

    controls.skip(playback, nowPlaying);

    // We need to update the queue object as well.
    // const onDeck = queueMap[playback.onDeckUuid];
    props.dispatch({
      type: 'queue/update',
      payload: {
        queues: [
          {
            ...nowPlaying,
            statusAt: Date.now(),
            status: "paused",
          },
          // {
          //   ...onDeck,
          //   statusAt: Date.now(),
          //   status: "played",
          // }
        ]
      },
    });

    // Let the caller know that pause was initiated.
    return true;
  }

  /*
   * Passed down to child components so they can have a handle on playback.
   */
  const playbackControls = { seek, pause, play, skip, queue };

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
  // eslint-disable-next-line
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
  let appleMusicContainerStyle = {},
      appleMusicWidth = 300,
      appleMusicHeight = 169;
  if(window.location.pathname !== '/app/welcome' && nowPlaying?.track?.service === services.APPLE_MUSIC && nowPlaying?.track?.format === 'video') {
    if(stream.nowPlayingUuid === playback.nowPlayingUuid) {
      if(sideBar.tab === "feed" && feedApp.contentContainer) {
        const containerRect = feedApp.contentContainer;
        appleMusicWidth = containerRect.width - 88;
        appleMusicHeight = appleMusicWidth / 16 * 9;
        appleMusicContainerStyle = {
          position: "absolute",
          width: appleMusicWidth,
          height: appleMusicHeight,
          top: `${95 + 44}px`,
          left: `${341 + 44}px`,
          zIndex: 16,
        }
      } else {
        appleMusicContainerStyle = {
          position: "absolute",
          width: 300,
          height: 169,
          top: "95px",
          right: "57px",
          boxShadow: "4px 4px 12px rgba(0, 0, 0, 0.15)",
        };
      }
    } else {
      appleMusicContainerStyle = {
        position: "fixed",
        top: "295px",
        right: "257px",
      };
    }
  } else {
    appleMusicContainerStyle = {
      display: "none",
    };
  }
  appleMusicContainerStyle.zIndex = 3;

  const appendAppleMusicSDK = function() {
    appendScript("https://js-cdn.music.apple.com/musickit/v3/musickit.js");

    // Then...
    window.addEventListener('musickitloaded', async function() {
      await window.MusicKit.configure({
        developerToken: userSettings.appleMusic.token,
        app: {
          name: 'Jukebox Radio',
          build: '0.0.1',
        },
      });
      props.dispatch({
        type: "playback/loaded",
        payload: { service: "appleMusic" },
      });
    })
  };

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// YOUTUBE
  let youTubeContainerStyle = {},
      youTubeWidth = 300,
      youTubeHeight = 169;
  if(nowPlaying?.track?.service === services.YOUTUBE && nowPlaying?.track?.format === 'video') {
    // if(stream.nowPlayingUuid === playback.nowPlayingUuid) {
      if(sideBar.tab === "feed" && feedApp.contentContainer && !modal.isOpen) {
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
    // } else {
    //   youTubeContainerStyle = {
    //     position: "fixed",
    //     top: "295px",
    //     right: "257px",
    //   };
    // }
  } else {
    youTubeContainerStyle = {
      display: "none",
    };
  }
  youTubeContainerStyle.zIndex = 3;

  const currentQueue = nowPlaying,
        isYouTube = currentQueue?.track?.service === services.YOUTUBE;

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
      youTubeApi.setVolume(playback.volumeLevel * 100);
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
      <div className={styles.AppleMusicContainer}
           style={appleMusicContainerStyle}>
          <div id="apple-music-video-container"></div>
      </div>
      <StreamEngine playbackControls={playbackControls}/>
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
    modal: state.modal,
});


export default connect(mapStateToProps)(PlaybackEngine);
