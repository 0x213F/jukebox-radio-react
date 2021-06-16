import React from "react";

import { connect } from 'react-redux';

import styles from './SystemAction.module.css';


function SystemAction(props) {

  /*
   * 🏗
   */
  const systemAction = props.data;

  /*
   * 🎨
   */
  return (
    <div className={styles.SystemActionContainer}>

      <div className={styles.SystemAction}>
        <p>
          Playback {systemAction.action}.
        </p>
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({
  stream: state.stream,
  queueMap: state.queueMap,
});


export default connect(mapStateToProps)(SystemAction);
