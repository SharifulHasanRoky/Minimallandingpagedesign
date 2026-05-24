import { useState } from 'react';
import { Menu, X, Activity } from 'lucide-react';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Activity className="w-7 h-7 text-emerald-400" />
            <span className="text-xl font-bold text-white">AdTrackr</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">PRO</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition text-sm font-medium">Features</a>
            <a href="#dashboard" className="text-gray-300 hover:text-white transition text-sm font-medium">Dashboard</a>
            <a href="#attribution" className="text-gray-300 hover:text-white transition text-sm font-medium">Attribution</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition text-sm font-medium">Pricing</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button className="text-gray-300 hover:text-white transition text-sm font-medium px-4 py-2">Log In</button>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-lg shadow-emerald-500/25">
              Start Free Trial
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800 px-4 py-4 space-y-3">
          <a href="#features" className="block text-gray-300 hover:text-white py-2">Features</a>
          <a href="#dashboard" className="block text-gray-300 hover:text-white py-2">Dashboard</a>
          <a href="#attribution" className="block text-gray-300 hover:text-white py-2">Attribution</a>
          <a href="#pricing" className="block text-gray-300 hover:text-white py-2">Pricing</a>
          <button className="w-full bg-emerald-500 text-white px-5 py-3 rounded-lg font-semibold mt-2">
            Start Free Trial
          </button>
        </div>
      )}
    </header>
  );
}
