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
        intervalWidth = intervalWidthDuration / duration * 100;

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
         style={{width: `${intervalWidth}%`}}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}>
      {editable && hovering &&
        <div className={styles.ProgressHoverContainer}>
          <div className={styles.ProgressHoverPointer}>
            {iconUpTriangle}
          </div>

          <div className={styles.HoverContainer}>
            <div className={styles.ProgressHoverPurpose}>
              {interval.purpose}
            </div>
            {interval.uuid &&
              <button className={styles.ProgressHoverDelete}
                      onClick={deleteTrackInterval}>
                {iconTrash}
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
