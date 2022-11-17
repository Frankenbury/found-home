/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { toast } from 'react-toastify';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';
import OAuth from '../Components/OAuth';

function Register() {
  // local state for form display and data
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const { name, email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const { user } = userCredential;

      updateProfile(auth.currentUser, {
        displayName: name
      });

      // use data without changing formData state
      const formDataCopy = { ...formData };
      // Don't send the password to the database
      delete formDataCopy.password;

      formDataCopy.timestamp = serverTimestamp();
      // save user data, less the password, on the server
      await setDoc(doc(db, 'users', user.uid), formDataCopy);

      navigate('/');
    } catch (error) {
      toast.error('Something Went Wrong');
    }
  };

  const toggleVisible = (e) => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome!</p>
        </header>
        <input
          type="email"
          className="nameInput"
          placeholder="name"
          id="name"
          name="name"
          value={name}
          onChange={onChange}
        />
        <form onSubmit={onSubmit}>
          <input
            type="email"
            className="emailInput"
            placeholder="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
          />
          <div className="passwordInputDiv">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="password"
              id="password"
              className="passwordInput"
              name="password"
              value={password}
              onChange={onChange}
            />
            <img
              src={visibilityIcon}
              alt="show password"
              className="showPassword"
              onClick={toggleVisible}
            />
          </div>
          <Link to="/forgot-password" className="forgotPasswordLink">
            Forgot Password
          </Link>
          <div className="signUpBar">
            <p className="signUpText">Register</p>
            <button className="signUpButton">
              <ArrowRightIcon fill="ffffff" width="34px" height="34px" />
            </button>
          </div>
        </form>
        <OAuth />
        <Link to="/sign-in" className="registerLink">
          Already registered? Sign in here.
        </Link>
      </div>
    </>
  );
}

export default Register;
