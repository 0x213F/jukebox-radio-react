import { getLeafQueue } from '../../components/QueueApp/utils';
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
  const lastUpQueueUuids = [...state.lastUpQueueUuids],
        nextUpQueueUuids = [...state.nextUpQueueUuids],
        nowPlayingUuid = state.stream.nowPlayingUuid,
        queueMap = { ...state.queueMap };

  const nextUpUuid = nextUpQueueUuids[0],
        nextUp = getLeafQueue(nextUpUuid, queueMap);

  if(nowPlayingUuid) {
    const nowPlaying = { ...queueMap[nowPlayingUuid] };
    if(!nextUp) {
      if(nowPlaying.parentUuid) {
        nextUpQueueUuids.unshift(nowPlaying.parentUuid);
        const nextUpCollection = { ...queueMap[nowPlaying.parentUuid] };
        nextUpCollection.childUuids.unshift(nowPlayingUuid);
      } else {
        nextUpQueueUuids.unshift(nowPlayingUuid);
      }
    } else if(nextUp.uuid !== nextUpUuid) {
      let nextUpCollection;
      nextUpCollection = { ...queueMap[nextUpUuid] };
      if(nowPlaying.parentUuid !== nextUpCollection.uuid) {
        nextUpQueueUuids.unshift(nowPlaying.parentUuid);
        nextUpCollection = { ...queueMap[nowPlaying.parentUuid] };
      }
      nextUpCollection.childUuids.unshift(nowPlayingUuid);
      queueMap[nextUpCollection.uuid] = nextUpCollection;
    } else {
      nextUpQueueUuids.unshift(nowPlayingUuid);
    }
  }

  const nextNowPlayingUuid = lastUpQueueUuids.pop();

  return {
      ...state,
      stream: {
        ...state.stream,
        nowPlayingUuid: nextNowPlayingUuid,
      },
      lastUpQueueUuids: lastUpQueueUuids,
      nextUpQueueUuids: nextUpQueueUuids,
      queueMap: queueMap,
      _lastPlayed: undefined,
  };
}


/*
 * ...
 */
export const streamNextTrack = function(state, payload) {
  const lastUpQueueUuids = [...state.lastUpQueueUuids],
        nextUpQueueUuids = [...state.nextUpQueueUuids],
        nowPlayingUuid = state.stream.nowPlayingUuid,
        queueMap = state.queueMap;

  lastUpQueueUuids.push(nowPlayingUuid);

  const nextUpUuid = nextUpQueueUuids.shift();
  const nextNowPlaying = { ...getLeafQueue(nextUpUuid, queueMap) };

  // Handle leaf node. (playing a track inside a collection)
  if(nextUpUuid !== nextNowPlaying.uuid) {
    // Pop the child from the collection.
    let nextUp;
    nextUp = { ...state.queueMap[nextUpUuid] };
    nextUp.childUuids.shift();
    queueMap[nextUp.uuid] = nextUp;
    if(nextUp.childUuids.length > 0) {
      // If no more children, pop the collection from the queue.
      nextUpQueueUuids.unshift(nextUpUuid);
    }
  }

  nextNowPlaying.startedAt = Date.now();
  queueMap[nextNowPlaying.uuid] = nextNowPlaying;

  return {
      ...state,
      stream: {
        ...state.stream,
        nowPlayingUuid: nextNowPlaying.uuid,
      },
      lastUpQueueUuids: lastUpQueueUuids,
      nextUpQueueUuids: nextUpQueueUuids,
      queueMap: queueMap,
      _lastPlayed: undefined,
  };
}
