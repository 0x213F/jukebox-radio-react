import React from 'react';
import ReactDOM from 'react-dom';
import QueueItem from './QueueItem';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<QueueItem />, div);
  ReactDOM.unmountComponentAtNode(div);
});
