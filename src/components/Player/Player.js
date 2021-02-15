import { useState } from "react";
import { connect } from 'react-redux'
// import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import styles from './Player.module.css';
import { fetchTextCommentList, fetchVoiceRecordingList } from '../Chat/network';


function Player(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        playback = props.playback,
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

  // NOTE: This is a temporary mechanism to allow the user to refresh the
  //       progress value on the front-end.
  // eslint-disable-next-line
  const [counter, setCounter] = useState(0);

  /*
   * A function used to calculate time elapsed since the now playing track was
   * started.
   */
  const getProgress = function() {
    if(stream?.isPaused) {
      return stream.pausedAt - stream.startedAt;
    } else if(stream?.isPlaying) {
      return Date.now() - stream.startedAt;
    } else {
      return undefined;
    }
  };

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
   * Go back and play the track that was last playing. Update the feed
   */
  const handlePrevTrack = async function() {
    props.prevTrack();
    await updateFeed();
  }

  /*
   * When...
   */
  const handleNextTrack = async function() {
    await props.nextTrack();
    await updateFeed();
  }

  const handleRefreshProgress = function() {
    setCounter(prev => prev + 1);
  }

  // BUG: Edge case needed to refresh the webpage. In the future, there should
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
        {getProgress() || 'Waiting...'}
      </div>

      <div className={styles.Div}>
        <button className={styles.Button}
                onClick={handlePrevTrack}
                disabled={!playback.controlsEnabled}>
          Prev
        </button>
        {stream?.isPaused &&
          <button className={styles.Button}
                  onClick={props.play}
                  disabled={!playback.controlsEnabled}>
            Play
          </button>
        }
        {stream?.isPlaying &&
          <button className={styles.Button}
                  onClick={props.pause}
                  disabled={!playback.controlsEnabled}>
            Pause
          </button>
        }
        <button className={styles.Button}
                onClick={handleNextTrack}
                disabled={!playback.controlsEnabled}>
          Next
        </button>
      </div>
      <div className={styles.Div}>
        {(stream?.isPlaying) &&
          <button className={styles.Button}
                  onClick={() => { props.seek('backward'); }}
                  disabled={!playback.controlsEnabled}>
            Backward
          </button>
        }
        {(stream?.isPlaying) &&
          <button className={styles.Button}
                  onClick={() => { props.seek('forward'); }}
                  disabled={!playback.controlsEnabled}>
            Forward
          </button>
        }
        {(stream?.isPlaying) &&
          <button className={styles.Button}
                  onClick={handleRefreshProgress}
                  disabled={!playback.controlsEnabled}>
            Progress
          </button>
        }
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
    stream: state.stream,
    lastUpQueues: state.lastUpQueues,
    nextUpQueues: state.nextUpQueues,
    playback: state.playback,
});

export default connect(mapStateToProps)(Player);
