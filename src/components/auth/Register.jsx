// src/components/auth/Register.jsx
import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, googleSignIn } = useAuth();

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.displayName);
    } catch (error) {
      setError('Failed to create account: ' + error.message);
    }
    
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      await googleSignIn();
    } catch (error) {
      setError('Failed to sign up with Google: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Display Name</Form.Label>
          <Form.Control
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength="6"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength="6"
            required
          />
        </Form.Group>

        <Button 
          variant="primary" 
          type="submit" 
          className="w-100 mb-2"
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : 'Create Account'}
        </Button>
      </Form>

      <hr />

      <Button 
        variant="outline-primary" 
        className="w-100"
        onClick={handleGoogleSignUp}
        disabled={loading}
      >
        Sign up with Google
      </Button>
    </>
  );
};

export default Register;
