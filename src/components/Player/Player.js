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
import { fetchTextComments, fetchVoiceRecordings } from '../Chat/network'
import { addToQueue, start, play, pause } from './controls';


function Player(props) {

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

  const [nextTrackTimeout, setNextTrackTimeout] = useState(undefined);

  /*
   * ...
   */
  const getProgress = useCallback(() => (
    stream ?
    (
      stream.pausedAt ?
        stream.pausedAt - stream.startedAt:
        Date.now() - stream.startedAt
    ) :
    undefined
  ), [stream]);

  const trackDuration = stream?.nowPlaying?.totalDurationMilliseconds;

  /*
   *
   */
  const updateFeed = useCallback(async function() {
    // load comments
    const textCommentsJsonResponse = await fetchTextComments();
    await props.dispatch({
      type: 'textComment/listSet',
      textComments: textCommentsJsonResponse.data,
    });

    // load voice recordings
    const voiceRecordingsJsonResponse = await fetchVoiceRecordings();
    await props.dispatch({
      type: 'voiceRecording/listSet',
      voiceRecordings: voiceRecordingsJsonResponse.data,
    });
  }, [props]);

  /*
   * When...
   */
  const handlePrevTrack = async function() {
    start(undefined);

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
    if(remaining <= 3000) {
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
  const handlePlayTrack = async function(e) {
    e.preventDefault();

    play(undefined);

    const jsonResponse = await fetchPlayTrack();
    props.dispatch({
      type: 'stream/set',
      stream: {
        ...stream,
        isPlaying: true,
        isPaused: false,
        playedAt: jsonResponse.data.playedAt,
      },
    });
  }

  /*
   * When...
   */
  const handlePauseTrack = async function(e) {
    e.preventDefault();

    pause(undefined);

    const jsonResponse = await fetchPauseTrack();

    props.dispatch({
      type: 'stream/set',
      stream: {
        ...stream,
        isPlaying: false,
        isPaused: true,
        pausedAt: jsonResponse.data.pausedAt,
      },
    });

    clearTimeout(nextTrackTimeout);
    setNextTrackTimeout(undefined);
  }

  /*
   * When...
   */
  const handleScanBackward = async function(e) {
    e.preventDefault();

    await fetchScanBackward();

    const date = new Date();
    const epochNow = date.getTime();

    const proposedStartedAt = stream.startedAt + 10000;
    const proposedProgress = epochNow - proposedStartedAt;
    const startedAt = proposedProgress > 0 ? proposedStartedAt : epochNow;

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
      const timeout = trackDuration - progress - 3000,
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
