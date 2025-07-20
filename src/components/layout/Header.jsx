// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Navbar, Nav, Container, Dropdown, Modal, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import ProfileModal from '../profile/ProfileModal';

const Header = () => {
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
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand href="#" className="fw-bold">
            ChatApp
          </Navbar.Brand>
          
          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle 
                variant="outline-light" 
                id="user-dropdown"
                className="d-flex align-items-center border-0"
              >
                <img
                  src={user?.photoURL || '/default-avatar.png'}
                  alt={user?.displayName}
                  className="rounded-circle me-2"
                  width={32}
                  height={32}
                  style={{ objectFit: 'cover' }}
                />
                <span className="d-none d-md-inline">{user?.displayName}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setShowProfile(true)}>
                  Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      <ProfileModal 
        show={showProfile} 
        onHide={() => setShowProfile(false)} 
      />
    </>
  );
};

export default Header;
