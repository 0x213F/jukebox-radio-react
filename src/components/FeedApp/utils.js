import {
  fetchTextCommentList,
  fetchVoiceRecordingList,
} from '../FeedApp/network';

import { store } from '../../utils/redux';


/*
 * Load comments and voice recordings to update the feed.
 */
export const updateFeed = async function() {
  const responseJsonTextCommentList = await fetchTextCommentList();
  const responseJsonVoiceRecordingList = await fetchVoiceRecordingList();
  store.dispatch(responseJsonTextCommentList.redux);
  store.dispatch(responseJsonVoiceRecordingList.redux);
};
