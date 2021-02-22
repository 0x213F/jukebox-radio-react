import { useEffect, useState } from "react";
import { connect } from 'react-redux';

import {
  playbackControlStart,
  playbackControlSeek,
  playbackControlPause,
  playbackControlPlay,
} from './controls';
import { getPositionMilliseconds } from './utils';

import MainApp from '../MainApp/MainApp';
import {
  fetchNextTrack,
  fetchPrevTrack,
  fetchScanBackward,
  fetchScanForward,
  fetchTrackGetFiles,
  fetchPauseTrack,
  fetchPlayTrack,
} from '../Player/network';
import { updateFeed } from '../FeedApp/utils';
import { getLastUpQueue, getNextUpQueue } from '../QueueApp/utils';

import { SERVICE_JUKEBOX_RADIO, SERVICE_SPOTIFY } from '../../config/services';


function PlaybackApp(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        playback = props.playback,
        lastUp = getLastUpQueue(props.lastUpQueues),
        nextUp = getNextUpQueue(props.nextUpQueues);

  const [messageScheduleNextTrack, setMessageScheduleNextTrack] = useState(false);
  const [plannedNextTrackTimeoutId, setPlannedNextTrackTimeoutId] = useState({});
  const [nextTrackJson, setNextTrackJson] = useState({});

  /*
   * When a track is changing from one to another, this boolean logic
   * determines whether or not the currently playing item needs to be paused.
   */
  const shouldPauseOnTrackChange = function(nextPlayingQueue, isPlanned) {
    const nowPlaying = stream.nowPlaying,
          playbackIntervals = nowPlaying.playbackIntervals,
          lastPlaybackInterval = playbackIntervals[playbackIntervals.length - 1];
    return (
      // There must be something now playing.
      nowPlaying?.track &&
      (
        // Everytime a manual upload is currently playing.
        nowPlaying.track.service === SERVICE_JUKEBOX_RADIO ||
        // Currently playing Spotify, nothing is up next.
        (
          nowPlaying.track.service === SERVICE_SPOTIFY &&
          !nextPlayingQueue.track
        ) ||
        // Currently playing Spotify, Spotify is not up next.
        (
          nowPlaying.track.service === SERVICE_SPOTIFY &&
          nextPlayingQueue.track.service !== SERVICE_SPOTIFY &&
          (
            !isPlanned ||
            (
              lastPlaybackInterval[1] !== nowPlaying.totalDurationMilliseconds &&
              isPlanned
            )
          )
        )
      )
    )
  }

  /*
   * This starts the now playing track.
   * NOTE: You may think of this as "playing" the track. However, "play" in
   *       code references different behavior. "Play" is used for toggling the
   *       current track from a "paused" state to "play." "Start" explicitly
   *       plays the track.
   */
  const start = function() {
    if(!stream.nowPlaying?.track) {
      return;
    }
    props.dispatch({ type: 'playback/started' });
    playbackControlStart(playback, stream);
  }

  /*
   * This adds the nextUp item in the queue to play next (add to queue). This
   * happens ~5 seconds before the next item should play.
   */
  const addToQueue = async function() {

    // disable the player UI (until plannedNextTrack happens)
    await props.dispatch({ type: 'playback/disable' });

    // update the back-end
    const responseJsonNextTrack = await fetchNextTrack(
      stream.nowPlaying?.totalDurationMilliseconds, true
    );

    if(nextUp.track.service === SERVICE_JUKEBOX_RADIO) {
      const responseJson = await fetchTrackGetFiles(nextUp.track.uuid);
      await props.dispatch(responseJson.redux);
    }

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
    if(shouldPauseOnTrackChange(nextUp, true)) {
      playbackControlPause(playback, stream);
    }
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
    if(shouldPauseOnTrackChange(lastUp, false)) {
      playbackControlPause(playback, stream);
    }
    if(lastUp.track?.service === SERVICE_JUKEBOX_RADIO) {
      const responseJson = await fetchTrackGetFiles(lastUp.track.uuid);
      await props.dispatch(responseJson.redux);
    }
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
    if(shouldPauseOnTrackChange(nextUp, false)) {
      playbackControlPause(playback, stream);
    }
    if(nextUp?.track.service === SERVICE_JUKEBOX_RADIO) {
      const responseJson = await fetchTrackGetFiles(nextUp.track.uuid);
      await props.dispatch(responseJson.redux);
    }
    const responseJsonNextTrack = await fetchNextTrack(
      stream.nowPlaying?.totalDurationMilliseconds, false
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

    const arr = getPositionMilliseconds(stream, startedAt),
          seekTimeoutDuration = arr[1];
    playbackControlSeek(playback, stream, startedAt);
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
    playbackControlPause(playback, stream);
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
    playbackControlPlay(playback, stream);
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
    const arr = getPositionMilliseconds(stream, stream.startedAt),
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

  const playbackControls = { nextTrack, prevTrack, seek, pause, play };

  /*
   * 🎨
   */
  return (
    <MainApp playbackControls={playbackControls}/>
  );
}

const mapStateToProps = (state) => ({
    stream: state.stream,
    playback: state.playback,
    lastUpQueues: state.lastUpQueues,
    nextUpQueues: state.nextUpQueues,
});

export default connect(mapStateToProps)(PlaybackApp);
