import { ENDPOINT_TRACK_CREATE } from '../../config/api'
import { TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'

/*
 * Fetches...
 */
export const fetchCreateTrack = async (audioFile, imageFile, trackName, artistName, albumName) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_TRACK_CREATE,
    {
      audioFile: audioFile,
      imageFile: imageFile,
      trackName: trackName,
      artistName: artistName,
      albumName: albumName,
    },
  );
  const responseJson = await response.json();
  return responseJson;
};
