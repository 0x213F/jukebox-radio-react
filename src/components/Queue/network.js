import { ENDPOINT_LIST_QUEUES, ENDPOINT_DELETE_QUEUE } from '../../config/api'
import { TYPE_GET, TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'

/*
 * Fetches...
 */
export const fetchListQueues = async () => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_LIST_QUEUES,
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
export const fetchDeleteQueue = async (queueUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_DELETE_QUEUE,
    { queueUuid: queueUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};
