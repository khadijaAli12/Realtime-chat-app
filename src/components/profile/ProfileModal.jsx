// src/components/profile/ProfileModal.jsx
import React, { useState, useRef } from 'react';
import { Modal, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../../services/firebase';

const ProfileModal = ({ show, onHide }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImageToFirebase = async (file) => {
    return new Promise((resolve, reject) => {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `profile_${user.uid}_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `profile-images/${filename}`);
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error('Upload failed: ' + error.message));
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('File available at:', downloadURL);
            resolve(downloadURL);
          } catch (error) {
            reject(new Error('Failed to get download URL: ' + error.message));
          }
        }
      );
    });
  };

  const generateInitialAvatar = (name) => {
    if (!name || !name.trim()) return null;
    
    const nameParts = name.trim().split(' ');
    let initials = '';
    
    if (nameParts.length >= 2) {
      initials = nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    } else {
      initials = nameParts[0].charAt(0).toUpperCase();
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&background=4f46e5&color=ffffff&font-size=0.5&bold=true&format=png`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setUploadProgress(0);

    try {
      let photoURL = user?.photoURL;

      // Upload new image if selected
      if (selectedFile) {
        console.log('Uploading image to Firebase Storage...');
        photoURL = await uploadImageToFirebase(selectedFile);
        console.log('Image uploaded successfully:', photoURL);
      } else if (!photoURL || photoURL.includes('ui-avatars.com')) {
        // Generate initial avatar if no photo and none uploaded
        photoURL = generateInitialAvatar(formData.displayName);
      }

      // Update Firebase Auth profile
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found. Please log in again.');
      }

      console.log('Updating Firebase Auth profile...');
      await updateProfile(currentUser, {
        displayName: formData.displayName,
        photoURL: photoURL
      });

      // Update Firestore user document
      console.log('Updating Firestore user document...');
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        photoURL: photoURL,
        updatedAt: new Date()
      });

      setSuccess('Profile updated successfully!');
      
      // Clear form state
      setSelectedFile(null);
      setPreviewImage(null);
      setUploadProgress(0);
      
      // Auto close modal after success
      setTimeout(() => {
        setSuccess('');
        onHide();
        // Force page refresh to show updated profile
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Profile update error:', error);
      setError(`Failed to update profile: ${error.message}`);
      setUploadProgress(0);
    }
    
    setLoading(false);
  };

  const getCurrentPhotoURL = () => {
    if (previewImage) return previewImage;
    if (user?.photoURL && !user.photoURL.includes('ui-avatars.com')) return user.photoURL;
    return generateInitialAvatar(formData.displayName || user?.displayName || 'User');
  };

  const hasCustomPhoto = () => {
    return user?.photoURL && !user.photoURL.includes('ui-avatars.com');
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-person-circle me-2"></i>
          Edit Profile
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          {/* Profile Picture Section */}
          <div className="profile-picture-section text-center mb-4">
            <div className="profile-picture-container">
              <img
                src={getCurrentPhotoURL()}
                alt={formData.displayName || 'Profile'}
                className="profile-picture"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--border-light)',
                  boxShadow: 'var(--shadow-md)'
                }}
                onError={(e) => {
                  e.target.src = generateInitialAvatar(formData.displayName || 'User');
                }}
              />
              
              <div className="picture-overlay">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-btn"
                  disabled={loading}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="bi bi-camera-fill"></i>
                </Button>
                
                {(previewImage || hasCustomPhoto()) && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={removeImage}
                    className="remove-btn"
                    disabled={loading}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      position: 'absolute',
                      bottom: '0',
                      right: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </Button>
                )}
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
            />
            
            <div className="mt-3">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <i className="bi bi-upload me-2"></i>
                {previewImage ? 'Change Photo' : 'Upload Photo'}
              </Button>
              
              {(previewImage || hasCustomPhoto()) && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={removeImage}
                  className="ms-2"
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Remove
                </Button>
              )}
            </div>
            
            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-3">
                <ProgressBar 
                  now={uploadProgress} 
                  label={`${uploadProgress}%`}
                  variant="primary"
                  style={{ height: '8px' }}
                />
                <small className="text-muted">Uploading image...</small>
              </div>
            )}
            
            <small className="text-muted mt-2 d-block">
              {hasCustomPhoto() || previewImage 
                ? 'Custom profile photo' 
                : 'Using initials as profile picture'}
            </small>
          </div>
          
          {/* Form Fields */}
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-person me-2"></i>
              Display Name
            </Form.Label>
            <Form.Control
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your display name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-envelope me-2"></i>
              Email Address
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="bg-light"
            />
            <Form.Text className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Email cannot be changed
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end gap-3">
            <Button 
              variant="outline-secondary" 
              onClick={onHide}
              disabled={loading}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
              className="d-flex align-items-center"
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 ? `Uploading ${uploadProgress}%...` : 'Updating...'}
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileModal;
