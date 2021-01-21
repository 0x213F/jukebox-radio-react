import { ENDPOINT_CREATE_TRACK_MARKER, ENDPOINT_DELETE_TRACK_MARKER, ENDPOINT_LIST_TRACK_MARKERS } from '../../config/api'
import { TYPE_GET, TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'


/*
 * Fetches...
 */
export const fetchCreateTrackMarker = async (trackUuid, timestampMilliseconds) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_CREATE_TRACK_MARKER,
    { trackUuid, timestampMilliseconds }
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
export const fetchDeleteTrackMarker = async (markerUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_DELETE_TRACK_MARKER,
    { markerUuid }
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
export const fetchListTrackMarkers = async (trackUuid) => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_LIST_TRACK_MARKERS,
    { trackUuid }
  );
  const responseJson = await response.json();
  return responseJson;
};
