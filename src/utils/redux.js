import { createStore } from 'redux';


const initialState = {
  nextUpQueues: [],
  lastUpQueues: [],
  _lastPlayed: undefined,
}


const reducer = (state = initialState, action) => {
  let queues;
  switch (action.type) {
    case "stream/set":
      const stream = action.stream;
      const obj = {
        ...state,
        stream: stream,
      };

      if(!stream.isPlaying && !stream.isPaused && stream.nowPlaying) {
        obj.lastUpQueues = [...state.lastUpQueues, stream.nowPlaying];
        obj.lastUp = stream.nowPlaying;
        obj._lastPlayed = stream.nowPlaying;
        obj.stream.nowPlaying = undefined;
      }
      console.log(obj.lastUpQueues)

      return obj
    case "stream/prevTrack":
      return { ...state };
    case "stream/nextTrack":
      return { ...state };
    case "stream/expire":
      return { ...state };
    case "queue/listSet":
      const lastUpQueues = action.lastUpQueues,
            nextUpQueues = action.nextUpQueues;

      if(state._lastPlayed) {
        lastUpQueues.push(state._lastPlayed);
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
