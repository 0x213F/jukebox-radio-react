import React, { useState } from "react";
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

  const [searchResults, setSearchResults] = useState([]);

  const [query, setQuery] = useState('');

  // NOTE: These could be condensed, but I prefer explicitly writing them out.
  const [serviceAppleMusic, setServiceAppleMusic] = useState(true);
  const [serviceSpotify, setServiceSpotify] = useState(true);
  const [serviceYouTube, setServiceYouTube] = useState(true);
  const [serviceJukeboxRadio, setServiceJukeboxRadio] = useState(true);

  const formatTrack = true,
        formatAlbum = true,
        formatPlaylist = true,
        formatVideo = true;

  const [showModal, setShowModal] = useState(false);

  //const openModal = function() {
    //setShowModal(true);
  //}

  const closeModal = function() {
    setShowModal(false);
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
      serviceAppleMusic,
      serviceSpotify,
      serviceYouTube,
      serviceJukeboxRadio,
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
          <button className={styles.Upload}>
            {iconUpload}
          </button>
        </div>

        <div className={styles.FormBlock}>
          <label className={styles.ServiceCheckboxContainer}>
            <button onClick={(e) => {setServiceSpotify(prev => !prev)}}>
              {serviceSpotify ? iconCheckboxChecked : iconCheckboxUnchecked}
            </button>
            <span>
              Spotify
            </span>
          </label>

          <label className={styles.ServiceCheckboxContainer}>
            <button onClick={(e) => {setServiceYouTube(prev => !prev)}}>
              {serviceYouTube ? iconCheckboxChecked : iconCheckboxUnchecked}
            </button>
            <span>
              YouTube
            </span>
          </label>

          <label className={styles.ServiceCheckboxContainer}>
            <button onClick={(e) => {setServiceAppleMusic(prev => !prev)}}>
              {serviceAppleMusic ? iconCheckboxChecked : iconCheckboxUnchecked}
            </button>
            <span>
              Apple Music
            </span>
          </label>

          <label className={styles.ServiceCheckboxContainer}>
            <button onClick={(e) => {setServiceJukeboxRadio(prev => !prev)}}>
              {serviceJukeboxRadio ? iconCheckboxChecked : iconCheckboxUnchecked}
            </button>
            <span>
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


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(SearchApp);
