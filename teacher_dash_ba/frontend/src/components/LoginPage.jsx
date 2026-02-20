import React, { useState } from 'react';
import { GraduationCap, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import apiService from '../services/api';
import ErrorPopup from './ErrorPopup';

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    errors: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (isLogin) {
      if (!formData.email || !formData.password) {
        setErrorPopup({
          isOpen: true,
          title: 'Missing Information',
          message: 'Please fill in all required fields.',
          errors: []
        });
        return;
      }
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setErrorPopup({
          isOpen: true,
          title: 'Missing Information',
          message: 'Please fill in all required fields.',
          errors: []
        });
        return;
      }
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        console.log('Attempting login with:', formData.email);
        const response = await apiService.login(formData.email, formData.password);
        
        console.log('Login response:', response);
        console.log('Response keys:', Object.keys(response));
        
        // Store token and user data with 1-day expiration
        if (response.token) {
          const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
          localStorage.setItem('token', response.token);
          localStorage.setItem('authExpiry', expiryTime.toString());
          console.log('✅ Token stored in localStorage');
        } else {
          console.error('❌ No token in login response');
          console.error('Full response:', JSON.stringify(response, null, 2));
        }
        
        const userData = response.user || response.data;
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ User data stored:', userData);
          onLogin(userData);
        } else {
          console.error('❌ No user data in login response');
          console.error('Available keys in response:', Object.keys(response));
          setErrorPopup({
            isOpen: true,
            title: 'Login Error',
            message: 'Login successful but no user data received',
            errors: []
          });
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setErrorPopup({
            isOpen: true,
            title: 'Password Mismatch',
            message: 'The passwords you entered do not match. Please try again.',
            errors: []
          });
          setLoading(false);
          return;
        }
        
        const response = await apiService.register(formData.name, formData.email, formData.password);
        
        // Store token and user data with 1-day expiration
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user || response.data));
        localStorage.setItem('authExpiry', expiryTime.toString());
        
        onLogin(response.user || response.data);
      }
    } catch (error) {
      // Extract error details
      let errorMessage = error.message || 'Authentication failed. Please try again.';
      let errors = [];
      
      // Check if error has validation errors array
      if (error.errors && Array.isArray(error.errors)) {
        errors = error.errors;
        errorMessage = 'Please fix the following errors:';
      } else if (error.status === 400) {
        // Validation error from backend
        errorMessage = 'Validation failed';
        if (error.errors) {
          errors = Array.isArray(error.errors) ? error.errors : [error.errors];
        }
      }
      
      setErrorPopup({
        isOpen: true,
        title: 'Authentication Error',
        message: errorMessage,
        errors: errors
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            TeacherHub
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Welcome back! Please sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Login/Register Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                isLogin 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                !isLogin 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-600">Email: teacher@demo.com</p>
            <p className="text-xs text-blue-600">Password: demo123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>© 2024 TeacherHub. All rights reserved.</p>
        </div>
      </div>

      {/* Error Popup */}
      <ErrorPopup
        isOpen={errorPopup.isOpen}
        onClose={() => setErrorPopup({ ...errorPopup, isOpen: false })}
        title={errorPopup.title}
        message={errorPopup.message}
        errors={errorPopup.errors}
      />
    </div>
  );
};

export default LoginPage;