import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/api';
import { useToast } from '@/components/ui/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code from URL
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const errorParam = queryParams.get('error');
        const errorReason = queryParams.get('error_reason');
        const errorDescription = queryParams.get('error_description');

        // Check for error parameters
        if (errorParam) {
          throw new Error(`Auth error: ${errorParam}. ${errorDescription || ''}`);
        }

        if (!code) {
          throw new Error('No authorization code found in URL');
        }

        console.log('Received auth code:', code);
        
        // Exchange code for token
        const result = await auth.handleCallback(code);
        console.log('Auth callback result:', result);
        
        if (!result.success) {
          throw new Error(typeof result.error === 'string' ? result.error : 'Authentication failed');
        }
        
        // Show success message
        toast({
          title: 'Authentication successful',
          description: 'You have been successfully logged in'
        });
        
        // Redirect to profile page
        navigate('/profile');
      } catch (err) {
        console.error('Authentication error:', err);
        // Ensure error is a string, not an object
        const errorMessage = typeof err === 'object' ? 
          (err.message || 'Authentication failed') : 
          String(err);
          
        setError(errorMessage);
        
        toast({
          variant: 'destructive',
          title: 'Authentication failed',
          description: errorMessage
        });
        
        // Redirect to home page after error
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
      {loading ? (
        <div className="text-center space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <h2 className="text-xl font-semibold">Authenticating with Instagram</h2>
          <p className="text-muted-foreground">Please wait while we complete the authentication process...</p>
        </div>
      ) : error ? (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Authentication Failed</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm">Redirecting to home page...</p>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-success">Authentication Successful</h2>
          <p className="text-muted-foreground">Redirecting to your profile...</p>
        </div>
      )}
    </div>
  );
}