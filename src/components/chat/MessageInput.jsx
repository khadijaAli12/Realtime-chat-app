// src/components/chat/MessageInput.jsx
import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';

const MessageInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
        />
        <Button 
          type="submit" 
          variant="primary"
          disabled={!message.trim() || disabled}
        >
          Send
        </Button>
      </InputGroup>
    </Form>
  );
};

export default MessageInput;
