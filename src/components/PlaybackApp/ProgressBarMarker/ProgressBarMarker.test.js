import React from 'react';
import ReactDOM from 'react-dom';
import ProgressBarMarker from './ProgressBarMarker';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ProgressBarMarker />, div);
  ReactDOM.unmountComponentAtNode(div);
});
