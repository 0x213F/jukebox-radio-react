import React from 'react';
import ReactDOM from 'react-dom';
import TrackMarker from './TrackMarker';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TrackMarker />, div);
  ReactDOM.unmountComponentAtNode(div);
});
