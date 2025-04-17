# Instagram Clone


A fully-featured Instagram clone that integrates with the Instagram API to display user profiles, media feeds, and enables interactive commenting functionality.

## 🎥 Demo Video
<div style="position: relative; padding-bottom: 53.125%; height: 0;">
  <iframe src="https://www.loom.com/embed/f3f20bdee8d54b78ba87e57824eb7a46?sid=c2480d20-54e3-41c0-8cad-6a1c1303ff7e" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>

**[Click here to watch the demo video](https://www.loom.com/share/f3f20bdee8d54b78ba87e57824eb7a46?sid=c2480d20-54e3-41c0-8cad-6a1c1303ff7e)** if the embedded video doesn't display properly.

## 🚀 Live Demo

[View Live Demo](https://instaclone-yourusername.vercel.app)

## ✨ Features

- 🔐 **Instagram API Authentication**: Secure login via OAuth
- 👤 **User Profile**: Display user profile with follower and following counts
- 📱 **Media Feed**: View posts with images and videos
- 💬 **Interactive Comments**: Add comments and reply to existing comments
- ❤️ **Real-time Updates**: Comments update automatically
- 🔄 **Responsive Design**: Works on all device sizes
- 🌓 **Dark/Light Mode**: Theme toggle for user preference

## 🛠️ Technologies Used

- **Frontend**:
  - React.js
  - Tailwind CSS
  - Shadcn UI Components
  - Lucide React Icons

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB (for user data storage)

- **API Integration**:
  - Instagram Graph API
  - Facebook Developer API

## 📋 Setup Instructions

### Prerequisites

- Node.js (v16+)
- MongoDB installed and running
- Facebook Developer Account with an Instagram Business/Creator Account

### Environment Variables

Create a `.env` file in the backend directory with the following:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/instaclone
CLIENT_ID=your_instagram_app_client_id
CLIENT_SECRET=your_instagram_app_client_secret
REDIRECT_URI=http://localhost:8080/auth/callback
PAGE_ID=your_facebook_page_id
```

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:5000/api
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/instaclone.git
   cd instaclone
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Start the backend server:
   ```bash
   cd ../backend
   npm start
   ```

5. Start the frontend development server:
   ```bash
   cd ../frontend
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:8080`

## 🔧 Facebook Developer Setup

1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com/)
2. Add the Instagram Basic Display product to your app
3. Configure OAuth Redirect URIs to match your REDIRECT_URI
4. Add test users or make your app public
5. Link your Instagram Business/Creator account

## 📦 API Endpoints

### Authentication
- `GET /api/auth/instagram` - Get Instagram OAuth URL
- `POST /api/auth/callback` - Handle OAuth callback

### User
- `GET /api/user/profile` - Get user profile data

### Media
- `GET /api/media/feed` - Get user's media feed
- `GET /api/media/:mediaId/comments` - Get comments for a specific media
- `POST /api/media/:mediaId/comment` - Add a comment to a media
- `POST /api/media/:commentId/reply` - Reply to a comment

## 📱 App Features Showcase

### Instagram Authentication
The app uses Facebook's OAuth authentication to securely log in with your Instagram credentials.

### Profile View
The profile view displays the user's profile picture, username, post/follower/following counts, and media grid.

### Media Feed
The feed displays posts with images and videos in a responsive layout with likes and comments.

### Comments and Replies
Users can view comments, add new comments, and reply to existing comments.

## 🧩 Project Structure

```
├── backend/
│   ├── index.js          # Entry point
│   ├── routes/           # API routes
│   ├── models/           # MongoDB models
│   └── package.json      # Backend dependencies
│
└── frontend/
    ├── src/
    │   ├── components/   # UI components
    │   ├── pages/        # Page components
    │   ├── lib/          # Utilities and API calls
    │   └── App.jsx       # Main app component
    ├── public/           # Static assets
    └── package.json      # Frontend dependencies
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/instaclone/issues).

## 📄 License

This project is [MIT](LICENSE) licensed.

## 🙏 Acknowledgements

- [Instagram API Documentation](https://developers.facebook.com/docs/instagram-api/)
- [Facebook for Developers](https://developers.facebook.com/)
- [Shadcn UI](https://ui.shadcn.com/) for the UI components

---

Developed with ❤️ by Garv 