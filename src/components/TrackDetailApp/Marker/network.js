import {
  ENDPOINT_MARKER_CREATE,
  ENDPOINT_MARKER_DELETE,
} from '../../../config/api';
import { TYPE_POST } from '../../../config/global';
import { fetchBackend } from '../../../utils/network';


/*
 * Creates a marker. The queue context is passed so the Redux state may be
 * updated.
 */
export const fetchStreamMarkerCreate = async (trackUuid, timestampMilliseconds, queueUuid, name) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_MARKER_CREATE,
    { trackUuid, timestampMilliseconds, queueUuid, name }
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
