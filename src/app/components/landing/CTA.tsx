import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 sm:py-28 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-medium">14-day free trial. No credit card required.</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Stop Guessing. Start{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Knowing.
          </span>
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Join 2,400+ media buyers who track every dollar, attribute every sale, and scale with confidence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 inline-flex items-center justify-center gap-2 group">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-10 py-4 rounded-xl font-semibold text-lg transition inline-flex items-center justify-center gap-2">
            Book a Demo
          </button>
        </div>

        <p className="text-gray-600 text-sm mt-6">
          Setup takes 5 minutes. Works with Shopify, WooCommerce, ClickFunnels & more.
        </p>
      </div>
    </section>
  );
}
