import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [forgotMode, setForgotMode] = useState(false); // NEW
  const [forgotOtp, setForgotOtp] = useState(''); // NEW
  const [newForgotPassword, setNewForgotPassword] = useState(''); // NEW

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setStep(1);
    setForgotMode(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem('token', res.data.token);
        login(formData.email);
        // ✅ NEW lines to fix profilePic issue
          const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
         Authorization: `Bearer ${res.data.token}`,
      },
      });
        localStorage.setItem('user', JSON.stringify(profileRes.data));
        setAnimating(true);
        setTimeout(() => navigate('/'), 1200);
      } catch (err) {
        alert(err.response?.data?.message || 'Login failed');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      try {
        await axios.post('http://localhost:5000/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        alert('OTP sent to your email');
        setStep(2);
      } catch (err) {
        alert(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  const handleOTPVerify = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/verify', {
        email: formData.email,
        otp,
      });
      alert('OTP verified! You can now login');
      setIsLogin(true);
      setStep(1);
    } catch (err) {
      alert(err.response?.data?.message || 'OTP verification failed');
    }
  };

  // ✨ FORGOT PASSWORD FLOW
  const sendForgotOtp = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/send-reset-otp', {
        email: formData.email,
      });
      alert('OTP sent to email');
      setStep(4);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyForgotOtp = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/verify-reset-otp', {
        email: formData.email,
        otp: forgotOtp,
      });
      alert('OTP verified. Now reset your password');
      setStep(5);
    } catch (err) {
      alert(err.response?.data?.message || 'OTP verification failed');
    }
  };

  const resetForgotPassword = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email: formData.email,
        newPassword: newForgotPassword,
      });
      alert('Password reset successful. You can now login.');
      setForgotMode(false);
      setStep(1);
      setIsLogin(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <section className={`flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-purple-100 to-pink-100 transition-all duration-700 ${animating ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full animate-slideUp">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">
          {forgotMode
            ? 'Forgot Password'
            : isLogin
            ? 'Login to SketchyArts'
            : 'Create Your Account'}
        </h2>

        {/* Step 1: Login / Register */}
        {step === 1 && !forgotMode && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="input-style"
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="input-style"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input-style"
              required
            />
            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-style"
                required
              />
            )}
            <button
              type="submit"
              className="w-full bg-purple-800 text-white py-2 rounded hover:bg-purple-700 transition"
            >
              {isLogin ? 'Login' : 'Send OTP'}
            </button>

            {/* Forgot Password link */}
            {isLogin && (
              <p
                className="text-right text-sm text-purple-600 hover:underline cursor-pointer"
                onClick={() => {
                  setForgotMode(true);
                  setStep(3);
                }}
              >
                Forgot Password?
              </p>
            )}
          </form>
        )}

        {/* Step 2: OTP verify after Register */}
        {!isLogin && step === 2 && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input-style"
              required
            />
            <button
              onClick={handleOTPVerify}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500 transition"
            >
              Verify OTP
            </button>
          </div>
        )}

        {/* Step 3: Enter Email for forgot password */}
        {forgotMode && step === 3 && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleChange}
              className="input-style"
              required
            />
            <button
              onClick={sendForgotOtp}
              className="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-800 transition"
            >
              Send OTP
            </button>
          </div>
        )}

        {/* Step 4: Verify OTP */}
        {forgotMode && step === 4 && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={forgotOtp}
              onChange={(e) => setForgotOtp(e.target.value)}
              className="input-style"
              required
            />
            <button
              onClick={verifyForgotOtp}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500 transition"
            >
              Verify OTP
            </button>
          </div>
        )}

        {/* Step 5: Reset Password */}
        {forgotMode && step === 5 && (
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter New Password"
              value={newForgotPassword}
              onChange={(e) => setNewForgotPassword(e.target.value)}
              className="input-style"
              required
            />
            <button
              onClick={resetForgotPassword}
              className="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-800 transition"
            >
              Reset Password
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          {forgotMode ? (
            <button
              onClick={() => {
                setForgotMode(false);
                setStep(1);
              }}
              className="text-purple-600 hover:underline font-medium"
            >
              Back to Login
            </button>
          ) : isLogin ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={toggleMode}
                className="text-purple-600 hover:underline font-medium"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={toggleMode}
                className="text-purple-600 hover:underline font-medium"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </section>
  );
};

export default Login;
