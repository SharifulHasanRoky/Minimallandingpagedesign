import { ArrowRight, CheckCircle2 } from 'lucide-react';

const comparisons = [
  { feature: 'Multi-touch attribution models', us: true, hyros: true, triple: true },
  { feature: 'Server-side tracking (iOS 14+ proof)', us: true, hyros: true, triple: false },
  { feature: 'AI budget optimization engine', us: true, hyros: false, triple: true },
  { feature: 'Real-time conversion feed to ad platforms', us: true, hyros: true, triple: false },
  { feature: 'Cohort-based LTV prediction', us: true, hyros: false, triple: true },
  { feature: 'Cross-device identity resolution', us: true, hyros: true, triple: false },
  { feature: 'Cookieless tracking', us: true, hyros: false, triple: false },
  { feature: 'Unlimited ad spend tracking', us: true, hyros: false, triple: false },
  { feature: 'Custom attribution windows', us: true, hyros: true, triple: true },
  { feature: 'Slack/Discord alerts & automations', us: true, hyros: false, triple: true },
];

export function Attribution() {
  return (
    <section id="attribution" className="py-20 sm:py-28 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Comparison</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
            Why Media Buyers Switch to AdTrackr
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            We built everything you need from Hyros AND Triple Whale — without the limitations or the price tag.
          </p>
        </div>


        {/* Comparison Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4">
                    <span className="text-emerald-400 font-bold">AdTrackr</span>
                  </th>
                  <th className="text-center py-4 px-4">
                    <span className="text-gray-400 font-medium">Hyros</span>
                  </th>
                  <th className="text-center py-4 px-4">
                    <span className="text-gray-400 font-medium">Triple Whale</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((c, i) => (
                  <tr key={i} className="border-b border-gray-800/50 last:border-0">
                    <td className="py-3.5 px-6 text-gray-300">{c.feature}</td>
                    <td className="py-3.5 px-4 text-center">
                      {c.us ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /> : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {c.hyros ? <CheckCircle2 className="w-5 h-5 text-gray-500 mx-auto" /> : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {c.triple ? <CheckCircle2 className="w-5 h-5 text-gray-500 mx-auto" /> : <span className="text-gray-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-10">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition shadow-2xl shadow-emerald-500/30 inline-flex items-center gap-2 group">
            Switch to AdTrackr Today
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
