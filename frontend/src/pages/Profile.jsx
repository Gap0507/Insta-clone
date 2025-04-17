import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Play, LogOut, Heart, MessageCircle, Send, Smile, RefreshCw } from 'lucide-react';
import { user, media, auth } from '../lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaCount, setMediaCount] = useState({ photos: 0, videos: 0 });
  
  // For comments functionality
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [fetchingComments, setFetchingComments] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

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

  const openPostDetails = async (post) => {
    setSelectedPost(post);
    await fetchComments(post.id);
  };

  const fetchComments = async (postId) => {
    try {
      setFetchingComments(true);
      const response = await media.getComments(postId);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load comments. Please try again.'
      });
    } finally {
      setFetchingComments(false);
    }
  };

  const refreshComments = async () => {
    if (selectedPost && !fetchingComments) {
      await fetchComments(selectedPost.id);
      toast({
        title: "Comments refreshed",
        description: "Latest comments have been loaded",
        duration: 2000
      });
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText[commentId] || submitting[commentId]) return;
    
    try {
      setSubmitting(prev => ({ ...prev, [commentId]: true }));
      
      // Using the authenticated user's profile for the reply
      await media.replyToComment(commentId, replyText[commentId]);
      
      // Clear the reply text
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      
      // Refetch comments to show the new reply
      if (selectedPost) {
        await fetchComments(selectedPost.id);
      }
      
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
  
  const handleComment = async () => {
    if (!newComment || !selectedPost || postingComment) return;
    
    try {
      setPostingComment(true);
      
      await media.addComment(selectedPost.id, newComment);
      
      // Clear the comment text
      setNewComment('');
      
      // Refetch comments to show the new comment
      await fetchComments(selectedPost.id);
      
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
    } finally {
      setPostingComment(false);
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
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center md:justify-start space-x-8 mb-4">
            <div className="text-center md:text-left">
              <span className="font-semibold">{profile?.mediaCount || 0}</span>
              <p className="text-sm text-muted-foreground">posts</p>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">{profile?.followerCount || 0}</span>
              <p className="text-sm text-muted-foreground">followers</p>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">{profile?.followingCount || 0}</span>
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
      
      {/* Tabs - Only show Posts tab */}
      <div className="border-b mb-6">
        <div className="flex">
          <button className="flex items-center justify-center px-4 py-2 border-b-2 border-primary text-primary font-medium">
            <Grid className="h-4 w-4 mr-2" />
            <span>Posts</span>
          </button>
        </div>
      </div>
      
      {/* Photo grid - using actual media */}
      {mediaItems.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {mediaItems.map((item) => (
            <div 
              key={item.id} 
              className="aspect-square bg-muted rounded-sm overflow-hidden relative hover-scale group cursor-pointer"
              onClick={() => openPostDetails(item)}
            >
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
                  <span>{item.like_count || 0}</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-1" />
                  <span>{item.comments_count || 0}</span>
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

      {/* Post Details Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="sm:max-w-3xl p-0 max-h-[90vh] overflow-hidden">
          <div className="grid md:grid-cols-2 h-full">
            {/* Post Media */}
            <div className="bg-black flex items-center justify-center">
              {selectedPost?.media_type === 'VIDEO' ? (
                <video 
                  src={selectedPost.media_url}
                  className="w-full h-full max-h-[500px] object-contain"
                  controls
                  poster={selectedPost.thumbnail_url}
                ></video>
              ) : (
                <img 
                  src={selectedPost?.media_url} 
                  alt={selectedPost?.caption || 'Instagram post'} 
                  className="w-full h-full max-h-[500px] object-contain"
                />
              )}
            </div>
            
            {/* Post Info */}
            <div className="flex flex-col h-full bg-background max-h-[500px]">
              {/* Post header */}
              <div className="flex items-center p-4 border-b">
                <img
                  src={profile?.profilePicture || 'https://via.placeholder.com/40'}
                  alt={profile?.username}
                  className="w-8 h-8 rounded-full object-cover mr-3"
                />
                <span className="font-medium">@{profile?.username}</span>
              </div>
              
              {/* Caption and comments */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Caption */}
                {selectedPost?.caption && (
                  <div className="flex p-4 border-b">
                    <img
                      src={profile?.profilePicture || 'https://via.placeholder.com/40'}
                      alt={profile?.username}
                      className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0"
                    />
                    <div>
                      <div>
                        <span className="font-medium mr-2">@{profile?.username}</span>
                        <span className="text-sm">{selectedPost.caption}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedPost.timestamp ? format(new Date(selectedPost.timestamp), 'MMM d, yyyy') : 'Recent post'}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Comments */}
                <div className="p-4">
                  <h3 className="font-medium text-sm mb-4">Comments</h3>
                  
                  {fetchingComments ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm">Loading comments...</span>
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="space-y-2">
                          <div className="flex">
                            {/* User Avatar - Using Initials as fallback */}
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 flex-shrink-0 text-xs font-medium">
                              {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex-1">
                              <div>
                                <span className="font-medium mr-2">{comment.username || 'user'}</span>
                                <span className="text-sm">{comment.text}</span>
                              </div>
                              <div className="flex items-center mt-1 space-x-4">
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
                                    className="flex-1 text-sm bg-muted border-none rounded-full px-3 py-1.5"
                                    placeholder="Reply to this comment..."
                                    value={replyText[comment.id] || ''}
                                    onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                  />
                                  <button 
                                    className="ml-2 text-primary"
                                    onClick={() => handleReply(comment.id)}
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
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No comments yet</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Comment input */}
              <div className="border-t p-3">
                <div className="flex items-center">
                  <Smile className="h-5 w-5 text-muted-foreground mr-2" />
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    className="flex-1 bg-transparent outline-none px-2 py-1.5"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={postingComment}
                  />
                  <button 
                    className={`text-primary font-medium ml-2 text-sm ${!newComment || postingComment ? 'opacity-50' : ''}`}
                    onClick={handleComment}
                    disabled={!newComment || postingComment}
                  >
                    {postingComment ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
