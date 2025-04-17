import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, Bookmark, Settings, Grid, Play, LogOut } from 'lucide-react';
import { user, media, auth } from '../lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaCount, setMediaCount] = useState({ photos: 0, videos: 0 });

  useEffect(() => {
    // Check if user is logged in
    if (!auth.isLoggedIn()) {
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user profile
        const profileData = await user.getProfile();
        setProfile(profileData);
        
        // Get media feed
        const mediaData = await media.getFeed(20);
        setMediaItems(mediaData.data || []);
        
        // Count photos and videos
        const counts = {
          photos: mediaData.data?.filter(item => item.media_type === 'IMAGE').length || 0,
          videos: mediaData.data?.filter(item => item.media_type === 'VIDEO').length || 0
        };
        setMediaCount(counts);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load profile data. Please try again.'
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, toast]);
  
  const handleLogout = () => {
    auth.logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out'
    });
    navigate('/');
  };
  
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
                src={profile?.profilePicture || 'https://via.placeholder.com/150'} 
                alt={profile?.username} 
                className="rounded-full w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Profile info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">{profile?.username}</h1>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button variant="outline" className="text-secondary-foreground bg-secondary hover:bg-secondary/80 p-1.5 rounded-md transition-colors">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center md:justify-start space-x-8 mb-4">
            <div className="text-center md:text-left">
              <span className="font-semibold">{profile?.mediaCount || 0}</span>
              <p className="text-sm text-muted-foreground">posts</p>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">-</span>
              <p className="text-sm text-muted-foreground">followers</p>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">-</span>
              <p className="text-sm text-muted-foreground">following</p>
            </div>
          </div>
          
          {/* Bio */}
          <div>
            <p className="font-medium">{profile?.username}</p>
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
              <p className="text-2xl font-bold">{mediaCount.photos}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-background rounded-md">
            <Play className="h-8 w-8 text-primary mr-4" />
            <div>
              <p className="text-sm text-muted-foreground">Videos</p>
              <p className="text-2xl font-bold">{mediaCount.videos}</p>
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
      
      {/* Photo grid - using actual media */}
      {mediaItems.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="aspect-square bg-muted rounded-sm overflow-hidden relative hover-scale group">
              {item.media_type === 'VIDEO' && (
                <div className="absolute top-2 right-2 z-10">
                  <Play className="h-5 w-5 text-white" />
                </div>
              )}
              <img 
                src={item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url} 
                alt={item.caption || 'Instagram post'} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-4">
                <div className="flex items-center">
                  <Heart className="h-5 w-5 mr-1" />
                  <span>-</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-1" />
                  <span>-</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No media posts found</p>
        </div>
      )}
    </div>
  );
}
