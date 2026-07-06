import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-full h-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl">
            <Compass className="w-16 h-16 text-sky-400 opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-white mix-blend-overlay">
              404
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-3">Lost off the map?</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          The destination you're looking for doesn't seem to exist. Let's get you back on track.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all hover:shadow-lg"
        >
          <Home className="w-5 h-5" />
          Return Home
        </Link>
      </div>
    </div>
  );
}
