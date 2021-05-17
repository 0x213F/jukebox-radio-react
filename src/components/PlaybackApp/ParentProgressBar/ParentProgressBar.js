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
        allIntervals = queue?.allIntervals || [],
        duration = queue?.track?.durationMilliseconds || 0;

  let position, pointerLeftDistance;
  if(mode === "player") {
    try {
      const stream = props.stream,
            arr = getPositionMilliseconds(stream, stream.startedAt);
      position = arr[0];
      pointerLeftDistance = (position / duration) * 100;
    } catch (e) {
      position = 0;
      pointerLeftDistance = (position / duration) * 100;
    }
  }

  const trackMarkerMap = props.trackMarkerMap,
        markers = trackMarkerMap[queue?.uuid] || [];

  let runningMark = 6;
  for(let i=0; i < markers.length; i++) {
    let pix = markers[i].timestampMilliseconds / duration * 100;
    markers[i].styleLeft = `calc(${pix}% - ${runningMark}px)`;
    runningMark += 12;

    if(markers[i].timestampMilliseconds < position) {
      markers[i].forceDisplay = true;
      if(i !== 0) {
        markers[i - 1].forceDisplay = false;
      }
    } else {
      markers[i].forceDisplay = false;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // REGENERATE THE FEED
  // eslint-disable-next-line
  const [counter, setCounter] = useState(0);
  useEffect(() => {

    const periodicTask = setInterval(() => {
      setCounter(prev => prev + 1);
    }, 15);

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
                                      playable={mode === "player"}
                                      playbackControls={props.playbackControls} />;
          })}
        </div>
      }
    </div>
  );
}

const mapStateToProps = (state) => ({
  trackMarkerMap: state.trackMarkerMap,
});


export default connect(mapStateToProps)(ParentProgressBar);
