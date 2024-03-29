import React, { useEffect } from "react";

import { connect } from 'react-redux';

import MainRouter from '../../MainRouter/MainRouter';
import { fetchUpdateFeed } from '../../FeedApp/utils';
import { fetchPauseTrack, fetchPlayTrack, fetchScan, fetchTrackGetFiles } from './network';
import { getLeafQueue } from '../../QueueApp/utils';
import * as services from '../../../config/services';
import { onplay, onpause, onseeked, handleNext, handlePrev } from './utils';
import { scheduleSpeakVoiceRecordings, closeModal } from './effects';


function StreamEngine(props) {

  const main = props.main,
        stream = props.stream,
        feedApp = props.feedApp,
        playback = props.playback,
        queueMap = props.queueMap,
        streamEngine = props.streamEngine,
        lastUpQueueUuids = props.lastUpQueueUuids,
        nextUpQueueUuids = props.nextUpQueueUuids,
        voiceRecordingTimeoutId = props.voiceRecordingTimeoutId,
        nowPlaying = queueMap[playback.nowPlayingUuid],
        lastUp = getLeafQueue(lastUpQueueUuids[lastUpQueueUuids.length - 1], queueMap),
        nextUp = getLeafQueue(nextUpQueueUuids[0], queueMap);

  const playbackIsStream = stream.nowPlayingUuid === playback.nowPlayingUuid;

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

    // Do other related things
    props.dispatch({ type: "voiceRecording/pause" });
    props.dispatch({ type: "voiceRecording/play" });
    props.dispatch({
      type: 'feed/takeAction',
      payload: {
        timestampMilliseconds: timestampMilliseconds,
        action: "seeked",
        trackUuid: nowPlaying.track.uuid,
      },
    });

    if(timestampMilliseconds) {
      // If not routine seek, append to feed
      props.dispatch({
        type: 'feed/takeAction',
        payload: {
          timestampMilliseconds: timestampMilliseconds,
          action: "seeked",
          trackUuid: nowPlaying.track.uuid,
        },
      });
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


    // Do other related things
    props.dispatch({ type: "voiceRecording/pause" });
    props.dispatch({
      type: 'feed/takeAction',
      payload: {
        action: "paused",
      },
    });

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
    const isPlaying = props.playbackControls.play(timestampMilliseconds, action.fake.playback);
    if(!isPlaying) {
      // If play failed for some reason, return early.
      props.dispatch({ type: 'main/actionShift' });
      props.dispatch({ type: 'main/enable' });
      return;
    }

    // Do other related things
    props.dispatch({ type: "voiceRecording/play" });
    props.dispatch({
      type: 'feed/takeAction',
      payload: {
        timestampMilliseconds: timestampMilliseconds,
        action: "played",
        trackUuid: nowPlaying.track.uuid,
      },
    });

    // Pause in the API layer
    if(!action.fake.api) {
      await fetchPlayTrack(timestampMilliseconds);
    }

    props.dispatch({ type: 'main/actionShift' });
    props.dispatch({ type: 'main/enable' });
  }

  const loadAudio = async function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });

    const action = main.actions[0],
          queue = action.queue;

    if(!playback.files.hasOwnProperty(queue.track.uuid)) {
      if(queue.track.service === services.JUKEBOX_RADIO) {
        const responseJson = await fetchTrackGetFiles(queue.track.uuid);
        responseJson.redux.payload = {
          ...responseJson.redux.payload, onplay, onpause, onseeked,
        };
        props.dispatch(responseJson.redux);
      }
      if(queue.track.service === services.AUDIUS) {
        props.dispatch({
          "type": "playback/loadAudius",
          "payload": {
            "id": queue.track.externalId,
            "trackUuid": queue.track.uuid,
            onplay, onpause, onseeked,
          },
        });
      }
      props.dispatch({
        type: "streamEngine/queueLoaded",
        payload: { queueUuid: queue.uuid },
      });
    }

    // TODO: This actions should really be shifted once the audio file is
    //       properly loaded.
    props.dispatch({ type: 'main/actionShift' });
    props.dispatch({ type: 'main/enable' });
  }

  const loadFeed = async function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });

    const action = main.actions[0],
          queue = action.queue;

    await fetchUpdateFeed(queue.track.uuid);

    props.dispatch({ type: 'main/actionShift' });
    props.dispatch({ type: 'main/enable' });
  }

  const mount = function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });

    const action = main.actions[0];
    let payload = {};
    if(action.queue) {
      payload = { queue: action.queue };
    } else if(action.stream) {
      // payload = { stream: action.stream };
    }

    props.dispatch({ type: "playback/mount", payload });

    props.dispatch({ type: 'main/actionShift' });
    props.dispatch({ type: 'main/enable' });
  }

  const openModal = function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });

    const action = main.actions[0],
          { view } = action;
    props.dispatch({
      type: "modal/open",
      payload: { view },
    });

    props.dispatch({ type: 'main/actionShift' });
    props.dispatch({ type: 'main/enable' });
  }

  const handleSkip = async function() {
    props.dispatch({ type: 'main/actionStart' });
    props.dispatch({ type: 'main/disable' });

    const queueMap = props.queueMap,
          stream = props.stream,
          streamNowPlaying = queueMap[stream.nowPlayingUuid];

    // Play in the playback engine
    const isSkipping = props.playbackControls.skip(streamNowPlaying);
    if(!isSkipping) {
      // If play failed for some reason, return early.
      props.dispatch({ type: 'main/actionShift' });
      props.dispatch({ type: 'main/enable' });
      return;
    }

    props.dispatch({ type: 'main/actionShift' });
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
    } else if(action.name === "skip") {
      handleSkip();
    } else if(action.name === "next") {
      handleNext();
    } else if(action.name === "prev") {
      handlePrev();
    } else if(action.name === "loadAudio") {
      loadAudio();
    } else if(action.name === "loadFeed") {
      loadFeed();
    } else if(action.name === "mount") {
      mount();
    } else if(action.name === "openModal") {
      openModal();
    } else if(action.name === "closeModal") {
      closeModal();
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
          timeoutDelay = remainingMilliseconds - 4850;

    setTimeout(initializeAutoplay, timeoutDelay);
  }

  const initializeAutoplay = function() {

    if(!nextUp) {
      return;
    }

    const timestampMilliseconds = Date.now() - nowPlaying.startedAt,
          remainingMilliseconds = nowPlaying.durationMilliseconds - timestampMilliseconds,
          timeoutDelay = remainingMilliseconds;

    const isQueued = props.playbackControls.queue(nextUp?.uuid);
    let pause = true,
        skip = false,
        play = true;
    if(isQueued) {
      const lastIdx = nowPlaying.playbackIntervals.length - 1;

      pause = false;
      skip = (
        nowPlaying.playbackIntervals[lastIdx].endPosition !==
        nowPlaying.track.durationMilliseconds
      );
      play = false;
    }

    const settings = { pause, skip, play };

    setTimeout(function() {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "next",
            status: "kickoff",
            fake: false,
            settings,
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
   * Used to preload for soon-to-be-played queue items.
   */
  useEffect(function() {
    if(!playbackIsStream) {
      return;
    }

    const queues = [lastUp, nowPlaying, nextUp];
    const queuesAlreadyLoading = new Set(
      main.actions
      .filter(a => a.name === 'loadAudio')
      .map(a => a.queue.uuid)
    );

    // Preload audio
    for(const queue of queues) {
      if(!queue?.track) {
        // No queue, nothing to load.
        continue;
      }

      if(queuesAlreadyLoading.has(queue.uuid)) {
        // Audio is already been queued up for loading.
        return;
      }

      if(streamEngine.loadedQueueUuids.has(queue.track.uuid)) {
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

    // Preload feed
    const queuesAlreadyLoadingFeed = new Set(
      main.actions
      .filter(a => a.name === 'loadFeed')
      .map(a => a.queue.uuid)
    );
    for(const queue of queues) {
      if(!queue?.track) {
        // No queue, nothing to load.
        continue;
      }

      if(queuesAlreadyLoadingFeed.has(queue.uuid)) {
        // Feed is already loading.
        continue;
      }

      if(feedApp.trackMap.hasOwnProperty(queue.track.uuid)) {
        // Feed is already loaded.
        continue;
      }

      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "loadFeed",
            queue: queue,
            status: "kickoff",
            fake: false,  // symbolic, not functional
          },
        },
      });
    }
  // eslint-disable-next-line
  }, [playback])


  /*
   * Schedule speak voice recordings
   */
  useEffect(scheduleSpeakVoiceRecordings, [voiceRecordingTimeoutId]);

  /*
   * 🎨
   */
  return <MainRouter />;
}


const mapStateToProps = (state) => ({
  main: state.main,
  playback: state.playback,
  queueMap: state.queueMap,
  lastUpQueueUuids: state.lastUpQueueUuids,
  nextUpQueueUuids: state.nextUpQueueUuids,
  stream: state.stream,
  feedApp: state.feedApp,
  voiceRecordingMap: state.voiceRecordingMap,
  voiceRecordingTimeoutId: state.voiceRecordingTimeoutId,
  streamEngine: state.streamEngine,
});


export default connect(mapStateToProps)(StreamEngine);
