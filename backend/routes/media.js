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
  
  // Fall back to query param or body param
  return req.query.token || req.body.token;
}

/**
 * @route   GET /api/media/feed
 * @desc    Get user's media feed
 * @access  Private
 */
router.get('/feed', async (req, res) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  const limit = req.query.limit || 10;

  try {
    // First find the user to get their Instagram ID
    const user = await User.findOne({ accessToken: token });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    // Use the Instagram business account ID to fetch media
    const instagramId = user.instagramId;
    
    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${instagramId}/media`,
      {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,like_count,comments_count',
          access_token: token,
          limit: limit
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching media feed:', error.response ? error.response.data : error);
    
    if (error.response && error.response.status === 400) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ 
      error: 'Error fetching media feed',
      details: error.response?.data?.error || error.message
    });
  }
});

/**
 * @route   GET /api/media/:mediaId/comments
 * @desc    Get comments for a specific media
 * @access  Private
 */
router.get('/:mediaId/comments', async (req, res) => {
  const { mediaId } = req.params;
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${mediaId}/comments`,
      {
        params: {
          access_token: token,
          fields: 'id,text,username,timestamp,like_count,replies'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching comments:', error.response ? error.response.data : error);
    
    if (error.response && error.response.status === 400) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

/**
 * @route   POST /api/media/:mediaId/comment
 * @desc    Add a comment to a media
 * @access  Private
 */
router.post('/:mediaId/comment', async (req, res) => {
  const { mediaId } = req.params;
  const { message } = req.body;
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${mediaId}/comments`,
      { message },
      {
        params: {
          access_token: token
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error posting comment:', error.response ? error.response.data : error);
    
    if (error.response && error.response.status === 400) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ error: 'Error posting comment' });
  }
});

/**
 * @route   POST /api/media/:commentId/reply
 * @desc    Reply to a comment
 * @access  Private
 */
router.post('/:commentId/reply', async (req, res) => {
  const { commentId } = req.params;
  const { message } = req.body;
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${commentId}/replies`,
      { message },
      {
        params: {
          access_token: token
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error posting reply:', error.response ? error.response.data : error);
    
    if (error.response && error.response.status === 400) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ error: 'Error posting reply' });
  }
});

module.exports = router; 