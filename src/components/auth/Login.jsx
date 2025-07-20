import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleSignIn } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await googleSignIn();
    } catch (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  return (
    <>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input"
          />
        </Form.Group>

        <Button 
          variant="primary" 
          type="submit" 
          className="w-100 mb-3 auth-btn"
          disabled={loading}
        >
          {loading ? <Spinner size="sm" className="me-2" /> : null}
          Login
        </Button>
      </Form>

      <hr className="my-3" />

      <Button 
        variant="outline-primary" 
        className="w-100 google-btn"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <i className="bi bi-google me-2"></i>
        Sign in with Google
      </Button>
    </>
  );
};

export default Login;
