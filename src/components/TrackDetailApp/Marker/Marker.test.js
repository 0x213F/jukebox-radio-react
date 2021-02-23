import React from 'react';
import ReactDOM from 'react-dom';
import Marker from './Marker';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Marker />, div);
  ReactDOM.unmountComponentAtNode(div);
});
