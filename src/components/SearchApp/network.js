import { ENDPOINT_MUSIC_SEARCH, ENDPOINT_QUEUE_CREATE } from '../../config/api'
import { TYPE_GET, TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'

/*
 * Fetches an auth token from the server.
 */
export const fetchSearchMusicLibrary = async (query, service, formatTrack, formatAlbum, formatPlaylist, formatVideo) => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_MUSIC_SEARCH,
    {
      query,
      service,
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
    ENDPOINT_QUEUE_CREATE,
    { className, genericUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};
