import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';

function App() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

 
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

 
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    isLoggedIn ? (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Woori 부동산</h1>
          <button onClick={handleLogout} style={{ padding: 8 }}>로그아웃</button>
        </div>
        <MapPage />
      </div>
    ) : (
      <LoginPage onLoginSuccess={handleLoginSuccess} />
    )
  );
}

export default App;
