import React from 'react';
import ReactDOM from 'react-dom';
import PlaybackApp from './PlaybackApp';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<PlaybackApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
