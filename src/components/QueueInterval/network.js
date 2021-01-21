import { ENDPOINT_CREATE_QUEUE_INTERVAL, ENDPOINT_DELETE_QUEUE_INTERVAL } from '../../config/api'
import { TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'

/*
 * Fetches...
 */
export const fetchCreateQueueInterval = async (queueUuid, lowerBoundMarkerUuid, upperBoundMarkerUuid, isMuted, repeatCount) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_CREATE_QUEUE_INTERVAL,
    { queueUuid, lowerBoundMarkerUuid, upperBoundMarkerUuid, isMuted, repeatCount }
  );
  const responseJson = await response.json();
  return responseJson;
};


/*
 * Fetches...
 */
export const fetchDeleteQueueInterval = async (queueIntervalUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_DELETE_QUEUE_INTERVAL,
    { queueIntervalUuid }
  );
  const responseJson = await response.json();
  return responseJson;
};
