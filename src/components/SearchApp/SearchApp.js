import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import styles from './SearchApp.module.css';

import { fetchSearchMusicLibrary, fetchCreateQueue } from './network';
import SearchResult from './SearchResult/SearchResult';
import Upload from '../Upload/Upload';
import { fetchQueueList } from '../QueueApp/network';
import { iconUpload, iconCheckboxChecked, iconCheckboxUnchecked } from './icons';


function SearchApp(props) {

  /*
   * 🏗
   */

  const search = props.search;

  const [searchResults, setSearchResults] = useState([]);

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

  const handleSpotify = function() {
    props.dispatch({
      type: 'search/toggleService',
      payload: { serviceName: "serviceSpotify" },
    });
  }

  const handleYouTube = function() {
    props.dispatch({
      type: 'search/toggleService',
      payload: { serviceName: "serviceYouTube" },
    });
  }

  const handleAppleMusic = function() {
    props.dispatch({
      type: 'search/toggleService',
      payload: { serviceName: "serviceAppleMusic" },
    });
  }

  const handleJukeboxRadio = function() {
    props.dispatch({
      type: 'search/toggleService',
      payload: { serviceName: "serviceJukeboxRadio" },
    });
  }

  /*
   * When the user initializes a login attempt.
   */
  const handleSubmit = async function() {
    if(!query) {
      return;
    }
    const responseJson = await fetchSearchMusicLibrary(
      query,
      search.serviceAppleMusic,
      search.serviceSpotify,
      search.serviceYouTube,
      search.serviceJukeboxRadio,
      formatTrack,
      formatAlbum,
      formatPlaylist,
      formatVideo,
    );
    setSearchResults(responseJson.data);
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
   if (event.key === 'Enter') {
     handleSubmit();
   }
 }

  return (
    <div>
      <div className={styles.SearchApp}>

        <div className={styles.SearchBarContainer}>
          <input type="text"
                 name="query"
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

        <div className={styles.FormBlock}>
          <label className={styles.ServiceCheckboxContainer}>
            <button onClick={handleSpotify}>
              {search.serviceSpotify ? iconCheckboxChecked : iconCheckboxUnchecked}
            </button>
            <span style={!search.serviceSpotify && {color: "#ABABAB"} || {}}>
              Spotify
            </span>
          </label>

          <label className={styles.ServiceCheckboxContainer}>
            <button onClick={handleYouTube}>
              {search.serviceYouTube ? iconCheckboxChecked : iconCheckboxUnchecked}
            </button>
            <span style={!search.serviceYouTube && {color: "#ABABAB"} || {}}>
              YouTube
            </span>
          </label>

          <label className={styles.ServiceCheckboxContainer}>
            <button onClick={handleAppleMusic}>
              {search.serviceAppleMusic ? iconCheckboxChecked : iconCheckboxUnchecked}
            </button>
            <span style={!search.serviceAppleMusic && {color: "#ABABAB"} || {}}>
              Apple Music
            </span>
          </label>

          <label className={styles.ServiceCheckboxContainer}>
            <button onClick={handleJukeboxRadio}>
              {search.serviceJukeboxRadio ? iconCheckboxChecked : iconCheckboxUnchecked}
            </button>
            <span style={!search.serviceJukeboxRadio && {color: "#ABABAB"} || {}}>
              Jukebox Radio
            </span>
          </label>
        </div>

      </div>

      <div className={styles.SearchResultsContainer}>
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
