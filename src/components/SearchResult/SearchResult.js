import React from 'react';
import styles from './SearchResult.module.css';


class SearchResult extends React.Component {

  render() {
    const searchResult = this.props.data;
    return (
      <div>
        <span>
          {searchResult.provider} {searchResult.format} {searchResult.name}
        </span>
        <button type="button" onClick={async (e) => { await this.props.addToQueue(this.props.data.class, this.props.data.uuid); }}>
          Add
        </button>
      </div>
    );
  }
}

SearchResult.propTypes = {};

SearchResult.defaultProps = {};

export default SearchResult;
