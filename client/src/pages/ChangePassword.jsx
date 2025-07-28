import React, { useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return setMessage('❌ Please fill all fields');
    }

    if (newPassword !== confirmPassword) {
      return setMessage('❌ New passwords do not match');
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        '/api/auth/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || '✅ Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Failed to change password');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold text-purple-800 mb-4">🔒 Change Password</h2>
      
      <div className="space-y-4 text-sm">
        <input
          type="password"
          placeholder="Old Password"
          className="input-style w-full"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          className="input-style w-full"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="input-style w-full"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          className="btn blue w-full mt-2"
          onClick={handleChange}
        >
          Update Password
        </button>
        {message && <p className="text-center mt-2 text-sm text-red-600">{message}</p>}
      </div>
    </div>
  );
};

export default ChangePassword;
