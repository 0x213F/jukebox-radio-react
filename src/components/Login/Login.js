import React, { useState } from "react";

import { Link } from "react-router-dom";

import { iconLogo, iconCheckboxChecked, iconCheckboxUnchecked } from '../../icons';

import styles from './Login.module.css';
import { fetchAuthToken, fetchInitializeStream } from './network';


function Login(props) {

  /*
   * 🏗
   */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleRememberMe = function() {
    setRememberMe(val => !val);
  }

  /*
   * When the user initializes a login attempt.
   */
  const handleSubmit = async function(e) {
    const responseJson = await fetchAuthToken(username, password);
    if(!responseJson.access || !responseJson.refresh) {
      return;
    }

    localStorage.setItem('accessToken', responseJson.access);
    localStorage.setItem('refreshToken', responseJson.refresh);

    await fetchInitializeStream();

    window.location.href = '/app/search';
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.LoginContainer}>
      <div className={styles.Logo}>
        {iconLogo}
      </div>
      <div className={styles.Login}>

        <div className={styles.LoginHeader}>
          <h3>Sign in</h3>

          {/*
          <p>
            If you have not created an account yet,
            then please <a href="#">Sign Up</a> first.
          </p>
          */}

        </div>

        <label className={styles.FormBlock}>
          <span>
            E-mail*
          </span>
          <input type="text"
                 name="username"
                 value={username}
                 onChange={(e) => {setUsername(e.target.value)}} />
        </label>

        <label className={styles.FormBlock}>
          <span>
            Password
          </span>
          <input type="password"
                 name="password"
                 value={password}
                 onChange={(e) => {setPassword(e.target.value)}} />
        </label>

        <label className={styles.FormBlock}
               style={{height: "25px"}}>
          <button className={styles.Checkbox}
                  onClick={handleRememberMe}>
            {rememberMe ? iconCheckboxChecked : iconCheckboxUnchecked}
          </button>
          <span className={styles.FormBlockInline}>
            Remember Me
          </span>
        </label>

        <div className={styles.FormBlock}
             style={{marginBottom: "6px;"}}>
          <button className={styles.Submit}
                  onClick={handleSubmit}>
            Sign In
          </button>
          <span className={styles.ForgotPassword}>
            <Link to="/forgotpassword">Forgot Password?</Link>
          </span>
        </div>
      </div>
    </div>
  );
}


export default Login;
