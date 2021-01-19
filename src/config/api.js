const ENDPOINT_OBTAIN_AUTH_TOKEN = '/auth/obtain-tokens/'
const ENDPOINT_REFRESH_AUTH_TOKEN = '/auth/refresh-token/'
const ENDPOINT_VERIFY_TOKEN = '/auth/verify-token/'

const ENDPOINT_CREATE_TEXT_COMMENT = '/comments/text-comment/create/'
const ENDPOINT_LIST_TEXT_COMMENTS = '/comments/text-comment/list'
const ENDPOINT_UPDATE_TEXT_COMMENT = '/comments/text-comment/update/'
const ENDPOINT_DELETE_TEXT_COMMENT = '/comments/text-comment/delete/'

const ENDPOINT_CREATE_TEXT_COMMENT_MODIFICATION = '/comments/text-comment-modification/create/'
const ENDPOINT_LIST_DELETE_TEXT_COMMENT_MODIFICATIONS = '/comments/text-comment-modification/list-delete/'

const ENDPOINT_CREATE_VOICE_RECORDING = '/comments/voice-recording/create/'
const ENDPOINT_LIST_VOICE_RECORDINGS = '/comments/voice-recording/list'
const ENDPOINT_DELETE_VOICE_RECORDING = '/comments/voice-recording/delete/'

const ENDPOINT_LIST_QUEUES = '/streams/queue/list'
const ENDPOINT_DELETE_QUEUE = '/streams/queue/delete/'

const ENDPOINT_CREATE_TRACK = '/music/track/create/'
const ENDPOINT_SEARCH_MUSIC = '/music/search'

const ENDPOINT_CREATE_QUEUE = '/streams/queue/create/'

const ENDPOINT_GET_STREAM = '/streams/stream/get'
const ENDPOINT_INTIALIZE_STREAM = '/streams/stream/initialize/'
const ENDPOINT_NEXT_TRACK = '/streams/stream/next-track/'
const ENDPOINT_PAUSE_TRACK = '/streams/stream/pause-track/'
const ENDPOINT_PLAY_TRACK = '/streams/stream/play-track/'
const ENDPOINT_PREVIOUS_TRACK = '/streams/stream/previous-track/'
const ENDPOINT_SCAN_BACKWARD = '/streams/stream/scan-backward/'
const ENDPOINT_SCAN_FORWARD = '/streams/stream/scan-forward/'

const ENDPOINT_GET_USER_SETTINGS = '/users/user/get-settings'

export {
  ENDPOINT_OBTAIN_AUTH_TOKEN,
  ENDPOINT_REFRESH_AUTH_TOKEN,
  ENDPOINT_VERIFY_TOKEN,

  ENDPOINT_CREATE_TEXT_COMMENT,
  ENDPOINT_LIST_TEXT_COMMENTS,
  ENDPOINT_UPDATE_TEXT_COMMENT,
  ENDPOINT_DELETE_TEXT_COMMENT,

  ENDPOINT_CREATE_TEXT_COMMENT_MODIFICATION,
  ENDPOINT_LIST_DELETE_TEXT_COMMENT_MODIFICATIONS,

  ENDPOINT_CREATE_VOICE_RECORDING,
  ENDPOINT_LIST_VOICE_RECORDINGS,
  ENDPOINT_DELETE_VOICE_RECORDING,

  ENDPOINT_LIST_QUEUES,
  ENDPOINT_DELETE_QUEUE,

  ENDPOINT_CREATE_TRACK,
  ENDPOINT_SEARCH_MUSIC,

  ENDPOINT_CREATE_QUEUE,

  ENDPOINT_GET_STREAM,
  ENDPOINT_INTIALIZE_STREAM,
  ENDPOINT_NEXT_TRACK,
  ENDPOINT_PAUSE_TRACK,
  ENDPOINT_PLAY_TRACK,
  ENDPOINT_PREVIOUS_TRACK,
  ENDPOINT_SCAN_BACKWARD,
  ENDPOINT_SCAN_FORWARD,

  ENDPOINT_GET_USER_SETTINGS,
}
