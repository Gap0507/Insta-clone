# InstaClone

A full-stack Instagram clone application using the Instagram Graph API, built for the Empathy Technologies Full Stack Developer Assessment.

## Features

- Instagram OAuth Authentication
- User Profile Display
- Media Feed
- Comment Reply Feature
- Responsive UI with Light/Dark Mode

## Tech Stack

### Frontend
- React.js
- React Router
- Tailwind CSS
- Shadcn UI Components

### Backend
- Node.js
- Express.js
- MongoDB
- Instagram Graph API

## Setup Instructions

### Prerequisites
- Node.js and npm
- MongoDB (local or Atlas)
- Instagram Business Account
- Facebook Developer Account with Instagram Graph API setup

### Environment Variables

#### Backend (.env)
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_ID=your_facebook_app_id
CLIENT_SECRET=your_facebook_app_secret
REDIRECT_URI=http://localhost:3000/auth/callback
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_CLIENT_ID=your_facebook_app_id
VITE_REDIRECT_URI=http://localhost:3000/auth/callback
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/instaclone.git
cd instaclone
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

4. Start the Development Servers

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

5. Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `GET /api/auth/instagram` - Get Instagram auth URL
- `POST /api/auth/callback` - Handle auth callback with code

### User
- `GET /api/user/profile` - Get current user profile

### Media
- `GET /api/media/feed` - Get user's media feed
- `GET /api/media/:mediaId/comments` - Get comments for a specific media
- `POST /api/media/:commentId/reply` - Reply to a comment

## Screenshots

[Add screenshots here]

## License

MIT 