import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { io, getReciverSocketId } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  {
    try {
      const loggedInUserId = req.user._id;
      const filterUsers = await User.find({
        _id: { $ne: loggedInUserId },
      }).select("-password");
      res.status(200).json(filterUsers);
    } catch (error) {
      console.error("Error in getUsersForSidebar controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // sender, reciver
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getUsersForSidebar controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;

    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Emit real-time event to receiver and sender
    const receiverSocketId = getReciverSocketId(receiverId);
    const senderSocketId = getReciverSocketId(senderId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
