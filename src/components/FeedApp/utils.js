import {
  fetchTextCommentList,
  fetchVoiceRecordingList,
} from '../FeedApp/network';

import { store } from '../../utils/redux';


/*
 * Load comments and voice recordings to update the feed.
 */
export const fetchUpdateFeed = async function(trackUuid) {
  const responseJsonTextCommentList = await fetchTextCommentList(trackUuid);
  store.dispatch(responseJsonTextCommentList.redux);
  const responseJsonVoiceRecordingList = await fetchVoiceRecordingList(trackUuid);
  store.dispatch(responseJsonVoiceRecordingList.redux);
};
