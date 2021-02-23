import React from "react";
import { connect } from 'react-redux';
import { fetchStreamMarkerDelete } from './network';


function Marker(props) {

  const { trackMarker, queueUuid } = props.data;

  const deleteTrackMarker = async function() {
    const responseJson = await fetchStreamMarkerDelete(
      trackMarker.uuid, queueUuid
    );
    await props.dispatch(responseJson.redux);
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

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(Marker);
