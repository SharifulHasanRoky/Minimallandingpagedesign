import { useState } from 'react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { Calendar, CheckCircle2, Clock, Star, Users, ArrowRight, Shield, Zap, Target } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you! We\'ll contact you within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Transform Your Business in 30 Days or Less
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Expert consulting that delivers measurable results. Join 500+ companies who've scaled their revenue by 3x.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.scrollTo({ top: document.getElementById('booking-form')?.offsetTop! - 100, behavior: 'smooth' })}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
                >
                  Book Free Consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.scrollTo({ top: document.getElementById('how-it-works')?.offsetTop! - 100, behavior: 'smooth' })}
                  className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2"
                >
                  See How It Works
                </button>
              </div>

              <div className="mt-6 flex items-center gap-2 text-blue-100">
                <Shield className="w-5 h-5" />
                <span>No credit card required • 100% free consultation</span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758518731706-be5d5230e5a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Business team collaboration and success"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">500+ Clients</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold">98% Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Leading Companies Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't just consult—we deliver measurable outcomes that transform your bottom line.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                3x Revenue Growth
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our proven strategies help businesses triple their revenue within the first year through optimized operations and smart scaling.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="bg-green-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Faster Implementation
              </h3>
              <p className="text-gray-700 leading-relaxed">
                See results in 30 days, not 6 months. We cut through the noise and deliver actionable strategies that work immediately.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="bg-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Risk-Free Guarantee
              </h3>
              <p className="text-gray-700 leading-relaxed">
                If you don't see measurable improvements in 90 days, we'll work for free until you do. That's our commitment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Simple Process, Powerful Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started is easy. We've streamlined everything so you can focus on growing your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-6">
                  1
                </div>
                <div className="mb-6">
                  <Calendar className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Book Your Call
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Schedule a free 30-minute consultation with one of our senior strategists. We'll analyze your business and identify growth opportunities.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-6">
                  2
                </div>
                <div className="mb-6">
                  <Target className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Get Your Custom Plan
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Within 48 hours, receive a detailed roadmap tailored to your business goals, complete with timelines and KPIs.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-6">
                  3
                </div>
                <div className="mb-6">
                  <CheckCircle2 className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Watch Growth Happen
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our team implements the strategy with you, providing weekly check-ins and continuous optimization for maximum results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / TESTIMONIALS */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Real Results From Real Clients
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it—see what our clients have to say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "We increased our revenue by 280% in just 6 months. The team's expertise and hands-on approach made all the difference."
              </p>
              <div className="flex items-center gap-4">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100"
                  alt="Sarah Chen"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">Sarah Chen</div>
                  <div className="text-sm text-gray-600">CEO, TechFlow Inc.</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Best investment we've ever made. They transformed our operations and saved us over $500K annually in wasted resources."
              </p>
              <div className="flex items-center gap-4">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100"
                  alt="Michael Rodriguez"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">Emily Parker</div>
                  <div className="text-sm text-gray-600">Founder, GrowthLabs</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Finally, a consulting firm that actually delivers. Results came faster than promised and the ROI was incredible."
              </p>
              <div className="flex items-center gap-4">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1770058428154-9eee8a6a1fbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100"
                  alt="Jennifer Brooks"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">Jennifer Brooks</div>
                  <div className="text-sm text-gray-600">VP Operations, ScaleUp Co.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING FORM SECTION */}
      <section id="booking-form" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Book Your Free Consultation
            </h2>
            <p className="text-xl text-gray-600">
              Fill out the form below and we'll contact you within 24 hours to schedule your personalized strategy session.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Instant Booking
              </button>
              <p className="text-center text-sm text-gray-600 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                No spam. 100% confidential. 500+ businesses trust us.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to 3x Your Revenue?
          </h2>
          <p className="text-xl sm:text-2xl text-blue-100 mb-4">
            Limited spots available this month. Only 5 consultation slots remaining.
          </p>
          <div className="bg-orange-500/20 border border-orange-300/30 rounded-lg p-4 mb-8 inline-block">
            <div className="flex items-center gap-2 text-orange-200">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Early Bird Offer Ends May 10, 2026</span>
            </div>
          </div>
          <button
            onClick={() => window.scrollTo({ top: document.getElementById('booking-form')?.offsetTop! - 100, behavior: 'smooth' })}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-5 rounded-lg font-semibold text-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 inline-flex items-center gap-2"
          >
            Claim Your Free Consultation
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="mt-6 text-blue-200">
            Join 500+ businesses who've already transformed their growth trajectory
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Business Growth Partners</h3>
              <p className="text-gray-400 leading-relaxed">
                Expert consulting that delivers measurable results for ambitious companies.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>Email: hello@growthpartners.com</p>
                <p>Phone: (555) 123-4567</p>
                <p>Hours: Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Trust & Security</h4>
              <div className="flex gap-4">
                <div className="bg-gray-800 px-4 py-2 rounded text-sm">SSL Secured</div>
                <div className="bg-gray-800 px-4 py-2 rounded text-sm">GDPR Compliant</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 Business Growth Partners. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
