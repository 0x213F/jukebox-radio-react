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
        stream = props.stream;

  const queueDuration = getQueueDuration(nextUpQueues, stream);
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
      <div>
        {  // eslint-disable-next-line
        nextUpQueues.map((value, index) => {
          if(value.collection) {
            return (
              <QueueCollection key={value.uuid}
                               data={value}
                               destroy={destroyQueueItem}>
              </QueueCollection>
            );
          } else if(value.track) {
            return (
              <QueueTrack key={value.uuid}
                          data={value}
                          destroy={destroyQueueItem}>
              </QueueTrack>
            );
          }
        })}
        <div className={styles.PlaybackDuration}>
          {queueDuration ?
            (
              <p>
                Playback will end&nbsp;
                <ReactTimeAgo future date={endsAt} locale="en-US" />
              </p>
            ) : (
              <p>
                There is nothing in the queue.
              </p>
            )
          }
        </div>
        <Link to="/app/search">
          <button className={styles.AddToQueue}>
            Add To Queue
          </button>
        </Link>
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({
  stream: state.stream,
  nextUpQueues: state.nextUpQueues,
  lastUpQueues: state.lastUpQueues,
});


export default connect(mapStateToProps)(QueueApp);
