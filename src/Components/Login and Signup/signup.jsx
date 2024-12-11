import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';

const Signup = ({ setIsAuthenticated, setUsername }) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch 
  } = useForm();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Tracks submission state

  const password = watch('password', ''); // Watch password input for validation

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true); // Disable the form while submitting
      setErrorMessage(''); // Clear any previous error messages

      // API call to register the user
      const response = await fetch('https://114a-129-173-66-71.ngrok-free.app/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setUsername(data.username); // Set username in the parent state
        navigate('/login'); // Redirect to login page
      } else {
        // Handle backend errors
        setErrorMessage(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      // Handle network or other errors
      setErrorMessage('An error occurred. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setIsSubmitting(false); // Re-enable the form
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Username Input */}
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' },
                })}
              />
              {errors.username && <span className="error">{errors.username.message}</span>}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
              />
              {errors.password && <span className="error">{errors.password.message}</span>}
            </div>

            {/* Confirm Password Input */}
            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm Password"
                {...register('confirmPassword', {
                  required: 'Confirm Password is required',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
            </div>

            {/* Error Message */}
            {errorMessage && <div className="error-message">{errorMessage}</div>}

            {/* Submit Button */}
            <div className="form-group">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>

        {/* Welcome Section */}
        <div className="login-welcome">
          <h2>Welcome to Signup</h2>
          <p>Already have an account?</p>
          <Link to="/login">
            <button className="sign-up-button">Sign In</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
