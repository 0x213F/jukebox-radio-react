import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import styles from './ParentProgressBar.module.css';
import { getPositionMilliseconds } from '../utils';
import ChildProgressBar from '../ChildProgressBar/ChildProgressBar';
import ProgressBarMarker from '../ProgressBarMarker/ProgressBarMarker';
import { iconDownTriangle } from '../icons';


function ParentProgressBar(props) {

  const queue = props.queue,
        mode = props.mode,
        allIntervals = queue.allIntervals,
        duration = queue?.track?.durationMilliseconds || 0;

  let position, pointerLeftDistance;
  if(mode === "player") {
    const stream = props.stream,
          arr = getPositionMilliseconds(stream, stream.startedAt);
    position = arr[0];
    pointerLeftDistance = (position / duration) * 400 + "px";
  }

  const trackMarkerMap = props.trackMarkerMap,
        markers = trackMarkerMap[queue.uuid] || [];

  for(let i=0; i < markers.length; i++) {
    let pix = markers[i].timestampMilliseconds / duration * 100;
    markers[i].styleLeft = `calc(${pix}% - 11px)`;
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
             style={{left: pointerLeftDistance}}>
          {iconDownTriangle}
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
      {mode === "markers" &&
        <div className={styles.ProgressMarkerContainer}>
          {  // eslint-disable-next-line
          markers.map((marker, index) => {
            return <ProgressBarMarker key={marker.uuid}
                                      marker={marker}
                                      queueUuid={queue.uuid}
                                      editable={true} />;
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
