import { useEffect, useState } from "react";

import { connect } from 'react-redux';
import YouTube from 'react-youtube';

import MainApp from '../MainApp/MainApp';
import {
  fetchNextTrack,
  fetchPrevTrack,
  fetchScan,
  fetchTrackGetFiles,
  fetchPauseTrack,
  fetchPlayTrack,
} from './Player/network';
import { fetchUpdateFeed } from '../FeedApp/utils';
import { getLeafQueue } from '../QueueApp/utils';
import { fetchGetUserSettings } from '../UserSettings/network';
import {
  SERVICE_JUKEBOX_RADIO,
  SERVICE_SPOTIFY,
  SERVICE_APPLE_MUSIC,
  SERVICE_YOUTUBE,
  SERVICE_AUDIUS,
} from '../../config/services';
import { appendScript } from '../../utils/async';
import { store } from '../../utils/redux';

import {
  playbackControlStart,
  playbackControlSeek,
  playbackControlPause,
  playbackControlPlay,
  playbackControlSkipToNext,
  playbackControlQueue,
} from './controls';
import { getPositionMilliseconds, updateSpotifyPlayer } from './utils';


const SpotifyWebApi = require('spotify-web-api-js');


function PlaybackApp(props) {

  /*
   * 🏗
   */
  const playback = props.playback,
        userSettings = props.userSettings,
        lastUp = getLeafQueue(props.lastUpQueueUuids[0], props.queueMap),
        nextUp = getLeafQueue(props.nextUpQueueUuids[0], props.queueMap);

  const queueMap = props.queueMap,
        nowPlaying = queueMap[playback.nowPlayingUuid];

  // Convenience values to help clarify setting up playback SDKs.
  const [appleMusicSDKReady, setAppleMusicSDKReady] = useState(false);
  const [spotifySDKReady, setSpotifySDKReady] = useState(false);
  const [spotifySDKDeviceID, setSpotifySDKDeviceID] = useState(undefined);

  const [plannedNextTrackTimeoutId, setPlannedNextTrackTimeoutId] = useState({});
  const [nextTrackJson, setNextTrackJson] = useState({});

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// PLAYBACK INTERFACE

  /*
   * When a track is changing from one to another, this boolean logic
   * determines whether or not the currently playing item needs to be paused.
   */
  const shouldPauseOnTrackChange = function(nextPlayingQueue, isPlanned) {
    const playbackIntervals = nowPlaying?.playbackIntervals,
          lastPlaybackInterval = (playbackIntervals ?
            playbackIntervals[playbackIntervals.length - 1] :
            undefined
          );
    return (
      // There must be something now playing.
      nowPlaying?.track &&
      (
        // Everytime a manual upload is currently playing.
        nowPlaying.track.service === SERVICE_JUKEBOX_RADIO ||
        // Everytime Audius is currently playing.
        nowPlaying.track.service === SERVICE_AUDIUS ||
        // Currently playing Spotify, nothing is up next.
        (
          nowPlaying.track.service === SERVICE_SPOTIFY &&
          !nextPlayingQueue?.track
        ) ||
        // Currently playing Spotify, Spotify is not up next.
        (
          nowPlaying.track.service === SERVICE_SPOTIFY &&
          nextPlayingQueue.track.service !== SERVICE_SPOTIFY &&
          (
            !isPlanned ||
            (
              lastPlaybackInterval.endPosition !== nowPlaying.durationMilliseconds &&
              isPlanned
            )
          )
        ) ||
        // Currently playing Apple Music, nothing is up next.
        (
          nowPlaying.track.service === SERVICE_APPLE_MUSIC &&
          !nextPlayingQueue?.track
        ) ||
        // Currently playing Apple Music, Apple Music is not up next.
        (
          nowPlaying.track.service === SERVICE_APPLE_MUSIC &&
          nextPlayingQueue?.track.service !== SERVICE_APPLE_MUSIC &&
          (
            !isPlanned ||
            (
              lastPlaybackInterval.endPosition !== nowPlaying.durationMilliseconds &&
              isPlanned
            )
          )
        ) ||
        // Currently playing YouTube, nothing is up next.
        (
          nowPlaying.track.service === SERVICE_YOUTUBE &&
          !nextPlayingQueue?.track
        ) ||
        // Currently playing YouTube, YouTube is not up next.
        (
          nowPlaying.track.service === SERVICE_YOUTUBE &&
          nextPlayingQueue.track.service !== SERVICE_YOUTUBE &&
          (
            !isPlanned ||
            (
              lastPlaybackInterval.endPosition !== nowPlaying.durationMilliseconds &&
              isPlanned
            )
          )
        )
      )
    )
  }

  /*
   * This starts the now playing track.
   * NOTE: You may think of this as "playing" the track. However, "play" in
   *       code references different behavior. "Play" is used for toggling the
   *       current track from a "paused" state to "play." "Start" explicitly
   *       plays the track.
   */
  const start = function() {
    if(!nowPlaying?.track) {
      return;
    }
    props.dispatch({ type: 'playback/started' });
    playbackControlStart(playback, nowPlaying);
  }

  /*
   * Triggered by human interaction, this plays the previous track.
   */
  const prevTrack = async function() {
    await props.dispatch({ type: 'playback/disable' });
    if(shouldPauseOnTrackChange(lastUp, false)) {
      playbackControlPause(playback, nowPlaying);
    }
    if(lastUp?.track?.service === SERVICE_JUKEBOX_RADIO) {
      const responseJson = await fetchTrackGetFiles(lastUp.track.uuid);
      await props.dispatch(responseJson.redux);
    }
    if(lastUp?.track?.service === SERVICE_AUDIUS) {
      await props.dispatch({
        "type": "playback/loadAudius",
        "payload": {
          "id": lastUp.track.externalId,
          "trackUuid": lastUp.track.uuid,
        }
      });
    }
    const responseJsonPrevTrack = await fetchPrevTrack(nowPlaying?.durationMilliseconds);
    await props.dispatch(responseJsonPrevTrack.redux);
    await props.dispatch({ type: 'stream/prevTrack' });
    await props.dispatch({ type: 'playback/start' });
    await props.dispatch({ type: 'playback/enable' });
    await fetchUpdateFeed(lastUp?.track?.uuid);
  }

  /*
   * Triggered by human interaction, this plays the next track.
   */
  const nextTrack = async function() {
    await props.dispatch({ type: 'playback/disable' });
    if(shouldPauseOnTrackChange(nextUp, false)) {
      playbackControlPause(playback, nowPlaying);
    }
    if(nextUp?.track.service === SERVICE_JUKEBOX_RADIO) {
      const responseJson = await fetchTrackGetFiles(nextUp.track.uuid);
      await props.dispatch(responseJson.redux);
    }
    if(nextUp?.track.service === SERVICE_AUDIUS) {
      await props.dispatch({
        "type": "playback/loadAudius",
        "payload": {
          "id": nextUp.track.externalId,
          "trackUuid": nextUp.track.uuid,
        },
      });
    } if(nextUp?.track.service === SERVICE_YOUTUBE) {

    }
    const responseJsonNextTrack = await fetchNextTrack(
      nowPlaying?.durationMilliseconds, false
    );
    await props.dispatch(responseJsonNextTrack.redux);
    await props.dispatch({ type: 'stream/nextTrack' });
    await props.dispatch({ type: 'playback/start' });
    await props.dispatch({ type: 'playback/enable' });
    await fetchUpdateFeed(nextUp?.track?.uuid);
  }

  /*
   * Seek to the expected position in the track. This may be called in 3 cases:
   *   1: a user signals the track to scan forward 10 seconds.
   *   2: a user signals the track to scan backward 10 seconds.
   *   3: a seekTimeout event is triggered, meaning the now playing track must
   *      seek to the new expected track progress (in the case of a muted
   *      interval).
   */
  const seek = async function(value = undefined) {
    await props.dispatch({ type: 'playback/disable' });
    let startedAt;

    if(value === undefined) {
      startedAt = nowPlaying.startedAt;
    } else {
      const date = new Date(),
            epochNow = date.getTime();
      startedAt = epochNow - value;
    }

    await props.dispatch({
      type: 'queue/update',
      payload: {
        queues: [
          { ...nowPlaying, startedAt: startedAt },
        ],
      },
    });

    nowPlaying.startedAt = startedAt;
    playbackControlSeek(playback, nowPlaying, startedAt);

    if(value === undefined) {
      const response = await fetchScan(
        startedAt,
        nowPlaying.durationMilliseconds,
      );
      if(response.system.status === 400) {
        throw new Error("Invalid scan! Code needs to prevent this!");
      }
    }

    await props.dispatch({ type: 'playback/addToQueueReschedule' });
    await props.dispatch({ type: 'playback/enable' });
  }

  /*
   * Toggling the player from the "playing" to "paused" state.
   */
  const pause = async function() {
    if(!nowPlaying) {
      return;
    }
    await props.dispatch({ type: 'playback/disable' });
    const jsonResponse = await fetchPauseTrack(nowPlaying.durationMilliseconds);
    await props.dispatch(jsonResponse.redux);
    await props.dispatch({ type: 'playback/addToQueueReschedule' });
    playbackControlPause(playback, nowPlaying);
    clearTimeout(plannedNextTrackTimeoutId);
    await props.dispatch({ type: 'playback/enable' });
  }

  /*
   * Toggling the player from the "paused" to "playing" state.
   */
  const play = async function(timestampMilliseconds = undefined) {
    await props.dispatch({ type: 'playback/disable' });
    let startedAt;

    if(timestampMilliseconds === undefined) {
      startedAt = undefined;
    } else {
      const date = new Date(),
            epochNow = date.getTime();
      startedAt = epochNow - timestampMilliseconds;
    }

    const jsonResponse = await fetchPlayTrack(
      startedAt,
      nowPlaying.durationMilliseconds,
    );
    await props.dispatch(jsonResponse.redux);

    // When page loads with the player in the "paused" state and then the user
    // toggles to the "playing" state.
    if(!playback.isPlaying) {
      await props.dispatch({ type: 'playback/enable' });
      return;
    }

    await props.dispatch({ type: 'playback/addToQueueReschedule' });
    playbackControlPlay(playback, nowPlaying);
    await props.dispatch({ type: 'playback/enable' });
  }

  /*
   * Passed down to child components so they can have a handle on playback.
   */
  const playbackControls = { nextTrack, prevTrack, seek, pause, play };

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// PLAYBACK ENGINE

  /*
   * This adds the nextUp item in the queue to play next (add to queue). This
   * happens ~5 seconds before the next item should play.
   */
  const prepareTransitionToNextTrack = async function() {

    // disable the player UI (until plannedNextTrack happens)
    await props.dispatch({ type: 'playback/disable' });

    // update the back-end
    const responseJsonNextTrack = await fetchNextTrack(
      nowPlaying?.durationMilliseconds, true
    );

    // update the front-end later
    setNextTrackJson(responseJsonNextTrack.redux.payload);

    // add to queue
    await props.dispatch({ type: 'playback/addToQueue' });

    playbackControlQueue(playback, nowPlaying, nextUp);

    // schedule "next track"
    // Happens at the very end of the currently playing track.
    // schedule next track
    const progress = Date.now() - nowPlaying.startedAt,
          timeoutDuration = (
            nowPlaying.durationMilliseconds - progress
          );
    const timeoutId = setTimeout(() => {
      plannedNextTrack();
    }, timeoutDuration);
    clearTimeout(plannedNextTrackTimeoutId);
    setPlannedNextTrackTimeoutId(timeoutId);
  }

  /*
   *  Triggered by a scheduled task, this plays the next track.
   */
  const plannedNextTrack = async function() {

    // There are cases where the currently playing item must be paused before
    // the next track can be played.
    if(shouldPauseOnTrackChange(nextUp, true)) {
      playbackControlPause(playback, nowPlaying);
    }
    const queuedUp = playback.queuedUp;
    if(queuedUp) {
      playbackControlSkipToNext(playback, nowPlaying);
    }
    await props.dispatch({
      type: 'playback/plannedNextTrack',
      payload: { payload: nextTrackJson },  // yes
    });
    await props.dispatch({ type: 'playback/enable' });
    await fetchUpdateFeed(nextUp?.track?.uuid);
  }

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// LOAD SDKs
  useEffect(() => {
    appendSpotifySDK();
    appendAppleMusicSDK();
  }, []);

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// SPOTIFY

  /*
   * Loads the Spotify SDK.
   */
  const appendSpotifySDK = function() {
    window.onSpotifyWebPlaybackSDKReady = () => {
      setSpotifySDKReady(true);
    };
    appendScript("https://sdk.scdn.co/spotify-player.js");
  };

  /*
   * Spotify SDK script has been loaded. Now initialize the SDK.
   */
  useEffect(() => {
    if(!spotifySDKReady) {
      return;
    }

    // Define the Spotify Web SDK.
    const player = new window.Spotify.Player({
      name: 'Jukebox Radio',
      getOAuthToken: (cb) => {
        fetchGetUserSettings()
          .then(responseJson => {
            const spotifyAccessToken = responseJson.data.spotify.accessToken;
            if(spotifyAccessToken) {
              // Spotify's SDK automatically refreshes the access token
              // periodically so it always has a valid token.
              cb(spotifyAccessToken);
              // The SpotifyWebApi interface must be updated as well.
              const spotifyApi = new SpotifyWebApi();
              spotifyApi.setAccessToken(responseJson.data.spotify.accessToken);
              props.dispatch({
                type: 'playback/spotify',
                payload: { spotifyApi: spotifyApi },
              });
            }
          });
      }
    });

    // Once player is ready, tranfer playback to Spotify Web SDK.
    player.addListener('ready', ({ device_id }) => {
      setSpotifySDKDeviceID(device_id);
    });

    // TODO: Listen to Spotify events.
    player.addListener('player_state_changed', (state) => {
      const reduxState = store.getState(),
            reduxPlayback = reduxState.playback;
      if(!reduxPlayback.loaded.spotify) {
        props.dispatch({
          type: "playback/loaded",
          payload: { service: "spotify" },
        });
      }
    });

    // Kick off initialization.
    player.connect();

  // eslint-disable-next-line
  }, [spotifySDKReady]);

  useEffect(() => {
    if(!spotifySDKDeviceID) {
      return;
    }
    updateSpotifyPlayer(playback, spotifySDKDeviceID);
    props.dispatch({ type: 'playback/enable' });
  // eslint-disable-next-line
  }, [spotifySDKDeviceID])

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// APPLE MUSIC

  const appendAppleMusicSDK = function() {
    appendScript("https://js-cdn.music.apple.com/musickit/v1/musickit.js")
      .then(() => {
        setAppleMusicSDKReady(true);
      });
  };

  useEffect(() => {
    if(!appleMusicSDKReady) {
      return;
    }

    // Define the Apple Music Web SDK.
    const player = window.MusicKit.configure({
      developerToken: userSettings.appleMusic.token,
      app: {
        name: 'Jukebox Radio',
        build: '0.0.1',
      },
    });

    // TODO: Listen to Apple Music events.
    player.addEventListener("playbackStateDidChange", (e) => {});

  // eslint-disable-next-line
  }, [appleMusicSDKReady]);

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //// YOUTUBE

  const currentQueue = nowPlaying,
        isYouTube = currentQueue?.track?.service === SERVICE_YOUTUBE;

  const youTubeStart = isYouTube ? Math.floor(currentQueue.playbackIntervals[0].startPosition / 1000) : null,
        youTubeVideoId = isYouTube ? currentQueue?.track?.externalId : null,
        youTubeOpts = {
          height: '135',
          width: '240',
          playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 0,   // the initial video will automatically start to play
            controls: 0,   // hide playback controls
            disablekb: 1,  // disable keyboard controls
            fs: 0,         // disable full screen
            iv_load_policy: 3,
            modestbranding: 1,  // minimal YT branding
            origin: 'jukeboxrad.io',
            playsinline: 1,
            start: youTubeStart,
          },
        };

  const onYouTubeReady = function(e) {
    const youTubeApi = e.target;

    props.dispatch({
      type: "playback/loaded",
      payload: { service: "youTube" },
    });

    if(playback.youTubeAutoplay) {
      youTubeApi.playVideo();
      props.dispatch({
        type: 'playback/youTubeTriggerAutoplay',
        payload: { autoplay: false },
      });
    }

    props.dispatch({
      type: 'playback/youTube',
      payload: { youTubeApi },
    });
  }

  const onYouTubePause = function() {
    // if(nowPlaying.status !== 'paused' && nowPlaying?.track.service === SERVICE_YOUTUBE) {
    //   pause();
    // }
  }

  const onYouTubePlay = function() {
    // if(nowPlaying.status !== "played" && nowPlaying?.track.service === SERVICE_YOUTUBE) {
    //   play();
    // }
  }

  //////////////////////////////////////////////////////////////////////////////
  // For one reason or another, the playback has changed. As such, we must
  // reschedule needed scheduled tasks.
  useEffect(() => {

    // debouncer
    const needsToScheduleAddToQueue = (
      nowPlaying?.status === "played" &&
      playback.isPlaying &&
      !playback.addToQueueTimeoutId
    );
    if(!needsToScheduleAddToQueue) {
      return;
    }

    // nothing to schedule
    if(!nowPlaying) {
      return;
    }

    // Schedule task that prepares the transition to next track.
    const progress = Date.now() - nowPlaying.startedAt,
          timeLeft = (
            nowPlaying.durationMilliseconds - progress
          ),
          timeoutDuration = timeLeft - 5000;
    const timeoutId = setTimeout(() => {
      prepareTransitionToNextTrack();
    }, timeoutDuration);
    props.dispatch({
      type: 'playback/addToQueueScheduled',
      payload: { addToQueueTimeoutId: timeoutId },
    });

    // Schedule task that modifies playback due to configured intervals.
    const arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt),
          seekTimeoutDuration = arr[1];
    if(seekTimeoutDuration) {
      const seekTimeoutId = setTimeout(() => {
        seek();
      }, seekTimeoutDuration);
      props.dispatch({
        type: 'playback/nextSeekScheduled',
        payload: { nextSeekTimeoutId: seekTimeoutId },
      });
    }

  // eslint-disable-next-line
  }, [playback]);

  ////////////////////////////////////////////////////////////////////////////
  // Play the music.
  useEffect(() => {
    if(nowPlaying?.status === "played" && !playback.isPlaying && playback.isReady) {
      start();
    }
  // eslint-disable-next-line
  }, [playback]);

  /*
   * 🎨
   */
  return (
    <>
      <div style={{ display: 'none' }}>
        <YouTube videoId={youTubeVideoId}
                 opts={youTubeOpts}
                 onReady={onYouTubeReady}
                 onPause={onYouTubePause}
                 onPlay={onYouTubePlay} />
      </div>
      <MainApp playbackControls={playbackControls}/>
    </>
  );
}


const mapStateToProps = (state) => ({
    playback: state.playback,
    queueMap: state.queueMap,
    lastUpQueueUuids: state.lastUpQueueUuids,
    nextUpQueueUuids: state.nextUpQueueUuids,
    userSettings: state.userSettings,
});


export default connect(mapStateToProps)(PlaybackApp);
