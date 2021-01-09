import { connect } from 'react-redux'
import styles from './Queue.module.css';
import { fetchDeleteQueue } from './network'
import QueueCollection from '../QueueCollection/QueueCollection'
import QueueTrack from '../QueueTrack/QueueTrack'


function Queue(props) {

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
    <div className={styles.Queue}>
      <p><i>Last up...</i></p>
      <div>
        {props.lastUpQueues.map((value, index) => {
          if(value.track) {
            return (
              <QueueTrack key={index}
                          data={value}
                          destroy={() => {}}>
              </QueueTrack>
            );
          } else {
            return <></>;
          }
        })}
      </div>
      <div>
        <p><i>Now playing...</i></p>
        <p>{props.stream?.nowPlaying?.track.name}</p>
      </div>
      <p><i>Next up...</i></p>
      <div>
        {props.nextUpQueues.map((value, index) => {
          if(value.collection) {
            return (
              <QueueCollection key={index}
                               data={value}
                               destroy={destroyQueueItem}>
              </QueueCollection>
            );
          } else if(value.track) {
            return (
              <QueueTrack key={index}
                          data={value}
                          destroy={destroyQueueItem}>
              </QueueTrack>
            );
          } else {
            return <></>;
          }
        })}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  stream: state.stream,
  nextUpQueues: state.nextUpQueues,
  lastUpQueues: state.lastUpQueues,
});

export default connect(mapStateToProps)(Queue);
