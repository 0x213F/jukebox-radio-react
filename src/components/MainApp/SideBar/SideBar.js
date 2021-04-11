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

  const openModal = function() {
    setShowModal(true);
  }

  const closeModal = function() {
    setShowModal(false);
  }

   /*
    * 🎨
    */
  return (
    <div className={styles.SideBar}>

      <div className={styles.Logo}>
        {iconLogo}
      </div>
      <div className={styles.SiteTitle}>
        Jukebox Radio
      </div>

      <ul className={styles.Menu}>
        <li className={styles.Search}>
          <Link to="/app/search">Search</Link>
        </li>
        <li className={styles.Queue}>
          <Link to="/app/queue">Queue</Link>
        </li>
        <li className={styles.Player}>
          <Link to="/app/player">Player</Link>
        </li>
        <li className={styles.Feed}>
          <Link to="/app/feed">Feed</Link>
        </li>
      </ul>

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
