import {
  ENDPOINT_STREAM_GET,
  ENDPOINT_TRACK_GET_FILES,
  ENDPOINT_STREAM_NEXT_TRACK,
  ENDPOINT_STREAM_PAUSE_TRACK,
  ENDPOINT_STREAM_PLAY_TRACK,
  ENDPOINT_STREAM_PREV_TRACK,
  ENDPOINT_STREAM_SCAN,
} from '../../../config/api'
import { TYPE_GET, TYPE_POST } from '../../../config/global'
import { fetchBackend } from '../../../utils/network'


/*
 * Fetches...
 */
const fetchStreamGet = async () => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_STREAM_GET,
  );
  return await response.json();
};


const fetchTrackGetFiles = async(trackUuid) => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_TRACK_GET_FILES,
    { trackUuid },
  );
  return await response.json();
}


/*
 * Fetches...
 */
const fetchNextTrack = async (nowPlayingTotalDurationMilliseconds, isPlanned) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_STREAM_NEXT_TRACK,
    { nowPlayingTotalDurationMilliseconds, isPlanned }
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchPauseTrack = async (nowPlayingTotalDurationMilliseconds) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_STREAM_PAUSE_TRACK,
    { nowPlayingTotalDurationMilliseconds },
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchPlayTrack = async (startedAt, nowPlayingTotalDurationMilliseconds) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_STREAM_PLAY_TRACK,
    { startedAt, nowPlayingTotalDurationMilliseconds },
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchPrevTrack = async (nowPlayingTotalDurationMilliseconds) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_STREAM_PREV_TRACK,
    { nowPlayingTotalDurationMilliseconds },
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchScan = async (startedAt, nowPlayingTotalDurationMilliseconds) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_STREAM_SCAN,
    { startedAt, nowPlayingTotalDurationMilliseconds },
  );
  const responseJson = await response.json();
  return responseJson;
};


export {
  fetchStreamGet,
  fetchNextTrack,
  fetchPauseTrack,
  fetchPlayTrack,
  fetchPrevTrack,
  fetchScan,
  fetchTrackGetFiles,
}
