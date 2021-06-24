import React, { useState, useEffect, useRef } from "react";

import { connect } from 'react-redux';
import Draggable from 'react-draggable';

import styles from './ParentProgressBar.module.css';
import { getPositionMilliseconds, getProgressMilliseconds, isPositionValid } from '../utils';
import ChildProgressBar from '../ChildProgressBar/ChildProgressBar';
import ProgressBarMarker from '../ProgressBarMarker/ProgressBarMarker';
import { iconSmallCircle } from '../icons';


function ParentProgressBar(props) {

  const DISABLE_ANIMATION = -1,
        ENABLE_ANIMATION = 0;

  const draggableRef = useRef(),
        progressRef = useRef();

  const [stickyPointerLeftDistance, setStickyPointerLeftDistance] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const [markerHover, setMarkerHover] = useState(false);

  const queueMap = props.queueMap,
        stream = props.stream,
        playback = props.playback,
        queue = queueMap[playback.nowPlayingUuid],
        mode = props.mode,
        allIntervals = queue?.allIntervals || [],
        duration = queue?.track?.durationMilliseconds || 0,
        allowMarkerSeek = props.allowMarkerSeek,
        allowMarkerDelete = props.allowMarkerDelete,
        allowIntervalPlay = props.allowIntervalPlay,
        allowIntervalDelete = props.allowIntervalDelete;

  let position, pointerLeftDistance;
  try {
    const arr = getPositionMilliseconds(queue, queue.startedAt);
    position = arr[0];
    pointerLeftDistance = (position / duration) * 100;
  } catch (e) {
    position = 0;
    pointerLeftDistance = (position / duration) * 100;
  }

  const markerMap = props.markerMap,
        markers = (
          Object.values(markerMap[queue?.track?.uuid] || []).sort((a, b) => {
            return a.timestampMilliseconds - b.timestampMilliseconds;
          })
        );

  let runningMark = 8;
  for(let i=0; i < markers.length; i++) {
    let pix = markers[i].timestampMilliseconds / duration * 100;
    markers[i].styleLeft = `calc(${pix}% - ${runningMark}px)`;
    runningMark += 0;

    if(mode === "player") {

      // Force display contextual marker
      if(markers[i].timestampMilliseconds < position) {
        markers[i].forceDisplay = true;
        if(i !== 0) {
          markers[i - 1].forceDisplay = false;
        }
      } else {
        markers[i].forceDisplay = false;
      }

      // Allow "stop"
      if(markers[i].timestampMilliseconds > position + 5000) {
        markers[i].stoppable = true;
      } else {
        markers[i].stoppable = false;
      }
    }

    // Change styles for markers that are "not playable"
    for(let j=0; j < queue.allIntervals.length; j++) {
      const interval = queue.allIntervals[j],
            notPlayable = (
              interval.purpose === 'muted' &&
              interval.startPosition <= markers[i].timestampMilliseconds &&
              interval.endPosition > markers[i].timestampMilliseconds
            );

      markers[i].playable = true;
      if(notPlayable) {
        markers[i].playable = false;

        // If this is the end of the song, do not allow "stop"
        const playbackIntervals = queue.playbackIntervals,
              endPosition = playbackIntervals[playbackIntervals.length - 1].endPosition,
              forceStoppable = (
                markers[i].timestampMilliseconds === endPosition ||
                (
                  interval.startPosition < markers[i].timestampMilliseconds &&
                  interval.endPosition > markers[i].timestampMilliseconds
                )
              );
        if(forceStoppable) {
          markers[i].stoppable = false;
        }
        break;
      }
    }
  }

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
    <div ref={progressRef} className={styles.ParentProgressBar}>
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
                                   editable={mode === "intervals"}
                                   playbackControls={props.playbackControls}
                                   deleteTrackInterval={props.deleteTrackInterval}
                                   allowIntervalPlay={allowIntervalPlay}
                                   allowIntervalDelete={allowIntervalDelete}>
                 </ChildProgressBar>;
        })}
      </div>
      <div className={styles.ProgressMarkerContainer}>
        {  // eslint-disable-next-line
        markers.map((marker, index) => {
          return <ProgressBarMarker key={marker.uuid}
                                    marker={marker}
                                    queue={queue}
                                    forceDisplay={marker.forceDisplay}
                                    editable={allowMarkerDelete}
                                    playable={marker.playable}
                                    stoppable={marker.stoppable}
                                    playbackControls={props.playbackControls}
                                    deleteTrackMarker={props.deleteTrackMarker}
                                    markerHover={markerHover}
                                    setMarkerHover={setMarkerHover}
                                    allowMarkerSeek={allowMarkerSeek}
                                    hoveringEnabled={mode !== "intervals"} />;
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
});


export default connect(mapStateToProps)(ParentProgressBar);
