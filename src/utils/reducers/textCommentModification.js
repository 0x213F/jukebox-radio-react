/*
 * ...
 */
export const textCommentModificationCreate = function(state, payload) {
  const textCommentModification = payload.textCommentModification,
        textCommentUuid = payload.textCommentUuid,
        textComments = [...state.textComments],
        textCommentIndex = textComments.findIndex(t => (
          t.uuid === textCommentUuid
        )),
        textComment = textComments[textCommentIndex],
        modifications = [...textComment.modifications];

  modifications.push(textCommentModification);
  const sortedModifications = modifications.sort((a, b) => {
    return a.startPtr - b.startPtr;
  });
  textComments[textCommentIndex].modifications = sortedModifications;

  return {
    ...state,
    textComments: textComments,
  }
}
