const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const router = express.Router();
/**
 * Extract token from request
 * Checks both the Authorization header and query params
 */
function getTokenFromRequest(req) {
  // Check Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Fall back to query param
  return req.query.token;
}

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile data
 * @access  Private
 */
router.get('/profile', async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    
    // First validate the token by getting user data from Instagram API
    try {
      // Find user in database first
      const user = await User.findOne({ accessToken: token });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid token - user not found' });
      }
      
      // Use the user's Instagram ID to fetch latest data
      const instagramId = user.instagramId;
      
      // Get updated profile info from Instagram API
      const instagramResponse = await axios.get(
        `https://graph.facebook.com/v19.0/${instagramId}`,
        {
          params: {
            fields: 'id,username,profile_picture_url,followers_count,follows_count,media_count',
            access_token: token
          }
        }
      );
      
      // Update user record with latest data
      user.username = instagramResponse.data.username;
      user.profilePicture = instagramResponse.data.profile_picture_url;
      user.lastLogin = Date.now();
      
      await user.save();
      
      // Return updated user profile with follower and following counts
      return res.json({
        id: user._id,
        instagramId: user.instagramId,
        username: user.username,
        profilePicture: user.profilePicture,
        followerCount: instagramResponse.data.followers_count || 0,
        followingCount: instagramResponse.data.follows_count || 0,
        mediaCount: instagramResponse.data.media_count || 0
      });
      
    } catch (error) {
      console.error('Instagram API Error:', error.response?.data || error.message);
      
      // If token is invalid, return appropriate error
      if (error.response?.data?.error?.code === 190) {
        return res.status(401).json({ 
          error: 'Invalid Instagram token',
          details: error.response.data.error
        });
      }
      
      throw error; // Re-throw for the outer catch
    }
    
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ 
      error: 'Server error retrieving profile',
      details: error.message
    });
  }
});

module.exports = router;