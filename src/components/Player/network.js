import {
  ENDPOINT_GET_STREAM,
  ENDPOINT_NEXT_TRACK,
  ENDPOINT_PAUSE_TRACK,
  ENDPOINT_PLAY_TRACK,
  ENDPOINT_PREVIOUS_TRACK,
  ENDPOINT_SCAN_BACKWARD,
  ENDPOINT_SCAN_FORWARD,
} from '../../config/api'
import { TYPE_GET, TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'


/*
 * Fetches...
 */
const fetchStream = async () => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_GET_STREAM,
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
    ENDPOINT_NEXT_TRACK,
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
    ENDPOINT_PAUSE_TRACK,
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
    ENDPOINT_PLAY_TRACK,
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
    ENDPOINT_PREVIOUS_TRACK,
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
    ENDPOINT_SCAN_BACKWARD,
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
    ENDPOINT_SCAN_FORWARD,
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
