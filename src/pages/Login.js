import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login } from '../firebase/authService';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { isAuthenticated, setUserFromLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both username (email) and password.');
      return;
    }
    setLoading(true);
    try {
      const { user } = await login(email.trim(), password);
      setUserFromLogin(user);
      navigate('/', { replace: true });
    } catch (err) {
      const message =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Invalid username or password.'
          : err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page page-enter">
      <div className="login-card card-enter">
        <div className="login-header">
          <span className="login-icon">🏖️</span>
          <h1>Ocean View Resort</h1>
          <p>Galle — Staff Reservation System</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email" className="login-label">
            Username (Email)
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            placeholder="staff@oceanviewresort.com"
            disabled={loading}
          />
          <label htmlFor="password" className="login-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            placeholder="••••••••"
            disabled={loading}
          />
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="login-footer">
          Secure access for resort staff only.
        </p>
      </div>
    </div>
  );
}
