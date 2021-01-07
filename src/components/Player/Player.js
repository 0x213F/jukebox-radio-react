import { useEffect } from "react";
import { connect } from 'react-redux'
// import { CountdownCircleTimer } from 'react-countdown-circle-timer'
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

  /*
   * When...
   */
  const handlePrevTrack = async function(e) {
    e.preventDefault();
    await fetchPreviousTrack();
  }

  /*
   * When...
   */
  const handleNextTrack = async function(e) {
    if(e) {
      e.preventDefault();
    }

    await fetchNextTrack();

    props.dispatch({
      type: 'queue/deleteNode',
      queueUuid: nextUp.uuid,
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

    const proposedPlayedAt = stream.playedAt + 10 ;
    const proposedProgress = epochNow - (proposedPlayedAt * 1000);
    const playedAt = proposedProgress > 0 ? proposedPlayedAt : Math.floor(epochNow / 1000);

    props.dispatch({
      type: 'stream/set',
      stream: { ...stream, playedAt: playedAt },
    });
  }

  /*
   * When...
   */
  const handleScanForward = async function(e) {
    e.preventDefault();

    const responseJson = await fetchScanForward();

    props.dispatch({
      type: 'stream/set',
      stream: { ...stream, playedAt: stream.playedAt - (10) },
    });
  }

  console.log(lastUp)

  return (
    <>
      <div>
        <p><i>Previous...</i></p>
        <p>{lastUp?.track.name}</p>
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
    nextUp: state.nextUp,
    lastUp: state.lastUp,
});

export default connect(mapStateToProps)(Player);
