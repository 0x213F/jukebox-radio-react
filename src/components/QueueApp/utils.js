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
  for(let queue of queues) {
    if(queue.children.length) {
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

export const durationPretty = function(durationMilliseconds) {
  var s = durationMilliseconds;

  // Pad to 2 or 3 digits, default is 2
  function pad(n, z) {
    z = z || 2;
    return ('00' + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  if(durationMilliseconds >= 1000 * 60 * 60) {
    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
  } else {
    return pad(mins) + ':' + pad(secs);
  }
}
