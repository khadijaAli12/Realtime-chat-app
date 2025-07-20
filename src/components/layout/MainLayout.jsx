import React, { useState } from 'react';
import Header from './Header';
import ConversationList from '../chat/ConversationList';
import ChatRoom from '../chat/ChatRoom';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="main-layout">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="chat-container">
        <div className="chat-wrapper">
          <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            <div className="sidebar-content">
              <ConversationList onChatSelect={() => setSidebarOpen(false)} />
            </div>
          </div>
          
          <div className="main-chat">
            <ChatRoom />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
