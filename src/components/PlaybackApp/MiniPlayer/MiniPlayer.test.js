import React from 'react';
import ReactDOM from 'react-dom';
import MiniPlayer from './MiniPlayer';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MiniPlayer />, div);
  ReactDOM.unmountComponentAtNode(div);
});
