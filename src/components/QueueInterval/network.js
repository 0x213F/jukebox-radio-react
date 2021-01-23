import {
  ENDPOINT_QUEUE_INTERVAL_CREATE,
  ENDPOINT_QUEUE_INTERVAL_DELETE,
} from '../../config/api';
import { TYPE_POST } from '../../config/global';
import { fetchBackend } from '../../utils/network';
import { store } from '../../utils/redux';

/*
 * Fetches...
 */
export const fetchStreamQueueIntervalCreate = async (queueUuid, lowerBoundMarkerUuid, upperBoundMarkerUuid, isMuted, repeatCount, parentQueueUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_QUEUE_INTERVAL_CREATE,
    { queueUuid, lowerBoundMarkerUuid, upperBoundMarkerUuid, isMuted, repeatCount, parentQueueUuid }
  );
  const responseJson = await response.json();
  await store.dispatch(responseJson.redux);
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
  const responseJson = await response.json();
  await store.dispatch(responseJson.redux);
};
