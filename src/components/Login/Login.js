import React from 'react';
import { Link } from "react-router-dom";
import styles from './Login.module.css';

import { fetchAuthToken, fetchInitializeStream } from './network';


class Login extends React.Component {

  /*
   * 🏗
   */
  constructor(props) {
    super(props);

    this.state = {
      // UI
      errorMessage: null,
      // Form
      username: '',
      password: '',
      rememberMe: false,
    };

    // This binding is necessary to make `this` work in the callback.
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /*
   * Ran when an element value has changed value. The data is updated in the
   * model layer so the component may re-render.
   */
  handleChange(event) {
    let obj = {};
    obj[event.target.name] = event.target.value;
    this.setState(obj);
  }

  /*
   * When the user initializes a login attempt.
   */
  async handleSubmit(event) {
    event.preventDefault();
    const responseJson = await fetchAuthToken(this.state.username, this.state.password);
    if(!responseJson.access || !responseJson.refresh) {
      return;
    }
    localStorage.setItem('accessToken', responseJson.access);
    localStorage.setItem('refreshToken', responseJson.refresh);
    await fetchInitializeStream();
  }

  render() {
    return (
      <form className={styles.Login} onSubmit={async (e) => { await this.handleSubmit(e); }}>
        <h3>Sign in</h3>
        <p>If you have not created an account yet, then please <Link to="/signup">Sign Up</Link> first.</p>

        <label className={styles.FormBlock}>
          Username
          <input type="text"
                 name="username"
                 placeholder="username"
                 value={this.state.username}
                 onChange={this.handleChange} />
        </label>

        <label className={styles.FormBlock}>
          Password
          <input type="password"
                 name="password"
                 placeholder="password"
                 value={this.state.password}
                 onChange={this.handleChange} />
        </label>

        <label className={styles.FormBlock}>
          <input type="checkbox"
                 name="remember-me"
                 value={this.state.rememberMe}
                 onChange={this.handleChange} />
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
}

Login.propTypes = {};

Login.defaultProps = {};

export default Login;
