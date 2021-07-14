import React, { useState } from "react";
import { connect } from 'react-redux';
import styles from './ProgressBarMarker.module.css';
import { iconTrash, iconPlay, iconMarkerExtension, iconStop } from '../../icons';
import { getProgressMilliseconds } from '../../utils';
import { fetchStreamQueueIntervalStop } from '../../../ModalApp/TrackDetail/Interval/network';


function ProgressBarMarker(props) {

  const marker = props.marker,
        queue = props.queue,
        editable = props.editable,
        playable = props.playable,
        stoppable = props.stoppable,
        forceDisplay = props.forceDisplay,
        allowMarkerSeek = props.allowMarkerSeek,
        hoveringEnabled = props.hoveringEnabled;

  const stream = props.stream,
        playback = props.playback;

  const [hovering, setHovering] = useState(false);

  const classPointer = playable ? "ProgressBarMarkerPointer" : "ProgressBarMarkerPointerGrey",
        classPointerExt = playable ? "ProgressBarMarkerPointerExtension" : "ProgressBarMarkerPointerExtensionGrey";

  /*
   * ENTER
   */
  const onMouseEnter = function() {
    setHovering(true);
    props.setMarkerHover(true);
  }

  /*
   * LEAVE
   */
  const onMouseLeave = function() {
    setHovering(false);
    props.setMarkerHover(false);
  }

  /*
   * SEEK
   */
  const seekToMarker = async function() {
    const progress = getProgressMilliseconds(queue, marker.timestampMilliseconds);
    if(queue.status === 'played') {
      const action = {
        name: "seek",
        timestampMilliseconds: progress,
        status: "kickoff",
        fake: !(playback.nowPlayingUuid === stream.nowPlayingUuid),
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
        fake: { api: !(playback.nowPlayingUuid === stream.nowPlayingUuid) },
      };
      props.dispatch({
        type: "main/addAction",
        payload: { action },
      });
    }
  }

  const stopAtMarker = async function() {
    const responseJson = await fetchStreamQueueIntervalStop(
      queue.uuid,
      marker.uuid,
      queue.parentUuid,
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
        {((hovering && hoveringEnabled) || (forceDisplay && !props.markerHover)) &&
          <div className={styles[classPointerExt]}>
            {iconMarkerExtension}
          </div>
        }

        {((hovering && hoveringEnabled) || (forceDisplay && !props.markerHover)) &&
          <div className={styles.HoverContainer}>

            {(hovering || forceDisplay) &&
              <div className={styles.ProgressBarMarkerName}>
                {marker.name}
              </div>
            }

            {hovering && editable &&
              <button className={styles.Delete}
                      onClick={(e) => {props.deleteTrackMarker(marker)}}>
                {iconTrash}
              </button>
            }

            {hovering && playable && allowMarkerSeek &&
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
  playback: state.playback,
});


export default connect(mapStateToProps)(ProgressBarMarker);
