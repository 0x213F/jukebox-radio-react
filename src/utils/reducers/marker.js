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
export const markerDelete = function(state, payload) {
  const markerMap = { ...state.markerMap },
        marker = payload.marker,
        markers = { ...markerMap[marker.trackUuid] };

  delete markers[marker.uuid];
  markerMap[marker.trackUuid] = markers;

  return { ...state, markerMap };
}
