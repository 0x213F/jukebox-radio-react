import React, { useState } from "react";
import { connect } from 'react-redux'
import EditTrack from '../EditTrack/EditTrack'
import styles from './QueueTrack.module.css';


function QueueTrack(props) {

  /*
   * 🏗
   */
  const queue = props.data,
        stream = props.stream,
        lastUp = props.lastUp;

  const [showEditing, setShowEditing] = useState(false);

  const edit = async function(e) {
    setShowEditing(true);
  }

  const save = async function(e) {
    setShowEditing(false);
  }

  /*
   * 🎨
   */
  const currentIndex = stream?.nowPlaying?.index || lastUp?.index;
  const isNextUp = !currentIndex || currentIndex < queue.index;
  const indent = queue.parentUuid && isNextUp ? '-' : '';
  return (
    <div className={styles.QueueTrack}>
      <span>
        {indent}
        {queue.track.name}
      </span>
      {isNextUp &&
        <>
          <button className={styles.Button} type="button" onClick={async (e) => { await props.destroy(queue); }}>
            Delete
          </button>
          {!showEditing &&
            <button className={styles.Button} type="button" onClick={edit}>
              Edit
            </button>
          }
          {showEditing &&
            <button className={styles.Button} type="button" onClick={save}>
              Save
            </button>
          }
        </>
      }
      {showEditing &&
        <EditTrack />
      }
    </div>
  );
}

const mapStateToProps = (state) => ({
  stream: state.stream,
  lastUp: state.lastUp,
});

export default connect(mapStateToProps)(QueueTrack);
