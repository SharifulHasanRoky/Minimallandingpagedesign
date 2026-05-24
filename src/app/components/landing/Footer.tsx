import { Activity } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-6 h-6 text-emerald-400" />
              <span className="text-lg font-bold text-white">AdTrackr</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              AI-powered ad attribution & optimization for modern media buyers and DTC brands.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Attribution</a></li>
              <li><a href="#" className="hover:text-white transition">AI Optimizer</a></li>
              <li><a href="#" className="hover:text-white transition">Conversion API</a></li>
              <li><a href="#" className="hover:text-white transition">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Partners</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">GDPR</a></li>
              <li><a href="#" className="hover:text-white transition">SOC 2</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">&copy; 2026 AdTrackr. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span className="bg-gray-900 px-3 py-1 rounded text-xs border border-gray-800">SOC 2 Certified</span>
            <span className="bg-gray-900 px-3 py-1 rounded text-xs border border-gray-800">GDPR Compliant</span>
            <span className="bg-gray-900 px-3 py-1 rounded text-xs border border-gray-800">99.9% Uptime</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
