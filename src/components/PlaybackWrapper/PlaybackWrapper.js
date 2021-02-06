import { useEffect, useState } from "react";
import { connect } from 'react-redux'
// import { CountdownCircleTimer } from 'react-countdown-circle-timer'
// import styles from './PlaybackWrapper.module.css';
import {
  Switch,
  Route,
} from "react-router-dom";

import Chat from '../Chat/Chat';
import Queue from '../Queue/Queue';
import Search from '../Search/Search';
import Upload from '../Upload/Upload';
import Player from '../Player/Player';
import UserSettings from '../UserSettings/UserSettings';
import {
  fetchNextTrack,
  fetchPrevTrack,
  fetchScanBackward,
  fetchScanForward,
  fetchPauseTrack,
  fetchPlayTrack,
} from '../Player/network';


function PlaybackWrapper(props) {

  const stream = props.stream,
        spotifyApi = props.spotifyApi,
        nextUpQueues = props.nextUpQueues,
        nextUp = (
          nextUpQueues.length ?
            (nextUpQueues[0].children.length ?
              nextUpQueues[0].children[0] :
              nextUpQueues[0]) :
            undefined
        );

  const [playerIsPlaying, setPlayerIsPlaying] = useState(false);
  const [shouldScheduleNextTrack, setShouldScheduleNextTrack] = useState(false);
  const [shouldScheduleReset, setShouldScheduleReset] = useState(false);

  const [nextTrackReduxJson, setNextTrackReduxJson] = useState({});

  // eslint-disable-next-line
  const [nextTrackTimeoutId, setNextTrackTimeoutId] = useState(undefined);
  // eslint-disable-next-line
  const [resetNextTrackTimeoutId, setResetNextTrackTimeoutId] = useState(undefined);
  // eslint-disable-next-line
  const [nextSeekTimeoutId, setNextSeekTimeoutId] = useState(undefined);

  const [nextSeekTimeout, setNextSeekTimeout] = useState(undefined);

  const getPositionMilliseconds = function(startedAt = stream.startedAt) {
    let progress = Date.now() - startedAt,
        seekTimeout,
        playbackIntervalIdx = 0,
        cumulativeProgress = 0;
    while(true) {
      const playbackInterval = stream.nowPlaying.playbackIntervals[playbackIntervalIdx],
            playbackIntervalDuration = playbackInterval[1] - playbackInterval[0],
            remainingProgress = progress - cumulativeProgress;
      if(remainingProgress < playbackIntervalDuration) {
        progress = playbackInterval[0] + remainingProgress;

        if(playbackIntervalIdx !== stream.nowPlaying.playbackIntervals.length - 1) {
          seekTimeout = playbackInterval[1] - progress;
        }

        break;
      }

      playbackIntervalIdx += 1;
      cumulativeProgress += playbackIntervalDuration;
    }

    // TODO setForceNextTrackOnTimeout - when trimming the end of a song
    return [progress, seekTimeout];
  }

  const resetScheduledTasks = function() {
    setNextTrackTimeoutId(prev => {
      clearTimeout(prev);
      return undefined;
    });

    setResetNextTrackTimeoutId(prev => {
      clearTimeout(prev);
      return undefined;
    });

    setNextSeekTimeoutId(prev => {
      clearTimeout(prev);
      return undefined;
    });
  }

  const start = function() {
    setPlayerIsPlaying(true);

    if(!stream.nowPlaying.track) {
      return;
    }

    const [positionMilliseconds, seekTimeout] = getPositionMilliseconds();

    spotifyApi.play({
      uris: [stream.nowPlaying.track.externalId],
      position_ms: positionMilliseconds,
    });
    setNextSeekTimeout(seekTimeout);
    setShouldScheduleNextTrack(true);
  }

  const nextTrack = async function(forced = false) {
    const responseJsonNextTrack = await fetchNextTrack();
    if(forced) {
      await props.dispatch(responseJsonNextTrack.redux);
      await setNextTrackReduxJson({});
      resetScheduledTasks();
      await setPlayerIsPlaying(false);
      return;
    }
    setNextTrackReduxJson(responseJsonNextTrack.redux);
    setShouldScheduleReset(true);
    addToQueue();
  }

  const prevTrack = async function() {
    const responseJsonPrevTrack = await fetchPrevTrack();
    await props.dispatch(responseJsonPrevTrack.redux);
    await setNextTrackReduxJson({});
    resetScheduledTasks();
    await setPlayerIsPlaying(false);
  }

  const seek = async function(direction = undefined) {
    let startedAt;
    if(direction === 'forward') {
      const response = await fetchScanForward();

      if(response.system.status === 400) {
        return;
      }

      startedAt = stream.startedAt - (10000);
    } else if(direction === 'backward') {
      await fetchScanBackward();

      const date = new Date(),
            epochNow = date.getTime();

      const proposedStartedAt = stream.startedAt + 10000,
            proposedProgress = epochNow - proposedStartedAt;

      startedAt = proposedProgress > 0 ? proposedStartedAt : epochNow;
    } else {
      startedAt = stream.startedAt;
    }

    await props.dispatch({
      type: 'stream/set',
      payload: {stream: { ...stream, startedAt: startedAt }},
    });

    const [positionMilliseconds, seekTimeout] = getPositionMilliseconds(startedAt);
    spotifyApi.seek(positionMilliseconds);

    resetScheduledTasks();
    setNextSeekTimeout(seekTimeout);
    setShouldScheduleNextTrack(true);
  }

  const pause = async function() {
    const jsonResponse = await fetchPauseTrack();
    props.dispatch(jsonResponse.redux);

    // NOTE: this is not called because it would "start" the song again
    // setPlayerIsPlaying(false);

    resetScheduledTasks();

    spotifyApi.pause();
  }

  const play = async function() {
    const jsonResponse = await fetchPlayTrack();
    await props.dispatch(jsonResponse.redux);

    if(!playerIsPlaying) {
      // TODO this case isn't working needs refactor
      return;
    }

    spotifyApi.play();
    // NOTE: this is not called because it would "start" the song again
    // setPlayerIsPlaying(true);
    setShouldScheduleNextTrack(true);
  }

  const resetNextTrack = async function() {
    await props.dispatch(nextTrackReduxJson);
    await setNextTrackReduxJson({});
    await setShouldScheduleNextTrack(true);
  }

  const addToQueue = function() {
    spotifyApi.queue(nextUp.track.externalId);
  }

  // Will schedule task to queue up the next track near the end of the
  // currently playing track.
  useEffect(() => {
    // check
    if(!shouldScheduleNextTrack) {
      return;
    }
    setShouldScheduleNextTrack(false);

    // calculations
    const nowPlayingDuration = stream.nowPlaying.totalDurationMilliseconds,
          progress = Date.now() - stream.startedAt,
          timeout = nowPlayingDuration - progress - 5000;

    // schedule seek
    if(nextSeekTimeout) {
      const seekTimeoutId = setTimeout(() => {
        seek();
      }, nextSeekTimeout);
      setNextSeekTimeoutId(seekTimeoutId);
    }

    // schedule next track
    const timeoutId = setTimeout(() => {
      nextTrack();
    }, timeout);

    setNextTrackTimeoutId(timeoutId);

  // eslint-disable-next-line
  }, [shouldScheduleNextTrack]);

  // Will schedule a task to reset the cycle at the end of the currently
  // playing track.
  useEffect(() => {
    if(!shouldScheduleReset) {
      return;
    }
    setShouldScheduleReset(false);
    const nowPlayingDuration = stream.nowPlaying.totalDurationMilliseconds,
          progress = Date.now() - stream.startedAt,
          timeout = nowPlayingDuration - progress;

    const timeoutId = setTimeout(() => {
      resetNextTrack();
    }, timeout);

    setResetNextTrackTimeoutId(timeoutId);

  // eslint-disable-next-line
  }, [shouldScheduleReset]);

  // Play the music.
  if(stream.isPlaying && !playerIsPlaying) {
    start();
  }

  return (
    <>
    <Switch>
      <Route path="/settings">
        <UserSettings />
      </Route>
      <Route path="/chat">
        <Chat />
      </Route>
      <Route path="/player">
        <Player nextTrack={nextTrack}
                prevTrack={prevTrack}
                seek={seek}
                pause={pause}
                play={play} />
      </Route>
      <Route path="/queue">
        <Queue />
      </Route>
      <Route path="/search">
        <Search />
      </Route>
      <Route path="/upload">
        <Upload />
      </Route>
    </Switch>
    </>
  );
}

const mapStateToProps = (state) => ({
    stream: state.stream,
    spotifyApi: state.spotifyApi,
    nextUpQueues: state.nextUpQueues,
});

export default connect(mapStateToProps)(PlaybackWrapper);
