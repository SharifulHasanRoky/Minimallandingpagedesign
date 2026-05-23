import { Layers, Brain, BarChart3, Zap, Globe, Shield } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Multi-Touch Attribution',
    description: 'Track the full customer journey across every touchpoint. First click, last click, linear, time-decay — all models in one place.',
    color: 'emerald',
  },
  {
    icon: Brain,
    title: 'AI-Powered Optimization',
    description: 'Our ML engine analyzes millions of conversion paths to recommend budget shifts that maximize your ROAS in real-time.',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: 'True Revenue Attribution',
    description: 'Server-side tracking that bypasses iOS 14+ limitations. Get 95%+ accuracy where Facebook reports 40% of conversions.',
    color: 'purple',
  },
  {
    icon: Zap,
    title: 'Real-Time Ad Signals',
    description: 'Feed accurate conversion data back to Meta, Google & TikTok. Supercharge their algorithms with real purchase data.',
    color: 'amber',
  },
  {
    icon: Globe,
    title: 'Cross-Channel Insights',
    description: 'See exactly how Meta, Google, TikTok, Email, and Organic work together. Eliminate channel cannibalization.',
    color: 'cyan',
  },
  {
    icon: Shield,
    title: 'Cookieless & Privacy-First',
    description: 'First-party data collection that complies with GDPR, CCPA, and works perfectly in a post-cookie world.',
    color: 'rose',
  },
];

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};


export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
            Everything Hyros & Triple Whale Do.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">But Better.</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Built for serious media buyers who need pixel-perfect attribution and actionable optimization insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-7 hover:border-gray-700 transition group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 ${colorMap[f.color]}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
