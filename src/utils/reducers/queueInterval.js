 import { finalizeQueue } from './queue';


/*
 * Used to "findIndex" by uuid in an array.
 */
const findByUuid = function(uuid) {
  return (o => o.uuid === uuid);
}


/*
 * Used to "filter" out by uuid in an array.
 */
const filterByUuid = function(uuid) {
  return (o => o.uuid !== uuid);
}


/*
 * Used to "sort" and array containing queue intervals.
 */
const sortQueueIntervals = function(a, b) {
  if(!b.upperBound) {
    return -1;
  } else if(!a.upperBound) {
    return 1;
  } else {
    return (
      a.upperBound.timestampMilliseconds -
      a.upperBound.timestampMilliseconds
    );
  }
}


/*
 * Create a queue interval relevant to a queue item (track).
 */
export const queueIntervalCreate = function(state, action) {
  const stream = { ...state.stream },
        queueInterval = action.queueInterval,
        queueUuid = action.queueUuid,
        parentQueueUuid = action.parentQueueUuid;

  // get the queue that the queue interval belongs too.
  let queues = state.nextUpQueues;
  let parentIndex = -1, index;
  if(parentQueueUuid) {
    parentIndex = queues.findIndex(findByUuid(parentQueueUuid));
    queues = queues[parentIndex].children;
  }
  index = queues.findIndex(findByUuid(queueUuid));
  const trackQueue = index > -1 ? queues[index] : stream.nowPlaying;

  // add queue interval to that queue (and sort).
  const queueIntervals = [...trackQueue.intervals, queueInterval],
        sortedQueueIntervals = queueIntervals.sort(sortQueueIntervals);

  // save the state
  let nextUpQueues;
  if(index > -1) {
    // when adding a queue interval to a next up queue
    nextUpQueues = [...state.nextUpQueues];
    if(parentIndex !== -1) {
      nextUpQueues[parentIndex].children[index].intervals = sortedQueueIntervals;
    } else {
      nextUpQueues[index].intervals = sortedQueueIntervals;
    }
  } else {
    // when adding a queue interval to now playing
    stream.nowPlaying.intervals = sortedQueueIntervals;
    return {
      ...state,
      stream: stream,
    };
  }

  // update playback intervals
  const finalizedNextUpQueues = nextUpQueues.map(finalizeQueue);

  return {
    ...state,
    nextUpQueues: finalizedNextUpQueues,
  };
}


/*
 * Delete a queue interval relevant to a queue item (track).
 */
export const queueIntervalDelete = function(state, action) {
  const stream = { ...state.stream },
        queueInterval = action.queueInterval,
        queueUuid = action.queueUuid,
        parentQueueUuid = action.parentQueueUuid;

  // get the queue that the queue interval belongs too.
  let queues = state.nextUpQueues;
  let parentIndex = -1, index;
  if(parentQueueUuid) {
    parentIndex = queues.findIndex(findByUuid(parentQueueUuid));
    queues = queues[parentIndex].children;
  }
  index = queues.findIndex(findByUuid(queueUuid));
  const trackQueue = index > -1 ? queues[index] : stream.nowPlaying;

  // delete queue interval from that queue.
  const queueIntervals = [...trackQueue.intervals],
        filteredQueueIntervals = queueIntervals.filter(filterByUuid(queueInterval.uuid));

  // save the state
  let nextUpQueues;
  if(index > -1) {
    // when deleting a queue interval from a next up queue
    nextUpQueues = [...state.nextUpQueues];
    if(parentIndex !== -1) {
      nextUpQueues[parentIndex].children[index].intervals = filteredQueueIntervals;
    } else {
      nextUpQueues[index].intervals = filteredQueueIntervals;
    }
  } else {
    // when deleting a queue interval from now playing
    stream.nowPlaying.intervals = filteredQueueIntervals;
    return {
      ...state,
      stream: stream,
    };
  }

  // update playback intervals
  const finalizedNextUpQueues = nextUpQueues.map(finalizeQueue);

  return {
   ...state,
   nextUpQueues: finalizedNextUpQueues,
  };
}
