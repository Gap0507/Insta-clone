import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../lib/api";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [authUrl, setAuthUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if already logged in
    if (auth.isLoggedIn()) {
      navigate("/profile");
      return;
    }
    
    // Get Instagram auth URL
    const fetchAuthUrl = async () => {
      try {
        const url = await auth.getAuthUrl();
        setAuthUrl(url);
      } catch (error) {
        console.error("Error fetching auth URL:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not connect to Instagram API"
        });
      }
    };
    
    fetchAuthUrl();
  }, [navigate, toast]);

  const handleLogin = () => {
    setLoading(true);
    
    if (authUrl) {
      window.location.href = authUrl;
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Instagram login is not available"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md px-6 py-8 space-y-8 text-center fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold instagram-gradient bg-clip-text text-transparent">InstaClone</h1>
          <p className="text-xl text-muted-foreground">Share your moments with the world</p>
        </div>
        
        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">connect with instagram</span>
          </div>
        </div>
        
        <Button 
          onClick={handleLogin}
          className="w-full instagram-gradient hover:opacity-90 transition-opacity hover-scale"
          size="lg"
          disabled={loading || !authUrl}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <>
              <Instagram className="mr-2 h-5 w-5" />
              Log in with Instagram
            </>
          )}
        </Button>
        
        <div className="mt-8 text-sm text-muted-foreground">
          <p>Don't have an Instagram account?</p>
          <a 
            href="https://www.instagram.com/accounts/emailsignup/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Sign up on Instagram
          </a>
        </div>
      </div>
      
      <div className="fixed bottom-4 right-4">
        <p className="text-xs text-muted-foreground">
          © 2023 InstaClone. Not affiliated with Instagram.
        </p>
      </div>
    </div>
  );
};

export default Index;
