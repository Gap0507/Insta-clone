import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile } from 'lucide-react';
import { media, auth } from '../lib/api';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export default function Feed() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    // Check if user is logged in
    if (!auth.isLoggedIn()) {
      navigate('/');
      return;
    }
    
    // Fetch media feed
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await media.getFeed(10);
        
        if (response && response.data) {
          setPosts(response.data);
          
          // Initialize comments state for each post
          const commentsState = {};
          response.data.forEach(post => {
            commentsState[post.id] = { 
              loaded: false,
              data: [],
              error: null
            };
          });
          setComments(commentsState);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching media feed:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load media feed. Please try again.'
        });
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [navigate, toast]);

  const fetchComments = async (postId) => {
    if (comments[postId]?.loaded || comments[postId]?.loading) return;
    
    try {
      setComments(prev => ({
        ...prev,
        [postId]: { ...prev[postId], loading: true }
      }));
      
      const response = await media.getComments(postId);
      
      setComments(prev => ({
        ...prev,
        [postId]: {
          loaded: true,
          loading: false,
          data: response.data || [],
          error: null
        }
      }));
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      
      setComments(prev => ({
        ...prev,
        [postId]: {
          loaded: false,
          loading: false,
          data: [],
          error: 'Failed to load comments'
        }
      }));
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load comments. Please try again.'
      });
    }
  };

  const handleReply = async (commentId, postId) => {
    if (!replyText[commentId] || submitting[commentId]) return;
    
    try {
      setSubmitting(prev => ({ ...prev, [commentId]: true }));
      
      await media.replyToComment(commentId, replyText[commentId]);
      
      // Clear the reply text
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      
      // Refetch comments to show the new reply
      await fetchComments(postId);
      
      toast({
        title: 'Reply posted',
        description: 'Your reply has been posted successfully'
      });
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not post reply. Please try again.'
      });
    } finally {
      setSubmitting(prev => ({ ...prev, [commentId]: false }));
    }
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
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="bg-card rounded-lg shadow-sm overflow-hidden border">
            {/* Post header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={post.author_pic || 'https://via.placeholder.com/150'} 
                  alt="User" 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium">@{post.username || 'instagram_user'}</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            {/* Post image */}
            <div className="w-full">
              {post.media_type === 'VIDEO' ? (
                <video 
                  src={post.media_url}
                  className="w-full aspect-square md:aspect-[4/3] object-cover"
                  controls
                  poster={post.thumbnail_url}
                ></video>
              ) : (
                <img 
                  src={post.media_url} 
                  alt="Post" 
                  className="w-full aspect-square md:aspect-[4/3] object-cover"
                />
              )}
            </div>
            
            {/* Post actions */}
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <div className="flex space-x-4">
                  <button className="text-foreground hover:text-red-500 transition-colors">
                    <Heart className="h-6 w-6" />
                  </button>
                  <button 
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => fetchComments(post.id)}
                  >
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
              
              {/* Likes - Instagram API doesn't provide like counts */}
              <div className="font-medium mb-2">- likes</div>
              
              {/* Caption */}
              {post.caption && (
                <div className="mb-2">
                  <span className="font-medium mr-2">@{post.username || 'instagram_user'}</span>
                  <span>{post.caption}</span>
                </div>
              )}
              
              {/* Timestamp */}
              <div className="text-xs text-muted-foreground mt-2">
                {post.timestamp ? format(new Date(post.timestamp), 'MMM d, yyyy') : 'Recent post'}
              </div>
              
              {/* Comments */}
              <div className="mt-4 border-t pt-3">
                <button 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                  onClick={() => fetchComments(post.id)}
                >
                  {comments[post.id]?.loading ? 'Loading comments...' : 
                   comments[post.id]?.loaded ? 
                    `${comments[post.id]?.data.length || 0} comments` : 
                    'View comments'}
                </button>
                
                {comments[post.id]?.error && (
                  <p className="text-sm text-destructive mb-2">{comments[post.id].error}</p>
                )}
                
                {comments[post.id]?.loaded && comments[post.id]?.data.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {comments[post.id].data.map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex items-start">
                          <span className="font-medium mr-2">{comment.username || 'user'}</span>
                          <span className="text-sm flex-1">{comment.text}</span>
                          <button className="text-sm text-muted-foreground">
                            <Heart className="h-3 w-3" />
                          </button>
                        </div>
                        
                        {/* Reply form */}
                        <div className="flex items-center ml-4 border-l-2 border-muted pl-3">
                          <input 
                            type="text" 
                            placeholder="Reply to this comment..." 
                            className="flex-1 bg-transparent outline-none text-sm"
                            value={replyText[comment.id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                          />
                          <button 
                            className={`ml-2 text-primary font-medium text-sm ${!replyText[comment.id] || submitting[comment.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handleReply(comment.id, post.id)}
                            disabled={!replyText[comment.id] || submitting[comment.id]}
                          >
                            {submitting[comment.id] ? 'Posting...' : 'Reply'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add comment */}
                <div className="flex items-center">
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
          </div>
        ))
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No posts found</p>
          <p className="text-sm text-muted-foreground mt-2">Your feed is empty. Follow more accounts to see their posts.</p>
        </div>
      )}
    </div>
  );
}
