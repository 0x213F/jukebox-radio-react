import {
  ENDPOINT_STREAM_GET,
  ENDPOINT_STREAM_NEXT_TRACK,
  ENDPOINT_STREAM_PAUSE_TRACK,
  ENDPOINT_STREAM_PLAY_TRACK,
  ENDPOINT_STREAM_PREVIOUS_TRACK,
  ENDPOINT_STREAM_SCAN_BACKWARD,
  ENDPOINT_STREAM_SCAN_FORWARD,
} from '../../config/api'
import { TYPE_GET, TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'


/*
 * Fetches...
 */
const fetchStream = async () => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_STREAM_GET,
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchNextTrack = async () => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_STREAM_NEXT_TRACK,
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchPauseTrack = async () => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_STREAM_PAUSE_TRACK,
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchPlayTrack = async () => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_STREAM_PLAY_TRACK,
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchPreviousTrack = async () => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_STREAM_PREVIOUS_TRACK,
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchScanBackward = async () => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_STREAM_SCAN_BACKWARD,
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchScanForward = async () => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_STREAM_SCAN_FORWARD,
  );
  const responseJson = await response.json();
  return responseJson;
};

export {
  fetchStream,
  fetchNextTrack,
  fetchPauseTrack,
  fetchPlayTrack,
  fetchPreviousTrack,
  fetchScanBackward,
  fetchScanForward,
}
