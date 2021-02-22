import React from 'react';
import ReactDOM from 'react-dom';
import TrackDetailApp from './TrackDetailApp';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TrackDetailApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
