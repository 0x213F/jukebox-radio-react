import { generateFeed } from './feed';


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
    feed: generateFeed(updatedState),
  };
}


/*
 *
 */
export const textCommentCreate = function(state, action) {
  const textComments = [...state.textComments, action.textComment],
        updatedState = {
          ...state,
          textComments: textComments,
        };
  console.log(action.textComment)
  return {
    ...updatedState,
    feed: generateFeed(updatedState),
  };
}


/*
 *
 */
export const textCommentDelete = function(state, action) {
  const deleteByUuid = i => i.uuid !== action.textCommentUuid,
        textComments = state.textComments.filter(deleteByUuid),
        updatedState = {
          ...state,
          textComments: textComments,
        };

  return {
    ...updatedState,
    feed: generateFeed(updatedState),
  };
}
