
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const login = () => {
    // This would handle actual Instagram OAuth in a real implementation
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = '/feed';
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
          onClick={login}
          className="w-full instagram-gradient hover:opacity-90 transition-opacity hover-scale"
          size="lg"
        >
          <Instagram className="mr-2 h-5 w-5" />
          Log in with Instagram
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
          © 2025 InstaClone. Not affiliated with Instagram.
        </p>
      </div>
    </div>
  );
};

export default Index;
