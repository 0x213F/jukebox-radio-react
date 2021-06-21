import { connect } from 'react-redux'
import { Link } from "react-router-dom";
import styles from './QueueApp.module.css';
import { fetchDeleteQueue } from './network'
import QueueCollection from './QueueCollection/QueueCollection'
import QueueTrack from './QueueTrack/QueueTrack'
import { getQueues, getQueueDuration, durationPretty, durationWords } from './utils';


function QueueApp(props) {

  const nextUpQueueUuids = props.nextUpQueueUuids,
        stream = props.stream,
        queueMap = props.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid];

  const nextUpQueues = getQueues(nextUpQueueUuids, queueMap);

  const queueDuration = getQueueDuration(nextUpQueues, nowPlaying);

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

  const handleSearch = function() {
    props.dispatch({
      type: "sideBar/selectTab",
      payload: { tab: "search" },
    });
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.QueueApp}>
      <div className={styles.NowPlaying}>
        {nowPlaying?.track?.uuid &&
          <>
            <div className={styles.NowPlayingArt}>
              <img src={nowPlaying?.track?.imageUrl} alt={"Album Art"} />
            </div>

            <div className={styles.NowPlayingInformation}>
              <h5>{nowPlaying?.track?.name}</h5>
              <h6>{nowPlaying?.track?.artistName}</h6>
            </div>

            <div className={styles.NowPlayingDuration}>
              {durationPretty(nowPlaying?.track?.durationMilliseconds)}
            </div>
          </>
        }
      </div>
      <div className={styles.QueueContainer}>
        {  // eslint-disable-next-line
        nextUpQueues.map((value, index) => {
          if(value.collection) {
            return (
              <QueueCollection key={index}
                               queueUuid={value.uuid}
                               destroy={destroyQueueItem}
                               playbackControls={props.playbackControls}>
              </QueueCollection>
            );
          } else if(value.track) {
            return (
              <QueueTrack key={index}
                          queueUuid={value.uuid}
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
                Playback will end {durationWords(queueDuration)}
              </>
            ) : (
              <>
                There is nothing in the queue
              </>
            )
          }
        </div>
        <Link onClick={handleSearch} to="/app/search">
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
  queueMap: state.queueMap,
  nextUpQueueUuids: state.nextUpQueueUuids,
  lastUpQueueUuids: state.lastUpQueueUuids,
});


export default connect(mapStateToProps)(QueueApp);
