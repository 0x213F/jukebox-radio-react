import React, { useState } from "react";

import { Link } from "react-router-dom";

import UserSettings from '../../UserSettings/UserSettings'

import styles from './SideBar.module.css';
import { iconLogo, iconGear } from './icons';


function SideBar(props) {

  /*
   * 🏗
   */
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

  // TODO: refactor these inline CSS styles into classes.
  let marginTop;
  if (window.location.pathname.includes("search")) {
    marginTop = "162px";
  } else if (window.location.pathname.includes("queue")) {
    marginTop = "228px";
  } else if (window.location.pathname.includes("player")) {
    marginTop = "294px";
  } else if (window.location.pathname.includes("feed")) {
    marginTop = "360px";
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
        <div className={styles.Line}>
          <div className={styles.Block}
               style={{marginTop: marginTop}}>
          </div>
        </div>

        <ul className={styles.Menu}
            onClick={(e) => { setCounter(prev => prev + 1); }}>
          <li className={window.location.pathname.includes("search") && styles.LiSelected}>
            <Link to="/app/search">Search</Link>
          </li>
          <li className={window.location.pathname.includes("queue") && styles.LiSelected}>
            <Link to="/app/queue">Queue</Link>
          </li>
          <li className={window.location.pathname.includes("player") && styles.LiSelected}>
            <Link to="/app/player">Player</Link>
          </li>
          <li className={window.location.pathname.includes("feed") && styles.LiSelected}>
            <Link to="/app/feed">Feed</Link>
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


export default SideBar;
