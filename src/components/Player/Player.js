import React from 'react';
import styles from './Player.module.css';
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
      now: undefined,
      progress: undefined,
      // Data
      stream: undefined,
    };

    //
    this.getStream = this.getStream.bind(this);
    this.animateProgressBar = this.animateProgressBar.bind(this);
    this.handlePrevTrack = this.handlePrevTrack.bind(this);
    this.handleNextTrack = this.handleNextTrack.bind(this);
    this.handlePlayTrack = this.handlePlayTrack.bind(this);
    this.handlePauseTrack = this.handlePauseTrack.bind(this);
    this.handleScanBackward = this.handleScanBackward.bind(this);
    this.handleScanForward = this.handleScanForward.bind(this);
  }

  async componentDidMount() {
    await this.getStream();
    this.animateProgressBar();
  }

  async getStream() {
    const jsonResponse = await fetchStream();
    const stream = jsonResponse.data;
    await this.setState({ stream: stream });
  }

  animateProgressBar() {
    const loop = () => {
      const stream = this.state.stream;
      if(!stream.isPlaying) {
        return;
      }

      const date = new Date();
      const epochNow = date.getTime();

      this.setState({
        now: epochNow,
        progress: epochNow - (stream.playedAt * 1000),
      });
      window.requestAnimationFrame(loop);
    };

    loop();
  }

  /*
   * When...
   */
  async handlePrevTrack(event) {
    event.preventDefault();

    const stream = this.state.stream;
    const jsonResponse = await fetchPreviousTrack();

    await this.getStream();
  }

  /*
   * When...
   */
  async handleNextTrack(event) {
    event.preventDefault();

    const stream = this.state.stream;
    const jsonResponse = await fetchNextTrack();

    await this.getStream();
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
  }

  /*
   * When...
   */
  async handlePauseTrack(event) {
    event.preventDefault();

    const stream = this.state.stream;
    const jsonResponse = await fetchPauseTrack();
    this.setState({
      stream: {
        ...stream,
        isPlaying: false,
        isPaused: true,
        pausedAt: jsonResponse.data.pausedAt,
      }
    });
  }

  /*
   * When...
   */
  async handleScanBackward(event) {
    event.preventDefault();

    const stream = this.state.stream;
    const jsonResponse = await fetchScanBackward();

    const date = new Date();
    const epochNow = date.getTime();

    const proposedPlayedAt = stream.playedAt + 10 ;
    const proposedProgress = epochNow - (proposedPlayedAt * 1000);
    const playedAt = proposedProgress > 0 ? proposedPlayedAt : Math.floor(epochNow / 1000);

    this.setState( {stream: { ...stream, playedAt: playedAt } });
  }

  /*
   * When...
   */
  async handleScanForward(event) {
    event.preventDefault();

    const stream = this.state.stream;
    const jsonResponse = await fetchScanForward();
    this.setState( {stream: { ...stream, playedAt: stream.playedAt - (10) } });
  }

  render() {
    const stream = this.state.stream;
    if(!stream) {
      return <></>;
    }
    return (
      <>
        <div>
          <p>{stream.nowPlaying.name}</p>
          {(stream.isPlaying || stream.isPaused) &&
            <progress value={this.state.progress} max={stream.nowPlaying.durationMilliseconds}> 32% </progress>
          }
        </div>
        <div>
          <button onClick={this.handlePrevTrack}>Last</button>
          {stream.isPaused &&
            <button onClick={this.handlePlayTrack}>Play</button>
          }
          {stream.isPlaying &&
            <button onClick={this.handlePauseTrack}>Pause</button>
          }
          <button onClick={this.handleNextTrack}>Next</button>
        </div>
        <div>
          {(stream.isPlaying) &&
            <button onClick={this.handleScanBackward}>Backward</button>
          }
          {(stream.isPlaying) &&
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
