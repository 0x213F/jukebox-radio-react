import React, { useState } from "react";
import { connect } from 'react-redux';
import styles from './ProgressBarMarker.module.css';
import { iconUpTriangle, iconTrash } from '../icons';
import { fetchStreamMarkerDelete } from '../../TrackDetailApp/Marker/network';


function ProgressBarMarker(props) {

  const marker = props.marker,
        queueUuid = props.queueUuid,
        editable = props.editable;

  const [hovering, setHovering] = useState(false);

  /*
   * ENTER
   */
  const onMouseEnter = function() {
    setHovering(true);
  }

  /*
   * LEAVE
   */
  const onMouseLeave = function() {
    setHovering(false);
  }

  /*
   * DELETE
   */
  const deleteTrackMarker = async function() {
    const responseJson = await fetchStreamMarkerDelete(marker.uuid, queueUuid);
    await props.dispatch(responseJson.redux);
  }

  return (
    <div className={styles.ProgressBarMarker}
         style={{left: marker.styleLeft}}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}>
      <div className={styles.ProgressBarMarkerPointer}>
        {iconUpTriangle}
      </div>

      {hovering &&
        <div className={styles.ProgressBarMarkerName}>
          {hovering && marker.name}
        </div>
      }

      {hovering && editable &&
        <button className={styles.ProgressBarMarkerDelete}
                onClick={deleteTrackMarker}>
          {iconTrash}
        </button>
      }
    </div>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(ProgressBarMarker);
