import React, { useState } from "react";
import { connect } from 'react-redux';
import styles from './ChildProgressBar.module.css';
import { iconMarker, iconTrash, iconPlay } from '../icons';
import { getProgressMilliseconds } from '../utils';


function ChildProgressBar(props) {

  /*
   * 🏗
   */
  const interval = props.interval,
        duration = props.duration,
        queue = props.queue,
        editable = props.editable,
        allowIntervalPlay = props.allowIntervalPlay,
        allowIntervalDelete = props.allowIntervalDelete;

  const intervalWidthDuration = interval.endPosition - interval.startPosition,
        intervalWidth = intervalWidthDuration / duration * 100;

  let cleanedPurpose;
  cleanedPurpose = interval.purpose.includes('solo') ? 'solo' : interval.purpose;
  cleanedPurpose = cleanedPurpose.charAt(0).toUpperCase() + cleanedPurpose.slice(1);
  const progressClass = "Progress" + cleanedPurpose;

  const classHoverContainer = "ProgressHoverContainer" + cleanedPurpose,
        classHoverPointer = "ProgressHoverPointer" + cleanedPurpose;

  /*
   * Hovering logic
   */
  const [hovering, setHovering] = useState(false);

  const onMouseEnter = function() {
    setHovering(true);
  }

  const onMouseLeave = function() {
    setHovering(false);
  }

  const seekToInterval = async function() {
    const progress = getProgressMilliseconds(queue, interval.startPosition);
    if(queue.status === 'played') {
      const action = {
        name: "seek",
        timestampMilliseconds: progress,
        status: "kickoff",
        fake: false,
      };
      props.dispatch({
        type: "main/addAction",
        payload: { action },
      });
    } else {
      const action = {
        name: "play",
        timestampMilliseconds: progress,
        status: "kickoff",
        fake: { api: false },
      };
      props.dispatch({
        type: "main/addAction",
        payload: { action },
      });
    }
  }

  /*
   * 🎨
   */
  return (
    <div className={styles[progressClass]}
         style={{width: `${intervalWidth}%`}}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}>
      {editable && hovering &&
        <div className={styles[classHoverContainer]}>
          <div className={styles[classHoverPointer]}>
            {iconMarker}
          </div>

          <div className={styles.HoverContainer}>
            <div className={styles.ProgressHoverPurpose}>
              {interval.purpose}
            </div>
            {interval.uuid && allowIntervalDelete &&
              <button className={styles.ProgressHoverDelete}
                      onClick={(e) => {props.deleteTrackInterval(interval)}}>
                {iconTrash}
              </button>
            }
            {allowIntervalPlay && cleanedPurpose !== 'Muted' &&
              <button className={styles.ProgressHoverDelete}
                      onClick={seekToInterval}>
                {iconPlay}
              </button>
            }
          </div>
        </div>
      }
    </div>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(ChildProgressBar);
