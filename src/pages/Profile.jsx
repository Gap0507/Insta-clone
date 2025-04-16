
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, Bookmark, Settings, Grid, Play } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Mock user data - in a real app, this would come from an API
  const [profile, setProfile] = useState({
    username: 'instagram_user',
    fullName: 'Instagram User',
    bio: 'Photography enthusiast | Travel lover | Food explorer',
    profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    following: 562,
    followers: 1438,
    posts: 83,
    mediaCount: {
      photos: 76,
      videos: 7
    }
  });

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto fade-in">
      {/* Profile header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        {/* Profile picture */}
        <div className="relative w-24 h-24 md:w-36 md:h-36">
          <div className="absolute inset-0 rounded-full p-1 instagram-gradient">
            <div className="bg-background rounded-full w-full h-full">
              <img 
                src={profile.profilePic} 
                alt={profile.username} 
                className="rounded-full w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Profile info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <div className="flex flex-wrap gap-2">
              <button className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
                Edit Profile
              </button>
              <button className="text-secondary-foreground bg-secondary hover:bg-secondary/80 p-1.5 rounded-md transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center md:justify-start space-x-8 mb-4">
            <div className="text-center md:text-left">
              <span className="font-semibold">{profile.posts}</span>
              <p className="text-sm text-muted-foreground">posts</p>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">{profile.followers.toLocaleString()}</span>
              <p className="text-sm text-muted-foreground">followers</p>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">{profile.following.toLocaleString()}</span>
              <p className="text-sm text-muted-foreground">following</p>
            </div>
          </div>
          
          {/* Bio */}
          <div>
            <p className="font-medium">{profile.fullName}</p>
            <p className="text-sm whitespace-pre-wrap mt-1">{profile.bio}</p>
          </div>
        </div>
      </div>
      
      {/* Media count stats */}
      <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="font-medium mb-4">Media Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center p-4 bg-background rounded-md">
            <Grid className="h-8 w-8 text-primary mr-4" />
            <div>
              <p className="text-sm text-muted-foreground">Photos</p>
              <p className="text-2xl font-bold">{profile.mediaCount.photos}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-background rounded-md">
            <Play className="h-8 w-8 text-primary mr-4" />
            <div>
              <p className="text-sm text-muted-foreground">Videos</p>
              <p className="text-2xl font-bold">{profile.mediaCount.videos}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex">
          <button className="flex items-center justify-center px-4 py-2 border-b-2 border-primary text-primary font-medium">
            <Grid className="h-4 w-4 mr-2" />
            <span>Posts</span>
          </button>
          <button className="flex items-center justify-center px-4 py-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">
            <Bookmark className="h-4 w-4 mr-2" />
            <span>Saved</span>
          </button>
          <button className="flex items-center justify-center px-4 py-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>Tagged</span>
          </button>
        </div>
      </div>
      
      {/* Photo grid - simplified with placeholder images */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {[...Array(9)].map((_, index) => (
          <div key={index} className="aspect-square bg-muted rounded-sm overflow-hidden relative hover-scale group">
            {index % 5 === 0 ? (
              <div className="absolute top-2 right-2 z-10">
                <Play className="h-5 w-5 text-white" />
              </div>
            ) : null}
            <img 
              src={`https://source.unsplash.com/random/300x300?sig=${index}`} 
              alt="Post thumbnail" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-4">
              <div className="flex items-center">
                <Heart className="h-5 w-5 mr-1" />
                <span>{Math.floor(Math.random() * 500)}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-1" />
                <span>{Math.floor(Math.random() * 50)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
