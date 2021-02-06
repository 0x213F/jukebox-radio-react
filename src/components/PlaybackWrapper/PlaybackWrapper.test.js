import React from 'react';
import ReactDOM from 'react-dom';
import PlaybackWrapper from './PlaybackWrapper';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<PlaybackWrapper />, div);
  ReactDOM.unmountComponentAtNode(div);
});
