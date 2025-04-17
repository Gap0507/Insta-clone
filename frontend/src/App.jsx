import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Layout } from './components/Layout';
import Index from './pages/Index';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/AuthCallback';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
