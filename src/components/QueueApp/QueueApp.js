import { connect } from 'react-redux'
import { Link } from "react-router-dom";
import styles from './QueueApp.module.css';
import { fetchDeleteQueue } from './network'
import QueueCollection from './QueueCollection/QueueCollection'
import QueueTrack from './QueueTrack/QueueTrack'
import { getQueueDuration } from './utils';
import ReactTimeAgo from 'react-time-ago';


function QueueApp(props) {

  const nextUpQueues = props.nextUpQueues,
        stream = props.stream,
        queueMap = props.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid];

  const queueDuration = getQueueDuration(nextUpQueues, nowPlaying);
  const endsAt = new Date(Date.now() + queueDuration);

  /*
   * Called inside a child component, this first deletes the queue from the
   * backend, then, on success, it deletes it from the front-end model and
   * view.
   */
  const destroyQueueItem = async function(queue) {
    const queueUuid = queue.uuid;

    await fetchDeleteQueue(queueUuid);

    const parentUuid = queue.parentUuid;
    if(parentUuid) {
      props.dispatch({
        type: 'queue/deleteChildNode',
        parentUuid: parentUuid,
        queueUuid: queueUuid,
      });
    } else {
      props.dispatch({
        type: 'queue/deleteNode',
        queueUuid: queueUuid,
      });
    }
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.QueueApp}>
      {  // eslint-disable-next-line
      nextUpQueues.map((value, index) => {
        if(value.collection) {
          return (
            <QueueCollection key={index}
                             data={value}
                             destroy={destroyQueueItem}
                             playbackControls={props.playbackControls}>
            </QueueCollection>
          );
        } else if(value.track) {
          return (
            <QueueTrack key={index}
                        data={value}
                        destroy={destroyQueueItem}
                        playbackControls={props.playbackControls}>
            </QueueTrack>
          );
        }
      })}
      <div className={styles.PlaybackDuration}>
        {queueDuration ?
          (
            <>
              Playback will end&nbsp;
              <ReactTimeAgo future date={endsAt} locale="en-US" />
            </>
          ) : (
            <>
              There is nothing in the queue.
            </>
          )
        }
      </div>
      <Link to="/app/search">
        <button className={styles.AddToQueue}>
          Add To Queue
        </button>
      </Link>
    </div>
  );
}


const mapStateToProps = (state) => ({
  stream: state.stream,
  queueMap: state.queueMap,
  nextUpQueues: state.nextUpQueues,
  lastUpQueues: state.lastUpQueues,
});


export default connect(mapStateToProps)(QueueApp);
