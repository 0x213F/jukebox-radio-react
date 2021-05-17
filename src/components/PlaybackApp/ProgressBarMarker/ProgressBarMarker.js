import React, { useState } from "react";
import { connect } from 'react-redux';
import styles from './ProgressBarMarker.module.css';
import { iconTrash, iconPlay, iconMarkerExtension, iconStop } from '../icons';
import { fetchStreamMarkerDelete } from '../../TrackDetailApp/Marker/network';


function ProgressBarMarker(props) {

  const marker = props.marker,
        queueUuid = props.queueUuid,
        editable = props.editable,
        playable = props.playable,
        forceDisplay = props.forceDisplay,
        playbackControls = props.playbackControls;

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

  /*
   * SEEK
   */
  const seekToMarker = async function() {
    playbackControls.seek(marker.timestampMilliseconds);
  }

  return (
    <div className={styles.ProgressBarMarker}
         style={{left: marker.styleLeft}}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}>

      <div className={styles.ProgressBarMarkerPointer}>
        {(hovering || forceDisplay) &&
          <div className={styles.ProgressBarMarkerPointerExtension}>
            {iconMarkerExtension}
          </div>
        }

        {(hovering || forceDisplay) &&
          <div className={styles.HoverContainer}>

            {(hovering || forceDisplay) &&
              <div className={styles.ProgressBarMarkerName}>
                {marker.name}
              </div>
            }

            {hovering && editable &&
              <button className={styles.Delete}
                      onClick={deleteTrackMarker}>
                {iconTrash}
              </button>
            }

            {hovering && playable &&
              <button className={styles.Play}
                      onClick={seekToMarker}>
                {iconPlay}
              </button>
            }

            {hovering && playable &&
              <button className={styles.Stop}
                      onClick={seekToMarker}>
                {iconStop}
              </button>
            }
          </div>
        }
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(ProgressBarMarker);
