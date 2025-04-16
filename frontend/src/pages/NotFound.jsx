
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center fade-in">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">This page does not exist</p>
      <p className="mb-8">Sorry, the page you're looking for cannot be found.</p>
      <Link 
        to="/" 
        className="instagram-gradient hover:opacity-90 transition-opacity text-white py-2 px-4 rounded-md font-medium"
      >
        Return Home
      </Link>
    </div>
  );
}
