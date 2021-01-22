import React from 'react';
import ReactDOM from 'react-dom';
import QueueInterval from './QueueInterval';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<QueueInterval />, div);
  ReactDOM.unmountComponentAtNode(div);
});
