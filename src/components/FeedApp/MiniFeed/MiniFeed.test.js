import React from 'react';
import ReactDOM from 'react-dom';
import MiniFeed from './MiniFeed';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MiniFeed />, div);
  ReactDOM.unmountComponentAtNode(div);
});
