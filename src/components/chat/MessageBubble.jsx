import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";

const MessageBubble = ({
  message,
  isOwn,
  onDelete,
  onReply,
  showAvatar = true,
}) => {
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);

  const formatTime = (ts) => {
    if (!ts) return "";
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text || "");
      setShowOptions(false);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleReply = () => {
    setShowOptions(false);
    if (onReply) onReply(message);
  };

  const handleDelete = async () => {
    setShowOptions(false);
    if (onDelete) await onDelete(message.id);
  };

  const senderName =
    message.senderName || message.sender?.displayName || "Unknown User";

  return (
    <div
      className={`message-bubble ${isOwn ? "own" : "other"}`}
      style={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        marginBottom: 12,
      }}
    >
      <div
        className="message-wrapper"
        style={{
          display: "inline-flex",
          alignItems: "flex-start",
          gap: 4,
          flexDirection: "row",
        }}
      >
        {/* Dropdown options button on LEFT */}
        {!message.isDeleted && !message.deleted && (
          <Dropdown
            show={showOptions}
            onToggle={setShowOptions}
            drop="down"
            align="start" // <-- یہ ensure کرے گا dropdown بائیں طرف کھلے
          >
            <Dropdown.Toggle
              as="button"
              className="options-btn"
              onClick={() => setShowOptions((s) => !s)}
              aria-label="Message options"
              style={{
                width: 28,
                height: 28,
                padding: 0,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.9)",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {/* یہاں آپ نے icon horizontal کرنے کے لیے یہ استعمال کرنا ہے */}
              <i className="bi bi-three-dots" style={{ fontSize: 16 }} />
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="message-options-menu"
              style={{
                minWidth: 160,
                marginTop: 4,
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                zIndex: 9999,
                left: 0,  // dropdown بائیں طرف کھلے گا
                right: "auto",
                transform: "none",
              }}
            >
              <Dropdown.Item
                onClick={handleReply}
                className="d-flex align-items-center"
                style={{ padding: "8px", borderRadius: "var(--radius-md)" }}
              >
                <i className="bi bi-reply me-2" />
                Reply
              </Dropdown.Item>
              <Dropdown.Item
                onClick={handleCopy}
                className="d-flex align-items-center"
                style={{ padding: "8px", borderRadius: "var(--radius-md)" }}
              >
                <i className="bi bi-clipboard me-2" />
                Copy Text
              </Dropdown.Item>
              {isOwn && (
                <>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={handleDelete}
                    className="d-flex align-items-center text-danger"
                    style={{ padding: "8px", borderRadius: "var(--radius-md)" }}
                  >
                    <i className="bi bi-trash3 me-2" />
                    Delete Message
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        )}

        {/* Message bubble */}
        <div
          className="bubble"
          style={{
            maxWidth: "calc(100% - 40px)",
            background: isOwn ? "#1b4332" : "#f4f4f4",
            color: isOwn ? "#fff" : "#000",
            borderRadius: 16,
            padding: "10px 15px",
            wordBreak: "break-word",
            lineHeight: 1.4,
            position: "relative",
          }}
        >
          {message.replyTo && (
            <div
              className="reply-reference"
              style={{
                backgroundColor: "rgba(27,67,50,0.1)",
                borderLeft: "4px solid #1b4332",
                padding: "6px 12px",
                marginBottom: 6,
                borderRadius: 8,
                fontSize: 13,
                fontStyle: "italic",
                color: "#166534",
                maxWidth: 240,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={`${message.replyTo.senderName}: ${message.replyTo.text}`}
            >
              <b>{message.replyTo.senderName}:</b> {message.replyTo.text}
            </div>
          )}
          {message.isDeleted || message.deleted ? (
            <div
              style={{
                fontStyle: "italic",
                opacity: 0.7,
                display: "flex",
                alignItems: "center",
              }}
            >
              <i className="bi bi-trash3 me-2" />
              This message was deleted
            </div>
          ) : (
            <>
              <div>{message.text}</div>
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.6,
                  marginTop: 6,
                  textAlign: "right",
                }}
              >
                {formatTime(message.timestamp)}
                {isOwn && (
                  <i
                    className={`bi ${
                      message.read ? "bi-check2-all text-primary" : "bi-check2"
                    } ms-1`}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
