// frontend/src/components/AuthErrorScreen.jsx
import React from 'react';
const AuthErrorScreen = ({ message }) => (
  <div className="w-full min-h-screen flex items-center justify-center bg-space-background text-white text-center p-4">
    <p>{message}</p>
  </div>
);
export default AuthErrorScreen;