/*
 * Create a marker relevant to a queue item (track).
 */
export const markerCreate = function(state, action) {
  const markerMap = { ...state.markerMap },
        marker = action.marker;

  if(markerMap[marker.trackUuid] === undefined || markerMap[marker.trackUuid].length === 0) {
    markerMap[marker.trackUuid] = {};
  }

  markerMap[marker.trackUuid][marker.uuid] = marker;

  return {
    ...state,
    markerMap: markerMap,
  };
}


/*
 * Delete a marker relevant to a queue item (track).
 */
export const markerDelete = function(state, action) {
  const markerMap = { ...state.markerMap },
        marker = action.marker,
        markers = markerMap[action.queueUuid];

  delete markers[marker.uuid];

  return {
    ...state,
    markerMap: markerMap,
  };
}
