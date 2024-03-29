import React from "react";

import { connect } from 'react-redux';

import { iconSpotify, iconYouTube, iconAppleMusic, iconAudius26, iconFolder } from '../../../icons';
import * as services from '../../../config/services';
import styles from './Welcome.module.css';


function Welcome(props) {

  const userSettings = props.userSettings;

  const generateServiceHandler = function(service) {
    return function() {
      props.dispatch({
        type: 'search/setService',
        payload: { service },
      });
      window.location.href = '/app/search';
    }
  }

  // lol, for fun, find what is wrong with this code
  let appleMusicEnabled = false;
  try {
    if(window.MusicKit.getInstance().musicUserToken) {
      appleMusicEnabled(true);
    }
  } catch {
    // pass
  } finally {
    // pass
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.WelcomeContainer}>
      <div className={styles.WelcomeHeader}>
        <h2>Welcome</h2>
        <h5>From where would you like to begin?</h5>
      </div>

      <div className={styles.PlaybackOptionContainer}>

        <div className={styles.PlaybackOption}
                onClick={generateServiceHandler(services.SPOTIFY)}
                disabled={!userSettings}>
          <div className={styles.PlaybackOptionLogo}>
            {iconSpotify}
          </div>
          <div className={styles.PlaybackOptionService}>
            Spotify
          </div>
          <div className={styles.PlaybackOptionDescription}>
            Connect your Spotify Premium account
          </div>
        </div>

        <div className={styles.PlaybackOption}
             onClick={generateServiceHandler(services.YOUTUBE)}>
          <div className={styles.PlaybackOptionLogo}>
            {iconYouTube}
          </div>
          <div className={styles.PlaybackOptionService}>
            YouTube
          </div>
          <div className={styles.PlaybackOptionDescription}>
            Free access to the YouTube catalog
          </div>
        </div>

        <div className={styles.PlaybackOption}
                onClick={generateServiceHandler(services.APPLE_MUSIC)}>
          <div className={styles.PlaybackOptionLogo}>
            {iconAppleMusic}
          </div>
          <div className={styles.PlaybackOptionService}>
            Apple Music
          </div>
          <div className={styles.PlaybackOptionDescription}>
            Connect your Apple Music account
          </div>
        </div>

        <div className={styles.PlaybackOption}
                onClick={generateServiceHandler(services.AUDIUS)}>
          <div className={styles.PlaybackOptionLogo}>
            {iconAudius26}
          </div>
          <div className={styles.PlaybackOptionService}>
            Audius
          </div>
          <div className={styles.PlaybackOptionDescription}>
            Free access to the Audius catalog
          </div>
        </div>

        <div className={styles.PlaybackOption}
             onClick={generateServiceHandler(services.JUKEBOX_RADIO)}>
          <div className={styles.PlaybackOptionLogo}>
            {iconFolder}
          </div>
          <div className={styles.PlaybackOptionService}>
            Library
          </div>
          <div className={styles.PlaybackOptionDescription}>
            Upload or search files in your cloud storage
          </div>
        </div>
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({
  userSettings: state.userSettings,
});


export default connect(mapStateToProps)(Welcome);
