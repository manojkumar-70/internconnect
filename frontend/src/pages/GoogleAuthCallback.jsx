import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [message, setMessage] = useState('Completing Google sign-in...');

  useEffect(() => {
    authAPI.exchangeGoogle().then((response) => {
      if (response.data.requiresRegistration) {
        navigate(`/auth/google/signup?role=${response.data.role}`, { replace: true });
        return;
      }
      const { token, user } = response.data;
      login(user, token);
      navigate(user.role === 'student' ? '/student-dashboard' : '/company-dashboard', { replace: true });
    }).catch((error) => {
      const errorMessage = error.response?.data?.message || 'Google sign-in failed.';
      setMessage(errorMessage);
      toast.error(errorMessage);
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    });
  }, [login, navigate]);

  return <main className="auth-callback-page"><h1>{message}</h1></main>;
};

export default GoogleAuthCallback;
