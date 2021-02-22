import {
  ENDPOINT_QUEUE_INTERVAL_CREATE,
  ENDPOINT_QUEUE_INTERVAL_DELETE,
} from '../../../config/api';
import { TYPE_POST } from '../../../config/global';
import { fetchBackend } from '../../../utils/network';

/*
 * Fetches...
 */
export const fetchStreamQueueIntervalCreate = async (queueUuid, lowerBoundMarkerUuid, upperBoundMarkerUuid, isMuted, repeatCount, parentQueueUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_QUEUE_INTERVAL_CREATE,
    { queueUuid, lowerBoundMarkerUuid, upperBoundMarkerUuid, isMuted, repeatCount, parentQueueUuid }
  );
  return await response.json();
};


/*
 * Fetches...
 */
export const fetchStreamQueueIntervalDelete = async (queueIntervalUuid, queueUuid, parentQueueUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_QUEUE_INTERVAL_DELETE,
    { queueIntervalUuid, queueUuid, parentQueueUuid }
  );
  return await response.json();
};
