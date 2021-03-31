import React from "react";
import styles from './ChildProgressBar.module.css';


function ChildProgressBar(props) {

  const interval = props.interval,
        // TODO: for now, everything inside here will be either all or mute.
        //       in the future, we need to add more styles for the other purposes.
        purpose = interval.purpose === 'mute' ? 'mute' : 'all';

  const duration = props.duration,
        intervalWidthDuration = interval.endPosition - interval.startPosition,
        intervalWidthStyle = (
          intervalWidthDuration / duration * 400 + "px"
        );

  const cleanedPurpose = purpose.charAt(0).toUpperCase() + purpose.slice(1),
        progressClass = "Progress" + cleanedPurpose,
        classNames = [];

  classNames.push(styles[progressClass]);
  if(interval.startPosition === 0) {
    classNames.push(styles.FirstInterval);
  }
  if(interval.endPosition === duration) {
    classNames.push(styles.LastInterval);
  }

  return (
    <div className={purpose === "all" ? styles.ProgressParentMuted : styles.ProgressParentBare}>
      <div className={classNames.join(' ')}
           style={{width: intervalWidthStyle}}>
      </div>
    </div>
  );
}


export default ChildProgressBar;
