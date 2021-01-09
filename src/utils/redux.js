import { createStore } from 'redux';


const initialState = {
  nextUpQueues: [],
  lastUpQueues: [],
  _lastPlayed: undefined,
}


function streamSet(state, action) {
  const stream = action.stream,
        obj = {
          ...state,
          stream: stream,
        };

  if(!stream.isPlaying && !stream.isPaused && stream.nowPlaying) {
    obj.lastUp = stream.nowPlaying;
    obj._lastPlayed = stream.nowPlaying;
    obj.stream.nowPlaying = undefined;
  }

  return obj;
}


function streamPrevTrack(state, action) {
  const lastUpQueues = [...state.lastUpQueues];
  const nowPlaying = lastUpQueues[lastUpQueues.length - 1];
  return {
      ...state,
      stream: {
        ...state.stream,
        startedAt: action.startedAt,
        nowPlaying: nowPlaying,
      },
      _lastPlayed: undefined,
  };
}


function streamNextTrack(state, action) {
  const nextUpQueues = [...state.nextUpQueues];
  const nowPlaying = (
    nextUpQueues[0].children.length ?
      nextUpQueues[0].children[0] :
      nextUpQueues[0]
  );
  return {
      ...state,
      stream: {
        ...state.stream,
        startedAt: action.startedAt,
        nowPlaying: nowPlaying,
      },
      _lastPlayed: undefined,
  };
}


function streamExpire(state, action) {
  const stream = { ...state.stream },
        _lastPlayed = stream.nowPlaying;

  stream.isPlaying = false;
  stream.isPaused = false;
  stream.nowPlaying = undefined;

  return { ...state, stream: stream, _lastPlayed: _lastPlayed };
}


function queueListSet(state, action) {
  const lastUpQueues = action.lastUpQueues,
        nextUpQueues = action.nextUpQueues,
        _lastPlayed = state._lastPlayed;

  if(_lastPlayed) {
    lastUpQueues.push(_lastPlayed);
  }

  let stream = state.stream;
  if(!stream.isPlaying && !stream.isPaused && stream.nowPlaying) {
    lastUpQueues.push(stream.nowPlaying);
    stream = { ...stream, nowPlaying: undefined }
  }

  const lastUp = (
          !lastUpQueues.length ?
            undefined :
            lastUpQueues[lastUpQueues.length - 1]
        ),
        nextUp = (
          !nextUpQueues.length ? undefined : (
            !nextUpQueues[0].children.length ?
              nextUpQueues[0] :
              nextUpQueues[0].children[0]
          )
        );
  return {
    ...state,
    stream: stream,
    lastUp: lastUp,
    lastUpQueues: lastUpQueues,
    nextUp: nextUp,
    nextUpQueues: nextUpQueues,
  }
}


function queueDeleteNode(state, action) {
  const queues = state.nextUpQueues,
        filteredQueues = queues.filter(i => i.uuid !== action.queueUuid);

  return {
    ...state,
    nextUpQueues: filteredQueues,
  }
}


function queueDeleteChildNode(state, action) {
  let queues = [...state.nextUpQueues];
  const parentIndex = queues.findIndex(i => i.uuid === action.parentUuid),
        children = queues[parentIndex].children,
        filteredChildren = children.filter(i => i.uuid !== action.queueUuid);

  queues[parentIndex].children = filteredChildren;

  if(!filteredChildren.length) {
    queues = queues.filter(i => i.uuid !== action.parentUuid);
  }

  return {
    ...state,
    nextUpQueues: queues,
  }
}


const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "stream/set":
      return streamSet(state, action);
    case "stream/prevTrack":
      return streamPrevTrack(state, action);
    case "stream/nextTrack":
      return streamNextTrack(state, action);
    case "stream/expire":
      return streamExpire(state, action);
    case "queue/listSet":
      return queueListSet(state, action);
    case "queue/deleteNode":
      return queueDeleteNode(state, action);
    case "queue/deleteChildNode":
      return queueDeleteChildNode(state, action);
    default:
      return state;
  }
}


export const store = createStore(reducer);
