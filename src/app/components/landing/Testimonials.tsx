import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "We switched from Hyros and saved $400/mo while getting MORE accurate data. AdTrackr's AI recommendations alone paid for the tool 10x over.",
    name: 'Jake Morrison',
    role: 'Media Buyer, 7-Figure DTC Brand',
    avatar: 'JM',
    metric: 'ROAS improved from 2.8x to 5.2x',
  },
  {
    quote: "Triple Whale showed us data. AdTrackr shows us what to DO with that data. The AI budget optimizer is a game-changer for our agency.",
    name: 'Priya Patel',
    role: 'Founder, ScaleForce Agency',
    avatar: 'PP',
    metric: 'Managing $2M+/mo in ad spend',
  },
  {
    quote: "After iOS 14, we lost 60% of our conversion data on Facebook. AdTrackr brought it back to 95%+ accuracy with server-side tracking. Incredible.",
    name: 'Marcus Webb',
    role: 'CMO, FitLife Supplements',
    avatar: 'MW',
    metric: 'Recovered $180k in hidden revenue',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Loved by 2,400+ Media Buyers
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5 mb-4 inline-block">
                <span className="text-emerald-400 text-xs font-medium">{t.metric}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
