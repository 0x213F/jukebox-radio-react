import React from "react";
import { connect } from 'react-redux';

function ProfileApp(props) {
  // if (!props.userProfile) {
  //   return <></>;
  // }

  const username = 'Olivia Park';
  const profileImg = 'https://flic.kr/p/2kDxxZi';
  const description = 'The bomb';
  const website = 'https://www.oliviahpark.com';
  const sessionList = [
    {
      'image': "https://flic.kr/p/2kDMzbQ",
      'title': "My Session",
      'duration': 252000,
    },
    {
      'image': "https://flic.kr/p/2kDGC7o",
      'title': "My Session2",
      'duration': 222000,
    },
  ]

  return (
    <div>
      <h1>{username}</h1>
      <img src={profileImg} alt="profileImg"></img>
      <p>{description}</p>
      <a href={website} target='_blank' rel='noreferrer'>{username} Website</a>
      <h2>Sessions</h2>
      {!sessionList ? <h2>This user has no sessions.</h2>
      :
      sessionList.map(session =>(
        <div>
          <ul>
            <li>
              {session.title}<br/>
              {session.image}<br/>
              {session.duration}
            </li>
          </ul>
        </div>
      ))}
    </div>
  );
}

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
});

export default connect(mapStateToProps)(ProfileApp);