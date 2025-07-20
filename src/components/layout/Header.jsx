// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import ProfileModal from '../profile/ProfileModal';
import ProfileImage from '../profile/ProfileImage';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <>
      <div className="modern-header">
        <Navbar expand="lg">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-link d-lg-none text-white me-2 p-0 mobile-menu-btn"
              onClick={onMenuClick}
            >
              <i className="bi bi-list fs-4"></i>
            </button>
            
            <Navbar.Brand href="#" className="text-white d-flex align-items-center">
              <div className="brand-icon">
                <i className="bi bi-chat-dots-fill"></i>
              </div>
              <span>ChatApp</span>
            </Navbar.Brand>
          </div>
          
          <Nav className="ms-auto">
            <div className="user-menu">
              <Dropdown align="end">
                <Dropdown.Toggle 
                  as="div"
                  className="dropdown-toggle"
                  style={{ cursor: 'pointer' }}
                >
                  <ProfileImage 
                    src={user?.photoURL} 
                    name={user?.displayName}
                    size={32} 
                    className="user-avatar me-2"
                    showInitials={true}
                  />
                  <span className="user-name">{user?.displayName}</span>
                  <i className="bi bi-chevron-down ms-1"></i>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setShowProfile(true)}>
                    <i className="bi bi-person me-2"></i>
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Nav>
        </Navbar>
      </div>

      <ProfileModal 
        show={showProfile} 
        onHide={() => setShowProfile(false)} 
      />
    </>
  );
};

export default Header;
