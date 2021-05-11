import React, { useState } from "react";

import { connect } from 'react-redux';
import { Link } from "react-router-dom";

import UserSettings from '../../UserSettings/UserSettings'

import styles from './SideBar.module.css';
import { iconLogo, iconGear } from './icons';


function SideBar(props) {

  /*
   * 🏗
   */
  const sideBar = props.sideBar;

  const [showModal, setShowModal] = useState(false);
  // eslint-disable-next-line
  const [counter, setCounter] = useState(0);

  /*
   * Opens the "User Settings" modal.
   */
  const openModal = function() {
    setShowModal(true);
  }

  /*
   * Closes the "User Settings" modal.
   */
  const closeModal = function() {
    setShowModal(false);
  }

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
    top = "165px";
  } else if (sideBar.tab === "queue") {
    top = "229px";
  } else if (sideBar.tab === "player") {
    top = "293px";
  } else if (sideBar.tab === "feed") {
    top = "357px";
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

        <div className={styles.Block}
             style={{top}}>
        </div>

        <ul className={styles.Menu}
            onClick={(e) => { setCounter(prev => prev + 1); }}>
          <li className={sideBar.tab === "search" && styles.LiSelected}>
            <Link to="/app/search" onClick={() => { handleTab("search"); }} style={{color: "#000"}}>Search</Link>
          </li>
          <li className={sideBar.tab === "queue" && styles.LiSelected}>
            <Link to="/app/queue" onClick={() => { handleTab("queue"); }} style={{color: "#000"}}>Queue</Link>
          </li>
          <li className={sideBar.tab === "player" && styles.LiSelected}>
            <Link to="/app/player" onClick={() => { handleTab("player"); }} style={{color: "#000"}}>Player</Link>
          </li>
          <li className={sideBar.tab === "feed" && styles.LiSelected}>
            <Link to="/app/feed" onClick={() => { handleTab("feed"); }} style={{color: "#000"}}>Feed</Link>
          </li>
        </ul>
      </div>

      <div className={styles.Settings}>
        <button onClick={openModal}>
          {iconGear}
        </button>
      </div>
      <UserSettings isOpen={showModal}
                    closeModal={closeModal} />
    </div>
  );
}


const mapStateToProps = (state) => ({
    sideBar: state.sideBar,
});


export default connect(mapStateToProps)(SideBar);
