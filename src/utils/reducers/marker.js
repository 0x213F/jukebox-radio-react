/*
 * Create a marker relevant to a queue item (track).
 */
export const markerCreate = function(state, action) {
  const trackMarkerMap = { ...state.trackMarkerMap },
        queueUuid = action.queueUuid,
        marker = action.marker,
        markers = [...trackMarkerMap[queueUuid], marker],
        sortedMarkers = markers.sort((a, b) => {
          return a.timestampMilliseconds - b.timestampMilliseconds;
        });
  trackMarkerMap[queueUuid] = sortedMarkers;
  return {
    ...state,
    trackMarkerMap: trackMarkerMap,
  };
}


/*
 * Delete a marker relevant to a queue item (track).
 */
export const markerDelete = function(state, action) {
  const trackMarkerMap = { ...state.trackMarkerMap },
        queueUuid = action.queueUuid,
        marker = action.marker,
        markers = trackMarkerMap[action.queueUuid],
        filteredMarkers = markers.filter(m => m.uuid !== marker.uuid);
  trackMarkerMap[queueUuid] = filteredMarkers;
  return {
    ...state,
    trackMarkerMap: trackMarkerMap,
  };
}


/*
 * Set the markers on a queue item (track).
 */
export const markerList = function(state, action) {
  const queueUuid = action.queueUuid,
        markers = action.markers,
        trackMarkerMap = { ...state.trackMarkerMap };
  trackMarkerMap[queueUuid] = markers;
  return {
    ...state,
    trackMarkerMap: trackMarkerMap
  };
}
