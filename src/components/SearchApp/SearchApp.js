import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import styles from './SearchApp.module.css';

import { fetchSearchMusicLibrary, fetchCreateQueue } from './network';
import SearchResult from './SearchResult/SearchResult';
import Upload from '../Upload/Upload';
import {
  SERVICE_AUDIUS,
  SERVICE_SPOTIFY,
  SERVICE_YOUTUBE,
  SERVICE_JUKEBOX_RADIO,
  SERVICE_APPLE_MUSIC,
} from '../../config/services';
import { fetchQueueList } from '../QueueApp/network';
import { iconUpload } from './icons';
import {
  iconSpotify,
  iconYouTube,
  iconAppleMusic,
  iconLogoAlt,
  iconAudius,
} from '../../icons';


function SearchApp(props) {

  /*
   * 🏗
   */

  const search = props.search,
        query = search.query;

  const [searchResults, setSearchResults] = useState([]);
  const [autoSearchTimeoutId, setAutoSearchTimeoutId] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const openModal = function() {
    setShowModal(true);
  }

  const closeModal = function() {
    setShowModal(false);
  }

  const handleQueryChange = function(e) {
    props.dispatch({
      type: "search/setQuery",
      payload: { query: e.target.value },
    });
  }

  /*
   * Get search results from server or local cache.
   */
  const fetchSearch = async function(service = undefined) {

    // Only search if there is a query
    if(!query) {
      return;
    }

    if(!service) {
      service = search.service;
    }

    const queryCache = search.cache[query] || {};
    let responseJson = queryCache[service];

    // Base case: run the search query
    if(!responseJson) {
      responseJson = await fetchSearchMusicLibrary(query, service);
      queryCache[service] = responseJson;
      props.dispatch({
        type: "search/setCache",
        payload: { query, service, responseJson },
      });
    }
    setSearchResults(responseJson.data);
    setAutoSearchTimeoutId(false);
  }

  /*
   * On click for service buttons
   */
  const generateServiceHandler = function(service) {
    return function() {
      if(autoSearchTimeoutId) {
        clearTimeout(autoSearchTimeoutId);
      }
      fetchSearch();
      props.dispatch({
        type: 'search/setService',
        payload: { service },
      });
      fetchSearch(service);
    }
  }

  /*
   * Adding a search item to the queue
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
   * Handle typing in the search bar.
   */
  const handleKeyDown = (event) => {
    if(autoSearchTimeoutId) {
      clearTimeout(autoSearchTimeoutId);
    }
    setAutoSearchTimeoutId(setTimeout(fetchSearch, 150));
    if(event.key === 'Enter') {
      clearTimeout(autoSearchTimeoutId);
      fetchSearch();
    }
  }

  // Display search results on componentDidLoad
  useEffect(() => {
    fetchSearch();
  // eslint-disable-next-line
  }, []);

  /*
   * 🎨
   */
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
               onChange={handleQueryChange}
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
                  onClick={generateServiceHandler(SERVICE_SPOTIFY)}
                  style={(search.service === SERVICE_SPOTIFY && {border: "2px solid rgba(29, 185, 84, 1)"}) || {}}>
            <div className={styles.ServiceCheckboxLogoContainer}>{iconSpotify}</div>
          </button>

          <button className={styles.ServiceCheckbox}
                  onClick={generateServiceHandler(SERVICE_YOUTUBE)}
                  style={(search.service === SERVICE_YOUTUBE && {border: "2px solid rgba(255, 0, 0, 1)"}) || {}}>
            <div className={styles.ServiceCheckboxLogoContainer}>{iconYouTube}</div>
          </button>

          <button className={styles.ServiceCheckbox}
                  onClick={generateServiceHandler(SERVICE_APPLE_MUSIC)}
                  style={(search.service === SERVICE_APPLE_MUSIC && {border: "2px solid rgba(251, 92, 116, 1)"}) || {}}>
            <div className={styles.ServiceCheckboxLogoContainer}>{iconAppleMusic}</div>
          </button>

          <button className={styles.ServiceCheckbox}
                  onClick={generateServiceHandler(SERVICE_AUDIUS)}
                  style={(search.service === SERVICE_AUDIUS && {border: "2px solid rgba(126, 27, 204, 1)"}) || {}}>
            <div className={styles.ServiceCheckboxLogoContainer}>{iconAudius}</div>
          </button>

          <button className={styles.ServiceCheckbox}
                  onClick={generateServiceHandler(SERVICE_JUKEBOX_RADIO)}
                  style={(search.service === SERVICE_JUKEBOX_RADIO && {border: "2px solid rgba(0, 71, 255, 1)"}) || {}}>
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
