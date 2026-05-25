import { useState } from 'react';
import { Brain, MessageSquare, Image as ImageIcon, Film, Terminal, Share2, Globe, Settings, LogOut, Menu, X, Sparkles, Zap } from 'lucide-react';
import AIImageGenerator from './AIImageGenerator';
import WebSearchTool from './WebSearchTool';

// Tool components will be passed as children or rendered based on active tool
type ToolId = 'chat' | 'image' | 'video' | 'code' | 'social' | 'search';

interface DashboardProps {
  onLogout: () => void;
}

const TOOLS = [
  { id: 'chat' as ToolId, name: 'AI Chat', icon: <MessageSquare className="w-5 h-5" />, color: 'text-blue-400', desc: 'Smart conversations' },
  { id: 'image' as ToolId, name: 'Image Gen', icon: <ImageIcon className="w-5 h-5" />, color: 'text-purple-400', desc: 'Create images' },
  { id: 'video' as ToolId, name: 'Video Gen', icon: <Film className="w-5 h-5" />, color: 'text-pink-400', desc: 'Generate videos' },
  { id: 'code' as ToolId, name: 'Code Gen', icon: <Terminal className="w-5 h-5" />, color: 'text-green-400', desc: 'Write code' },
  { id: 'social' as ToolId, name: 'Social Media', icon: <Share2 className="w-5 h-5" />, color: 'text-orange-400', desc: 'Create content' },
  { id: 'search' as ToolId, name: 'Web Search', icon: <Globe className="w-5 h-5" />, color: 'text-cyan-400', desc: 'Search internet' },
];

// ========== CHAT AI COMPONENT (Free Pollinations Text API) ==========
function ChatAI() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Using Pollinations.ai free text API
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(userMsg)}?model=openai&seed=${Date.now()}`);
      const text = await response.text();
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 w-20 h-20 rounded-2xl flex items-center justify-center mb-4">
              <Brain className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">OmniCore AI Chat</h3>
            <p className="text-gray-500 max-w-md">Ask me anything! I can help with coding, writing, research, brainstorming, and more.</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg">
              {['Write a marketing email', 'Explain quantum computing', 'Create a business plan', 'Help me with React code'].map(q => (
                <button key={q} onClick={() => setInput(q)} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors">{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-white/10 text-gray-200'}`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <button onClick={sendMessage} disabled={isLoading || !input.trim()} className="bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-3 rounded-xl font-medium disabled:opacity-50 hover:from-violet-500 hover:to-cyan-500 transition-all">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== VIDEO PROMPT GENERATOR ==========
function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState('5s');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const styles = ['cinematic', 'anime', 'realistic', '3d-animation', 'stop-motion', 'vfx', 'commercial', 'music-video'];
  const durations = ['3s', '5s', '10s', '15s', '30s'];

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    const fullPrompt = `${style} style video: ${prompt}, ${duration} duration, high quality, smooth motion, professional`;
    setGeneratedPrompt(fullPrompt);
    
    // Generate a preview frame using Pollinations image API
    const previewSeed = Math.floor(Math.random() * 99999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`cinematic film still frame, ${prompt}, ${style} style, movie quality, dramatic lighting`)}\?width=1280&height=720&seed=${previewSeed}&nologo=true`;
    setPreviewUrl(imageUrl);
    
    // Simulate generation time
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">AI Video Generator</h2>
        <p className="text-gray-400">Generate video concepts with AI-powered preview frames. Uses free Pollinations API.</p>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Video Description</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your video scene... e.g., 'A drone shot flying over a futuristic city at sunset'" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 min-h-[100px] resize-none" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
            <div className="flex flex-wrap gap-2">
              {styles.map(s => (
                <button key={s} onClick={() => setStyle(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${style === s ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-violet-500'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
            <div className="flex flex-wrap gap-2">
              {durations.map(d => (
                <button key={d} onClick={() => setDuration(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${duration === d ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-violet-500'}`}>{d}</button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={generateVideo} disabled={isGenerating || !prompt.trim()} className="w-full bg-gradient-to-r from-pink-600 to-violet-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {isGenerating ? <><span className="animate-spin">&#9696;</span>Generating...</> : <><Film className="w-5 h-5" />Generate Video</>}
        </button>
      </div>

      {previewUrl && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="aspect-video relative">
            <img src={previewUrl} alt="Video preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4"><Film className="w-8 h-8 text-white" /></div>
            </div>
            <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded text-xs text-white">{duration}</div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-400 mb-2">Generated Prompt:</p>
            <p className="text-sm text-gray-200 bg-white/5 rounded-lg p-3 font-mono">{generatedPrompt}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== SOCIAL MEDIA CONTENT CREATOR ==========
function SocialMediaCreator() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [contentType, setContentType] = useState('post');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const platforms = ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube'];
  const types = ['post', 'caption', 'hashtags', 'bio', 'thread', 'script', 'hook', 'cta'];

  const generate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const promptText = `Create a ${contentType} for ${platform} about: ${topic}. Make it engaging, viral-worthy, and optimized for ${platform}. Include relevant emojis and hashtags where appropriate. Keep it concise and punchy.`;
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptText)}?model=openai&seed=${Date.now()}`);
      const text = await response.text();
      setGeneratedContent(text);
    } catch {
      setGeneratedContent('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Social Media AI</h2>
        <p className="text-gray-400">Create viral content for any platform instantly. Free &amp; unlimited.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Topic / Product / Idea</label>
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'New fitness app launch', 'Morning routine tips'" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(p => (
                <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${platform === p ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-orange-500'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
            <div className="flex flex-wrap gap-2">
              {types.map(t => (
                <button key={t} onClick={() => setContentType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${contentType === t ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-orange-500'}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={generate} disabled={isGenerating || !topic.trim()} className="w-full bg-gradient-to-r from-orange-600 to-pink-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {isGenerating ? <><span className="animate-spin">&#9696;</span>Creating...</> : <><Sparkles className="w-5 h-5" />Generate Content</>}
        </button>
      </div>

      {generatedContent && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Generated Content</h3>
            <button onClick={() => navigator.clipboard.writeText(generatedContent)} className="text-xs bg-white/10 px-3 py-1 rounded-lg text-gray-300 hover:bg-white/20">Copy</button>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">{generatedContent}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== CODE GENERATOR ==========
function CodeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const languages = ['javascript', 'python', 'typescript', 'react', 'html/css', 'nodejs', 'sql', 'rust', 'go', 'java'];

  const generate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const codePrompt = `Write ${language} code for: ${prompt}. Provide clean, well-commented, production-ready code. Only output the code, no explanations.`;
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(codePrompt)}?model=openai&seed=${Date.now()}`);
      const text = await response.text();
      setGeneratedCode(text);
    } catch {
      setGeneratedCode('// Error generating code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Code Generator</h2>
        <p className="text-gray-400">Generate production-ready code in any language. Powered by free AI.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">What do you want to build?</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 'A REST API with authentication', 'A React todo app with local storage'" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 min-h-[80px] resize-none" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Language / Framework</label>
          <div className="flex flex-wrap gap-2">
            {languages.map(l => (
              <button key={l} onClick={() => setLanguage(l)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${language === l ? 'bg-green-600 border-green-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-green-500'}`}>{l}</button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={isGenerating || !prompt.trim()} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {isGenerating ? <><span className="animate-spin">&#9696;</span>Generating...</> : <><Terminal className="w-5 h-5" />Generate Code</>}
        </button>
      </div>

      {generatedCode && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-sm text-gray-400 font-mono">{language}</span>
            <button onClick={() => navigator.clipboard.writeText(generatedCode)} className="text-xs bg-white/10 px-3 py-1 rounded-lg text-gray-300 hover:bg-white/20">Copy Code</button>
          </div>
          <pre className="p-4 overflow-x-auto text-sm text-green-300 font-mono leading-relaxed max-h-[500px] overflow-y-auto"><code>{generatedCode}</code></pre>
        </div>
      )}
    </div>
  );
}

// ========== MAIN DASHBOARD ==========
export default function OmniCoreDashboard({ onLogout }: DashboardProps) {
  const [activeTool, setActiveTool] = useState<ToolId>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderTool = () => {
    switch (activeTool) {
      case 'chat': return <ChatAI />;
      case 'image': return <AIImageGenerator />;
      case 'video': return <VideoGenerator />;
      case 'code': return <CodeGenerator />;
      case 'social': return <SocialMediaCreator />;
      case 'search': return <WebSearchTool />;
      default: return <ChatAI />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-950 text-white overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-white/10 flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-violet-500 to-cyan-500 p-1.5 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">OmniCore</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        {/* Tools */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-xs text-gray-500 uppercase font-semibold px-3 py-2">AI Tools</p>
          {TOOLS.map(tool => (
            <button key={tool.id} onClick={() => { setActiveTool(tool.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activeTool === tool.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
              <span className={activeTool === tool.id ? tool.color : ''}>{tool.icon}</span>
              <div>
                <p className="text-sm font-medium">{tool.name}</p>
                <p className="text-xs text-gray-500">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Back to Home</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-gray-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              <span className={TOOLS.find(t => t.id === activeTool)?.color}>{TOOLS.find(t => t.id === activeTool)?.icon}</span>
              <h1 className="font-semibold text-white">{TOOLS.find(t => t.id === activeTool)?.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />FREE
            </span>
          </div>
        </header>

        {/* Tool Content */}
        <div className="flex-1 overflow-y-auto">
          {renderTool()}
        </div>
      </main>
    </div>
  );
}
