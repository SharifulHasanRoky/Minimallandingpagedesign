import { Check, ArrowRight, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$199',
    period: '/mo',
    description: 'For brands spending up to $25k/mo on ads',
    features: [
      'Up to $25k monthly ad spend tracking',
      'Multi-touch attribution (3 models)',
      '5 ad platform integrations',
      'Basic AI recommendations',
      'Email support',
      '7-day attribution window',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Growth',
    price: '$499',
    period: '/mo',
    description: 'For scaling brands spending $25k-$100k/mo',
    features: [
      'Up to $100k monthly ad spend tracking',
      'All attribution models',
      'Unlimited integrations',
      'Advanced AI optimization engine',
      'Conversion API feed to ad platforms',
      'Custom attribution windows',
      'Slack & Discord alerts',
      'Priority support + Slack channel',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$999',
    period: '/mo',
    description: 'For agencies & brands spending $100k+/mo',
    features: [
      'Unlimited ad spend tracking',
      'All Growth features',
      'White-label dashboard',
      'Multi-brand management',
      'Dedicated account manager',
      'Custom ML model training',
      'API access & webhooks',
      'SOC 2 compliance',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];


export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            No hidden fees. No per-event charges. Pay based on your ad spend, not your conversions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 ${
                plan.popular
                  ? 'bg-gradient-to-b from-emerald-500/10 to-gray-950 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/10'
                  : 'bg-gray-950 border border-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-semibold transition inline-flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          All plans include a 14-day free trial. No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
