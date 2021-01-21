import {
  ENDPOINT_CREATE_QUEUE_INTERVAL,
  ENDPOINT_DELETE_QUEUE_INTERVAL,
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
    ENDPOINT_CREATE_QUEUE_INTERVAL,
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
    ENDPOINT_DELETE_QUEUE_INTERVAL,
    { queueIntervalUuid, queueUuid, parentQueueUuid }
  );
  const responseJson = await response.json();
  await store.dispatch(responseJson.redux);
};
