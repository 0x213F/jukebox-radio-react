import { connect } from 'react-redux'
import styles from './QueueApp.module.css';
import { fetchDeleteQueue } from './network'
import QueueCollection from './QueueCollection/QueueCollection'
import QueueTrack from './QueueTrack/QueueTrack'


function QueueApp(props) {

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
      <h4><i>Last up...</i></h4>
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
        <h4><i>Now playing...</i></h4>
        <p>{props.stream?.nowPlaying?.track?.name}</p>
      </div>
      <h2><i>Next up...</i></h2>
      <div>
        {props.nextUpQueues.map((value, index) => {
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


export default connect(mapStateToProps)(QueueApp);
