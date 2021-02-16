import { useEffect, useState } from "react";
import { connect } from 'react-redux'
import { fetchTextCommentList, fetchVoiceRecordingList } from '../Chat/network';
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
  // eslint-disable-next-line
  fetchPauseTrack,
  // eslint-disable-next-line
  fetchPlayTrack,
} from '../Player/network';


function PlaybackWrapper(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        playback = props.playback;

  const [messageScheduleNextTrack, setMessageScheduleNextTrack] = useState(false);
  const [plannedNextTrackTimeoutId, setPlannedNextTrackTimeoutId] = useState({});
  const [nextTrackJson, setNextTrackJson] = useState({});

  /*
   * This gets the position that the track should be at.
   *
   * @return [
   *   progress: Time in milliseconds,
   *   seekTimeout: Time in milliseconds until the next seek should happen,
   * ]
   */
  const getPositionMilliseconds = function(startedAt = stream.startedAt) {
    if(!stream.nowPlaying) {
      return [undefined, undefined];
    }

    let progress = Date.now() - startedAt,
        seekTimeout,
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
      seekTimeout = undefined;
    }

    return [progress, seekTimeout];
  }

  /*
   * Load comments and voice recordings to update the feed.
   */
  const updateFeed = async function() {
    const responseJsonTextCommentList = await fetchTextCommentList();
    const responseJsonVoiceRecordingList = await fetchVoiceRecordingList();
    await props.dispatch(responseJsonTextCommentList.redux);
    await props.dispatch(responseJsonVoiceRecordingList.redux);
  };

  /*
   * This starts the now playing track.
   * Note: You can think of this as "playing" the track, but "play" in code
   *       references different behavior. "Play" is used for toggling the
   *       current track from a "paused" state to "play."
   */
  const start = function() {
    if(!stream.nowPlaying.track) {
      return;
    }
    props.dispatch({ type: 'playback/started' });

    const arr = getPositionMilliseconds();
    let positionMilliseconds = arr[0];

    playback.spotifyApi.play({
      uris: [stream.nowPlaying.track.externalId],
      position_ms: positionMilliseconds,
    });
  }

  /*
   * This adds the nextUp item in the queue to play next (add to queue). This
   * happens ~5 seconds before the next item should play.
   */
  const addToQueue = async function() {

    // disable the player UI
    await props.dispatch({ type: 'playback/disable' });

    // update the back-end
    const responseJsonNextTrack = await fetchNextTrack(
      stream.nowPlaying.totalDurationMilliseconds, true
    );

    // update the front-end later
    setNextTrackJson(responseJsonNextTrack);

    // add to queue
    await props.dispatch({ type: 'playback/addToQueue' });

    // schedule "next track"
    setMessageScheduleNextTrack(true);
  }

  /*
   *  Triggered by a scheduled task, this plays the next track.
   */
  const plannedNextTrack = async function() {
    await props.dispatch({
      type: 'playback/plannedNextTrack',
      payload: { payload: nextTrackJson.redux },  // yes
    });
    await props.dispatch({ type: 'playback/enable' });
    await updateFeed();
  }

  /*
   * Triggered by human interaction, this plays the previous track.
   */
  const prevTrack = async function() {
    await props.dispatch({ type: 'playback/disable' });
    const responseJsonPrevTrack = await fetchPrevTrack();
    await props.dispatch(responseJsonPrevTrack.redux);
    await props.dispatch({ type: 'playback/start' });
    await props.dispatch({ type: 'playback/enable' });
    await updateFeed();
  }

  /*
   * Triggered by human interaction, this plays the next track.
   */
  const nextTrack = async function() {
    await props.dispatch({ type: 'playback/disable' });
    const responseJsonNextTrack = await fetchNextTrack(
      stream.nowPlaying.totalDurationMilliseconds, false
    );
    await props.dispatch(responseJsonNextTrack.redux);
    await props.dispatch({ type: 'playback/start' });
    await props.dispatch({ type: 'playback/enable' });
    await updateFeed();
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
    await props.dispatch({ type: 'playback/disable' });
    let startedAt;

    if(direction === 'forward') {
      const response = await fetchScanForward(
        stream.nowPlaying.totalDurationMilliseconds
      );
      // Seeking forward is not allowed because the track is almost over.
      if(response.system.status === 400) {
        await props.dispatch({ type: 'playback/enable' });
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
          positionMilliseconds = arr[0],
          seekTimeoutDuration = arr[1];
    playback.spotifyApi.seek(positionMilliseconds);
    await props.dispatch({ type: 'playback/addToQueueReschedule' });

    // schedule seek
    if(seekTimeoutDuration) {
      const seekTimeoutId = setTimeout(() => {
        seek();
      }, seekTimeoutDuration);
      // setNextSeekTimeoutId(seekTimeoutId);
      props.dispatch({
        type: 'playback/nextSeekScheduled',
        payload: { nextSeekTimeoutId: seekTimeoutId },
      });
    }

    await props.dispatch({ type: 'playback/enable' });
  }

  /*
   * Toggling the player from the "playing" to "paused" state.
   */
  const pause = async function() {
    await props.dispatch({ type: 'playback/disable' });
    const jsonResponse = await fetchPauseTrack();
    await props.dispatch(jsonResponse.redux);
    await props.dispatch({ type: 'playback/addToQueueReschedule' });
    playback.spotifyApi.pause();
    clearTimeout(plannedNextTrackTimeoutId);
    await props.dispatch({ type: 'playback/enable' });
  }

  /*
   * Toggling the player from the "paused" to "playing" state.
   */
  const play = async function() {
    await props.dispatch({ type: 'playback/disable' });
    const jsonResponse = await fetchPlayTrack();
    await props.dispatch(jsonResponse.redux);

    // When page loads with the player in the "paused" state and then the user
    // toggles to the "playing" state.
    if(!playback.isPlaying) {
      await props.dispatch({ type: 'playback/enable' });
      return;
    }

    await props.dispatch({ type: 'playback/addToQueueReschedule' });
    playback.spotifyApi.play();
    await props.dispatch({ type: 'playback/enable' });
  }

  //////////////////////////////////////////////////////////////////////////////
  // SCHEDULE ADD TO QUEUE
  // Happens near the end of the currently playing track.
  useEffect(() => {

    // debouncer
    const needsToScheduleAddToQueue = (
      stream.isPlaying &&
      playback.isPlaying &&
      !playback.addToQueueTimeoutId
    );
    if(!needsToScheduleAddToQueue) {
      return;
    }

    if(!stream?.nowPlaying) {
      return;
    }

    // schedule add to queue
    const progress = Date.now() - stream.startedAt,
          timeLeft = (
            stream.nowPlaying.totalDurationMilliseconds - progress
          ),
          timeoutDuration = timeLeft - 5000;
    const timeoutId = setTimeout(() => {
      addToQueue();
    }, timeoutDuration);
    props.dispatch({
      type: 'playback/addToQueueScheduled',
      payload: { addToQueueTimeoutId: timeoutId },
    });

    // schedule seek
    const arr = getPositionMilliseconds(),
          seekTimeoutDuration = arr[1];
    if(seekTimeoutDuration) {
      const seekTimeoutId = setTimeout(() => {
        seek();
      }, seekTimeoutDuration);
      // setNextSeekTimeoutId(seekTimeoutId);
      props.dispatch({
        type: 'playback/nextSeekScheduled',
        payload: { nextSeekTimeoutId: seekTimeoutId },
      });
    }

  // eslint-disable-next-line
  }, [playback]);

  //////////////////////////////////////////////////////////////////////////////
  // SCHEDULE PLANNED NEXT TRACK
  // Happens at the very end of the currently playing track.
  useEffect(() => {

    // debouncer
    if(!messageScheduleNextTrack) {
      return;
    }
    setMessageScheduleNextTrack(false);

    // schedule next track
    const progress = Date.now() - stream.startedAt,
          timeoutDuration = (
            stream.nowPlaying.totalDurationMilliseconds - progress
          );
    const timeoutId = setTimeout(() => {
      plannedNextTrack();
    }, timeoutDuration);
    clearTimeout(plannedNextTrackTimeoutId);
    setPlannedNextTrackTimeoutId(timeoutId);

  // eslint-disable-next-line
  }, [messageScheduleNextTrack]);

  // Play the music.
  if(stream.isPlaying && !playback.isPlaying && playback.isReady) {
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
        <Player nextTrack={nextTrack}
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
    playback: state.playback,
});

export default connect(mapStateToProps)(PlaybackWrapper);
