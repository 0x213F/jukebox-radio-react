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
