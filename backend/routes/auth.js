const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const router = express.Router();

/**
 * @route   GET /api/auth/instagram
 * @desc    Get Instagram OAuth URL
 * @access  Public
 */
// In your /api/auth/instagram route:
router.get('/instagram', (req, res) => {
  const instagramAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_comments&response_type=code&display=popup`;
    res.json({ authUrl: instagramAuthUrl });
});

/**
 * @route   POST /api/auth/callback
 * @desc    Handle OAuth callback and exchange code for access token
 * @access  Public
 */
router.post('/callback', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    // Make sure the code is properly trimmed and encoded
    const cleanCode = code.trim();
    
    console.log('OAuth exchange request parameters:', {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code: cleanCode
    });

    // Exchange code for access token using Facebook Graph API
    const tokenResponse = await axios({
      method: 'get',
      url: 'https://graph.facebook.com/v19.0/oauth/access_token',
      params: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code: cleanCode
      }
    });

    console.log('Token response:', tokenResponse.data);
    
    if (!tokenResponse.data || !tokenResponse.data.access_token) {
      throw new Error('Invalid token response from Facebook API');
    }

    const { access_token } = tokenResponse.data;

    // Get user ID from debug token endpoint
    const debugTokenResponse = await axios.get(
      `https://graph.facebook.com/debug_token?input_token=${access_token}&access_token=${process.env.CLIENT_ID}|${process.env.CLIENT_SECRET}`
    );
    console.log('Token debug info:', debugTokenResponse.data);
    
    const userId = debugTokenResponse.data.data.user_id;
    
    // Get long-lived token using the short-lived token
    const longLivedTokenResponse = await axios.get(
      'https://graph.facebook.com/v19.0/oauth/access_token',
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          fb_exchange_token: access_token
        }
      }
    );
    
    const longLivedToken = longLivedTokenResponse.data.access_token;
    console.log('Long-lived token obtained:', longLivedToken ? 'Yes' : 'No');

    // Check what access the token has
const debugPermissions = await axios.get(
  `https://graph.facebook.com/v19.0/${userId}/permissions`,
  {
    params: { access_token: longLivedToken }
  }
);
console.log('User permissions:', debugPermissions.data);

    // First, try to get the Instagram business account ID
    const accountsResponse = await axios.get(`https://graph.facebook.com/v19.0/${userId}/accounts`, {
      params: { access_token: longLivedToken || access_token }
    });
    
    console.log('Accounts response:', accountsResponse.data);
    
    let pageId, pageAccessToken;
    
    if (!accountsResponse.data.data || accountsResponse.data.data.length === 0) {
      // Fallback: Use page ID directly and long-lived token
      console.log('No pages found via API, using direct page ID');
      pageId = '625457237316305'; // Your GarvShah page ID
      pageAccessToken = longLivedToken; // Always use long-lived token here
    } else {
      pageId = accountsResponse.data.data[0].id;
      pageAccessToken = accountsResponse.data.data[0].access_token;
    }
    
    // Get Instagram business account connected to this page
    const instagramAccountResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${pageId}`,
      {
        params: {
          fields: 'instagram_business_account',
          access_token: longLivedToken // Use long-lived token here
        }
      }
    );
    
    console.log('Instagram account response:', instagramAccountResponse.data);
    
    if (!instagramAccountResponse.data.instagram_business_account) {
      throw new Error('No Instagram business account connected to this Facebook page');
    }
    
    const instagramBusinessId = instagramAccountResponse.data.instagram_business_account.id;
    
    // Now get Instagram account info
    const instagramInfoResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${instagramBusinessId}`,
      {
        params: {
          fields: 'id,username,profile_picture_url,name',
          access_token: longLivedToken // Use long-lived token consistently
        }
      }
    );
    
    console.log('Instagram info response:', instagramInfoResponse.data);
    
    const userData = instagramInfoResponse.data;
    
    // Check if user already exists in DB
    let user = await User.findOne({ instagramId: userData.id });

    if (user) {
      // Update user with long-lived token
      user.accessToken = longLivedToken;  // Always use long-lived token
      user.username = userData.username;
      user.name = userData.name;
      user.profilePicture = userData.profile_picture_url;
      user.lastLogin = Date.now();
    } else {
      // Create new user with long-lived token
      user = new User({
        instagramId: userData.id,
        username: userData.username,
        name: userData.name,
        accessToken: longLivedToken,  // Always use long-lived token
        profilePicture: userData.profile_picture_url
      });
    }

    await user.save();

    // Send user data & token to frontend
    res.json({
      success: true,
      user: {
        id: user._id,
        instagramId: user.instagramId,
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture
      },
      token: longLivedToken  // Send long-lived token to frontend
    });

  } catch (error) {
    console.error('OAuth Callback Error:', error.response?.data || error.message);
    
    // Send a properly formatted error response
    res.status(500).json({ 
      error: error.response?.data?.error?.message || error.message || 'Authentication failed'
    });
  }
});
module.exports = router;
