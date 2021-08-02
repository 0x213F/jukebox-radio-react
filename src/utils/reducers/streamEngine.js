
/*
 * Returns the intial state value for the streamEngine component.
 */
export const initialState = function() {
  return {
    loadedQueueUuids: new Set(),
  };
}


/*
 * Adds a queueUuid to the set of loaded queueUuids.
 */
export const queueLoaded = function(state, payload) {
  const queueUuid = payload.queueUuid,
        streamEngine = { ...state.streamEngine };
  streamEngine.loadedQueueUuids.add(queueUuid);
  return { ...state, streamEngine };
}
