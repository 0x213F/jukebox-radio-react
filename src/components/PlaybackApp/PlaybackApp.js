import { useEffect, useState } from "react";
import { connect } from 'react-redux';
import YouTube from 'react-youtube';

import {
  playbackControlStart,
  playbackControlSeek,
  playbackControlPause,
  playbackControlPlay,
  playbackControlSkipToNext,
  playbackControlQueue,
} from './controls';
import { fetchGetUserSettings } from '../UserSettings/network';
import { getPositionMilliseconds, updateSpotifyPlayer } from './utils';

import MainApp from '../MainApp/MainApp';
import {
  fetchNextTrack,
  fetchPrevTrack,
  fetchScanBackward,
  fetchScanForward,
  fetchTrackGetFiles,
  fetchPauseTrack,
  fetchPlayTrack,
} from './Player/network';
import { updateFeed } from '../FeedApp/utils';
import { getLastUpQueue, getNextUpQueue } from '../QueueApp/utils';

import {
  SERVICE_JUKEBOX_RADIO,
  SERVICE_SPOTIFY,
  SERVICE_APPLE_MUSIC,
  SERVICE_YOUTUBE,
} from '../../config/services';

const SpotifyWebApi = require('spotify-web-api-js');


function PlaybackApp(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        playback = props.playback,
        lastUp = getLastUpQueue(props.lastUpQueues),
        nextUp = getNextUpQueue(props.nextUpQueues);

  const [appleMusicSDKReady, setAppleMusicSDKReady] = useState(false);

  const [spotifySDKReady, setSpotifySDKReady] = useState(false);
  const [spotifySDKDeviceID, setSpotifySDKDeviceID] = useState(undefined);
  const [spotifySDKInit, setSpotifySDKInit] = useState(false);

  // const [spotifyIsPaused, setSpotifyIsPaused] = useState(false);
  // const [spotifyIsPlaying, setSpotifyIsPlaying] = useState(false);

  const [messageScheduleNextTrack, setMessageScheduleNextTrack] = useState(false);
  const [plannedNextTrackTimeoutId, setPlannedNextTrackTimeoutId] = useState({});
  const [nextTrackJson, setNextTrackJson] = useState({});

  /*
   * Loads the Spotify SDK.
   */
  const appendSpotifySDK = function() {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    new Promise(resolve => {
      if (window.Spotify) {
        resolve();
      } else {
        window.onSpotifyWebPlaybackSDKReady = resolve;
      }
    })
      .then(() => {
        setSpotifySDKReady(true);
      });
    document.body.appendChild(script);
  };

  /*
   * Loads the Spotify SDK.
   */
  const appendAppleMusicSDK = function() {
    new Promise(resolve => {
      const script = document.createElement("script");
      script.src = "https://js-cdn.music.apple.com/musickit/v1/musickit.js";
      script.async = true;
      script.onload = () => { resolve(); };
      document.body.appendChild(script);
    })
      .then(() => {
        setAppleMusicSDKReady(true);
      });
  };

  /*
   * When a track is changing from one to another, this boolean logic
   * determines whether or not the currently playing item needs to be paused.
   */
  const shouldPauseOnTrackChange = function(nextPlayingQueue, isPlanned) {
    const nowPlaying = stream.nowPlaying,
          playbackIntervals = nowPlaying?.playbackIntervals,
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
              lastPlaybackInterval.endPosition !== nowPlaying.totalDurationMilliseconds &&
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
              lastPlaybackInterval.endPosition !== nowPlaying.totalDurationMilliseconds &&
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
              lastPlaybackInterval.endPosition !== nowPlaying.totalDurationMilliseconds &&
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
    if(!stream.nowPlaying?.track) {
      return;
    }
    props.dispatch({ type: 'playback/started' });
    playbackControlStart(playback, stream);
  }

  /*
   * This adds the nextUp item in the queue to play next (add to queue). This
   * happens ~5 seconds before the next item should play.
   */
  const addToQueue = async function() {

    // disable the player UI (until plannedNextTrack happens)
    await props.dispatch({ type: 'playback/disable' });

    // update the back-end
    const responseJsonNextTrack = await fetchNextTrack(
      stream.nowPlaying?.totalDurationMilliseconds, true
    );

    // update the front-end later
    setNextTrackJson(responseJsonNextTrack);

    // add to queue
    await props.dispatch({ type: 'playback/addToQueue' });

    playbackControlQueue(playback, stream, nextUp);

    // schedule "next track"
    setMessageScheduleNextTrack(true);
  }

  /*
   *  Triggered by a scheduled task, this plays the next track.
   */
  const plannedNextTrack = async function() {
    if(shouldPauseOnTrackChange(nextUp, true)) {
      playbackControlPause(playback, stream);
    }
    const queuedUp = playback.queuedUp;
    if(queuedUp) {
      playbackControlSkipToNext(playback, stream);
    }
    await props.dispatch({
      type: 'playback/plannedNextTrack',
      payload: { payload: nextTrackJson.redux },  // yes
    });
    await props.dispatch({ type: 'playback/enable' });
    await updateFeed(nextUp?.track?.uuid);
  }

  /*
   * Triggered by human interaction, this plays the previous track.
   */
  const prevTrack = async function() {
    await props.dispatch({ type: 'playback/disable' });
    if(shouldPauseOnTrackChange(lastUp, false)) {
      playbackControlPause(playback, stream);
    }
    if(lastUp.track?.service === SERVICE_JUKEBOX_RADIO) {
      const responseJson = await fetchTrackGetFiles(lastUp.track.uuid);
      await props.dispatch(responseJson.redux);
    }
    const responseJsonPrevTrack = await fetchPrevTrack(stream.nowPlaying?.totalDurationMilliseconds);
    await props.dispatch(responseJsonPrevTrack.redux);
    await props.dispatch({ type: 'playback/start' });
    await props.dispatch({ type: 'playback/enable' });
    await updateFeed(lastUp?.track?.uuid);
  }

  /*
   * Triggered by human interaction, this plays the next track.
   */
  const nextTrack = async function() {
    await props.dispatch({ type: 'playback/disable' });
    if(shouldPauseOnTrackChange(nextUp, false)) {
      playbackControlPause(playback, stream);
    }
    if(nextUp?.track.service === SERVICE_JUKEBOX_RADIO) {
      const responseJson = await fetchTrackGetFiles(nextUp.track.uuid);
      await props.dispatch(responseJson.redux);
    }
    const responseJsonNextTrack = await fetchNextTrack(
      stream.nowPlaying?.totalDurationMilliseconds, false
    );
    await props.dispatch(responseJsonNextTrack.redux);
    await props.dispatch({ type: 'playback/start' });
    await props.dispatch({ type: 'playback/enable' });
    await updateFeed(nextUp?.track?.uuid);
  }

  /*
   * Seek to the expected position in the track. This may be called in 3 cases:
   *   1: a user signals the track to scan forward 10 seconds.
   *   2: a user signals the track to scan backward 10 seconds.
   *   3: a seekTimeout event is triggered, meaning the now playing track must
   *      seek to the new expected track progress (in the case of a muted
   *      interval).
   */
  const seek = async function(direction = undefined) {
    await props.dispatch({ type: 'playback/disable' });
    let startedAt;

    if(direction === 'forward') {
      const response = await fetchScanForward(
        stream.nowPlaying.totalDurationMilliseconds
      );
      // Seeking forward is not allowed because the track is almost over.
      if(response.system.status === 400) {
        await props.dispatch({ type: 'playback/enable' });
        return;
      }
      startedAt = stream.startedAt - (10000);
    } else if(direction === 'backward') {
      await fetchScanBackward(stream.nowPlaying.totalDurationMilliseconds);
      const date = new Date(),
            epochNow = date.getTime(),
            proposedStartedAt = stream.startedAt + 10000,
            proposedProgress = epochNow - proposedStartedAt;
      startedAt = proposedProgress > 0 ? proposedStartedAt : epochNow;
    } else {
      startedAt = stream.startedAt;
    }

    await props.dispatch({
      type: 'stream/set',
      payload: {stream: { ...stream, startedAt: startedAt }},
    });

    const arr = getPositionMilliseconds(stream, startedAt),
          seekTimeoutDuration = arr[1];
    playbackControlSeek(playback, stream, startedAt);
    await props.dispatch({ type: 'playback/addToQueueReschedule' });

    // schedule seek
    if(seekTimeoutDuration) {
      const seekTimeoutId = setTimeout(() => {
        seek();
      }, seekTimeoutDuration);
      // setNextSeekTimeoutId(seekTimeoutId);
      props.dispatch({
        type: 'playback/nextSeekScheduled',
        payload: { nextSeekTimeoutId: seekTimeoutId },
      });
    }

    await props.dispatch({ type: 'playback/enable' });
  }

  /*
   * Toggling the player from the "playing" to "paused" state.
   */
  const pause = async function() {
    if(!stream.nowPlaying) {
      return;
    }
    await props.dispatch({ type: 'playback/disable' });
    const jsonResponse = await fetchPauseTrack(stream.nowPlaying.totalDurationMilliseconds);
    await props.dispatch(jsonResponse.redux);
    await props.dispatch({ type: 'playback/addToQueueReschedule' });
    playbackControlPause(playback, stream);
    clearTimeout(plannedNextTrackTimeoutId);
    await props.dispatch({ type: 'playback/enable' });
  }

  /*
   * Toggling the player from the "paused" to "playing" state.
   */
  const play = async function() {
    await props.dispatch({ type: 'playback/disable' });
    const jsonResponse = await fetchPlayTrack();
    await props.dispatch(jsonResponse.redux);

    // When page loads with the player in the "paused" state and then the user
    // toggles to the "playing" state.
    if(!playback.isPlaying) {
      await props.dispatch({ type: 'playback/enable' });
      return;
    }

    await props.dispatch({ type: 'playback/addToQueueReschedule' });
    playbackControlPlay(playback, stream);
    await props.dispatch({ type: 'playback/enable' });
  }

  //////////////////////////////////////////////////////////////////////////////
  // LOAD SPOTIFY SDK
  useEffect(() => {
    appendSpotifySDK();
    appendAppleMusicSDK();
  }, []);

  useEffect(() => {
    if(!appleMusicSDKReady) {
      return;
    }

    fetchGetUserSettings()
      .then(responseJson => {
        const player = window.MusicKit.configure({
          developerToken: responseJson.data.appleMusic.token,
          app: {
            name: 'Jukebox Radio',
            build: '0.0.1',
          },
        });

        player.addEventListener('mediaPlaybackError', function(e) {
          console.log("mediaPlaybackError");
          console.log(e)
        });

        player.addEventListener("playbackStateDidChange", function(e) {
          console.log("playbackStateDidChange")
          console.log(e)
        })

        props.dispatch({
          type: 'playback/appleMusic',
          payload: { appleMusicApi: player },
        });
      });
  // eslint-disable-next-line
  }, [appleMusicSDKReady])

  //////////////////////////////////////////////////////////////////////////////
  // SPOTIFY SDK LOADED
  // Happens on page load
  useEffect(() => {
    if(!spotifySDKReady) {
      return;
    }
    // 7: Get user settings.
    const player = new window.Spotify.Player({
      name: 'Jukebox Radio',
      getOAuthToken: cb => {
        fetchGetUserSettings()
          .then(responseJson => {
            cb(responseJson.data.spotify.accessToken);
            props.dispatch({
              type: 'user/get-settings',
              userSettings: responseJson.data,
            });

            // Initialize the Spotify player (conditionally).
            const spotifyAccessToken = responseJson.data.spotify.accessToken;
            if(spotifyAccessToken) {
              const spotifyApi = new SpotifyWebApi();
              spotifyApi.setAccessToken(responseJson.data.spotify.accessToken);
              props.dispatch({
                type: 'playback/spotify',
                payload: { spotifyApi: spotifyApi },
              });
            }

            // Enable playback controls.
            props.dispatch({ type: 'playback/enable' });

            setSpotifySDKInit(true);
          });
      }
    });
    player.addListener('ready', ({ device_id }) => {
      setSpotifySDKDeviceID(device_id);
    });
    player.addListener('player_state_changed', (state) => {
      return;
      // if(state.duration) {
      //   if(state.paused) {
      //     setSpotifyIsPaused(true);
      //   } else {
      //     setSpotifyIsPlaying(true);
      //   }
      // } else {
      //   setSpotifyIsPaused(false);
      //   setSpotifyIsPlaying(false);
      // }
      // console.log(state);
    });
    player.connect();

  // eslint-disable-next-line
  }, [spotifySDKReady]);

  //////////////////////////////////////////////////////////////////////////////
  // Update player to SDK player
  useEffect(() => {
    if(!spotifySDKInit || !spotifySDKDeviceID) {
      return;
    }

    updateSpotifyPlayer(playback, spotifySDKDeviceID);
  // eslint-disable-next-line
  }, [spotifySDKInit, spotifySDKDeviceID])

  //////////////////////////////////////////////////////////////////////////////
  // SCHEDULE ADD TO QUEUE
  // Happens near the end of the currently playing track.
  useEffect(() => {

    // debouncer
    const needsToScheduleAddToQueue = (
      stream.isPlaying &&
      playback.isPlaying &&
      !playback.addToQueueTimeoutId
    );
    if(!needsToScheduleAddToQueue) {
      return;
    }

    if(!stream?.nowPlaying) {
      return;
    }

    // schedule add to queue
    const progress = Date.now() - stream.startedAt,
          timeLeft = (
            stream.nowPlaying.totalDurationMilliseconds - progress
          ),
          timeoutDuration = timeLeft - 5000;
    const timeoutId = setTimeout(() => {
      addToQueue();
    }, timeoutDuration);
    props.dispatch({
      type: 'playback/addToQueueScheduled',
      payload: { addToQueueTimeoutId: timeoutId },
    });

    // schedule seek
    const arr = getPositionMilliseconds(stream, stream.startedAt),
          seekTimeoutDuration = arr[1];
    if(seekTimeoutDuration) {
      const seekTimeoutId = setTimeout(() => {
        seek();
      }, seekTimeoutDuration);
      // setNextSeekTimeoutId(seekTimeoutId);
      props.dispatch({
        type: 'playback/nextSeekScheduled',
        payload: { nextSeekTimeoutId: seekTimeoutId },
      });
    }

  // eslint-disable-next-line
  }, [playback]);

  //////////////////////////////////////////////////////////////////////////////
  // SCHEDULE PLANNED NEXT TRACK
  // Happens at the very end of the currently playing track.
  useEffect(() => {

    // debouncer
    if(!messageScheduleNextTrack) {
      return;
    }
    setMessageScheduleNextTrack(false);

    // schedule next track
    const progress = Date.now() - stream.startedAt,
          timeoutDuration = (
            stream.nowPlaying.totalDurationMilliseconds - progress
          );
    const timeoutId = setTimeout(() => {
      plannedNextTrack();
    }, timeoutDuration);
    clearTimeout(plannedNextTrackTimeoutId);
    setPlannedNextTrackTimeoutId(timeoutId);

  // eslint-disable-next-line
  }, [messageScheduleNextTrack]);

  //////////////////////////////////////////////////////////////////////////////
  // Play the music.
  useEffect(() => {
    if(stream.isPlaying && !playback.isPlaying && playback.isReady) {
      start();
    }
  // eslint-disable-next-line
  }, [stream, playback]);


  const playbackControls = { nextTrack, prevTrack, seek, pause, play };

  const opts = {
          height: '135',
          width: '240',
          playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 0,  // the initial video will automatically start to play
            controls: 0,  // hide playback controls
            disablekb: 1,  // disable keyboard controls
            fs: 0,  // disable full screen
            iv_load_policy: 3,
            modestbranding: 1,
            origin: 'jukeboxrad.io',
            playsinline: 1,
          },
        },
        videoId = stream?.nowPlaying?.track?.externalId;

  const onYouTubeReady = function(e) {
    const youTubeApi = e.target;
    props.dispatch({
      type: 'playback/youTube',
      payload: { youTubeApi: youTubeApi },
    });
  }

  const onYouTubePause = function() {
    if(!stream.isPaused) {
      pause();
    }
  }

  const onYouTubePlay = function() {
    if(!stream.isPlaying) {
      play();
    }
  }

  /*
   * 🎨
   */
  return (
    <>
      <div style={{ display: 'none' }}>
        <YouTube videoId={videoId}
                 opts={opts}
                 onReady={onYouTubeReady}
                 onPause={onYouTubePause}
                 onPlay={onYouTubePlay} />
      </div>
      <MainApp playbackControls={playbackControls}/>
    </>
  );
}

const mapStateToProps = (state) => ({
    stream: state.stream,
    playback: state.playback,
    lastUpQueues: state.lastUpQueues,
    nextUpQueues: state.nextUpQueues,
    userSettings: state.userSettings,
});

export default connect(mapStateToProps)(PlaybackApp);
