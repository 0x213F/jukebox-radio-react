import React, { useState, useEffect, useRef } from "react";

import { connect } from 'react-redux';
import Draggable from 'react-draggable';

import styles from './ParentProgressBar.module.css';
import { getPositionMilliseconds } from '../utils';
import ChildProgressBar from '../ChildProgressBar/ChildProgressBar';
import ProgressBarMarker from '../ProgressBarMarker/ProgressBarMarker';
import { iconSmallCircle } from '../icons';


function ParentProgressBar(props) {

  const DISABLE_ANIMATION = -1,
        ENABLE_ANIMATION = 0;

  const draggableRef = useRef();

  const [stickyPointerLeftDistance, setStickyPointerLeftDistance] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const [markerHover, setMarkerHover] = useState(false);

  const queue = props.queue,
        mode = props.mode,
        stream = props.stream,
        allIntervals = queue?.allIntervals || [],
        duration = queue?.track?.durationMilliseconds || 0;

  let position, pointerLeftDistance;
  if(mode === "player") {
    try {
      const arr = getPositionMilliseconds(stream, stream.nowPlaying.startedAt);
      position = arr[0];
      pointerLeftDistance = (position / duration) * 100;
    } catch (e) {
      position = 0;
      pointerLeftDistance = (position / duration) * 100;
    }
  }

  const markerMap = props.markerMap,
        markers = Object.values(markerMap[queue?.track?.uuid] || []).sort((a, b) => {
          return a.timestampMilliseconds - b.timestampMilliseconds;
        });

  let runningMark = 6;
  for(let i=0; i < markers.length; i++) {
    let pix = markers[i].timestampMilliseconds / duration * 100;
    markers[i].styleLeft = `calc(${pix}% - ${runningMark}px)`;
    runningMark += 12;

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
    if(mode === "player") {
      for(let j=0; j < stream.nowPlaying.allIntervals.length; j++) {
        const interval = stream.nowPlaying.allIntervals[j],
              notPlayable = (
                interval.purpose === 'muted' &&
                interval.startPosition <= markers[i].timestampMilliseconds &&
                interval.endPosition > markers[i].timestampMilliseconds
              );

        markers[i].playable = true;
        if(notPlayable) {
          markers[i].playable = false;

          // If this is the end of the song, do not allow "stop"
          const playbackIntervals = stream.nowPlaying.playbackIntervals,
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
  }

  // Change styles for markers that are "not playable"
  if(mode === "markers") {
    for(let i=0; i < allIntervals.length; i++) {
      // allIntervals[i].purpose = "all";
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
    const rect = draggableRef.current.getBoundingClientRect(),
          playbackPercent = rect.left / (window.innerWidth - 8),
          nextPosition = Math.round(duration * playbackPercent);
    await props.playbackControls.seek(nextPosition);
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
    }, 50);

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
    <div className={styles.ParentProgressBar}>
      {mode === "player" &&
        <Draggable axis="x"
                   bounds="body"
                   disabled={stream.nowPlaying?.status === 'paused'}
                   onStart={handleDragStart}
                   onDrag={handleDragChange}
                   onStop={handleDragStop}>
          <div ref={draggableRef}
               className={styles.ProgressPointer}
               style={{left: `calc(${pointerLeftDistance}% - ${6 + dragOffset}px)`}}>
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
                                   editable={mode === "intervals"}>
                 </ChildProgressBar>;
        })}
      </div>
      {(mode === "markers" || mode === "player") &&
        <div className={styles.ProgressMarkerContainer}>
          {  // eslint-disable-next-line
          markers.map((marker, index) => {
            return <ProgressBarMarker key={marker.uuid}
                                      marker={marker}
                                      queueUuid={queue.uuid}
                                      forceDisplay={marker.forceDisplay}
                                      editable={mode === "markers"}
                                      playable={marker.playable}
                                      stoppable={marker.stoppable}
                                      playbackControls={props.playbackControls}
                                      markerHover={markerHover}
                                      setMarkerHover={setMarkerHover} />;
          })}
        </div>
      }
    </div>
  );
}

const mapStateToProps = (state) => ({
  markerMap: state.markerMap,
});


export default connect(mapStateToProps)(ParentProgressBar);
