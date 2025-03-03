import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  messageId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  author: String,
  message: String,
  room: String,
  userId: String,
  edited: { 
    type: Boolean, 
    default: false 
  },
  lastEditedAt: Date,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);