// src/components/auth/AuthGuard.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import Login from './Login';
import Register from './Register';
import LoadingSpinner from '../ui/LoadingSpinner';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Row className="w-100">
          <Col xs={12} md={6} lg={4} className="mx-auto">
            <Card className="shadow">
              <Card.Header>
                <Nav variant="pills" className="justify-content-center">
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'login'} 
                      onClick={() => setActiveTab('login')}
                    >
                      Login
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'register'} 
                      onClick={() => setActiveTab('register')}
                    >
                      Register
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                {activeTab === 'login' ? <Login /> : <Register />}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return children;
};

export default AuthGuard;
