import React from "react";
import { connect } from 'react-redux';

function UserProfile(props) {
  if (!props.userProfile) {
    return <></>;
  }

  return (
    <div>This is user profile page.</div>
  );
}

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
});

export default connect(mapStateToProps)(UserProfile);