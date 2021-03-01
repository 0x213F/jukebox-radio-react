import React, { useState } from "react";
import { connect } from 'react-redux'
import styles from './QueueCollection.module.css';
import QueueTrack from '../QueueTrack/QueueTrack'


function QueueCollection(props) {

  /*
   * 🏗
   */
  const queue = props.data,
        stream = props.stream,
        lastUpQueues = props.lastUpQueues,
        lastUp = lastUpQueues[lastUpQueues.length - 1],
        queueUuid = queue.uuid;

  const isCurrentlyPlayingCollection = (
    // Stream is NOW playing - "now playing" belongs to same parent UUID
    (stream?.nowPlaying && stream?.nowPlaying?.parentUuid === queueUuid) ||
    // Stream is NOT playing - "last up" belongs to same parent UUID
    (!stream?.nowPlaying && lastUp?.parentUuid && lastUp?.parentUuid === queueUuid)
  );


  const [reveal, setReveal] = useState(isCurrentlyPlayingCollection);

  /*
   * When...
   */
  const toggleReveal = function(e) {
    setReveal(!reveal);
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.QueueCollection}>
      <div className={styles.Item}>
        <span>
          <i>
            {queue.collection.name}
          </i>
        </span>
        &nbsp;&nbsp;
        {queue.children.length > 0 && !reveal &&
          <button className={styles.Button} type="button" onClick={toggleReveal}>
            More
          </button>
        }&nbsp;&nbsp;
        {queue.children.length > 0 && reveal &&
          <button className={styles.Button} type="button" onClick={toggleReveal}>
            Less
          </button>
        }&nbsp;&nbsp;
        {!isCurrentlyPlayingCollection &&
          <button className={styles.Button} type="button" onClick={async (e) => { await props.destroy(queue); }}>
            Delete
          </button>
        }
      </div>
      {queue.children.length > 0 && reveal &&
        <div className={styles.Children}>
          {queue.children.map((value, index) => (
            <QueueTrack key={index}
                        data={value}
                        destroy={props.destroy}>
            </QueueTrack>
          ))}
        </div>
      }
    </div>
  );

}

const mapStateToProps = (state) => ({
  stream: state.stream,
  lastUpQueues: state.lastUpQueues,
});

export default connect(mapStateToProps)(QueueCollection);
