import React, { useState, useEffect, useRef } from "react";

import { connect } from 'react-redux';
import Draggable from 'react-draggable';

import styles from './ProgressBar.module.css';
import { getPositionMilliseconds, getProgressMilliseconds, isPositionValid } from '../utils';
import ChildProgressBar from './ChildProgressBar/ChildProgressBar';
import ProgressBarMarker from './ProgressBarMarker/ProgressBarMarker';
import { iconSmallCircle } from '../icons';
import * as progressBarUtils from './utils';
import * as modalViews from '../../../config/views/modal';
import * as tabs from '../../../config/tabs';
import * as motives from '../../../config/motives';
import * as stringUtils from '../../../utils/strings';


function ProgressBar(props) {

  /*
   * 🏗
   */

  // Unpack Redux state
  const { queueMap, stream, playback, trackDetail, feedApp, sideBar, modal } = props;

  // Convenience values
  const queue = queueMap[playback.nowPlayingUuid],
        allIntervals = queue?.allIntervals || [],
        duration = queue?.track?.durationMilliseconds || 0,
        allowIntervalPlay = false;

  const DISABLE_ANIMATION = -1,
        ENABLE_ANIMATION = 0;

  const draggableRef = useRef(),
        progressRef = useRef();

  const [stickyPointerLeftDistance, setStickyPointerLeftDistance] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [markerHover, setMarkerHover] = useState(false);

  let position, pointerLeftDistance;
  try {
    const arr = getPositionMilliseconds(queue, queue.startedAt);
    position = arr[0];
    pointerLeftDistance = (position / duration) * 100;
  } catch (e) {
    position = 0;
    pointerLeftDistance = (position / duration) * 100;
  }

  const markerMap = props.markerMap;
  let markers;
  markers = progressBarUtils.getMarkers(markerMap, queue?.track?.uuid);

  if(trackDetail.tab === tabs.MARKERS && trackDetail.motive === motives.CREATE) {
    if(trackDetail.form.marker.name && trackDetail.form.marker.timestamp) {
      const tempMarker = {
        forceDisplay: true,
        name: trackDetail.form.marker.name,
        timestampMilliseconds: trackDetail.form.marker.timestamp,
        trackUuid: queue?.track?.uuid,
        uuid: 'fake-uuid',
      };
      markers.push(tempMarker);
    }
  }
  if(feedApp.textComment.trackUuid && sideBar.tab === 'feed' && modal.view === modalViews.NOTATION_COMPOSE) {
    const tempMarker = {
      forceDisplay: true,
      name: stringUtils.truncate(feedApp.textComment.text),
      timestampMilliseconds: feedApp.textComment.position,
      trackUuid: feedApp.textComment.trackUuid,
      uuid: 'fake-uuid',
    };
    markers.push(tempMarker);
  }

  markers = progressBarUtils.cleanMarkers(markers, queue, duration, position);

  /*
   *
   */
  const handleDragStart = function(e, ui) {
    setAnimationStatus(DISABLE_ANIMATION);
    setStickyPointerLeftDistance(pointerLeftDistance);
  }

  /*
   *
   */
  const handleDragChange = function(e, ui) {
    // noop
  }

  /*
   *
   */
  const handleDragStop = async function(e, ui) {
    const cursorRect = draggableRef.current.getBoundingClientRect(),
          progressRect = progressRef.current.getBoundingClientRect(),
          playbackPercent = (cursorRect.left - progressRect.left) / (progressRef.current.offsetWidth - 8),
          nextPosition = Math.round(duration * playbackPercent);

    const isValid = isPositionValid(queue, nextPosition);

    if(!isValid) {
      setAnimationStatus(ENABLE_ANIMATION);
      setDragOffset(ui.x);
      setStickyPointerLeftDistance(false);
      return;
    }

    const nextProgress = getProgressMilliseconds(queue, nextPosition);

    const action = {
      name: "seek",
      timestampMilliseconds: nextProgress,
      status: "kickoff",
      fake: !(playback.nowPlayingUuid === stream.nowPlayingUuid),
    };
    props.dispatch({
      type: "main/addAction",
      payload: { action },
    });

    setDragOffset(ui.x);
    setAnimationStatus(ENABLE_ANIMATION);
    setStickyPointerLeftDistance(false);
  }

  //////////////////////////////////////////////////////////////////////////////
  // REGENERATE THE FEED
  const [animationStatus, setAnimationStatus] = useState(ENABLE_ANIMATION);
  const [animationPeriodicTask, setAnimationPeriodicTask] = useState(-1);
  // eslint-disable-next-line
  const [counter, setCounter] = useState(0);
  useEffect(() => {

    if(animationStatus === DISABLE_ANIMATION) {
      if(animationPeriodicTask !== -1) {
        clearInterval(animationPeriodicTask);
      }
      return;
    }

    const periodicTask = setInterval(() => {
      setCounter(prev => prev + 1);
    }, 1500);

    setAnimationPeriodicTask(periodicTask);

    return () => {
      clearInterval(animationPeriodicTask);
    }

  // eslint-disable-next-line
  }, [animationStatus]);

  if(stickyPointerLeftDistance) {
    pointerLeftDistance = stickyPointerLeftDistance;
  }

  return (
    <div ref={progressRef} className={styles.ProgressBar}>
      {queue?.track?.uuid &&
        <Draggable axis="x"
                   bounds="body"
                   nodeRef={draggableRef}
                   disabled={queue?.status === 'paused'}
                   onStart={handleDragStart}
                   onDrag={handleDragChange}
                   onStop={handleDragStop}>
          <div ref={draggableRef}
               className={styles.ProgressPointer}
               style={{left: `calc(${pointerLeftDistance}% - ${3 + dragOffset}px)`}}>
            {iconSmallCircle}
          </div>
        </Draggable>
      }
      <div className={styles.ProgressBar}>
        {  // eslint-disable-next-line
        allIntervals.map((interval, index) => {
          return <ChildProgressBar key={interval.uuid || index}
                                   interval={interval}
                                   duration={duration}
                                   queue={queue}
                                   deleteTrackInterval={props.deleteTrackInterval}
                                   allowIntervalPlay={allowIntervalPlay} />;
        })}
      </div>
      <div className={styles.ProgressMarkerContainer}>
        {  // eslint-disable-next-line
        markers.map((marker, index) => {
          return <ProgressBarMarker key={marker.uuid}
                                    marker={marker}
                                    queue={queue}
                                    forceDisplay={marker.forceDisplay}
                                    playable={marker.playable}
                                    stoppable={marker.stoppable}
                                    markerHover={markerHover}
                                    setMarkerHover={setMarkerHover}
                                    hoveringEnabled={true} />;
        })}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  markerMap: state.markerMap,
  queueMap: state.queueMap,
  playback: state.playback,
  stream: state.stream,
  trackDetail: state.trackDetail,
  feedApp: state.feedApp,
  sideBar: state.sideBar,
  modal: state.modal,
});


export default connect(mapStateToProps)(ProgressBar);
