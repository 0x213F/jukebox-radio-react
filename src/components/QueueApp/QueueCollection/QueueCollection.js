import React, { useState } from "react";
import { connect } from 'react-redux'
import styles from './QueueCollection.module.css';
import QueueTrack from '../QueueTrack/QueueTrack';
import { iconExpand, iconCollapse, iconRemove, iconCollapseDisabled, iconRemoveDisabled } from '../icons';
import { durationPretty } from '../utils';


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
    if(isCurrentlyPlayingCollection) {
      return;
    }
    setReveal(!reveal);
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.QueueCollection}>

      <div className={styles.QueueCollectionMain}>
        <div className={[styles.AlbumArtContainer, styles[queue.collection.service]].join(' ')}>
          <img src={queue.collection.imageUrl} alt={"Album Art"} />
        </div>

        <div className={styles.QueueInformation}>
          <h5>{queue.collection.name}</h5>
          <h6>{queue.collection.artistName}</h6>
        </div>

        <div className={styles.DurationContainer}>
          {durationPretty(queue.durationMilliseconds)}
        </div>

        <div className={styles.ButtonContainer}>
          {!isCurrentlyPlayingCollection &&
            <>
              <button type="button" onClick={toggleReveal}>
                {reveal ? iconCollapse: iconExpand}
              </button>
              <button type="button" onClick={async (e) => { await props.destroy(queue); }}>
                {iconRemove}
              </button>
            </>
          }
          {isCurrentlyPlayingCollection &&
            <>
              <button type="button" disabled style={{cursor: "not-allowed"}}>
                {iconCollapseDisabled}
              </button>
              <button type="button" disabled style={{cursor: "not-allowed"}}>
                {iconRemoveDisabled}
              </button>
            </>
          }
        </div>
      </div>

      {queue.children.length > 0 && reveal &&
        <div className={styles.Children}>
          {queue.children.map((value, index) => (
            <QueueTrack key={index}
                        data={value}
                        destroy={props.destroy}
                        playbackControls={props.playbackControls}>
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
