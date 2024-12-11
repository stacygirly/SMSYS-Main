import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

// Components
import Home from './Components/Home/home';
import Login from './Components/Login and Signup/login';
import Signup from './Components/Login and Signup/signup';
import Dashboard from './Components/Dashboard/dashboard';
import CustomNavbar from './Components/Navbar/navbar';
import Chatbot from './Components/ChatBot/chatbot';
import Footer from './Components/Footer/footer';
import About from './Components/About/about';
import Detector from './Components/Detector/detector';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  /**
   * Check the current user session
   */
  const checkSession = async () => {
    try {
      const response = await axios.get('http://localhost:5000/@me', { withCredentials: true });
      if (response.status === 200 && response.data.message === 'Session active') {
        setIsAuthenticated(true);
        setUsername(response.data.username);
        setMessage(response.data.message);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Session check failed:', error.response || error.message);
      setIsAuthenticated(false);
    }
  };

  /**
   * Handle user login
   * @param {string} username
   * @param {string} password
   */
  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password }, { withCredentials: true });
      if (response.status === 200) {
        setIsAuthenticated(true);
        setUsername(username);
        checkSession(); // Refresh session after login
        return true; // Successful login
      }
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error.response || error.message);
      throw error;
    }
  };

  // Check session on component mount
  useEffect(() => {
    checkSession();
  }, []);

  return (
    <Router>
      <div className="App">
        <CustomNavbar
          isAuthenticated={isAuthenticated}
          username={username}
          setIsAuthenticated={setIsAuthenticated}
          setUsername={setUsername}
          setMessage={setMessage}
        />
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                  setUsername={setUsername}
                  onLogin={handleLogin}
                />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Signup setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />
              )
            }
          />
          <Route path="/home" element={<Home />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/about"
            element={<About isAuthenticated={isAuthenticated} />}
          />
          <Route
            path="/detector"
            element={<Detector />}
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        {isAuthenticated && <Chatbot username={username} message={message} />}
        <Footer />
      </div>
    </Router>
  );
};

export default App;