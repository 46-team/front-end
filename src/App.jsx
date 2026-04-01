import React, { useState } from 'react';
import useAuth from './hooks/useAuth';
import LoginForm from './components/Login/LoginForm';
import RegisterForm from './components/Register/RegisterForm';

function App() {
  const { user, isReady } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);

  if (!isReady) {
    return <div className="loading">Initializing Secure Connection...</div>;
  }

  if (user) {
    return (
      <div className="dashboard">
        <h1>Welcome, {user.email}</h1>
        <p>Your session is active.</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {isLoginView ? <LoginForm /> : <RegisterForm />}
      
      <button onClick={() => setIsLoginView(!isLoginView)}>
        {isLoginView ? "Need an account? Register" : "Already have an account? Login"}
      </button>
    </div>
  );
}

export default App;