
/*
 *
 */
export const getMarkers = function(markerMap, trackUuid) {
  if(!trackUuid) {
    return [];
  }
  return Object.values(markerMap[trackUuid] || []);
};

/*
 * Markers have to be cleaned from their raw data state (from server).
 * Additional data needs to be added to them, calculated here (on the FE).
 *
 * NOTE: this is legacy code, probably should be cleaned up at some point!
 */
export const cleanMarkers = function(markers, queue, duration, position) {

  // Firstly, sort
  markers = markers.sort((a, b) => {
    return a.timestampMilliseconds - b.timestampMilliseconds;
  });

  // Secondly, is there a force display?
  const alreadyForceDisplay = !!markers.filter(m => m.forceDisplay).length;

  let runningMark = 8;
  for(let i=0; i < markers.length; i++) {
    markers[i] = { ...markers[i] };

    let pix = markers[i].timestampMilliseconds / duration * 100;
    markers[i].styleLeft = `calc(${pix}% - ${runningMark}px)`;
    runningMark += 0;

    // Force display contextual marker
    if(!alreadyForceDisplay) {
      if(markers[i].timestampMilliseconds <= position) {
        markers[i].forceDisplay = true;
        if(i !== 0) {
          markers[i - 1].forceDisplay = false;
        }
      } else {
        markers[i].forceDisplay = false;
      }
    } else {
      if(!markers[i].forceDisplay) {
        markers[i].forceDisplay = false;
      }
    }

    // Allow "stop"
    if(markers[i].timestampMilliseconds > position + 5000) {
      markers[i].stoppable = true;
    } else {
      markers[i].stoppable = false;
    }

    // Change styles for markers that are "not playable"
    for(let j=0; j < queue.allIntervals.length; j++) {
      const interval = queue.allIntervals[j],
            notPlayable = (
              interval.purpose === 'muted' &&
              interval.startPosition <= markers[i].timestampMilliseconds &&
              interval.endPosition > markers[i].timestampMilliseconds
            );

      markers[i].playable = true;
      if(notPlayable) {
        markers[i].playable = false;

        // If this is the end of the song, do not allow "stop"
        const playbackIntervals = queue.playbackIntervals,
              endPosition = playbackIntervals[playbackIntervals.length - 1].endPosition,
              forceStoppable = (
                markers[i].timestampMilliseconds === endPosition ||
                (
                  interval.startPosition < markers[i].timestampMilliseconds &&
                  interval.endPosition > markers[i].timestampMilliseconds
                )
              );
        if(forceStoppable) {
          markers[i].stoppable = false;
        }
        break;
      }
    }
  }

  return markers;
}
