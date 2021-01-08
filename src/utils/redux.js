import { createStore } from 'redux';


const initialState = {
  nextUpQueues: [],
  lastUpQueues: [],
  _lastPlayed: undefined,
}


const reducer = (state = initialState, action) => {
  let queues,
      lastUpQueues,
      stream,
      nowPlaying,
      nextUpQueues,
      obj;
  switch (action.type) {
    case "stream/set":
      stream = action.stream;
      obj = {
        ...state,
        stream: stream,
      };

      if(!stream.isPlaying && !stream.isPaused && stream.nowPlaying) {
        // obj.lastUpQueues = [...state.lastUpQueues, stream.nowPlaying];
        obj.lastUp = stream.nowPlaying;
        obj._lastPlayed = stream.nowPlaying;
        obj.stream.nowPlaying = undefined;
      }

      return obj
    case "stream/prevTrack":
      lastUpQueues = [...state.lastUpQueues];
      nowPlaying = lastUpQueues[lastUpQueues.length - 1];
      return {
          ...state,
          stream: {
            ...state.stream,
            startedAt: action.startedAt,
            nowPlaying: nowPlaying,
          }
      };
    case "stream/nextTrack":
      nextUpQueues = [...state.nextUpQueues];
      nowPlaying = (
        nextUpQueues[0].children.length ?
          nextUpQueues[0].children[0] :
          nextUpQueues[0]
      )
      return {
          ...state,
          stream: {
            ...state.stream,
            startedAt: action.startedAt,
            nowPlaying: nowPlaying,
          }
      };
    case "stream/expire":
      stream = { ...state.stream };

      stream.isPlaying = false;
      stream.isPaused = false;
      const tempVar = stream.nowPlaying;
      stream.nowPlaying = undefined;

      return { ...state, stream: stream, _lastPlayed: tempVar };
    case "queue/listSet":
      lastUpQueues = action.lastUpQueues;
      nextUpQueues = action.nextUpQueues;

      const _lastPlayed = state._lastPlayed;
      if(_lastPlayed) {
        lastUpQueues.push(_lastPlayed);
      }

      stream = state.stream;
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
    case "queue/deleteNode":
      queues = state.nextUpQueues;
      const filteredQueues = queues.filter(i => i.uuid !== action.queueUuid);

      return {
        ...state,
        nextUpQueues: filteredQueues,
      }
    case "queue/deleteChildNode":
      queues = [...state.nextUpQueues];

      const parentIndex = queues.findIndex(i => i.uuid === action.parentUuid);
      const children = queues[parentIndex].children;

      const filteredChildren = children.filter(i => i.uuid !== action.queueUuid);
      queues[parentIndex].children = filteredChildren;

      if(!filteredChildren.length) {
        queues = queues.filter(i => i.uuid !== action.parentUuid);
      }

      return {
        ...state,
        nextUpQueues: queues,
      }
    default:
      return state;
  }
}


export const store = createStore(reducer);
