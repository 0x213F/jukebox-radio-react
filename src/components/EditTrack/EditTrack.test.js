import React from 'react';
import ReactDOM from 'react-dom';
import EditTrack from './EditTrack';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<EditTrack />, div);
  ReactDOM.unmountComponentAtNode(div);
});
