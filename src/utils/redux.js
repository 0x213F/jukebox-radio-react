import { createStore } from 'redux';


const initialState = {
  nextUpQueues: [],
  lastUpQueues: [],
}


const reducer = (state = initialState, action) => {
  let queues,
      lastUpQueues,
      stream,
      nowPlaying,
      nextUpQueues;
  switch (action.type) {
    case "stream/set":
      stream = action.stream;
      const obj = {
        ...state,
        stream: stream,
      };

      if(!stream.isPlaying && !stream.isPaused && stream.nowPlaying) {
        obj.lastUpQueues = [...state.lastUpQueues, stream.nowPlaying];
        obj.lastUp = stream.nowPlaying;
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
      return { ...state };
    case "queue/listSet":
      lastUpQueues = action.lastUpQueues;
      nextUpQueues = action.nextUpQueues;

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
