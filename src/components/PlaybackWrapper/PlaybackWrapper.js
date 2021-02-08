import { useEffect, useState } from "react";
import { connect } from 'react-redux'
// import { CountdownCircleTimer } from 'react-countdown-circle-timer'
// import styles from './PlaybackWrapper.module.css';
import {
  Switch,
  Route,
} from "react-router-dom";

import Chat from '../Chat/Chat';
import Queue from '../Queue/Queue';
import Search from '../Search/Search';
import Upload from '../Upload/Upload';
import Player from '../Player/Player';
import UserSettings from '../UserSettings/UserSettings';
import {
  fetchNextTrack,
  fetchPrevTrack,
  fetchScanBackward,
  fetchScanForward,
  fetchPauseTrack,
  fetchPlayTrack,
} from '../Player/network';


function PlaybackWrapper(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        spotifyApi = props.spotifyApi,
        nextUpQueues = props.nextUpQueues,
        nextUp = (
          nextUpQueues.length ?
            (nextUpQueues[0].children.length ?
              nextUpQueues[0].children[0] :
              nextUpQueues[0]) :
            undefined
        );

  const [playerIsPlaying, setPlayerIsPlaying] = useState(false);
  const [messageScheduleAddToQueue, setMessageScheduleAddToQueue] = useState(false);
  const [messageScheduleNextTrack, setMessageScheduleNextTrack] = useState(false);

  const [nextTrackJson, setNextTrackJson] = useState({});

  // eslint-disable-next-line
  const [addToQueueTimeoutId, setAddToQueueTimeoutId] = useState(undefined);
  // eslint-disable-next-line
  const [nextTrackTimeoutId, setNextTrackTimeoutId] = useState(undefined);
  // eslint-disable-next-line
  const [nextSeekTimeoutId, setNextSeekTimeoutId] = useState(undefined);

  const [forceNextTrackOnTimeout, setForceNextTrackOnTimeout] = useState(false);

  /*
   * This gets the position that the track should be at.
   *
   * @return [
   *   progress: Time in milliseconds,
   *   seekTimeout: Time in milliseconds until the next seek should happen,
   *   forceNextTrack: Boolean that determines wether nextTrack triggers the
   *                   the next track to play. Set to true when the tail end of
   *                   a track is muted.
   * ]
   */
  const getPositionMilliseconds = function(startedAt = stream.startedAt) {
    if(!stream.nowPlaying) {
      return [undefined, undefined, undefined];
    }

    let progress = Date.now() - startedAt,
        seekTimeout,
        forceNextTrack = false,
        playbackIntervalIdx = 0,
        cumulativeProgress = 0;

    while(true) {
      const playbackInterval = stream.nowPlaying.playbackIntervals[playbackIntervalIdx],
            playbackIntervalDuration = playbackInterval[1] - playbackInterval[0],
            remainingProgress = progress - cumulativeProgress;
      if(remainingProgress < playbackIntervalDuration) {
        progress = playbackInterval[0] + remainingProgress;
        seekTimeout = playbackInterval[1] - progress;
        break;
      }
      playbackIntervalIdx += 1;
      cumulativeProgress += playbackIntervalDuration;
    }

    if(playbackIntervalIdx === stream.nowPlaying.playbackIntervals.length - 1) {
      const intervals = stream.nowPlaying.intervals;
      if(intervals.length && !intervals[intervals.length - 1].upperBound) {
        forceNextTrack = true;
      }
      seekTimeout = undefined;
    }

    return [progress, seekTimeout, forceNextTrack];
  }

  /*
   *
   */
  const resetScheduledTasks = function() {
    const reduxClearTimeout = (prev) => {
      clearTimeout(prev);
      return undefined;
    }

    setAddToQueueTimeoutId(reduxClearTimeout);
    setNextTrackTimeoutId(reduxClearTimeout);
    setNextSeekTimeoutId(reduxClearTimeout);
  }

  /*
   * This triggers a track to start.
   * Note: You can think of this as "playing" the track, but "play" in code
   *       references different behavior. "Play" is used for toggling the
   *       current track from a "paused" state to "play."
   */
  const start = function() {
    setPlayerIsPlaying(true);

    if(!stream.nowPlaying.track) {
      return;
    }

    const arr = getPositionMilliseconds(),
          // eslint-disable-next-line
          [positionMilliseconds, seekTimeoutDuration, forceNextTrack] = arr;

    if(!positionMilliseconds) {
      return;
    }

    spotifyApi.play({
      uris: [stream.nowPlaying.track.externalId],
      position_ms: positionMilliseconds,
    });
    setMessageScheduleAddToQueue(true);
  }

  /*
   * This adds the nextUp item in the queue to play next (add to queue). If
   * forced === true, then immediately play the nextUp item.
   */
  const addToQueue = async function(forced = false) {
    const responseJsonNextTrack = await fetchNextTrack();

    if(forced) {
      await props.dispatch(responseJsonNextTrack.redux);
      await setNextTrackJson({});
      resetScheduledTasks();
      await setPlayerIsPlaying(false);
      return;
    }

    setNextTrackJson(responseJsonNextTrack);
    setMessageScheduleNextTrack(true);
    spotifyApi.queue(nextUp.track.externalId);
  }

  /*
   * This plays the previous track.
   */
  const prevTrack = async function() {
    const responseJsonPrevTrack = await fetchPrevTrack();
    await props.dispatch(responseJsonPrevTrack.redux);
    resetScheduledTasks();
    await setPlayerIsPlaying(false);
  }

  /*
   * This does "next track" behavior. In some cases, next track happens
   * passively (e.g. on Spotify the next track automatically plays). Else, the
   * next track must be forcibly triggered.
   */
  const nextTrack = async function() {
    console.log(forceNextTrackOnTimeout)
    if(forceNextTrackOnTimeout) {
      spotifyApi.skipToNext();
    }
    await props.dispatch(nextTrackJson.redux);
    setForceNextTrackOnTimeout(false);
    setMessageScheduleAddToQueue(true);
  }

  /*
   * Seek to the expected position in the track. This may be called in 3 cases:
   *   1: a user signals the track to scan forward 10 seconds.
   *   2: a user signals the track to scan backward 10 seconds.
   *   3: a seekTimeout event is triggered, meaning the now playing track must
   *      seek to the new expected track progress (in the case of a muted
   *      interval).
   */
  const seek = async function(direction = undefined) {
    let startedAt;

    if(direction === 'forward') {
      const response = await fetchScanForward();
      // Seeking forward is not allowed because the track is almost over.
      if(response.system.status === 400) {
        return;
      }
      startedAt = stream.startedAt - (10000);
    } else if(direction === 'backward') {
      await fetchScanBackward();
      const date = new Date(),
            epochNow = date.getTime(),
            proposedStartedAt = stream.startedAt + 10000,
            proposedProgress = epochNow - proposedStartedAt;
      startedAt = proposedProgress > 0 ? proposedStartedAt : epochNow;
    } else {
      startedAt = stream.startedAt;
    }

    await props.dispatch({
      type: 'stream/set',
      payload: {stream: { ...stream, startedAt: startedAt }},
    });
    const arr = getPositionMilliseconds(startedAt),
          // eslint-disable-next-line
          [positionMilliseconds, seekTimeoutDuration, forceNextTrack] = arr;
    spotifyApi.seek(positionMilliseconds);
    if(forceNextTrack) {
      setForceNextTrackOnTimeout(forceNextTrack);
    }
    resetScheduledTasks();
    setMessageScheduleAddToQueue(true);
  }

  /*
   * Toggling the player from the "playing" to "paused" state.
   */
  const pause = async function() {
    const jsonResponse = await fetchPauseTrack();
    props.dispatch(jsonResponse.redux);
    resetScheduledTasks();
    spotifyApi.pause();
  }

  /*
   * Toggling the player from the "paused" to "playing" state.
   */
  const play = async function() {
    const jsonResponse = await fetchPlayTrack();
    await props.dispatch(jsonResponse.redux);

    // When page loads with the player in the "paused" state and then the user
    // toggles to the "playing" state.
    if(!playerIsPlaying) {
      return;
    }

    spotifyApi.play();
    setMessageScheduleAddToQueue(true);
  }

  // Will schedule task to add to queue. Happens near the end of the currently
  // playing track.
  useEffect(() => {

    // debouncer
    if(!messageScheduleAddToQueue) {
      return;
    }
    setMessageScheduleAddToQueue(false);
    setNextTrackJson({});

    // schedule seek
    const arr = getPositionMilliseconds(),
          // eslint-disable-next-line
          [positionMilliseconds, seekTimeoutDuration, forceNextTrack] = arr;
    if(seekTimeoutDuration) {
      const seekTimeoutId = setTimeout(() => {
        seek();
      }, seekTimeoutDuration);
      setNextSeekTimeoutId(seekTimeoutId);
    }
    if(forceNextTrack) {
      setForceNextTrackOnTimeout(forceNextTrack);
    }

    // schedule add to queue
    const nowPlayingDuration = stream.nowPlaying.totalDurationMilliseconds,
          progress = Date.now() - stream.startedAt,
          addToQueueTimeoutDuration = nowPlayingDuration - progress - 5000;
    const timeoutId = setTimeout(() => {
      addToQueue();
    }, addToQueueTimeoutDuration);
    setAddToQueueTimeoutId(timeoutId);

  // eslint-disable-next-line
  }, [messageScheduleAddToQueue]);

  // Will schedule a task to perform "next track" action at the end of the
  // currently playing track.
  useEffect(() => {

    // debouncer
    if(!messageScheduleNextTrack) {
      return;
    }
    setMessageScheduleNextTrack(false);

    // schedule next track
    const nowPlayingDuration = stream.nowPlaying.totalDurationMilliseconds,
          progress = Date.now() - stream.startedAt,
          nextTrackTimeoutDuration = nowPlayingDuration - progress;
    const timeoutId = setTimeout(() => {
      nextTrack();
    }, nextTrackTimeoutDuration);
    setNextTrackTimeoutId(timeoutId);

  // eslint-disable-next-line
  }, [messageScheduleNextTrack]);

  // Play the music.
  if(stream.isPlaying && !playerIsPlaying) {
    start();
  }

  return (
    <>
    <Switch>
      <Route path="/settings">
        <UserSettings />
      </Route>
      <Route path="/chat">
        <Chat />
      </Route>
      <Route path="/player">
        <Player nextTrack={addToQueue}
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
    </>
  );
}

const mapStateToProps = (state) => ({
    stream: state.stream,
    spotifyApi: state.spotifyApi,
    nextUpQueues: state.nextUpQueues,
});

export default connect(mapStateToProps)(PlaybackWrapper);
