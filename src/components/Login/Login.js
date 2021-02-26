import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from './Login.module.css';

import { fetchAuthToken, fetchInitializeStream } from './network';


function Login(props) {

  /*
   * 🏗
   */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  /*
   * When the user initializes a login attempt.
   */
  const handleSubmit = async function(e) {
    e.preventDefault();

    const responseJson = await fetchAuthToken(username, password);
    if(!responseJson.access || !responseJson.refresh) {
      return;
    }

    localStorage.setItem('accessToken', responseJson.access);
    localStorage.setItem('refreshToken', responseJson.refresh);

    await fetchInitializeStream();

    window.location.href = '/app/search';
  }

  return (
    <form className={styles.Login} onSubmit={async (e) => { await handleSubmit(e); }}>
      <h3>Sign in</h3>
      <p>Contact a system administrator for login information.</p>
      <p>At this time, new registrations are on a case by case basis.</p>

      <br></br>

      <label className={styles.FormBlock}>
        Username&nbsp;&nbsp;
        <input type="text"
               name="username"
               placeholder="username"
               value={username}
               onChange={(e) => {setUsername(e.target.value)}} />
      </label>

      <label className={styles.FormBlock}>
        Password&nbsp;&nbsp;
        <input type="password"
               name="password"
               placeholder="password"
               value={password}
               onChange={(e) => {setPassword(e.target.value)}} />
      </label>

      <br></br>

      <label className={styles.FormBlock}>
        <input type="checkbox"
               name="remember-me"
               value={rememberMe}
               onChange={(e) => {setRememberMe(e.target.value)}} />
        Remember Me
      </label>

      <br></br>

      <div className={styles.FormBlock}>
        <button type="submit">
          Sign In
        </button>
        <span>&nbsp;&nbsp;<Link to="/forgotpassword">Forgot Password?</Link></span>
      </div>
    </form>
  );
}

export default Login;
