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

    window.location.reload();
  }

  return (
    <form className={styles.Login} onSubmit={async (e) => { await handleSubmit(e); }}>
      <h3>Sign in</h3>
      <p>If you have not created an account yet, then please <Link to="/signup">Sign Up</Link> first.</p>

      <label className={styles.FormBlock}>
        Username
        <input type="text"
               name="username"
               placeholder="username"
               value={username}
               onChange={(e) => {setUsername(e.target.value)}} />
      </label>

      <label className={styles.FormBlock}>
        Password
        <input type="password"
               name="password"
               placeholder="password"
               value={password}
               onChange={(e) => {setPassword(e.target.value)}} />
      </label>

      <label className={styles.FormBlock}>
        <input type="checkbox"
               name="remember-me"
               value={rememberMe}
               onChange={(e) => {setRememberMe(e.target.value)}} />
        Remember Me
      </label>

      <div className={styles.FormBlock}>
        <button type="submit">
          Sign In
        </button>
        <span><Link to="/forgotpassword">Forgot Password?</Link></span>
      </div>
    </form>
  );
}

export default Login;
