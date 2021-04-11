import React, { useState } from "react";
import { connect } from 'react-redux';
import styles from './ChildProgressBar.module.css';
import { iconUpTriangle, iconTrash } from '../icons';
import { fetchStreamQueueIntervalDelete } from '../../TrackDetailApp/Interval/network';


function ChildProgressBar(props) {

  /*
   * 🏗
   */
  const interval = props.interval,
        duration = props.duration,
        queue = props.queue,
        editable = props.editable;

  const intervalWidthDuration = interval.endPosition - interval.startPosition,
        intervalWidth = intervalWidthDuration / duration * 400;

  let cleanedPurpose;
  cleanedPurpose = interval.purpose.includes('solo') ? 'solo' : interval.purpose;
  cleanedPurpose = cleanedPurpose.charAt(0).toUpperCase() + cleanedPurpose.slice(1);

  const progressClass = "Progress" + cleanedPurpose;

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

  /*
   *
   */
  const deleteTrackInterval = async function() {
    const responseJson = await fetchStreamQueueIntervalDelete(
      interval.uuid, queue.uuid, queue.parentUuid
    );
    await props.dispatch(responseJson.redux);
  }

  /*
   * 🎨
   */
  return (
    <div className={styles[progressClass]}
         style={{width: `${intervalWidth}px`}}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}>
      {editable && hovering &&
        <div className={styles.ProgressHoverContainer}>
          <div className={styles.ProgressHoverPointer}
               style={{marginLeft: `${(intervalWidth / 2) - 11}px`}}>
            {iconUpTriangle}
          </div>
          <div className={styles.ProgressHoverPurpose}
               style={{marginLeft: `${(intervalWidth / 2) - 11}px`}}>
            {interval.purpose}
          </div>
          {interval.uuid &&
            <button className={styles.ProgressHoverDelete}
                    onClick={deleteTrackInterval}>
              {iconTrash}
            </button>
          }
        </div>
      }
    </div>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(ChildProgressBar);
