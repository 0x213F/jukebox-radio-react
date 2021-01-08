import { useState } from "react";
import { connect } from 'react-redux'
// import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { fetchListQueues } from '../Queue/network'
import {
  fetchNextTrack,
  fetchPauseTrack,
  fetchPlayTrack,
  fetchPreviousTrack,
  fetchScanBackward,
  fetchScanForward,
} from './network'


function Player(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        track = stream?.nowPlaying?.track,
        nextUp = props.nextUp,
        lastUp = props.lastUp;

  const [key, setKey] = useState(0);

  /*
   * When...
   */
  const handlePrevTrack = async function(e) {
    e.preventDefault();

    const responseJson = await fetchPreviousTrack();

    const jsonResponse = await fetchListQueues();
    const { nextUpQueues, lastUpQueues } = jsonResponse.data;

    await props.dispatch({
      type: 'stream/prevTrack',
      startedAt: responseJson.data.startedAt,
    });

    props.dispatch({
      type: 'queue/listSet',
      lastUpQueues: lastUpQueues,
      nextUpQueues: nextUpQueues,
    });
  }

  /*
   * When...
   */
  const handleNextTrack = async function(e) {
    if(e) {
      e.preventDefault();
    }

    const responseJson = await fetchNextTrack();

    const jsonResponse = await fetchListQueues();
    const { nextUpQueues, lastUpQueues } = jsonResponse.data;

    await props.dispatch({
      type: 'stream/nextTrack',
      startedAt: responseJson.data.startedAt,
    });

    props.dispatch({
      type: 'queue/listSet',
      lastUpQueues: lastUpQueues,
      nextUpQueues: nextUpQueues,
    });
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

    console.log(stream.startedAt, startedAt)
    console.log(stream.startedAt - startedAt)

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
      <div>
        <p><i>Previous...</i></p>
        <p>{lastUp?.track?.name}</p>
      </div>

      <div>
        <p><i>Now playing...</i></p>
        {(stream?.isPlaying || stream?.isPaused) &&
          <p>{track?.name}</p>
        }
        {(!stream?.isPlaying && !stream?.isPaused) &&
          <p>Waiting...</p>
        }
      </div>

      <div>
        <button onClick={handlePrevTrack}>Prev</button>
        {stream?.isPaused &&
          <button onClick={handlePlayTrack}>Play</button>
        }
        {stream?.isPlaying &&
          <button onClick={handlePauseTrack}>Pause</button>
        }
        <button onClick={handleNextTrack}>Next</button>
      </div>
      <div>
        {(stream?.isPlaying) &&
          <button onClick={handleScanBackward}>Backward</button>
        }
        {(stream?.isPlaying) &&
          <button onClick={handleScanForward}>Forward</button>
        }
      </div>

      <div>
        <p><i>Next...</i></p>
        <p>{nextUp?.track.name}</p>
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
    stream: state.stream,
    lastUp: state.lastUp,
    lastUpQueues: state.lastUpQueues,
    nextUp: state.nextUp,
    nextUpQueues: state.nextUpQueues,
});

export default connect(mapStateToProps)(Player);
