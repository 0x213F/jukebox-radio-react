import React, { useEffect } from "react";

import { connect } from 'react-redux';
import { Switch, Route } from "react-router-dom";

import SpotifySync from '../SpotifySync/SpotifySync';
import Session from './Session/Session';
import { fetchPauseTrack, fetchPlayTrack, fetchScan, fetchNextTrack, fetchPrevTrack, fetchTrackGetFiles } from '../PlaybackApp/Player/network';
import { getLeafQueue } from '../QueueApp/utils';
import {
  SERVICE_JUKEBOX_RADIO,
  SERVICE_AUDIUS,
} from '../../config/services';
import { onplay, onpause, onseeked } from './utils';


function MainApp(props) {

  const main = props.main,
        stream = props.stream,
        playback = props.playback,
        queueMap = props.queueMap,
        lastUpQueueUuids = props.lastUpQueueUuids,
        nextUpQueueUuids = props.nextUpQueueUuids,
        nowPlaying = queueMap[playback.nowPlayingUuid],
        lastUp = getLeafQueue(lastUpQueueUuids[lastUpQueueUuids.length - 1], queueMap),
        nextUp = getLeafQueue(nextUpQueueUuids[0], queueMap);

  /*
   *
   */
  const seek = async function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });
    props.dispatch({ type: "main/clearAutoplayTimeoutId" });

    const action = main.actions[0],
          timestampMilliseconds = action.timestampMilliseconds;

    // Seek in the playback engine
    const isSeeking = props.playbackControls.seek(timestampMilliseconds);

    if(!isSeeking) {
      // If seek failed for some reason, return early.
      props.dispatch({ type: 'main/actionShift' });
      props.dispatch({ type: 'main/enable' });
      return;
    }
    if(!timestampMilliseconds) {
      // If routine seek, (skipping an muted interval) return early to prevent
      // hitting the API.
      props.dispatch({ type: 'main/actionShift' });
      props.dispatch({ type: 'main/enable' });
      return;
    }

    // Seek in the API layer
    const startedAt = Date.now() - timestampMilliseconds;
    if(!action.fake) {
      await fetchScan(startedAt);
    }

    props.dispatch({ type: 'main/actionShift' });
    props.dispatch({ type: 'main/enable' });
  }

  /*
   *
   */
  const pause = async function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });

    const action = main.actions[0];

    // Pause in the playback engine
    const isPausing = props.playbackControls.pause();

    if(!isPausing) {
      // If pause failed for some reason, return early.
      props.dispatch({ type: 'main/actionShift' });
      props.dispatch({ type: 'main/enable' });
      return;
    }

    // Pause in the API layer
    if(!action.fake) {
      await fetchPauseTrack();
    }

    props.dispatch({ type: 'main/actionShift' });
    props.dispatch({ type: 'main/enable' });
  }

  /*
   *
   */
  const play = async function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });
    props.dispatch({ type: "main/clearAutoplayTimeoutId" });

    const action = main.actions[0],
          timestampMilliseconds = action.timestampMilliseconds;

    // Play in the playback engine
    const isPlaying = props.playbackControls.play(timestampMilliseconds);
    if(!isPlaying) {
      // If play failed for some reason, return early.
      props.dispatch({ type: 'main/actionShift' });
      props.dispatch({ type: 'main/enable' });
      return;
    }

    // Pause in the API layer
    if(!action.fake) {
      await fetchPlayTrack(timestampMilliseconds);
    }

    props.dispatch({ type: 'main/actionShift' });
    props.dispatch({ type: 'main/enable' });
  }

  const next = async function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });
    props.dispatch({ type: 'stream/nextTrack' });
    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "mount",
          queue: nextUp,
          status: "kickoff",
          fake: true,  // symbolic, not functional
        },
      },
    });
    await fetchNextTrack(false);
    props.dispatch({ type: 'main/actionShift' });
  }

  const prev = async function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });
    props.dispatch({ type: 'stream/prevTrack' });
    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "mount",
          queue: lastUp,
          status: "kickoff",
          fake: true,  // symbolic, not functional
        },
      },
    });
    await fetchPrevTrack(false);
    props.dispatch({ type: 'main/actionShift' });
  }

  const loadAudio = async function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });

    const action = main.actions[0],
          queue = action.queue;

    if(queue.track.service === SERVICE_JUKEBOX_RADIO) {
      const responseJson = await fetchTrackGetFiles(queue.track.uuid);
      responseJson.redux.payload = {
        ...responseJson.redux.payload, onplay, onpause, onseeked,
      };
      props.dispatch(responseJson.redux);
    }
    if(queue.track.service === SERVICE_AUDIUS) {
      props.dispatch({
        "type": "playback/loadAudius",
        "payload": {
          "id": queue.track.externalId,
          "trackUuid": queue.track.uuid,
          onplay, onpause, onseeked,
        },
      });
    }

    // TODO: This actions should really be shifted once the audio file is
    //       properly loaded.
    props.dispatch({ type: 'main/actionShift' });
    props.dispatch({ type: 'main/enable' });
  }

  const mount = function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });

    const action = main.actions[0];
    let payload;
    if(action.queue) {
      payload = { queue: action.queue };
    } else if(action.stream) {
      payload = { stream: action.stream };
    }
    props.dispatch({ type: "playback/mount", payload });

    props.dispatch({ type: 'main/actionShift' });
    props.dispatch({ type: 'main/enable' });
  }

  /*
   * An action was triggered or changed somewhere in the application. This
   * handles the change accordingly.
   */
  useEffect(function() {
    console.log(main.actions)
    if(!main.actions.length) {
      // We only do something if there is something to do.
      return;
    }

    const action = main.actions[0];
    if(action.status !== "kickoff") {
      // Something is already in progress.
      return;
    }

    if(playback.action) {
      // Playback action is still in progress.
      return;
    }

    if(action.name === "seek") {
      seek();
    } else if(action.name === "pause") {
      pause();
    } else if(action.name === "play") {
      play();
    } else if(action.name === "next") {
      next();
    } else if(action.name === "prev") {
      prev();
    } else if(action.name === "loadAudio") {
      loadAudio();
    } else if(action.name === "mount") {
      mount();
    }
  // eslint-disable-next-line
  }, [main, playback])

  /*
   * Schedules "next track" behavior after "now playing" terminates.
   */
  useEffect(function() {
    if(playback.nowPlayingUuid !== stream.nowPlayingUuid) {
      return;
    }
    if(main.autoplayTimeoutId || !playback.isPlaying) {
      return;
    }

    const timestampMilliseconds = Date.now() - nowPlaying.startedAt,
          remainingMilliseconds = nowPlaying.durationMilliseconds - timestampMilliseconds,
          timeoutDelay = remainingMilliseconds - 5000;

    const timeoutId = setTimeout(kickoffAutoplay, timeoutDelay);
    props.dispatch({
      type: "main/setAutoplayTimeoutId",
      payload: { timeoutId },
    });
  // eslint-disable-next-line
  }, [main, playback])

  const kickoffAutoplay = function() {
    props.dispatch({ type: 'main/disable' });

    const timestampMilliseconds = Date.now() - nowPlaying.startedAt,
          remainingMilliseconds = nowPlaying.durationMilliseconds - timestampMilliseconds,
          timeoutDelay = remainingMilliseconds - 4000;

    setTimeout(initializeAutoplay, timeoutDelay);
  }

  const initializeAutoplay = function() {

    console.log('TODO: pre-loading for autoplay');

    const timestampMilliseconds = Date.now() - nowPlaying.startedAt,
          remainingMilliseconds = nowPlaying.durationMilliseconds - timestampMilliseconds,
          timeoutDelay = remainingMilliseconds;

    setTimeout(function() {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "next",
            status: "kickoff",
            fake: false,
          },
        },
      });
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "play",
            status: "kickoff",
            fake: true,
          },
        },
      });
    }, timeoutDelay);
  }

  useEffect(function() {
    if(playback.nowPlayingUuid === stream.nowPlayingUuid) {
      return;
    }
    if(main.autoplayTimeoutId || !playback.isPlaying) {
      return;
    }

    const timestampMilliseconds = Date.now() - nowPlaying.startedAt,
          remainingMilliseconds = nowPlaying.durationMilliseconds - timestampMilliseconds,
          timeoutDelay = remainingMilliseconds;

    const timeoutId = setTimeout(resetStartedAt, timeoutDelay);
    props.dispatch({
      type: "main/setAutoplayTimeoutId",
      payload: { timeoutId },
    });
  // eslint-disable-next-line
  }, [main, playback]);

  const resetStartedAt = function() {
    const now = Date.now();
    props.dispatch({
      type: 'queue/update',
      payload: {
        queues: [
          {
            ...nowPlaying,
            startedAt: now,
            statusAt: now,
            status: "paused",
          }
        ]
      },
    });
  }

  /*
   * Used to load audio for soon-to-be-played queue items.
   */
  useEffect(function() {
    const queues = [lastUp, nowPlaying, nextUp];
    const queuesAlreadyLoading = new Set(
      main.actions
      .filter(a => a.name === 'loadAudio')
      .map(a => a.queue.uuid)
    );
    for(const queue of queues) {
      if(!queue?.track) {
        // No queue, nothing to load.
        continue;
      }

      const rawAudioServices = new Set();
      rawAudioServices.add(SERVICE_JUKEBOX_RADIO);
      rawAudioServices.add(SERVICE_AUDIUS);
      if(!rawAudioServices.has(queue.track.service)) {
        // We only need to load audio from raw audio services.
        continue;
      }

      if(queuesAlreadyLoading.has(queue.uuid) || playback.files.hasOwnProperty(queue.track.uuid)) {
        // Audio is already loading or loaded.
        continue;
      }

      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "loadAudio",
            queue: queue,
            status: "kickoff",
            fake: true,  // symbolic, not functional
          },
        },
      });
    }
  // eslint-disable-next-line
  }, [playback])

  /*
   * 🎨
   */
  return (
    <Switch>
      <Route path="/app/:content">
        <Session playbackControls={props.playbackControls} />
      </Route>
      <Route path="/u/:username">
        <span>PROFILE</span>
      </Route>
      <Route path="/spotify">
        <SpotifySync />
      </Route>
      <Route>
        <Session playbackControls={props.playbackControls} />
      </Route>
    </Switch>
  );
}


const mapStateToProps = (state) => ({
  main: state.main,
  playback: state.playback,
  queueMap: state.queueMap,
  lastUpQueueUuids: state.lastUpQueueUuids,
  nextUpQueueUuids: state.nextUpQueueUuids,
  stream: state.stream,
});


export default connect(mapStateToProps)(MainApp);
