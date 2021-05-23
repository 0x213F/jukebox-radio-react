import { finalizeQueues } from './queue';


export const streamSetWrapper = function(state, payload) {
  const obj = streamSet(state, payload);

  const stream = { ...obj.stream },
        queueMap = obj.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid];
  if(!nowPlaying?.track?.uuid) {
    return obj;
  }

  // Gotta update the marker map
  const markerMap = { ...state.markerMap };
  if(markerMap[nowPlaying.track.uuid] === undefined || markerMap[nowPlaying.track.uuid].length === 0) {
    markerMap[nowPlaying.track.uuid] = {};
  }
  for(const marker of nowPlaying.markers) {
    markerMap[nowPlaying.track.uuid][marker.uuid] = marker;
  }
  obj.markerMap = markerMap;
  return {
    ...obj,
    stream: stream,
  };
}


/*
 * ...
 */
export const streamSet = function(state, payload) {
  const stream = payload.stream,
        nowPlaying = stream.nowPlaying;  // from server, this is a full obj!
  let obj = { ...state };

  if(nowPlaying) {
    obj = finalizeQueues(obj, [nowPlaying]);

    // stream.nowPlaying = obj.queueMap[nowPlaying.uuid];
  }

  obj.stream = stream;
  const progress = (
          stream.nowPlaying.status === "played" ?
          Date.now() - stream.nowPlaying.startedAt : stream.nowPlaying.statusAt - stream.nowPlaying.startedAt
        );
  const notPlaying = (
    (stream.nowPlaying.status !== "played" && stream.nowPlaying.status !== 'paused' && stream.nowPlaying) ||
    (progress && progress >= stream.nowPlaying.durationMilliseconds)
  )

  if(notPlaying) {
    obj.lastUp = stream.nowPlaying;
    obj._lastPlayed = stream.nowPlaying;
    obj.stream.nowPlaying = undefined;
  }

  // clean nowPlaying
  if(obj.stream.nowPlaying) {
    const nowPlayingUuid = obj.stream.nowPlaying.uuid;
    delete obj.stream.nowPlaying;
    obj.stream.nowPlayingUuid = nowPlayingUuid;
  } else {
    delete obj.stream.nowPlaying;
    obj.stream.nowPlayingUuid = undefined;
  }

  return obj;
}


/*
 * ...
 */
export const streamPlay = function(state, payload) {
  const queueMap = { ...state.queueMap },
        queue = {
          ...queueMap[state.stream.nowPlayingUuid],
          startedAt: payload.startedAt,
          statusAt: payload.statusAt,
          status: payload.status,
        };
  queueMap[queue.uuid] = queue;

  return {
    ...state,
    queueMap
  };

  // const updatedPayload = {
  //   queueMap: queueMap,
  // };
  // return streamSet(state, updatedPayload);
}


/*
 * ...
 */
export const streamPause = function(state, payload) {
  const queueMap = { ...state.queueMap },
        queue = {
          ...queueMap[state.stream.nowPlayingUuid],
          statusAt: payload.statusAt,
          status: payload.status,
        };
  queueMap[queue.uuid] = queue;

  return {
    ...state,
    queueMap
  };

  // const updatedPayload = {
  //   queueMap: queueMap,
  // };
  // return streamSet(state, updatedPayload);
}


/*
 * Set the stream context.
 */
export const streamPrevTrack = function(state, payload) {
  const lastUpQueues = [...state.lastUpQueues],
        nextUpQueues = [...state.nextUpQueues],
        queueMap = state.queueMap,
        lastNowPlaying = queueMap[state.stream.nowPlayingUuid],
        nextUpQueue = nextUpQueues[0],
        nextNowPlaying = lastUpQueues[lastUpQueues.length - 1];

  const isTrackInCollection = (
          lastNowPlaying?.parentUuid &&
          nextUpQueue?.uuid &&
          lastNowPlaying?.parentUuid === nextUpQueue?.uuid
        );
  let parentQueue;
  if(lastNowPlaying) {
    if(isTrackInCollection) {
      nextUpQueue.children.unshift(lastNowPlaying);
    } else {
      if(lastNowPlaying.parentUuid) {
        // Here we need to first create the "parent queue."
        parentQueue = { ...lastNowPlaying };
        parentQueue.uuid = parentQueue.parentUuid;
        parentQueue.parentUuid = null;
        parentQueue.track = null;
        parentQueue.isAbstract = true;
        parentQueue.playbackIntervals = [];
        parentQueue.allIntervals = [];
        parentQueue.intervals = [];
        // Then, it goes into the queue along with the track as its first child.
        parentQueue.children.unshift(lastNowPlaying);
        nextUpQueues.unshift(parentQueue);
      } else {
        nextUpQueues.unshift(lastNowPlaying);
      }
    }
  }

  lastUpQueues.pop();

  const queue = {
          ...nextNowPlaying,
          startedAt: payload.startedAt,
          statusAt: payload.statusAt,
          status: payload.status,
        };
  queueMap[queue.uuid] = queue;

  if(parentQueue) {
    queueMap[parentQueue.uuid] = parentQueue;
  }

  return {
      ...state,
      stream: {
        ...state.stream,
        nowPlayingUuid: queue.uuid,
      },
      playback: { ...state.playback, nowPlayingUuid: queue.uuid },
      queueMap: queueMap,
      lastUpQueues: lastUpQueues,
      nextUpQueues: nextUpQueues,
      _lastPlayed: undefined,
  };
}


/*
 * ...
 */
export const streamNextTrack = function(state, payload) {
  const lastUpQueues = [...state.lastUpQueues],
        nextUpQueues = [...state.nextUpQueues],
        queueMap = state.queueMap,
        lastNowPlaying = queueMap[state.stream.nowPlayingUuid],
        nextUpQueue = nextUpQueues[0],
        nextNowPlaying = (
          nextUpQueue ?
            (nextUpQueue.children.length ?
              nextUpQueue.children[0] :
              nextUpQueue) :
            undefined
        );

  if(lastNowPlaying) {
    lastUpQueues.push(lastNowPlaying);
  }

  if(nextUpQueue) {
    if(nextUpQueue.children.length) {
      nextUpQueue.children.shift();
      if(!nextUpQueue.children.length) {
        nextUpQueues.shift();
      }
    } else {
      nextUpQueues.shift();
    }
  }

  const queue = {
          ...nextNowPlaying,
          startedAt: payload.startedAt,
          statusAt: payload.statusAt,
          status: payload.status,
        };
  queueMap[queue.uuid] = queue;

  return {
      ...state,
      stream: {
        ...state.stream,
        nowPlayingUuid: queue.uuid,
      },
      playback: { ...state.playback, nowPlayingUuid: queue.uuid },
      queueMap: queueMap,
      lastUpQueues: lastUpQueues,
      nextUpQueues: nextUpQueues,
      _lastPlayed: lastNowPlaying,
  };
}
