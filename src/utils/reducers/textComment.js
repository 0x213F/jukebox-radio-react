import { feedGenerate } from './feed';


/*
 * ...
 */
export const textCommentListSet = function(state, payload) {
  const textComments = payload.textComments,
        updatedState = {
          ...state,
          textComments: textComments,
        };

  return {
    ...updatedState,
    feed: feedGenerate(updatedState),
  };
}


/*
 *
 */
export const textCommentCreate = function(state, payload) {
  const textComments = [...state.textComments, payload.textComment],
        updatedState = {
          ...state,
          textComments: textComments,
        };

  return {
    ...updatedState,
    feed: feedGenerate(updatedState),
  };
}


/*
 *
 */
export const textCommentDelete = function(state, payload) {
  const deleteByUuid = i => i.uuid !== payload.textCommentUuid,
        textComments = state.textComments.filter(deleteByUuid),
        updatedState = {
          ...state,
          textComments: textComments,
        };

  return {
    ...updatedState,
    feed: feedGenerate(updatedState),
  };
}
