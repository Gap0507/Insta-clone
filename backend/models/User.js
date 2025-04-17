const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  instagramId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema); 