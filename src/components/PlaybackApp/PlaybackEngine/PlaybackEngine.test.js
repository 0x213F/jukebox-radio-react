import React from 'react';
import ReactDOM from 'react-dom';
import PlaybackEngine from './PlaybackEngine';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<PlaybackEngine />, div);
  ReactDOM.unmountComponentAtNode(div);
});
