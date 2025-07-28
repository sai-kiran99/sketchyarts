import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './Main.css';
import AuthProvider, { AuthContext } from './context/AuthContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RootApp = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-purple-800 font-bold text-xl">
        Loading...
      </div>
    );
  }

  return (
    <>
      <App />
      <ToastContainer position="top-center" />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  </React.StrictMode>
);
