import React from 'react';
import ReactDOM from 'react-dom';
import QueueTrack from './QueueTrack';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<QueueTrack />, div);
  ReactDOM.unmountComponentAtNode(div);
});
