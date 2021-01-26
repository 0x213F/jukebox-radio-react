import {
  ENDPOINT_MARKER_CREATE,
  ENDPOINT_MARKER_DELETE,
  ENDPOINT_MARKER_LIST,
} from '../../config/api';
import { TYPE_GET, TYPE_POST } from '../../config/global';
import { fetchBackend } from '../../utils/network';


/*
 * Creates a marker. The queue context is passed so the Redux state may be
 * updated.
 */
export const fetchStreamMarkerCreate = async (trackUuid, timestampMilliseconds, queueUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_MARKER_CREATE,
    { trackUuid, timestampMilliseconds, queueUuid }
  );
  return await response.json();
};


/*
 * Deletes a marker. The queue context is passed so the Redux state may be
 * updated.
 */
export const fetchStreamMarkerDelete = async (markerUuid, queueUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_MARKER_DELETE,
    { markerUuid, queueUuid }
  );
  return await response.json();
};

/*
 * Fetches a list of markers for a given track. The queue context is passed so
 * the Redux state may be updated.
 */
export const fetchStreamMarkerList = async (trackUuid, queueUuid) => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_MARKER_LIST,
    { trackUuid, queueUuid }
  );
  return await response.json();
};
