// src/App.jsx
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import AuthGuard from './components/auth/AuthGuard';
import MainLayout from './components/layout/MainLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AuthGuard>
          <ChatProvider>
            <MainLayout />
          </ChatProvider>
        </AuthGuard>
      </div>
    </AuthProvider>
  );
}

export default App;
