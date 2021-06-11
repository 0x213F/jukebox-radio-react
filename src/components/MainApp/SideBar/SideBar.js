import React, { useState } from "react";

import { connect } from 'react-redux';
import { Link } from "react-router-dom";

import styles from './SideBar.module.css';
import { iconLogo } from './icons';


function SideBar(props) {

  /*
   * 🏗
   */
  const sideBar = props.sideBar;

  // eslint-disable-next-line
  const [counter, setCounter] = useState(0);

  /*
   * Switches the active tab, updating styles in the side bar.
   */
  const handleTab = function(tab) {
    props.dispatch({
      type: "sideBar/selectTab",
      payload: { tab },
    });
  }

  // TODO: refactor these inline CSS styles into classes.
  let top;
  if (sideBar.tab === "search") {
    top = "28px";
  } else if (sideBar.tab === "queue") {
    top = "91.5px";
  } else if (sideBar.tab === "feed") {
    top = "155px";
  }

   /*
    * 🎨
    */
  return (
    <div className={styles.SideBar}>

      <div className={styles.Logo}>
        {iconLogo}
      </div>

      <div className={styles.MenuContainer}>
        <div className={styles.Menu}
            onClick={(e) => { setCounter(prev => prev + 1); }}>
          <div className={(sideBar.tab === "search" && styles.LiSelected) || ""}>
            <Link to="/app/search" onClick={() => { handleTab("search"); }} style={{color: "#000"}}>Search</Link>
          </div>
          <div className={(sideBar.tab === "queue" && styles.LiSelected) || ""}>
            <Link to="/app/queue" onClick={() => { handleTab("queue"); }} style={{color: "#000"}}>Queue</Link>
          </div>
          <div className={(sideBar.tab === "feed" && styles.LiSelected) || ""}>
            <Link to="/app/feed" onClick={() => { handleTab("feed"); }} style={{color: "#000"}}>Feed</Link>
          </div>
        </div>

        <div className={styles.BlockContainer}>
          <div className={styles.Block} style={{top}}></div>
        </div>
      </div>

    </div>
  );
}


const mapStateToProps = (state) => ({
    sideBar: state.sideBar,
});


export default connect(mapStateToProps)(SideBar);
