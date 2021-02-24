import React from "react";
import { connect } from 'react-redux';
import styles from './ProfileApp.module.css';

function ProfileApp(props) {
  // if (!props.userProfile) {
  //   return <></>;
  // }

  const username = 'Olivia Park';
  const profileImg = 'https://images.unsplash.com/photo-1614038276039-667c23bc32fa?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=3000&q=80';
  const description = 'The bomb';
  const website = 'https://www.oliviahpark.com';
  const sessionList = [
    {
      'image': "https://images.unsplash.com/photo-1614028609503-590a6a47146a?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw3fHx8ZW58MHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
      'title': "My Session",
      'duration': "252000ms",
    },
    {
      'image': "https://images.unsplash.com/photo-1614070501149-ce4d75b91ada?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
      'title': "My Session2",
      'duration': "222000",
    },
    {
      'image': "https://images.unsplash.com/photo-1614070501149-ce4d75b91ada?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
      'title': "My Session2",
      'duration': "222000",
    },
    {
      'image': "https://images.unsplash.com/photo-1614070501149-ce4d75b91ada?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
      'title': "My Session2",
      'duration': "222000",
    },
  ]

  return (
    <div className={styles.mainContainer}>

        <div className={styles.userSideBar}>
          <h1>{username}</h1>
          <img src={profileImg} alt="profileImg" className={styles.profilePicture} />
          <a href={website} target='_blank' rel='noreferrer'>{username}'s Website</a>
        </div>

        <div className={styles.scrollContainer}>
          <div className={styles.description}>
            <h2>Who is {username}?</h2>
            <p>{description}</p>
          </div>

          <div className={styles.sessions}>
            <h2>Sessions</h2>
            {sessionList.length === 0 ? <h3>{username} has no sessions.</h3>
            :
            sessionList.map(session =>(
              <div className="sessions">
                <ul>
                  <li>
                    {session.title}<br/>
                    <img src={session.image} alt="sessionImage" className={styles.sessionImage} /><br/>
                    <p>{session.duration}</p>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>

    </div>
  );
}

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
});

export default connect(mapStateToProps)(ProfileApp);