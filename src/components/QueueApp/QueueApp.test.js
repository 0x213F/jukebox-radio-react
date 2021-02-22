import React from 'react';
import ReactDOM from 'react-dom';
import QueueApp from './QueueApp';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<QueueApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
