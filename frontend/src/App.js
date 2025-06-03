import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");
  const [timestamp, setTimestamp] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get the API URL from environment variable or default to localhost
  const API_URL = "http://localhost:3000";

  // Fetch the original hello endpoint
  useEffect(() => {
    fetch(`${API_URL}/api/hello`)
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
        setTimestamp(data.timestamp);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMessage("Error connecting to backend");
      });
  }, [API_URL]);

  // Fetch all messages
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/messages`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();
  }, [API_URL]);

  // Add a new message
  const handleAddMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newMessageText }),
      });

      if (!response.ok) {
        throw new Error("Failed to add message");
      }

      setNewMessageText("");
      fetchMessages();
    } catch (error) {
      console.error("Error adding message:", error);
      setError("Failed to add message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/messages/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("Failed to delete message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing a message
  const handleStartEdit = (message) => {
    setEditingMessage(message._id);
    setEditText(message.text);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  // Save edited message
  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/messages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: editText }),
      });

      if (!response.ok) {
        throw new Error("Failed to update message");
      }

      setEditingMessage(null);
      fetchMessages();
    } catch (error) {
      console.error("Error updating message:", error);
      setError("Failed to update message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + Express with MongoDB</h1>
        <div className="message-box">
          <p>
            Message from backend: <strong>{message}</strong>
          </p>
          <p>Timestamp: {timestamp}</p>
        </div>
      </header>

      <main className="App-main">
        <section className="message-form-container">
          <h2>Add New Message</h2>
          <form onSubmit={handleAddMessage} className="message-form">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Enter a new message..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newMessageText.trim()}
            >
              {isLoading ? "Adding..." : "Add Message"}
            </button>
          </form>
        </section>

        <section className="messages-container">
          <h2>Messages</h2>
          {error && <p className="error-message">{error}</p>}

          {isLoading && messages.length === 0 ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p>No messages yet. Add one above!</p>
          ) : (
            <ul className="messages-list">
              {messages.map((msg) => (
                <li key={msg._id} className="message-item">
                  {editingMessage === msg._id ? (
                    <div className="edit-message-form">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="edit-buttons">
                        <button onClick={() => handleSaveEdit(msg._id)}>
                          Save
                        </button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="message-content">
                        <p>{msg.text}</p>
                        <span className="message-date">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <div className="message-actions">
                        <button onClick={() => handleStartEdit(msg)}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteMessage(msg._id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
