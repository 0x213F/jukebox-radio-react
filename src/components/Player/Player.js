import { useState, useEffect, useCallback } from "react";
import { connect } from 'react-redux'
// import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import styles from './Player.module.css';
import {
  fetchNextTrack,
  fetchPauseTrack,
  fetchPlayTrack,
  fetchPrevTrack,
  fetchScanBackward,
  fetchScanForward,
} from './network'
import { fetchTextCommentList, fetchVoiceRecordingList } from '../Chat/network';
import { addToQueue, start, play, pause } from './controls';


function Player(props) {

  const PRELOAD_DURATION = 3000;

  /*
   * 🏗
   */
  const stream = props.stream,
        track = stream?.nowPlaying?.track,
        lastUpQueues = props.lastUpQueues,
        lastUp = lastUpQueues[lastUpQueues.length - 1],
        nextUpQueues = props.nextUpQueues,
        nextUp = (
          nextUpQueues.length ?
            (nextUpQueues[0].children.length ?
              nextUpQueues[0].children[0] :
              nextUpQueues[0]) :
            undefined
        );

  const trackDuration = stream?.nowPlaying?.totalDurationMilliseconds;

  const [nextTrackTimeout, setNextTrackTimeout] = useState(undefined);
  const [counter, setCounter] = useState(0);

  /*
   * A function used to calculate time elapsed since the now playing track was
   * started.
   */
  const getProgress = useCallback(() => {
    if(stream?.isPaused) {
      return stream.pausedAt - stream.startedAt;
    } else if(stream?.isPlaying) {
      return Date.now() - stream.startedAt;
    } else {
      return undefined;
    }
  }, [stream]);

  /*
   * Load comments and voice recordings to update the feed.
   */
  const updateFeed = useCallback(async function() {
    const responseJsonTextCommentList = await fetchTextCommentList();
    const responseJsonVoiceRecordingList = await fetchVoiceRecordingList();
    await props.dispatch(responseJsonTextCommentList.redux);
    await props.dispatch(responseJsonVoiceRecordingList.redux);
  }, [props]);

  /*
   * Go back and play the track that was last playing.
   */
  const handlePrevTrack = async function() {
    start(lastUp);

    const responseJsonPrevTrack = await fetchPrevTrack();
    await props.dispatch(responseJsonPrevTrack.redux);

    await updateFeed();

    clearTimeout(nextTrackTimeout);
    setNextTrackTimeout(undefined);
  }

  /*
   * When...
   */
  const handleNextTrack = useCallback(async function() {
    const responseJsonNextTrack = await fetchNextTrack();

    const remaining = trackDuration - getProgress();
    if(remaining <= PRELOAD_DURATION) {
      addToQueue(undefined);
    } else {
      start(undefined);
    }

    await props.dispatch(responseJsonNextTrack.redux);
    await updateFeed();

    clearTimeout(nextTrackTimeout);
    setNextTrackTimeout(undefined);
  }, [getProgress, nextTrackTimeout, props, trackDuration, updateFeed]);

  /*
   * When...
   */
  const handlePlayTrack = async function() {
    play();

    const jsonResponse = await fetchPlayTrack();
    props.dispatch(jsonResponse.redux);
  }

  /*
   * When...
   */
  const handlePauseTrack = async function() {
    pause();

    const jsonResponse = await fetchPauseTrack();
    props.dispatch(jsonResponse.redux);

    clearTimeout(nextTrackTimeout);
    setNextTrackTimeout(undefined);
  }

  /*
   * When...
   */
  const handleScanBackward = async function(e) {
    e.preventDefault();

    await fetchScanBackward();

    const date = new Date(),
          epochNow = date.getTime();

    const proposedStartedAt = stream.startedAt + 10000,
          proposedProgress = epochNow - proposedStartedAt,
          startedAt = proposedProgress > 0 ? proposedStartedAt : epochNow;

    await props.dispatch({
      type: 'stream/set',
      payload: {stream: { ...stream, startedAt: startedAt }},
    });

    clearTimeout(nextTrackTimeout)
    setNextTrackTimeout(undefined);
  }

  /*
   * When...
   */
  const handleScanForward = async function(e) {
    e.preventDefault();

    const response = await fetchScanForward();

    if(response.system.status === 400) {
      return;
    }

    await props.dispatch({
      type: 'stream/set',
      payload: {stream: { ...stream, startedAt: stream.startedAt - (10000) }},
    });

    clearTimeout(nextTrackTimeout);
    setNextTrackTimeout(undefined);
  }

  const handleRefreshProgress = function() {
    setCounter(counter + 1);
  }

  /*
   * When...
   */
  // const handleIdle = async function() {
  //   await props.dispatch({
  //     type: "stream/expire",
  //   });
  //
  //   await props.dispatch({
  //     type: "queue/listSet",
  //     lastUpQueues: props.lastUpQueues,
  //     nextUpQueues: props.nextUpQueues,
  //   });
  // }

  /*
   * Schedule next track
   */
  useEffect(() => {
    const progress = getProgress();
    if(stream?.isPlaying && (progress < trackDuration) && !nextTrackTimeout) {
      const timeout = trackDuration - progress - PRELOAD_DURATION,
            timeoutId = setTimeout(handleNextTrack, timeout);
      setNextTrackTimeout(timeoutId);
    }
  }, [
    nextTrackTimeout, setNextTrackTimeout, handleNextTrack, trackDuration,
    stream, getProgress
  ]);

  /*
   * Schedule next section
   */

  // BUG: edge case needed to refresh the webpage. In the future, there should
  //      be an API endpoint to fetch additional past queue items.
  if(stream?.nowPlaying?.index !== 1 && !lastUp) {
    window.location.reload();
  }

  return (
    <>
      <div className={styles.Div}>
        <p><i>Last...</i></p>
        <p>{lastUp?.track?.name}</p>
      </div>

      <div className={styles.Div}>
        <p><i>Now playing...</i></p>
        {(stream?.isPlaying || stream?.isPaused) &&
          <p>{track?.name}</p>
        }
        {(!stream?.isPlaying && !stream?.isPaused) &&
          <p>Waiting...</p>
        }
      </div>

      <div className={styles.Div}>
        <p><i>Next...</i></p>
        <p>{nextUp?.track.name}</p>
      </div>

      <div className={styles.Div}>
        {getProgress()}
      </div>

      <div className={styles.Div}>
        <button className={styles.Button} onClick={handlePrevTrack}>Prev</button>
        {stream?.isPaused &&
          <button className={styles.Button} onClick={handlePlayTrack}>Play</button>
        }
        {stream?.isPlaying &&
          <button className={styles.Button} onClick={handlePauseTrack}>Pause</button>
        }
        <button className={styles.Button} onClick={handleNextTrack}>Next</button>
      </div>
      <div className={styles.Div}>
        {(stream?.isPlaying) &&
          <button className={styles.Button} onClick={handleScanBackward}>Backward</button>
        }
        {(stream?.isPlaying) &&
          <button className={styles.Button} onClick={handleScanForward}>Forward</button>
        }
        {(stream?.isPlaying) &&
          <button className={styles.Button} onClick={handleRefreshProgress}>Progress</button>
        }
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
    stream: state.stream,
    lastUpQueues: state.lastUpQueues,
    nextUpQueues: state.nextUpQueues,
});

export default connect(mapStateToProps)(Player);
