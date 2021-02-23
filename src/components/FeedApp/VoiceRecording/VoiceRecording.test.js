import React from 'react';
import ReactDOM from 'react-dom';
import VoiceRecording from './VoiceRecording';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<VoiceRecording />, div);
  ReactDOM.unmountComponentAtNode(div);
});
