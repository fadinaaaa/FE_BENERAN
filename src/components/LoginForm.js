// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate untuk redirect
import { Eye, EyeOff } from 'lucide-react'; // Pastikan sudah install lucide-react
import './LoginForm.css'; // Atau './LoginForm.css' sesuai lokasi file CSS Anda

const LoginPage = () => {
  const navigate = useNavigate(); // Hook untuk navigasi
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Logika simulasi login
    console.log('Login attempt:', formData);

    // --- LOGIKA REDIRECT KE DASHBOARD ---
    // Setelah submit berhasil, pindah ke dashboard
    navigate('/dashboard'); 
  };

  return (
    <div className="ttmt-login-container">
      <div className="ttmt-login-card">
        
        {/* Header Section */}
        <div className="ttmt-login-header">
          <h1 className="ttmt-login-title">
            PT TTMT
          </h1>
          <p className="ttmt-login-subtitle">
            Please login to your account
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit}>
          
          {/* Username Input */}
          <div className="ttmt-login-group">
            <label htmlFor="username" className="ttmt-login-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              className="ttmt-login-input"
              required
            />
          </div>

          {/* Password Input */}
          <div className="ttmt-login-group">
            <label htmlFor="password" className="ttmt-login-label">
              Password
            </label>
            <div className="ttmt-login-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="ttmt-login-input"
                style={{ paddingRight: '3rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ttmt-login-toggle-btn"
                style={{
                    background: 'none',
                    border: 'none',
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer'
                }}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button type="submit" className="ttmt-login-submit-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;