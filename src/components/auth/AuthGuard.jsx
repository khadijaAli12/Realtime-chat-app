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
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container">
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
          <Row className="w-100">
            <Col xs={12} md={6} lg={4} className="mx-auto">
              <Card className="auth-card shadow-lg">
                <Card.Header className="auth-header">
                  <div className="text-center mb-3">
                    <h3 className="auth-brand">
                      <i className="bi bi-chat-dots-fill me-2"></i>
                     Eloquent
                    </h3>
                  </div>
                  <Nav variant="pills" className="justify-content-center">
                    <Nav.Item>
                      <Nav.Link 
                        active={activeTab === 'login'} 
                        onClick={() => setActiveTab('login')}
                        className="auth-tab"
                      >
                        Login
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link 
                        active={activeTab === 'register'} 
                        onClick={() => setActiveTab('register')}
                        className="auth-tab"
                      >
                        Register
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Header>
                <Card.Body className="auth-body">
                  {activeTab === 'login' ? <Login /> : <Register />}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return children;
};

export default AuthGuard;
