// Imports
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Message from "./models/message.js";
import { randomUUID } from "crypto";
import User from "./models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./authMiddleware.js";
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
app.post("/messages", authenticateToken, async (req, res) => {
  try {
    // Get user info from token
    const { username, userId } = req.user;
    
    // Data from request body
    const { message, room } = req.body;

    // If value not specified return error
    if (!message || !room) {
      return res.status(400).json({ error: "Message and room are required" });
    }

    // Generate a unique message ID
    const messageId = randomUUID();

    // New Message and Save to MongoDB
    const newMessage = new Message({ 
      messageId,
      author: username, 
      message, 
      room,
      userId
    });
    
    await newMessage.save();
    res.status(201).json(newMessage);

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

// Get Message by ID
app.get("/messages/:messageId", async (req, res) => {
  // Try Get Catch
  try {

    // Get Message ID Param and Attempt to Find it
    const { messageId } = req.params;
    const message = await Message.findOne({ messageId });
    
    // If message doesnt exist then return 404 msge not found
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    // return
    res.json(message);
    
  } catch (err) {
    // try catch failure
    console.error("Error fetching message by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Authentication
app.post("/auth/register", async (req, res) => {
  try {

    // get user and password
    const { username, password } = req.body;
    
    // check if null
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    // check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }
    
    // hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // add new user to schema
    const newUser = new User({
      username,
      password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({
      success: true,
      userId: newUser._id,
      username: newUser.username
    });
    
  } catch (err) {
    // error
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// login
app.post("/auth/login", async (req, res) => {
  try {

    // get user and password
    const { username, password } = req.body;
    
    // check if null
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    // find user in schema
    const user = await User.findOne({ username });
    if (!user) {
      // not found
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    // confirm password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // invalid
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    // assign jwt
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // success
    res.json({
      success: true,
      token,
      userId: user._id,
      username: user.username
    });
    
  } catch (err) {
    // error
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});