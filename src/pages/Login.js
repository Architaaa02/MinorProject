import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isAdmin = role === 'admin';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login({ ...formData, role });
      const user = response.data.user;
      if (isAdmin && user.role !== 'admin') {
        setError('Access denied. This account does not have admin privileges.');
        return;
      }
      login(user, response.data.token);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      if (!err.response) {
        // Mock fallback
        const mockUser = { id: Date.now(), name: isAdmin ? 'Admin User' : 'Demo User', email: formData.email, role };
        login(mockUser, 'mock-token');
        navigate(isAdmin ? '/admin' : '/dashboard');
        return;
      }
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 transition-colors duration-300 ${isAdmin ? 'bg-gradient-to-br from-blue-900 to-blue-700' : 'bg-gradient-to-br from-emerald-50 to-teal-100'}`}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Role Toggle Header */}
        <div className={`p-6 text-center ${isAdmin ? 'bg-blue-900' : 'bg-emerald-600'}`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAdmin ? 'bg-blue-700' : 'bg-emerald-500'}`}>
              {isAdmin ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAdmin ? 'Admin Portal' : 'Welcome Back'}
          </h2>
          <p className="text-sm mt-1 text-white/70">
            {isAdmin ? 'CivicEye Administration' : 'Sign in to your account'}
          </p>

          {/* Toggle */}
          <div className="flex mt-5 bg-white/10 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => { setRole('user'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${!isAdmin ? 'bg-white text-emerald-700 shadow' : 'text-white/70 hover:text-white'}`}
            >
              User Login
            </button>
            <button
              type="button"
              onClick={() => { setRole('admin'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isAdmin ? 'bg-white text-blue-800 shadow' : 'text-white/70 hover:text-white'}`}
            >
              Admin Login
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label={isAdmin ? 'Admin Email' : 'Email'}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={isAdmin ? 'admin@civiceye.com' : 'Enter your email'}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors duration-200 disabled:opacity-50 mt-2
                ${isAdmin ? 'bg-blue-800 hover:bg-blue-900' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {loading ? 'Signing in...' : isAdmin ? 'Login as Admin' : 'Login'}
            </button>
          </form>

          {!isAdmin && (
            <p className="text-center mt-4 text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-600 font-medium hover:underline">
                Register here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
