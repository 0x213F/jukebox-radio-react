import { ENDPOINT_SEARCH_MUSIC, ENDPOINT_CREATE_QUEUE } from '../../config/api'
import { TYPE_GET, TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'

/*
 * Fetches an auth token from the server.
 */
export const fetchSearchMusicLibrary = async (query, providerSpotify, providerYouTube, providerJukeboxRadio, formatTrack, formatAlbum, formatPlaylist, formatVideo) => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_SEARCH_MUSIC,
    {
      query,
      providerSpotify,
      providerYouTube,
      providerJukeboxRadio,
      formatTrack,
      formatAlbum,
      formatPlaylist,
      formatVideo,
    },
  );
  const responseJson = await response.json();
  return responseJson;
};


/*
 * Fetches an auth token from the server.
 */
export const fetchCreateQueue = async (className, genericUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_CREATE_QUEUE,
    { className, genericUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};
