
import React, { useState } from 'react';

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      onLoginSuccess();
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e0e5ec',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          background: '#e0e5ec',
          borderRadius: 20,
          boxShadow: '10px 10px 20px #a3b1c6, -10px -10px 20px #ffffff',
          padding: 30,
          width: 320,
        }}
      >
        <h1
          style={{
            marginBottom: 30,
            fontWeight: 700,
            color: '#333',
            fontSize: 32,
          }}
        >
          Woori Login
        </h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{
            background: '#e0e5ec',
            borderRadius: 20,
            boxShadow:
              'inset 10px 10px 20px #a3b1c6, inset -10px -10px 20px #ffffff',
            border: 'none',
            outline: 'none',
            padding: '14px 20px',
            marginBottom: 20,
            fontSize: 16,
            width: 240,
            color: '#333',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{
            background: '#e0e5ec',
            borderRadius: 20,
            boxShadow:
              'inset 10px 10px 20px #a3b1c6, inset -10px -10px 20px #ffffff',
            border: 'none',
            outline: 'none',
            padding: '14px 20px',
            marginBottom: 20,
            fontSize: 16,
            width: 240,
            color: '#333',
          }}
        />
        {error && (
          <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
        )}
        <button
          type="submit"
          style={{
            background: '#e0e5ec',
            borderRadius: 20,
            boxShadow: '10px 10px 20px #a3b1c6, -10px -10px 20px #ffffff',
            border: 'none',
            padding: '14px 0',
            width: 180,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: 10,
            color: '#333',
          }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
