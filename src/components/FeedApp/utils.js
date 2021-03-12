import {
  fetchTextCommentList,
  fetchVoiceRecordingList,
} from '../FeedApp/network';

import { store } from '../../utils/redux';


/*
 * Load comments and voice recordings to update the feed.
 */
export const updateFeed = async function(trackUuid) {
  const responseJsonTextCommentList = await fetchTextCommentList(trackUuid);
  const responseJsonVoiceRecordingList = await fetchVoiceRecordingList(trackUuid);
  store.dispatch(responseJsonTextCommentList.redux);
  store.dispatch(responseJsonVoiceRecordingList.redux);
};
