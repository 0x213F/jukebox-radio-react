import { getProgress } from '../PlaybackApp/utils';


/*
 * Returns the (track) queue item that was last played.
 */
export const getLastUpQueue = function(lastUpQueues) {
  return lastUpQueues[lastUpQueues.length - 1];
}


/*
 * Returns the (track) queue item that will be played next.
 */
export const getNextUpQueue = function(nextUpQueues) {
  return (
    nextUpQueues.length ?
      (nextUpQueues[0].children.length ?
        nextUpQueues[0].children[0] :
        nextUpQueues[0]) :
      undefined
  );
}


/*
 *
 */
export const flattenQueues = function(queues) {
  if(!queues.length) {
    return undefined;
  }

  const flattenedQueues = [];
  console.log(queues)
  for(let queue of queues) {
    if(queue?.children?.length) {
      for(let child of queue.children) {
        flattenedQueues.push(child);
      }
    } else {
      flattenedQueues.push(queue);
    }
  }

  return flattenedQueues;
}


/*
 * Returns the (track) queue item that will be played next.
 */
export const getQueueDuration = function(queues, stream) {

  // Determines the duration of a queue object.
  const getDuration = function(queue) {
    let total = 0;
    if(queue.children.length) {
      for(let child of queue.children) {
        total += child.totalDurationMilliseconds;
      }
    } else {
      total += queue.totalDurationMilliseconds;
    }
    return total;
  }

  // Reducer function which reduces an array of queues into total duration.
  const reducer = function(total, curr) {
    if(typeof(total) !== 'number') {
      total = getDuration(total);
    }
    total += getDuration(curr);
    return total;
  };

  // In addition to whatever is queued up, we must add the remaining progress
  // of whatever is now playing in the stream.
  const progress = getProgress(stream);
  let remainingProgress = 0;
  if(progress) {
    remainingProgress = stream.nowPlaying.totalDurationMilliseconds - progress;
  }

  // Now add determine the total length of all queue objects.
  // NOTE: Reduce works differently in JavaScript than in Python! Someone
  //       explain this madness to me!! 0x213F
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
  if(!queues.length) {
    return remainingProgress + 0;
  } else if (queues.length === 1) {
    return remainingProgress + getDuration(queues[0]);
  } else {
    return remainingProgress + queues.reduce(reducer);
  }
}
