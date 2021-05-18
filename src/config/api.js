// NOTE: If the API endpoint is a GET, then there is no ending slash.
//       Else, the endpoint is probably a POST and there should be a slash.


// AUTHENTICATION
export const ENDPOINT_OBTAIN_TOKENS = '/auth/obtain-tokens/'
export const ENDPOINT_REFRESH_TOKEN = '/auth/refresh-token/'
export const ENDPOINT_VERIFY_TOKEN = '/auth/verify-token/'

// USER
export const ENDPOINT_USER_GET_SETTINGS = '/users/user/get-settings'
export const ENDPOINT_USER_UPDATE_SETTINGS = '/users/user/update-settings/'
export const ENDPOINT_USER_CONNECT_SPOTIFY = '/users/user/connect-spotify/'

// TEXT COMMENT
export const ENDPOINT_TEXT_COMMENT_CREATE = '/comments/text-comment/create/'
export const ENDPOINT_TEXT_COMMENT_DELETE = '/comments/text-comment/delete/'
export const ENDPOINT_TEXT_COMMENT_LIST = '/comments/text-comment/list'

// TEXT COMMENT MODIFICATION
export const ENDPOINT_TEXT_COMMENT_MODIFICATION_CREATE = '/comments/text-comment-modification/create/'
export const ENDPOINT_TEXT_COMMENT_MODIFICATION_LIST_DELETE = '/comments/text-comment-modification/list-delete/'

// VOICE RECORDING
export const ENDPOINT_VOICE_RECORDING_CREATE = '/comments/voice-recording/create/'
export const ENDPOINT_VOICE_RECORDING_DELETE = '/comments/voice-recording/delete/'
export const ENDPOINT_VOICE_RECORDING_LIST = '/comments/voice-recording/list'

// TRACK
export const ENDPOINT_TRACK_CREATE = '/music/track/create/'
export const ENDPOINT_TRACK_GET_FILES = '/music/track/get-files'

// MUSIC
export const ENDPOINT_MUSIC_SEARCH = '/music/search'

// QUEUE
export const ENDPOINT_QUEUE_CREATE = '/streams/queue/create/'
export const ENDPOINT_QUEUE_DELETE = '/streams/queue/delete/'
export const ENDPOINT_QUEUE_LIST = '/streams/queue/list'

// STREAM
export const ENDPOINT_STREAM_GET = '/streams/stream/get'
export const ENDPOINT_STREAM_INITIALIZE = '/streams/stream/initialize/'
export const ENDPOINT_STREAM_NEXT_TRACK = '/streams/stream/next-track/'
export const ENDPOINT_STREAM_PAUSE_TRACK = '/streams/stream/pause-track/'
export const ENDPOINT_STREAM_PLAY_TRACK = '/streams/stream/play-track/'
export const ENDPOINT_STREAM_PREV_TRACK = '/streams/stream/prev-track/'
export const ENDPOINT_STREAM_SCAN = '/streams/stream/scan/'

// MARKER
export const ENDPOINT_MARKER_CREATE = '/streams/marker/create/'
export const ENDPOINT_MARKER_DELETE = '/streams/marker/delete/'

// QUEUE INTERVAL
export const ENDPOINT_QUEUE_INTERVAL_CREATE = '/streams/queue-interval/create/'
export const ENDPOINT_QUEUE_INTERVAL_DELETE = '/streams/queue-interval/delete/'
export const ENDPOINT_QUEUE_INTERVAL_STOP = '/streams/queue-interval/stop/'
