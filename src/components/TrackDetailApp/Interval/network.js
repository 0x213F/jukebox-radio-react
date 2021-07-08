import {
  ENDPOINT_QUEUE_INTERVAL_CREATE,
  ENDPOINT_QUEUE_INTERVAL_DELETE,
  ENDPOINT_QUEUE_INTERVAL_STOP,
} from '../../../config/api';
import { TYPE_POST } from '../../../config/global';
import { fetchBackend } from '../../../utils/network';

/*
 * Fetches...
 */
export const fetchStreamQueueIntervalCreate = async (queueUuid, lowerBoundMarkerUuid, upperBoundMarkerUuid, purpose, repeatCount, parentQueueUuid) => {
  const stemVocals = true,
        stemDrums = true,
        stemBass = true,
        stemPiano = true,
        stemOther = true;

  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_QUEUE_INTERVAL_CREATE,
    {
      queueUuid, lowerBoundMarkerUuid, upperBoundMarkerUuid, purpose, repeatCount, parentQueueUuid,
      stemVocals, stemDrums, stemBass, stemPiano, stemOther,
    }
  );
  return await response.json();
};


/*
 * Fetches...
 */
export const fetchStreamQueueIntervalStop = async (queueUuid, markerUuid, parentQueueUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_QUEUE_INTERVAL_STOP,
    { queueUuid, markerUuid, parentQueueUuid }
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
