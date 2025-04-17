import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile, RefreshCw } from 'lucide-react';
import { media, auth, user } from '../lib/api';
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
  const [profile, setProfile] = useState(null);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    // Check if user is logged in
    if (!auth.isLoggedIn()) {
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user profile for avatar and username
        const profileData = await user.getProfile();
        setProfile(profileData);
        
        // Fetch media feed
        const response = await media.getFeed(10);
        
        if (response && response.data) {
          setPosts(response.data);
          
          // Initialize comments state for each post
          const commentsState = {};
          const commentTextState = {};
          
          response.data.forEach(post => {
            commentsState[post.id] = { 
              loaded: false,
              data: [],
              error: null
            };
            commentTextState[post.id] = '';
          });
          
          setComments(commentsState);
          setCommentText(commentTextState);
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
    
    fetchData();
    
    // Set up auto-refresh of comments for any loaded comment sections
    const refreshInterval = setInterval(() => {
      // Refresh comments that are already loaded
      Object.keys(comments).forEach(postId => {
        if (comments[postId]?.loaded) {
          fetchComments(postId);
        }
      });
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(refreshInterval);
  }, [navigate, toast]);

  const fetchComments = async (postId) => {
    if (comments[postId]?.loaded && !comments[postId]?.refreshing) return;
    
    try {
      setComments(prev => ({
        ...prev,
        [postId]: { 
          ...prev[postId], 
          loading: !prev[postId]?.loaded, 
          refreshing: prev[postId]?.loaded || false 
        }
      }));
      
      const response = await media.getComments(postId);
      
      setComments(prev => ({
        ...prev,
        [postId]: {
          loaded: true,
          loading: false,
          refreshing: false,
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
          refreshing: false,
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
  
  const handleComment = async (postId) => {
    if (!commentText[postId]) return;
    
    try {
      const message = commentText[postId];
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      
      // Post the comment
      await media.addComment(postId, message);
      
      // Immediately refresh comments to show the new comment
      await fetchComments(postId);
      
      toast({
        title: 'Comment posted',
        description: 'Your comment has been posted successfully'
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not post comment. Please try again.'
      });
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
                {profile ? (
                  <img 
                    src={profile.profilePicture} 
                    alt={profile.username} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium">
                    {post.username ? post.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="font-medium">@{post.username || profile?.username || 'instagram_user'}</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            {/* Post image/video with proper sizing */}
            <div className="w-full bg-black flex items-center justify-center">
              {post.media_type === 'VIDEO' ? (
                <video 
                  src={post.media_url}
                  className="w-full max-h-[600px] object-contain"
                  controls
                  poster={post.thumbnail_url}
                ></video>
              ) : (
                <img 
                  src={post.media_url} 
                  alt="Post" 
                  className="w-full max-h-[600px] object-contain"
                />
              )}
            </div>
            
            {/* Post actions */}
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <div className="flex space-x-4">
                  <button className="text-foreground hover:text-red-500 transition-colors flex items-center gap-1">
                    <Heart className={`h-6 w-6 ${post.liked ? 'fill-red-500 text-red-500' : ''}`} />
                    {post.like_count > 0 && (
                      <span className="text-xs">{post.like_count}</span>
                    )}
                  </button>
                  <button 
                    className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
                    onClick={() => fetchComments(post.id)}
                  >
                    <MessageCircle className="h-6 w-6" />
                    {post.comments_count > 0 && (
                      <span className="text-xs">{post.comments_count}</span>
                    )}
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
              <div className="font-medium mb-2">
                {post.like_count ? `${post.like_count} likes` : 'No likes yet'}
              </div>
              
              {/* Caption */}
              {post.caption && (
                <div className="mb-3">
                  <span className="font-medium mr-2">@{post.username || profile?.username || 'instagram_user'}</span>
                  <span className="text-sm">{post.caption}</span>
                </div>
              )}
              
              {/* Timestamp */}
              <div className="text-xs text-muted-foreground mt-2 mb-3">
                {post.timestamp ? format(new Date(post.timestamp), 'MMM d, yyyy') : 'Recent post'}
              </div>
              
              {/* Comments */}
              <div className="mt-4 border-t pt-3">
                <button 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1"
                  onClick={() => fetchComments(post.id)}
                >
                  {comments[post.id]?.loading ? (
                    <>
                      <div className="animate-spin h-3 w-3 border-t-2 border-b-2 border-primary rounded-full mr-1"></div>
                      Loading comments...
                    </>
                  ) : comments[post.id]?.refreshing ? (
                    <>
                      <div className="animate-spin h-3 w-3 border-t-2 border-b-2 border-primary rounded-full mr-1"></div>
                      Refreshing...
                    </>
                  ) : comments[post.id]?.loaded ? (
                    <>
                      <span>{comments[post.id]?.data.length || 0} comments</span>
                      <RefreshCw className="h-3 w-3 ml-1 hover:text-primary" />
                    </>
                  ) : (
                    'View comments'
                  )}
                </button>
                
                {comments[post.id]?.error && (
                  <p className="text-sm text-destructive mb-2">{comments[post.id].error}</p>
                )}
                
                {comments[post.id]?.loaded && comments[post.id]?.data.length > 0 && (
                  <div className="space-y-3 mb-4 overflow-y-auto custom-scrollbar max-h-[300px]">
                    {comments[post.id].data.map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex">
                          {/* Comment user avatar */}
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 flex-shrink-0 text-xs font-medium">
                            {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                          
                          <div className="flex-1">
                            <div>
                              <span className="font-medium mr-2">{comment.username || 'user'}</span>
                              <span className="text-sm">{comment.text}</span>
                            </div>
                            <div className="flex items-center mt-1 space-x-3">
                              <span className="text-xs text-muted-foreground">
                                {comment.timestamp ? format(new Date(comment.timestamp), 'MMM d') : 'Recent'}
                              </span>
                              {comment.like_count > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {comment.like_count} likes
                                </span>
                              )}
                              <button 
                                className="text-xs font-medium hover:text-foreground text-muted-foreground"
                                onClick={() => setReplyText(prev => ({ ...prev, [comment.id]: `@${comment.username} ` }))}
                              >
                                Reply
                              </button>
                            </div>
                            
                            {/* Reply Input */}
                            {replyText[comment.id] && (
                              <div className="flex items-center mt-3">
                                <input 
                                  type="text" 
                                  placeholder="Reply to this comment..." 
                                  className="flex-1 text-sm bg-muted border-none rounded-full px-3 py-1.5"
                                  value={replyText[comment.id] || ''}
                                  onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                />
                                <button 
                                  className="ml-2 text-primary"
                                  onClick={() => handleReply(comment.id, post.id)}
                                  disabled={submitting[comment.id]}
                                >
                                  {submitting[comment.id] ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                                  ) : (
                                    <Send className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            )}
                            
                            {/* Replies */}
                            {comment.replies && comment.replies.data && comment.replies.data.length > 0 && (
                              <div className="ml-8 mt-3 space-y-3 border-l-2 border-muted pl-3">
                                {comment.replies.data.map((reply) => (
                                  <div key={reply.id} className="flex">
                                    {/* Use profile picture if it's the user's reply */}
                                    {reply.username === profile?.username ? (
                                      <img
                                        src={profile.profilePicture || 'https://via.placeholder.com/24'}
                                        alt={profile.username}
                                        className="w-6 h-6 rounded-full object-cover mr-2 flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 flex-shrink-0 text-xs">
                                        {reply.username ? reply.username.charAt(0).toUpperCase() : 'U'}
                                      </div>
                                    )}
                                    <div>
                                      <div>
                                        <span className="font-medium mr-2 text-sm">{reply.username || profile?.username || 'user'}</span>
                                        <span className="text-sm">{reply.text}</span>
                                      </div>
                                      <span className="text-xs text-muted-foreground block mt-1">
                                        {reply.timestamp ? format(new Date(reply.timestamp), 'MMM d') : 'Recent'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add comment */}
                <div className="flex items-center border-t pt-3">
                  {profile ? (
                    <img 
                      src={profile.profilePicture} 
                      alt={profile.username} 
                      className="w-8 h-8 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 flex-shrink-0 text-xs font-medium">
                      {profile?.username ? profile.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="flex flex-1 items-center">
                    <input 
                      type="text" 
                      placeholder="Add a comment..." 
                      className="flex-1 bg-transparent outline-none text-sm py-2"
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                    />
                    <button 
                      className={`ml-2 text-primary font-medium text-sm ${!commentText[post.id] ? 'opacity-50' : ''}`}
                      onClick={() => handleComment(post.id)}
                      disabled={!commentText[post.id]}
                    >
                      Post
                    </button>
                  </div>
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
