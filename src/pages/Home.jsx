
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      navigate('/feed');
    }
  }, [navigate]);

  const handleLogin = () => {
    // In a real app, this would initiate OAuth flow with Instagram
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/profile');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 text-center fade-in">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          Share your moments with <span className="instagram-gradient bg-clip-text text-transparent">InstaClone</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Connect with friends, share photos and videos, and stay updated with what matters to you.
        </p>
      </div>
      
      <div className="w-full max-w-md mx-auto grid gap-4">
        <button
          onClick={handleLogin}
          className="instagram-gradient hover:opacity-90 transition-opacity text-white py-3 px-6 rounded-md font-medium flex items-center justify-center space-x-2 hover-scale"
        >
          <Instagram className="h-5 w-5" />
          <span>Login with Instagram</span>
        </button>
      </div>

      <div className="relative w-full h-96 max-w-4xl mt-12">
        {/* Device mockup with app screenshot */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-red-400/20 rounded-lg -z-10"></div>
        <div className="relative w-full h-full border border-border rounded-lg overflow-hidden shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80" 
            alt="Instagram feed example" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
