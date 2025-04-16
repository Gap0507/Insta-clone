
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Home, User, Image, LogOut } from 'lucide-react';

export function Layout({ children }) {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-bold text-xl instagram-gradient bg-clip-text text-transparent">
            InstaClone
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {isLoggedIn && (
              <nav className="flex items-center space-x-2">
                <Link 
                  to="/" 
                  className={`p-2 rounded-full hover:bg-secondary transition-colors ${location.pathname === '/' ? 'text-primary' : ''}`}
                >
                  <Home className="h-5 w-5" />
                </Link>
                <Link 
                  to="/profile" 
                  className={`p-2 rounded-full hover:bg-secondary transition-colors ${location.pathname === '/profile' ? 'text-primary' : ''}`}
                >
                  <User className="h-5 w-5" />
                </Link>
                <Link 
                  to="/feed" 
                  className={`p-2 rounded-full hover:bg-secondary transition-colors ${location.pathname === '/feed' ? 'text-primary' : ''}`}
                >
                  <Image className="h-5 w-5" />
                </Link>
                <button 
                  onClick={() => {
                    localStorage.setItem('isLoggedIn', 'false');
                    window.location.href = '/';
                  }}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6 page-transition">
        {children}
      </main>
      <footer className="border-t py-6 bg-background">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; 2025 InstaClone. Not affiliated with Instagram.
        </div>
      </footer>
    </div>
  );
}
