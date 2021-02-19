import React from 'react';
import ReactDOM from 'react-dom';
import SpotifySync from './SpotifySync';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<SpotifySync />, div);
  ReactDOM.unmountComponentAtNode(div);
});
