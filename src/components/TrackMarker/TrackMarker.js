import React, { useState, useEffect } from "react";
import { connect } from 'react-redux'
import { fetchDeleteTrackMarker } from './network';


function TrackMarker(props) {

  const marker = props.data;

  const deleteMarker = async function() {
    await fetchDeleteTrackMarker(marker.uuid);
  }

  return (
    <div>
      <span>
        @ {marker.timestampMilliseconds / 1000}
      </span>
      <button onClick={deleteMarker}>Delete</button>
    </div>
  );
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(TrackMarker);
