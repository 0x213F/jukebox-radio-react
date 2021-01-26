import { ENDPOINT_QUEUE_LIST, ENDPOINT_QUEUE_DELETE } from '../../config/api'
import { TYPE_GET, TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'

/*
 * Fetches...
 */
export const fetchQueueList = async () => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_QUEUE_LIST,
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
    ENDPOINT_QUEUE_DELETE,
    { queueUuid: queueUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};
