import { useEffect, useState, useRef } from 'react'
import './App.css'

// Import Components
import Messagebox from './components/messagebox'
import Message from './components/message'

function App() {

  // Get Current Messages
  const [messages, setMessages] = useState([]);

  // Room & Display Name
  const [ displayname, setdisplayname ] = useState("Random User")
  const [ room, setRoom ] = useState("default")

  // Get Messages
  useEffect(() => {
    fetch(`http://localhost:3000/messages?room=${room}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Error fetching messages:", err));
  }, [room]);

  // Post Messages
  const PostMessage = async (messageText) => {

    // Trim
    if (!messageText.trim()) return;

    // Message Json Values
    const newMessage = {
      author: displayname,
      message: messageText,
      room: room
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

  // Automatically Scroll to next message
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ messages ]);

  return (
    <div className='flex flex-col justify-center items-center'>
      {/* Settings */}
      <h1 className='p-5' > Settings </h1>
      <div className='flex'>
        <div className='p-2 self-end'>
          <label> Room ID </label>
          <input className='ml-3 p-2 bg-[#0C0F1B] rounded border-[#1B1E29] border-2 focus:outline-none' type='text' value={room} onChange={(e) => setRoom(e.target.value) } />
        </div>
        <div className='p-2 self-end' >
          <label> Display Name </label>
          <input className='ml-3 p-2 bg-[#0C0F1B] rounded border-[#1B1E29] border-2 focus:outline-none' type="text" value={displayname} onChange={(e) => setdisplayname(e.target.value) } />
        </div>
      </div>
      {/* Rendered Messages */}
      <div className='flex flex-col items-center h-126 mt-5 mb-10 overflow-auto'>
        <div ref={messagesEndRef} />
        {messages.map((msg, index) => (
          <Message key={index} Message={msg.message} Author={msg.author} />
        ))}
      </div>
      {/* Message Box */}
      <Messagebox PostMessage={PostMessage} />
    </div>
  )
}

export default App
