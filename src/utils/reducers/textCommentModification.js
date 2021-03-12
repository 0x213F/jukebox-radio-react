/*
 * ...
 */
export const textCommentModificationCreate = function(state, payload) {
  const textCommentModifications = payload.textCommentModifications,
        modifiedModification = textCommentModifications.modified,
        deletedModifications = textCommentModifications.deleted,
        textCommentUuid = payload.textCommentUuid,
        textComments = [...state.textComments],
        textCommentIndex = textComments.findIndex(t => (
          t.uuid === textCommentUuid
        )),
        textComment = textComments[textCommentIndex];

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

  textComments[textCommentIndex].modifications = modifications;

  return {
    ...state,
    textComments: textComments,
  }
}


/*
 * ...
 */
export const textCommentClearModifications = function(state, payload) {
  const textCommentIndex = state.textComments.findIndex(t => t.uuid === payload.textCommentUuid),
        textComments = [...state.textComments];

  textComments[textCommentIndex].modifications = [];

  return {
    ...state,
    textComments: textComments,
  }
}
