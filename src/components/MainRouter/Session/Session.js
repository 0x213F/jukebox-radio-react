import React, { useEffect } from "react";

import { Switch, Route, Link } from "react-router-dom";
import { connect } from 'react-redux';

import * as modalViews from '../../../config/views/modal';

import FeedApp from '../../FeedApp/FeedApp';
import QueueApp from '../../QueueApp/QueueApp';
import MiniQueue from '../../QueueApp/MiniQueue/MiniQueue';
import SearchApp from '../../SearchApp/SearchApp';
import MiniNotes from '../../SearchApp/MiniNotes/MiniNotes';

import ModalApp from '../../ModalApp/ModalApp';

import BottomBar from '../BottomBar/BottomBar';
import SideBar from '../SideBar/SideBar';

import styles from './Session.module.css';
import { iconLogo } from './icons';


function Session(props) {

  const modal = props.modal;

  /*
   * Switches the active tab, updating styles in the side bar.
   */
  const handleTab = function(tab) {
    props.dispatch({
      type: "sideBar/selectTab",
      payload: { tab },
    });
  }

  useEffect(() => {
    if(window.location.pathname === '/app/welcome') {
      props.dispatch({
        type: "modal/open",
        payload: { view: modalViews.WELCOME },
      });
    }
  // eslint-disable-next-line
  }, [])

   /*
    * 🎨
    */
  return (
    <div className={styles.Session}>

      {/* LOGO */}
      <div className={styles.Logo}>
        {iconLogo}
      </div>

      {/* SIDE BAR */}
      {!modal.isOpen &&
        <SideBar />
      }

      {/* MAIN CONTENT */}
      {!modal.isOpen &&
        <div className={styles.Content}>
          <Switch>

            {/* FEED */}
            <Route path="/app/feed">
              <FeedApp />
            </Route>

            {/* QUEUE */}
            <Route path="/app/queue">
              <div className={styles.PrimaryContent}>
                <QueueApp />
              </div>
              <div className={styles.SecondaryContent}>
                <MiniNotes />
              </div>
            </Route>

            {/* SEARCH */}
            <Route path="/app/search">
              <div className={styles.PrimaryContent}>
                <SearchApp />
              </div>
                <div className={styles.SecondaryContent}>
                  <MiniNotes />
                  <Link to="/app/queue" onClick={() => { handleTab("queue"); }} style={{ textDecoration: 'none', color: "#000" }}>
                    <MiniQueue />
                  </Link>
                </div>
            </Route>

          </Switch>
        </div>
      }

      {/* BOTTOM BAR */}
      {(!modal.isOpen || (modal.isOpen && modal.config.bottomBar)) &&
        <BottomBar />
      }

      {/* MODAL APP */}
      <ModalApp />

    </div>
  );
}


const mapStateToProps = (state) => ({
  modal: state.modal,
});


export default connect(mapStateToProps)(Session);
