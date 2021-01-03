import React from 'react';
import {
  fetchStream,
  fetchNextTrack,
  fetchPauseTrack,
  fetchPlayTrack,
  fetchPreviousTrack,
  fetchScanBackward,
  fetchScanForward,
} from './network'


class Player extends React.Component {

  /*
   * 🏗
   */
  constructor(props) {
    super(props);

    this.state = {
      // UI
      progress: undefined,
      _nextTrackScheduledAt: undefined,
      // Data
      stream: undefined,
    };

    //
    this.getStream = this.getStream.bind(this);
    this.animateProgressBar = this.animateProgressBar.bind(this);
    this.scheduleNextTrack = this.scheduleNextTrack.bind(this);
    this.handlePrevTrack = this.handlePrevTrack.bind(this);
    this.handleNextTrack = this.handleNextTrack.bind(this);
    this.handlePlayTrack = this.handlePlayTrack.bind(this);
    this.handlePauseTrack = this.handlePauseTrack.bind(this);
    this.handleScanBackward = this.handleScanBackward.bind(this);
    this.handleScanForward = this.handleScanForward.bind(this);
  }

  async componentDidMount() {
    await this.getStream();
    this.scheduleNextTrack();
  }

  async getStream() {
    const jsonResponse = await fetchStream();
    const stream = jsonResponse.data;
    await this.setState({ stream: stream });
    this.animateProgressBar();
  }

  animateProgressBar() {
    const loop = () => {
      const stream = this.state.stream;
      if(!stream?.nowPlaying) {
        this.setState({ progress: undefined, stream: undefined});
        return;
      } else if(!stream.isPlaying && stream.isPaused) {
        this.setState({
          progress: (stream.pausedAt * 1000) - (stream.playedAt * 1000),
        });
        return;
      }

      const date = new Date();
      const epochNow = date.getTime();
      const progress = epochNow - (stream.playedAt * 1000);

      if(progress > (stream.nowPlaying.durationMilliseconds + 3000)) {
        this.setState({ progress: undefined, stream: undefined});
        return;
      }

      this.setState({
        progress: progress,
      });
      window.requestAnimationFrame(loop);
    };

    loop();
  }

  scheduleNextTrack() {
    let nextTrackScheduledAt = this.state._nextTrackScheduledAt;
    if(nextTrackScheduledAt) {
      clearTimeout(nextTrackScheduledAt);
    }

    const stream = this.state.stream;
    if(!stream?.isPlaying) {
      this.setState({ _nextTrackScheduledAt: undefined });
      return;
    }

    const date = new Date();
    const epochNow = date.getTime();
    const progress = epochNow - (stream.playedAt * 1000);
    const durationMilliseconds = stream.nowPlaying.durationMilliseconds;

    nextTrackScheduledAt = setTimeout(
      this.handleNextTrack,
      (durationMilliseconds - progress)
    );
    console.log(nextTrackScheduledAt)
    this.setState({ _nextTrackScheduledAt: nextTrackScheduledAt });
  }

  /*
   * When...
   */
  async handlePrevTrack(event) {
    event.preventDefault();

    await fetchPreviousTrack();

    await this.getStream();
    this.scheduleNextTrack();
  }

  /*
   * When...
   */
  async handleNextTrack(event) {
    if(event) {
      event.preventDefault();
    }

    await fetchNextTrack();

    await this.getStream();
    this.scheduleNextTrack();
  }

  /*
   * When...
   */
  async handlePlayTrack(event) {
    event.preventDefault();

    const stream = this.state.stream;
    const jsonResponse = await fetchPlayTrack();
    await this.setState({
      stream: {
        ...stream,
        isPlaying: true,
        isPaused: false,
        playedAt: jsonResponse.data.playedAt,
      }
    });

    this.animateProgressBar();
    this.scheduleNextTrack();
  }

  /*
   * When...
   */
  async handlePauseTrack(event) {
    event.preventDefault();

    const stream = this.state.stream;
    const jsonResponse = await fetchPauseTrack();
    await this.setState({
      stream: {
        ...stream,
        isPlaying: false,
        isPaused: true,
        pausedAt: jsonResponse.data.pausedAt,
      }
    });
    this.scheduleNextTrack();
  }

  /*
   * When...
   */
  async handleScanBackward(event) {
    event.preventDefault();

    const stream = this.state.stream;
    await fetchScanBackward();

    const date = new Date();
    const epochNow = date.getTime();

    const proposedPlayedAt = stream.playedAt + 10 ;
    const proposedProgress = epochNow - (proposedPlayedAt * 1000);
    const playedAt = proposedProgress > 0 ? proposedPlayedAt : Math.floor(epochNow / 1000);

    await this.setState( {stream: { ...stream, playedAt: playedAt } });
    this.scheduleNextTrack();
  }

  /*
   * When...
   */
  async handleScanForward(event) {
    event.preventDefault();

    const responseJson = await fetchScanForward();
    if(responseJson.system.status !== 200) {
      throw responseJson.system.message;
    }

    const stream = this.state.stream;
    await this.setState( {stream: { ...stream, playedAt: stream.playedAt - (10) } });
    this.scheduleNextTrack();
  }

  render() {
    const stream = this.state.stream;
    return (
      <>
        <div>
          {(stream?.isPlaying || stream?.isPaused) &&
            <p>{stream?.nowPlaying?.name}</p>
          }
          <progress value={this.state.progress} max={stream?.nowPlaying?.durationMilliseconds}></progress>
        </div>
        <div>
          <button onClick={this.handlePrevTrack}>Prev</button>
          {stream?.isPaused &&
            <button onClick={this.handlePlayTrack}>Play</button>
          }
          {stream?.isPlaying &&
            <button onClick={this.handlePauseTrack}>Pause</button>
          }
          <button onClick={this.handleNextTrack}>Next</button>
        </div>
        <div>
          {(stream?.isPlaying) &&
            <button onClick={this.handleScanBackward}>Backward</button>
          }
          {(stream?.isPlaying) &&
            <button onClick={this.handleScanForward}>Forward</button>
          }
        </div>
      </>
    );
  }
}

Player.propTypes = {};

Player.defaultProps = {};

export default Player;
