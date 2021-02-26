import React from 'react';


function SearchResult(props) {
  const searchResult = props.data;
  return (
    <div>
      <span>
        {searchResult.provider} {searchResult.format} {searchResult.name}
      </span>
      <button type="button" onClick={async (e) => { await props.addToQueue(props.data.class, props.data.uuid); }}>
        Add
      </button>
    </div>
  );
}

export default SearchResult;
