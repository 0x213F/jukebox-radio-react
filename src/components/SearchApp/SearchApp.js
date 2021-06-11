import React, { useState } from "react";
import { connect } from 'react-redux';
import styles from './SearchApp.module.css';

import { fetchSearchMusicLibrary, fetchCreateQueue } from './network';
import SearchResult from './SearchResult/SearchResult';
import Upload from '../Upload/Upload';
import { fetchQueueList } from '../QueueApp/network';
import { iconUpload } from './icons';
import { iconSpotify, iconYouTube, iconAppleMusic, iconLogoAlt, iconAudius } from '../../icons';


function SearchApp(props) {

  /*
   * 🏗
   */

  const search = props.search;

  const [searchResults, setSearchResults] = useState([]);
  const [searchResultCache, setSearchResultCache] = useState({});
  const [autoSearchTimeoutId, setAutoSearchTimeoutId] = useState(false);

  const [query, setQuery] = useState('');

  const formatTrack = true,
        formatAlbum = true,
        formatPlaylist = true,
        formatVideo = true;

  const [showModal, setShowModal] = useState(false);

  const openModal = function() {
    setShowModal(true);
  }

  const closeModal = function() {
    setShowModal(false);
  }

  const fetchSearch = async function(service = undefined) {
    if(!query) {
      return;
    }

    const queryCache = { ...searchResultCache[query] } || {};

    if(!service) {
      if(search.serviceAppleMusic) {
        service = 'apple_music';
      } else if (search.serviceSpotify) {
        service = 'spotify';
      } else if (search.serviceYouTube) {
        service = 'youtube';
      } else if (search.serviceAudius) {
        service = 'audius';
      } else if (search.serviceJukeboxRadio) {
        service = 'jukebox_radio';
      }
    }

    console.log(service)

    let responseJson;
    responseJson = queryCache[service];
    if(!responseJson) {
      responseJson = await fetchSearchMusicLibrary(
        query,
        service,
        formatTrack,
        formatAlbum,
        formatPlaylist,
        formatVideo,
      );
      queryCache[service] = responseJson;
      setSearchResultCache(function(oldState) {
        const state = { ...oldState };
        state[query] = queryCache;
        return state;
      });
    }
    setSearchResults(responseJson.data);
    setAutoSearchTimeoutId(false);
  }

  const handleSpotify = function() {
    props.dispatch({
      type: 'search/toggleService',
      payload: { serviceName: "serviceSpotify" },
    });
    fetchSearch('spotify');
  }

  const handleYouTube = function() {
    props.dispatch({
      type: 'search/toggleService',
      payload: { serviceName: "serviceYouTube" },
    });
    fetchSearch('youtube');
  }

  const handleAppleMusic = function() {
    props.dispatch({
      type: 'search/toggleService',
      payload: { serviceName: "serviceAppleMusic" },
    });
    fetchSearch('apple_music');
  }

  const handleAudius = function() {
    props.dispatch({
      type: 'search/toggleService',
      payload: { serviceName: "serviceAudius" },
    });
    fetchSearch('audius');
  }

  const handleJukeboxRadio = function() {
    props.dispatch({
      type: 'search/toggleService',
      payload: { serviceName: "serviceJukeboxRadio" },
    });
    fetchSearch('jukebox_radio');
  }

  /*
   * When the user initializes a login attempt.
   */
  const handleSubmit = function() {
    if(!query) {
      return;
    }
    fetchSearch();
  }

  /*
   * When...
   */
  const addToQueue = async function(className, genericUuid) {
    await fetchCreateQueue(
      className,
      genericUuid,
    );

    const responseJsonQueueList = await fetchQueueList();
    props.dispatch(responseJsonQueueList.redux);
  }

  /*
   *
   */
  const handleKeyDown = (event) => {
    if(autoSearchTimeoutId) {
      clearTimeout(autoSearchTimeoutId);
    }
    setAutoSearchTimeoutId(setTimeout(fetchSearch, 500));
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <div className={styles.SearchApp}>

      <div className={styles.SearchBarContainer}>
        <input type="text"
               name="query"
               autoComplete="off"
               spellCheck="false"
               placeholder=""
               className={styles.SearchBar}
               value={query}
               onChange={(e) => {setQuery(e.target.value)}}
               onKeyDown={handleKeyDown} />
        {/*}
        <div className={styles.SearchBarIcon}>
          {iconSearch}
        </div>
        */}
        <button className={styles.Upload}
                onClick={openModal}>
          {iconUpload}
        </button>
      </div>

      <div className={styles.SearchResultsContainer}>
        <div className={styles.ServiceCheckboxContainer}>
          <button className={styles.ServiceCheckbox}
                  onClick={handleSpotify}
                  style={(search.serviceSpotify && {border: "2px solid rgba(29, 185, 84, 1)"}) || {}}>
            <div className={styles.ServiceCheckboxLogoContainer}>{iconSpotify}</div>
          </button>

          <button className={styles.ServiceCheckbox}
                  onClick={handleYouTube}
                  style={(search.serviceYouTube && {border: "2px solid rgba(255, 0, 0, 1)"}) || {}}>
            <div className={styles.ServiceCheckboxLogoContainer}>{iconYouTube}</div>
          </button>

          <button className={styles.ServiceCheckbox}
                  onClick={handleAppleMusic}
                  style={(search.serviceAppleMusic && {border: "2px solid rgba(251, 92, 116, 1)"}) || {}}>
            <div className={styles.ServiceCheckboxLogoContainer}>{iconAppleMusic}</div>
          </button>

          <button className={styles.ServiceCheckbox}
                  onClick={handleAudius}
                  style={(search.serviceAudius && {border: "2px solid rgba(126, 27, 204, 1)"}) || {}}>
            <div className={styles.ServiceCheckboxLogoContainer}>{iconAudius}</div>
          </button>

          <button className={styles.ServiceCheckbox}
                  onClick={handleJukeboxRadio}
                  style={(search.serviceJukeboxRadio && {border: "2px solid rgba(0, 71, 255, 1)"}) || {}}>
            <div className={styles.ServiceCheckboxLogoContainer}>{iconLogoAlt}</div>
          </button>
        </div>

        <div className={styles.SearchResults}>
          {searchResults.map((value, index) => (
            <SearchResult key={value.uuid} data={value} addToQueue={addToQueue}></SearchResult>
          ))}
        </div>
      </div>

      <Upload isOpen={showModal}
              closeModal={closeModal} />
    </div>
  );
}


const mapStateToProps = (state) => ({
  search: state.search,
});


export default connect(mapStateToProps)(SearchApp);
