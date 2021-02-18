import React, { useEffect } from "react";
// import styles from './SpotifySync.module.css';

import { fetchUserConnectSpotify } from './network';


function SpotifySync(props) {

  useEffect(() => {
    async function postData() {
      const queryString = window.location.search,
            urlParams = new URLSearchParams(queryString),
            code = urlParams.get('code'),
            error = urlParams.get('error');

      await fetchUserConnectSpotify(code, error);

      window.location.href = '../search?service=spotify'
    }
    postData();
  }, []);

  return (
    <p>Redirecting...</p>
  );
}

export default SpotifySync;
