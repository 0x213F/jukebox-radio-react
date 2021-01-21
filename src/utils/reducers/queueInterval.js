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
  const queueInterval = action.queueInterval,
        queueUuid = action.queueUuid,
        parentQueueUuid = action.parentQueueUuid;

  // get the queue that the queue interval belongs too.
  let queues = state.nextUpQueues;
  let parentIndex, index;
  if(parentQueueUuid) {
    parentIndex = queues.findIndex(findByUuid(parentQueueUuid));
    queues = queues[parentIndex].children;
  }
  index = queues.findIndex(findByUuid(queueUuid));
  const trackQueue = queues[index];

  console.log(trackQueue);

  // add queue interval to that queue (and sort).
  const queueIntervals = [...trackQueue.intervals, queueInterval],
        sortedQueueIntervals = queueIntervals.sort(sortQueueIntervals);

  // save the state
  const nextUpQueues = [...state.nextUpQueues];
  if(parentIndex) {
    nextUpQueues[parentIndex].children[index].intervals = sortedQueueIntervals;
  } else {
    nextUpQueues[index].intervals = sortedQueueIntervals;
  }
  return {
    ...state,
    nextUpQueues: nextUpQueues,
  };
}


/*
 * Delete a queue interval relevant to a queue item (track).
 */
 export const queueIntervalDelete = function(state, action) {
   const queueInterval = action.queueInterval,
         queueUuid = action.queueUuid,
         parentQueueUuid = action.parentQueueUuid;

   // get the queue that the queue interval belongs too.
   let queues = state.nextUpQueues;
   let parentIndex, index;
   if(parentQueueUuid) {
     parentIndex = queues.findIndex(findByUuid(parentQueueUuid));
     queues = queues[parentIndex].children;
   }
   index = queues.findIndex(findByUuid(queueUuid));
   const trackQueue = queues[index];

   // delete queue interval from that queue.
   const queueIntervals = trackQueue.intervals,
         deletedIndex = queueIntervals.findIndex(findByUuid(queueInterval.uuid)),
         filteredQueueIntervals = queueIntervals.filter(filterByUuid(deletedIndex));

   // save the state
   const nextUpQueues = [...state.nextUpQueues];
   if(parentIndex) {
     nextUpQueues[parentIndex].children[index].intervals = filteredQueueIntervals;
   } else {
     nextUpQueues[index].intervals = filteredQueueIntervals;
   }
   return {
     ...state,
     nextUpQueues: nextUpQueues,
   };
 }
