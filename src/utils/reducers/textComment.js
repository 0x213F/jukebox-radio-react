/*
 * ...
 */
export const textCommentListSet = function(state, payload) {
  const textComments = payload.textComments,
        trackUuid = payload.trackUuid,
        textCommentMap = { ...state.textCommentMap },
        feedApp = { ...state.feedApp },
        trackMap = { ...state.feedApp.trackMap };

  for(let textComment of textComments) {
    textCommentMap[textComment.uuid] = textComment;
  }

  if(!trackMap.hasOwnProperty(trackUuid)) {
    trackMap[trackUuid] = {};
  }
  const textCommentUuids = textComments.map(obj => obj.uuid);
  trackMap[trackUuid].textCommentUuids = textCommentUuids;
  feedApp.trackMap = trackMap;

  return { ...state, feedApp, textCommentMap };
}


/*
 *
 */
export const textCommentCreate = function(state, payload) {
  const textComment = payload.textComment,
        trackUuid = textComment.trackUuid,
        textCommentMap = { ...state.textCommentMap },
        feedApp = { ...state.feedApp },
        textCommentUuids = [...state.feedApp.trackMap[trackUuid].textCommentUuids];

  textComment.forceDisplay = true;
  textCommentMap[textComment.uuid] = textComment;
  textCommentUuids.push(textComment.uuid);
  feedApp.trackMap[trackUuid].textCommentUuids = textCommentUuids;

  return { ...state, feedApp, textCommentMap };
}


/*
 *
 */
export const textCommentDelete = function(state, payload) {
  const textCommentUuid = payload.textCommentUuid,
        trackUuid = payload.trackUuid,
        textCommentMap = { ...state.textCommentMap },
        feedApp = { ...state.feedApp },
        trackMap = { ...state.feedApp.trackMap };

  let textCommentUuids;
  const deleteByUuid = uuid => uuid !== textCommentUuid;
  textCommentUuids = [...trackMap[trackUuid].textCommentUuids];
  textCommentUuids = textCommentUuids.filter(deleteByUuid);

  trackMap[trackUuid].textCommentUuids = textCommentUuids;
  feedApp.trackMap = trackMap;

  delete textCommentMap[textCommentUuid];

  return { ...state, feedApp, textCommentMap };
}
