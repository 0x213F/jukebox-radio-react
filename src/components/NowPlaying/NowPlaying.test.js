import React from 'react';
import ReactDOM from 'react-dom';
import NowPlaying from './NowPlaying';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<NowPlaying />, div);
  ReactDOM.unmountComponentAtNode(div);
});
