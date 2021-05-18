import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import styles from './ParentProgressBar.module.css';
import { getPositionMilliseconds } from '../utils';
import ChildProgressBar from '../ChildProgressBar/ChildProgressBar';
import ProgressBarMarker from '../ProgressBarMarker/ProgressBarMarker';
import { iconSmallCircle } from '../icons';


function ParentProgressBar(props) {

  const queue = props.queue,
        mode = props.mode,
        stream = props.stream,
        allIntervals = queue?.allIntervals || [],
        duration = queue?.track?.durationMilliseconds || 0;

  let position, pointerLeftDistance;
  if(mode === "player") {
    try {
      const arr = getPositionMilliseconds(stream, stream.startedAt);
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

  //////////////////////////////////////////////////////////////////////////////
  // REGENERATE THE FEED
  // eslint-disable-next-line
  const [counter, setCounter] = useState(0);
  useEffect(() => {

    const periodicTask = setInterval(() => {
      setCounter(prev => prev + 1);
    }, 50);

    return () => {
      clearInterval(periodicTask);
    }

  // eslint-disable-next-line
  }, []);

  return (
    <div className={styles.ParentProgressBar}>
      {mode === "player" &&
        <div className={styles.ProgressPointer}
             style={{left: `calc(${pointerLeftDistance}% - 6px)`}}>
          {iconSmallCircle}
        </div>
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
                                      playbackControls={props.playbackControls} />;
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
