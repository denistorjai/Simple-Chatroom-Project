// Imports
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Message from "./models/message.js";
import { randomUUID } from "crypto";
dotenv.config();

// Variables
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = "mongodb://forum-mongo:27017/forumDB";

// App
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected"))
  .catch(err => console.error("Not Connected", err));

// Default Route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// Get Messages for Specific Room
app.get("/messages", async (req, res) => {
  // Try Catch
  try {
    // Room Query
    const { room } = req.query;

    // if Room not Specified in Query
    if (!room) {
      return res.status(400).json({ error: "Room ID is required" });
    }

    // Find Message
    const messages = await Message.find({ room }).sort({ timestamp: 1 }); // Sort by oldest first
    res.json(messages);

    // Fail
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Post New Message
app.post("/messages", async (req, res) => {
  try {
    // Data
    const { author, message, room, userId } = req.body;

    // If Value Not Specified Return Error
    if (!author || !message || !room) {
      return res.status(400).json({ error: "Author, message, and room are required" });
    }

    // Generate a unique message ID
    const messageId = randomUUID();

    // New Message and Save to MongoDB
    const newMessage = new Message({ 
      messageId,
      author, 
      message, 
      room,
      userId: userId || "anonymous"
    });
    
    await newMessage.save();
    res.status(201).json(newMessage);

    // Error
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Edit Message
app.put("/messages/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message, userId } = req.body;

    // Find the message by ID
    const existingMessage = await Message.findOne({ messageId });

    // Check if message exists
    if (!existingMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the user is the original author
    if (existingMessage.userId !== userId) {
      return res.status(403).json({ error: "You can only edit your own messages" });
    }

    // Update the message
    existingMessage.message = message;
    existingMessage.edited = true;
    existingMessage.lastEditedAt = new Date();
    
    await existingMessage.save();
    
    res.json(existingMessage);
  } catch (err) {
    console.error("Error editing message:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete Message
app.delete("/messages/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    // Find the message by ID
    const existingMessage = await Message.findOne({ messageId });

    // Check if message exists
    if (!existingMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the user is the original author
    if (existingMessage.userId !== userId) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    // Delete the message
    await Message.deleteOne({ messageId });
    
    res.json({ success: true, messageId });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});