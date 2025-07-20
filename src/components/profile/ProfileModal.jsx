// src/components/profile/ProfileModal.jsx
import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const ProfileModal = ({ show, onHide }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');
    setLoading(true);

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.displayName
      });

      // Update Firestore user document
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setSuccess('');
        onHide();
      }, 2000);
    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <div className="text-center mb-3">
            <img
              src={user?.photoURL || '/default-avatar.png'}
              alt={user?.displayName}
              className="rounded-circle"
              width={80}
              height={80}
              style={{ objectFit: 'cover' }}
            />
          </div>
          
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
              disabled
              className="bg-light"
            />
            <Form.Text className="text-muted">
              Email cannot be changed
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileModal;
