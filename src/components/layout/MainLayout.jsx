// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Header from './Header';
import ConversationList from '../chat/ConversationList';
import ChatRoom from '../chat/ChatRoom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="main-layout">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="chat-container">
        <div className="chat-wrapper">
          {/* Sidebar */}
          <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            <div className="sidebar-content">
              <ConversationList onChatSelect={() => setSidebarOpen(false)} />
            </div>
          </div>
          
          {/* Main Chat Area */}
          <div className="main-chat">
            <ChatRoom />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
