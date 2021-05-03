import React, { useState } from "react";
import { Link } from "react-router-dom";
import UserSettings from '../../UserSettings/UserSettings'
import styles from './SideBar.module.css';
import { iconLogo, iconMore } from './icons';


function SideBar(props) {

  /*
   * 🏗
   */
  const [showModal, setShowModal] = useState(false);
  // eslint-disable-next-line
  const [counter, setCounter] = useState(0);

  const openModal = function() {
    setShowModal(true);
  }

  const closeModal = function() {
    setShowModal(false);
  }

  let marginBottom;
  if (window.location.pathname.includes("search")) {
    marginBottom = "196px";
  } else if (window.location.pathname.includes("queue")) {
    marginBottom = "66px";
  } else if (window.location.pathname.includes("player")) {
    marginBottom = "-66px";
  } else if (window.location.pathname.includes("feed")) {
    marginBottom = "-196px";
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
        </div>
        <div className={styles.Block}
             style={{marginBottom: marginBottom}}>
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
          {iconMore}
        </button>
      </div>

      <UserSettings isOpen={showModal}
                    closeModal={closeModal} />

    </div>
  );
}

export default SideBar;
