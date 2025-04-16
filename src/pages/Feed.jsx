
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile } from 'lucide-react';

export default function Feed() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Mock posts data - in a real app, this would come from an API
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        username: 'travel_enthusiast',
        profilePic: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
      },
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
      caption: 'Exploring the beautiful landscapes of New Zealand. What a breathtaking view! 🏞️ #travel #newzealand #nature',
      likes: 1289,
      timestamp: '2h ago',
      comments: [
        {
          user: 'mountainlover',
          text: 'This looks amazing! Which trail is this?',
          timestamp: '1h ago'
        },
        {
          user: 'photography_pro',
          text: 'Perfect composition and lighting!',
          timestamp: '45m ago'
        }
      ]
    },
    {
      id: 2,
      user: {
        username: 'food_blogger',
        profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
      },
      image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
      caption: 'Homemade pasta with fresh ingredients from the local farmers market. Simple but delicious! 🍝 #food #cooking #homemade',
      likes: 932,
      timestamp: '5h ago',
      comments: [
        {
          user: 'chef_mike',
          text: 'Looks delicious! What sauce did you use?',
          timestamp: '4h ago'
        },
        {
          user: 'pasta_lover',
          text: 'I need this recipe ASAP!',
          timestamp: '3h ago'
        },
        {
          user: 'healthy_eating',
          text: 'Love seeing fresh ingredients being used!',
          timestamp: '2h ago'
        }
      ]
    },
    {
      id: 3,
      user: {
        username: 'fitness_coach',
        profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
      },
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
      caption: 'Morning workout complete! Remember, consistency is key to achieving your fitness goals. 💪 #fitness #workout #motivation',
      likes: 756,
      timestamp: '8h ago',
      comments: [
        {
          user: 'gym_enthusiast',
          text: 'What\'s your workout routine?',
          timestamp: '7h ago'
        },
        {
          user: 'beginner_athlete',
          text: 'Thanks for the motivation!',
          timestamp: '6h ago'
        }
      ]
    }
  ]);

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

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 fade-in">
      {posts.map((post) => (
        <div key={post.id} className="bg-card rounded-lg shadow-sm overflow-hidden border">
          {/* Post header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <img 
                src={post.user.profilePic} 
                alt={post.user.username} 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-medium">{post.user.username}</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          {/* Post image */}
          <div className="w-full">
            <img 
              src={post.image} 
              alt="Post" 
              className="w-full aspect-square md:aspect-[4/3] object-cover"
            />
          </div>
          
          {/* Post actions */}
          <div className="p-4">
            <div className="flex justify-between mb-2">
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="text-foreground hover:text-red-500 transition-colors"
                >
                  <Heart className="h-6 w-6" />
                </button>
                <button className="text-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </button>
                <button className="text-foreground hover:text-primary transition-colors">
                  <Send className="h-6 w-6" />
                </button>
              </div>
              <button className="text-foreground hover:text-primary transition-colors">
                <Bookmark className="h-6 w-6" />
              </button>
            </div>
            
            {/* Likes */}
            <div className="font-medium mb-2">{post.likes.toLocaleString()} likes</div>
            
            {/* Caption */}
            <div className="mb-2">
              <span className="font-medium mr-2">{post.user.username}</span>
              <span>{post.caption}</span>
            </div>
            
            {/* Comments */}
            {post.comments.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  View all {post.comments.length} comments
                </p>
                {post.comments.slice(0, 2).map((comment, index) => (
                  <div key={index} className="flex items-start mb-2">
                    <span className="font-medium mr-2">{comment.user}</span>
                    <span className="text-sm flex-1">{comment.text}</span>
                    <button className="text-sm text-muted-foreground">
                      <Heart className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Timestamp */}
            <div className="text-xs text-muted-foreground mt-2">{post.timestamp}</div>
            
            {/* Add comment */}
            <div className="mt-4 flex items-center border-t pt-3">
              <button className="mr-3 text-muted-foreground">
                <Smile className="h-6 w-6" />
              </button>
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button className="ml-2 text-primary font-medium text-sm">Post</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
