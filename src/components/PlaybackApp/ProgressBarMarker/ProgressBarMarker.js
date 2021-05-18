import React, { useState } from "react";
import { connect } from 'react-redux';
import styles from './ProgressBarMarker.module.css';
import { iconTrash, iconPlay, iconMarkerExtension, iconStop } from '../icons';
import { getProgressMilliseconds } from '../utils';
import { fetchStreamMarkerDelete } from '../../TrackDetailApp/Marker/network';
import { fetchStreamQueueIntervalStop } from '../../TrackDetailApp/Interval/network';


function ProgressBarMarker(props) {

  const marker = props.marker,
        queueUuid = props.queueUuid,
        editable = props.editable,
        playable = props.playable,
        stoppable = props.stoppable,
        forceDisplay = props.forceDisplay,
        playbackControls = props.playbackControls;

  const stream = props.stream;

  const [hovering, setHovering] = useState(false);

  const classPointer = playable ? "ProgressBarMarkerPointer" : "ProgressBarMarkerPointerGrey",
        classPointerExt = playable ? "ProgressBarMarkerPointerExtension" : "ProgressBarMarkerPointerExtensionGrey";

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
    const progress = getProgressMilliseconds(stream, marker.timestampMilliseconds);
    if(stream.isPaused) {
      playbackControls.play(progress);
    } else {
      playbackControls.seek(progress);
    }
  }

  const stopAtMarker = async function() {
    const responseJson = await fetchStreamQueueIntervalStop(
      stream.nowPlaying.uuid,
      marker.uuid,
      stream.nowPlaying.parentUuid,
    );

    for(const [_type, payloads] of Object.entries(responseJson.redux.payload)) {
      for(const payload of payloads) {
        props.dispatch({
          type: _type,
          payload: payload,
        });
      }
    }
  }

  return (
    <div className={styles.ProgressBarMarker}
         style={{left: marker.styleLeft}}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}>

      <div className={styles[classPointer]}>
        {(hovering || forceDisplay) &&
          <div className={styles[classPointerExt]}>
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

            {hovering && stoppable && false &&
              <button className={styles.Stop}
                      onClick={stopAtMarker}>
                {iconStop}
              </button>
            }
          </div>
        }
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({
  stream: state.stream,
});


export default connect(mapStateToProps)(ProgressBarMarker);
