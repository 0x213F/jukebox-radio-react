import { useState } from "react";
import { connect } from 'react-redux'
// import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import styles from './Player.module.css';
import { fetchQueueList } from '../Queue/network'
import {
  fetchNextTrack,
  fetchPauseTrack,
  fetchPlayTrack,
  fetchPrevTrack,
  fetchScanBackward,
  fetchScanForward,
} from './network'
import { fetchTextComments, fetchVoiceRecordings } from '../Chat/network'


function Player(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        playback = props.playback,
        track = stream?.nowPlaying?.track,
        nextUp = props.nextUp,
        lastUp = props.lastUp;

  const [key, setKey] = useState(0);


  /*
   *
   */
  const updateFeed = async function() {
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
  }

  /*
   * When...
   */
  const handlePrevTrack = async function() {
    const responseJsonPrevTrack = await fetchPrevTrack(),
          responseJsonQueueList = await fetchQueueList();

    await props.dispatch(responseJsonPrevTrack.redux);
    await props.dispatch(responseJsonQueueList.redux);

    await updateFeed();
  }

  /*
   * When...
   */
  const handleNextTrack = async function() {
    const responseJsonNextTrack = await fetchNextTrack(),
          responseJsonQueueList = await fetchQueueList();

    await props.dispatch(responseJsonNextTrack.redux);
    await props.dispatch(responseJsonQueueList.redux);

    await updateFeed();
  }

  /*
   * When...
   */
  const handlePlayTrack = async function(e) {
    e.preventDefault();

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
      stream: { ...stream, startedAt: startedAt },
    });
    setKey(key + 1);
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
      stream: { ...stream, startedAt: stream.startedAt - (10000) },
    });
    setKey(key + 1);
  }

  if(stream?.isPlaying && !playback.nowPlaying) {
    props.dispatch({ type: 'playback/play' });
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

  // const progress = (
  //   stream ?
  //   (
  //     stream.pausedAt ?
  //       stream.pausedAt - stream.startedAt:
  //       Date.now() - stream.startedAt
  //   ) :
  //   undefined
  // );
  // const trackDuration = stream?.nowPlaying?.track?.durationMilliseconds;

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
    playback: state.playback,
    lastUp: state.lastUp,
    lastUpQueues: state.lastUpQueues,
    nextUp: state.nextUp,
    nextUpQueues: state.nextUpQueues,
});

export default connect(mapStateToProps)(Player);
