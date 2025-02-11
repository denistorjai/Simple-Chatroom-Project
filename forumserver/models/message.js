import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  author: String,
  message: String,
  room: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);
