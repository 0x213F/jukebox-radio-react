/*
 * ...
 */
export const textCommentModificationCreate = function(state, payload) {
  const textCommentMap = { ...state.textCommentMap },
        textCommentModifications = payload.textCommentModifications,
        modifiedModification = textCommentModifications.modified,
        deletedModifications = textCommentModifications.deleted,
        textCommentUuid = payload.textCommentUuid,
        textComment = { ...state.textCommentMap[textCommentUuid] };

  let modifications = [...textComment.modifications],
      existingIdx;
  existingIdx = modifications.findIndex(t => (
    t.uuid === modifiedModification.uuid
  ));
  if(existingIdx !== -1) {
    modifications[existingIdx] = modifiedModification;
  } else {
    modifications.push(modifiedModification);
    modifications = modifications.sort((a, b) => {
      return a.startPtr - b.startPtr;
    });
  }

  if(deletedModifications) {
    for(let idx=0; idx < deletedModifications.length; idx++) {
      const deletedModification = deletedModifications[idx];
      existingIdx = modifications.findIndex(t => (
        t.uuid === deletedModifications.uuid
      ));
      if(existingIdx !== -1) {
        modifications = modifications.filter(i => i.uuid !== deletedModification.uuid);
      }
    }
  }

  textComment.modifications = modifications;
  textCommentMap[textComment.uuid] = textComment;

  return { ...state, textCommentMap };
}


/*
 * ...
 */
export const textCommentClearModifications = function(state, payload) {
  const textCommentMap = { ...state.textCommentMap },
        textCommentUuid = payload.textCommentUuid,
        textComment = textCommentMap[textCommentUuid];

  textComment.modifications = [];
  textCommentMap[textCommentUuid] = textComment;

  return { ...state, textCommentMap };
}
