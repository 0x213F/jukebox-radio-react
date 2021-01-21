import React, { useState, useEffect } from "react";
import { fetchStreamMarkerDelete } from './network';


function TrackMarker(props) {

  const { trackMarker, queueUuid } = props.data;

  const deleteTrackMarker = async function() {
    await fetchStreamMarkerDelete(trackMarker.uuid, queueUuid);
  }

  return (
    <div>
      <span>
        @ {trackMarker.timestampMilliseconds / 1000}
      </span>
      <button onClick={deleteTrackMarker}>Delete</button>
    </div>
  );
}

export default TrackMarker;
