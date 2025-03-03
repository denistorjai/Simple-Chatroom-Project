import { useEffect, useState, useRef } from 'react'
import './App.css'

// Import Components
import Messagebox from './components/messagebox'
import Message from './components/message'

// Generate a random ID for cookies
function generateRandomId(length = 16) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Get cookie by name
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// Set cookie with expiration
function setCookie(name, value, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + value + expires + "; path=/";
}

function App() {
  // Get Current Messages
  const [messages, setMessages] = useState([]);

  // Room & Display Name
  const [displayname, setdisplayname] = useState("Random User")
  const [room, setRoom] = useState("default")
  const [userId, setUserId] = useState("")
  
  // Editing state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  // Initialize user cookie on first load
  useEffect(() => {
    // Check if user cookie exists
    let userCookie = getCookie('forumUserId');
    
    // If not, create one
    if (!userCookie) {
      userCookie = generateRandomId();
      setCookie('forumUserId', userCookie);
    }
    
    setUserId(userCookie);
  }, []);

  // Get Messages
  useEffect(() => {
    if (room) {
      fetch(`http://localhost:3000/messages?room=${room}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error("Error fetching messages:", err));
    }
  }, [room]);

  // Post Messages
  const PostMessage = async (messageText) => {
    // Trim
    if (!messageText.trim()) return;

    // Message Json Values
    const newMessage = {
      author: displayname,
      message: messageText,
      room: room,
      userId: userId
    };

    // Try Catch Method Post to Express Server
    try {
      const res = await fetch("http://localhost:3000/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage)
      });

      // Successful
      if (res.ok) {
        const savedMessage = await res.json();
        setMessages(prevMessages => [...prevMessages, savedMessage]); // Append new message
      }

      // Fail
    } catch (err) {
      console.error("Error posting message:", err);
    }
  };

  // Start editing a message
  const startEditing = (message) => {
    setEditingMessageId(message.messageId);
    setEditText(message.message);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  // Save edited message
  const saveEditedMessage = async () => {
    if (!editText.trim()) {
      return cancelEditing();
    }

    try {
      const res = await fetch(`http://localhost:3000/messages/${editingMessageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: editText,
          userId: userId
        })
      });

      if (res.ok) {
        const updatedMessage = await res.json();
        
        // Update the message in the local state
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.messageId === updatedMessage.messageId ? updatedMessage : msg
          )
        );
        
        // Reset editing state
        cancelEditing();
      } else {
        const errorData = await res.json();
        console.error("Failed to update message:", errorData.error);
      }
    } catch (err) {
      console.error("Error updating message:", err);
    }
  };

  // Automatically Scroll to next message
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className='flex flex-col justify-center items-center'>
      {/* Settings */}
      <h1 className='p-5'> Settings </h1>
      <div className='flex'>
        <div className='p-2 self-end'>
          <label> Room ID </label>
          <input 
            className='ml-3 p-2 bg-[#0C0F1B] rounded border-[#1B1E29] border-2 focus:outline-none' 
            type='text' 
            value={room} 
            onChange={(e) => setRoom(e.target.value)} 
          />
        </div>
        <div className='p-2 self-end'>
          <label> Display Name </label>
          <input 
            className='ml-3 p-2 bg-[#0C0F1B] rounded border-[#1B1E29] border-2 focus:outline-none' 
            type="text" 
            value={displayname} 
            onChange={(e) => setdisplayname(e.target.value)} 
          />
        </div>
      </div>
      {/* User ID Display */}
      <div className='text-sm opacity-50 mb-2'>
        Your User ID: {userId}
      </div>
      {/* Rendered Messages */}
      <div className='flex flex-col items-center h-126 mt-5 mb-10 overflow-auto w-full'>
        {messages.map((msg) => (
          <div key={msg.messageId} className="w-full">
            {editingMessageId === msg.messageId ? (
              <div className='flex flex-col p-5 rounded w-128 bg-[#0F1B2A] justify-self-center align-bottom mb-3 mx-auto'>
                <div className="flex justify-between mb-2">
                  <h1 className="self-start text-blue-300">{msg.author} <span className="text-xs opacity-60">(editing)</span></h1>
                </div>
                <textarea
                  className='bg-[#0C0F1B] rounded border-[#1B1E29] border-2 p-2 mb-2 focus:outline-none resize-none w-full'
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button 
                    className='bg-[#2D3748] px-3 py-1 rounded-md cursor-pointer text-sm'
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                  <button 
                    className='bg-[#2B4F82] px-3 py-1 rounded-md cursor-pointer text-sm'
                    onClick={saveEditedMessage}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <Message 
                Message={msg.message} 
                Author={msg.author} 
                IsCurrentUser={msg.userId === userId}
                IsEdited={msg.edited}
                EditTimestamp={msg.lastEditedAt}
                onEdit={() => msg.userId === userId && startEditing(msg)}
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Message Box */}
      <Messagebox PostMessage={PostMessage} />
    </div>
  )
}

export default App