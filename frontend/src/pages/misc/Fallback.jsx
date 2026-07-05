import { Link } from 'react-router-dom';
import { ShieldOff, Home } from 'lucide-react';

export function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4">
      <ShieldOff size={56} className="text-accent-danger" />
      <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Access Denied</h1>
      <p className="text-text-secondary text-sm">You don&apos;t have permission to view this page.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-md transition-all duration-300">
        <Home size={15}/> Go Home
      </Link>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4">
      <h1 className="text-7xl font-black text-text-muted select-none tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-text-primary">Page Not Found</h2>
      <p className="text-text-secondary text-sm">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-md transition-all duration-300">
        <Home size={15}/> Go Home
      </Link>
    </div>
  );
}
