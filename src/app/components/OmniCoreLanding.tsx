import { useState } from 'react';
import { Zap, Brain, Image as ImageIcon, Video, Code, Share2, Bot, Rocket, Check, ArrowRight, Sparkles, Globe, MessageSquare, Palette, Film, Terminal, Users, Star, Shield } from 'lucide-react';

interface OmniCoreLandingProps {
  onGetStarted: () => void;
}

export default function OmniCoreLanding({ onGetStarted }: OmniCoreLandingProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-violet-500 to-cyan-500 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">OmniCore AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#tools" className="hover:text-white transition-colors">Tools</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <button onClick={onGetStarted} className="bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2 rounded-lg font-medium text-sm hover:from-violet-500 hover:to-cyan-500 transition-all">
            Launch App
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-cyan-900/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-3xl"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-8">
            <Sparkles className="w-4 h-4 text-violet-400" />
            100% Free &amp; Open Source AI Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
              One AI Platform.
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Infinite Possibilities.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Chat, generate images, create videos, build websites, automate workflows, manage social media — all from one free AI platform. No API keys needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onGetStarted} className="bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-4 rounded-xl font-semibold text-lg hover:from-violet-500 hover:to-cyan-500 transition-all shadow-2xl shadow-violet-500/20 inline-flex items-center justify-center gap-2">
              Start Creating Free <ArrowRight className="w-5 h-5" />
            </button>
            <a href="#features" className="border border-white/20 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/5 transition-all inline-flex items-center justify-center gap-2">
              Explore Features
            </a>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" />No Credit Card</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" />No API Key Needed</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" />Unlimited Usage</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" />Open Source</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Everything You Need. One Platform.</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Replace 10+ tools with one unified AI platform. All powered by free, open-source models.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <MessageSquare className="w-7 h-7" />, title: 'AI Chat', desc: 'Smart conversations with memory. Ask anything, get instant answers.', color: 'from-blue-500 to-blue-600' },
              { icon: <ImageIcon className="w-7 h-7" />, title: 'Image Generation', desc: 'Create stunning AI images, logos, posters, characters instantly.', color: 'from-purple-500 to-purple-600' },
              { icon: <Film className="w-7 h-7" />, title: 'Video Generation', desc: 'Generate cinematic videos, reels, ads from text prompts.', color: 'from-pink-500 to-pink-600' },
              { icon: <Terminal className="w-7 h-7" />, title: 'Code Generator', desc: 'Generate full apps, fix bugs, create APIs in any language.', color: 'from-green-500 to-green-600' },
              { icon: <Share2 className="w-7 h-7" />, title: 'Social Media AI', desc: 'Create viral content, captions, hashtags, and schedule posts.', color: 'from-orange-500 to-orange-600' },
              { icon: <Globe className="w-7 h-7" />, title: 'Web Search', desc: 'Search the internet for latest news, products, and trends.', color: 'from-cyan-500 to-cyan-600' },
              { icon: <Bot className="w-7 h-7" />, title: 'AI Agents', desc: 'Autonomous agents for research, marketing, and automation.', color: 'from-red-500 to-red-600' },
              { icon: <Palette className="w-7 h-7" />, title: 'Design Tools', desc: 'UI/UX design, brand identity, marketing materials.', color: 'from-yellow-500 to-yellow-600' },
              { icon: <Zap className="w-7 h-7" />, title: 'Automation', desc: 'Connect apps, automate workflows, trigger actions.', color: 'from-indigo-500 to-indigo-600' },
            ].map(feature => (
              <div key={feature.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all group">
                <div className={`bg-gradient-to-br ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS SECTION */}
      <section id="tools" className="py-20 px-4 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Powered by Free APIs</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">No hidden costs. No paid APIs. Everything runs on free, open-source technology.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Pollinations.ai', type: 'Image & Text', free: true },
              { name: 'Stable Diffusion', type: 'Image Gen', free: true },
              { name: 'CogVideoX', type: 'Video Gen', free: true },
              { name: 'DeepSeek', type: 'LLM Chat', free: true },
              { name: 'Hugging Face', type: 'AI Models', free: true },
              { name: 'n8n', type: 'Automation', free: true },
              { name: 'Supabase', type: 'Database', free: true },
              { name: 'Vercel', type: 'Hosting', free: true },
            ].map(tool => (
              <div key={tool.name} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                <div>
                  <p className="font-semibold">{tool.name}</p>
                  <p className="text-sm text-gray-500">{tool.type}</p>
                </div>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">FREE</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-400">Free forever. No catches. No credit card.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 relative">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-500 font-normal">/forever</span></div>
              <ul className="space-y-3 mb-8">
                {['Unlimited AI Chat', 'Image Generation', 'Video Prompts', 'Code Generation', 'Social Media Tools', 'Web Search', 'All Features Included'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-green-500 shrink-0" />{f}</li>
                ))}
              </ul>
              <button onClick={onGetStarted} className="w-full bg-white/10 border border-white/20 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors">
                Get Started
              </button>
            </div>
            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-2xl p-8 relative">
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-1 rounded-full text-xs font-bold">COMING SOON</div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">$9<span className="text-lg text-gray-500 font-normal">/month</span></div>
              <ul className="space-y-3 mb-8">
                {['Everything in Free', 'Priority Processing', 'HD Image Generation', '4K Video Generation', 'Custom AI Agents', 'API Access', 'Priority Support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-300"><Check className="w-5 h-5 text-violet-400 shrink-0" />{f}</li>
                ))}
              </ul>
              <button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 py-3 rounded-xl font-semibold opacity-50 cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-white/10 rounded-3xl p-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Build the Future?</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Start using OmniCore AI today. No signup required. No cost. Just pure AI power.
            </p>
            <button onClick={onGetStarted} className="bg-gradient-to-r from-violet-600 to-cyan-600 px-10 py-5 rounded-xl font-semibold text-xl hover:from-violet-500 hover:to-cyan-500 transition-all shadow-2xl shadow-violet-500/20 inline-flex items-center gap-3">
              <Rocket className="w-6 h-6" />
              Launch OmniCore AI
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <span className="font-bold text-gray-400">OmniCore AI</span>
          </div>
          <p className="text-sm text-gray-600">Built with free &amp; open-source AI. No cost forever.</p>
        </div>
      </footer>
    </div>
  );
}
