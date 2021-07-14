import React from 'react';
import ReactDOM from 'react-dom';
import TrackDetail from './TrackDetail';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TrackDetail />, div);
  ReactDOM.unmountComponentAtNode(div);
});
