import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import styles from './ParentProgressBar.module.css';
import { getPositionMilliseconds } from '../utils';
import ChildProgressBar from '../ChildProgressBar/ChildProgressBar';
import { getAllIntervals } from './utils';
import { iconDownTriangle } from '../icons';


function ParentProgressBar(props) {

  const queue = props.queue,
        allIntervals = getAllIntervals(queue);

  const stream = props.stream,
        duration = stream.nowPlaying?.track?.durationMilliseconds || 0,
        arr = getPositionMilliseconds(stream, stream.startedAt),
        position = arr[0];

  const pointerLeftDistance = (position / duration) * 400 + "px";

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
      <div className={styles.ProgressPointer}
           style={{left: pointerLeftDistance}}>
        {iconDownTriangle}
      </div>
      <div className={styles.ProgressBar}>
        {  // eslint-disable-next-line
        allIntervals.map((interval, index) => {
          return <ChildProgressBar key={index}
                                   interval={interval}
                                   duration={duration}>
                 </ChildProgressBar>;
        })}
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
});


export default connect(mapStateToProps)(ParentProgressBar);
