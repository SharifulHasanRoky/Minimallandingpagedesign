import { useState, useRef } from 'react';
import { Wand2, Download, Loader2, Image as ImageIcon, Sparkles, X, Copy, RefreshCw, Settings, Key, Palette, Film, UserCircle, Layout, Share2, Layers } from 'lucide-react';

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  timestamp: number;
  style: string;
}

interface ApiConfig {
  provider: 'pollinations' | 'stability' | 'huggingface';
  apiKey: string;
}

type ImageStyle = 'realistic' | 'anime' | 'digital-art' | 'oil-painting' | 'watercolor' | '3d-render' | 'pixel-art' | 'comic' | 'minimalist' | 'cinematic';
type ImageCategory = 'general' | 'poster' | 'logo' | 'character' | 'cgi' | 'thumbnail' | 'social-media';


const STYLE_OPTIONS: { value: ImageStyle; label: string; emoji: string }[] = [
  { value: 'realistic', label: 'Realistic', emoji: '📷' },
  { value: 'anime', label: 'Anime', emoji: '🎌' },
  { value: 'digital-art', label: 'Digital Art', emoji: '🎨' },
  { value: 'oil-painting', label: 'Oil Painting', emoji: '🖼️' },
  { value: 'watercolor', label: 'Watercolor', emoji: '💧' },
  { value: '3d-render', label: '3D Render', emoji: '🧊' },
  { value: 'pixel-art', label: 'Pixel Art', emoji: '👾' },
  { value: 'comic', label: 'Comic', emoji: '💥' },
  { value: 'minimalist', label: 'Minimalist', emoji: '⬜' },
  { value: 'cinematic', label: 'Cinematic', emoji: '🎬' },
];

const CATEGORY_OPTIONS: { value: ImageCategory; label: string; icon: React.ReactNode; prompt_prefix: string }[] = [
  { value: 'general', label: 'General Image', icon: <ImageIcon className="w-4 h-4" />, prompt_prefix: '' },
  { value: 'poster', label: 'Poster Design', icon: <Layout className="w-4 h-4" />, prompt_prefix: 'Professional poster design, ' },
  { value: 'logo', label: 'Logo Design', icon: <Sparkles className="w-4 h-4" />, prompt_prefix: 'Minimalist logo design, vector style, clean background, ' },
  { value: 'character', label: 'Character', icon: <UserCircle className="w-4 h-4" />, prompt_prefix: 'Character design, full body, detailed, ' },
  { value: 'cgi', label: 'CGI / VFX', icon: <Layers className="w-4 h-4" />, prompt_prefix: 'CGI render, photorealistic, VFX quality, high detail, ' },
  { value: 'thumbnail', label: 'Thumbnail', icon: <Film className="w-4 h-4" />, prompt_prefix: 'YouTube thumbnail style, eye-catching, bold colors, dramatic, ' },
  { value: 'social-media', label: 'Social Media', icon: <Share2 className="w-4 h-4" />, prompt_prefix: 'Social media post design, modern, trendy, vibrant, ' },
];


const SIZE_OPTIONS = [
  { value: '1024x1024', label: '1:1 Square', desc: '1024x1024' },
  { value: '1024x768', label: '4:3 Landscape', desc: '1024x768' },
  { value: '768x1024', label: '3:4 Portrait', desc: '768x1024' },
  { value: '1280x720', label: '16:9 Wide', desc: '1280x720' },
  { value: '720x1280', label: '9:16 Story', desc: '720x1280' },
];

// ===== FREE API: Pollinations.ai (No API key needed!) =====
async function generateWithPollinations(prompt: string, width: number, height: number): Promise<string> {
  const seed = Math.floor(Math.random() * 100000);
  const encodedPrompt = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
  
  // Pollinations returns the image directly, we just need to verify it loads
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Image generation failed');
  }
  return url;
}

// ===== Stability AI (DreamStudio - free credits on signup) =====
async function generateWithStability(prompt: string, width: number, height: number, apiKey: string): Promise<string> {
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      width: Math.min(width, 1024),
      height: Math.min(height, 1024),
      steps: 30,
      samples: 1,
    }),
  });

  if (!response.ok) throw new Error(`Stability AI error: ${response.status}`);
  const data = await response.json();
  return `data:image/png;base64,${data.artifacts[0].base64}`;
}


// ===== Hugging Face Inference API (free tier available) =====
async function generateWithHuggingFace(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!response.ok) throw new Error(`Hugging Face error: ${response.status}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// Main generation function
async function generateImage(
  prompt: string,
  style: ImageStyle,
  category: ImageCategory,
  size: string,
  config: ApiConfig | null
): Promise<string> {
  const categoryConfig = CATEGORY_OPTIONS.find(c => c.value === category);
  const styleText = style !== 'realistic' ? `, ${style} style` : '';
  const fullPrompt = `${categoryConfig?.prompt_prefix || ''}${prompt}${styleText}, high quality, detailed, professional`;

  const [width, height] = size.split('x').map(Number);

  // Try configured API first
  if (config && config.apiKey) {
    if (config.provider === 'stability') {
      return await generateWithStability(fullPrompt, width, height, config.apiKey);
    }
    if (config.provider === 'huggingface') {
      return await generateWithHuggingFace(fullPrompt, config.apiKey);
    }
  }

  // Default: Use Pollinations (FREE, no API key needed!)
  return await generateWithPollinations(fullPrompt, width, height);
}


export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('realistic');
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>('general');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    try {
      const saved = localStorage.getItem('aiImageGenConfig');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { provider: 'pollinations', apiKey: '' };
  });

  const saveConfig = (config: ApiConfig) => {
    setApiConfig(config);
    try { localStorage.setItem('aiImageGenConfig', JSON.stringify(config)); } catch {}
    setShowSettings(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const config = apiConfig.apiKey ? apiConfig : null;
      const imageUrl = await generateImage(prompt.trim(), selectedStyle, selectedCategory, selectedSize, config);
      
      const newImage: GeneratedImage = {
        id: `img-${Date.now()}`,
        prompt: prompt.trim(),
        url: imageUrl,
        timestamp: Date.now(),
        style: selectedStyle,
      };

      setGeneratedImages(prev => [newImage, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(image.url, '_blank');
    }
  };


  const QUICK_PROMPTS = [
    'A futuristic cyberpunk city at night with neon lights',
    'Cute anime character with magical powers',
    'Professional business logo for a tech startup',
    'Epic dragon flying over mountains, fantasy art',
    'Modern YouTube thumbnail for a gaming channel',
    'Minimalist social media post about fitness',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                API Configuration
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                <p className="font-medium mb-1">Default: Pollinations.ai (FREE!)</p>
                <p className="text-green-700">No API key needed! Works out of the box. For higher quality, add optional keys below.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select value={apiConfig.provider} onChange={(e) => setApiConfig({ ...apiConfig, provider: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900">
                  <option value="pollinations">Pollinations.ai (FREE - No key needed)</option>
                  <option value="stability">Stability AI (Free credits on signup)</option>
                  <option value="huggingface">Hugging Face (Free tier)</option>
                </select>
              </div>
              {apiConfig.provider !== 'pollinations' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input type="password" value={apiConfig.apiKey} onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })} placeholder="Enter API key" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => saveConfig(apiConfig)} className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-4 py-2.5 rounded-lg font-medium hover:from-purple-700 hover:to-fuchsia-700 transition-all">Save</button>
                <button onClick={() => saveConfig({ provider: 'pollinations', apiKey: '' })} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">Reset to Free</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl w-full max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-white hover:text-gray-300"><X className="w-8 h-8" /></button>
            <img src={selectedImage.url} alt={selectedImage.prompt} className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-white/80 text-sm truncate max-w-[70%]">{selectedImage.prompt}</p>
              <button onClick={() => handleDownload(selectedImage)} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><Download className="w-4 h-4" />Download</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 p-2 rounded-xl shadow-lg">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Image Generator</h1>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse"></span>
                  {apiConfig.provider === 'pollinations' ? 'Free Mode (Pollinations.ai)' : `${apiConfig.provider} API`}
                </p>
              </div>
            </div>
            <button onClick={() => setShowSettings(true)} className="text-sm text-gray-500 hover:text-purple-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors border border-gray-200">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </header>


      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Prompt Input */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">What do you want to create?</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map(cat => (
                    <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedCategory === cat.value ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'}`}>
                      {cat.icon}{cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Textarea */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Describe your image</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to generate... e.g., 'A majestic lion wearing a crown, sitting on a throne, epic lighting'"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-900 placeholder:text-gray-400 min-h-[100px] resize-none"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                />
              </div>

              {/* Style & Size Row */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                  <div className="flex flex-wrap gap-1.5">
                    {STYLE_OPTIONS.map(style => (
                      <button key={style.value} onClick={() => setSelectedStyle(style.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${selectedStyle === style.value ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300'}`}>
                        {style.emoji} {style.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZE_OPTIONS.map(size => (
                      <button key={size.value} onClick={() => setSelectedSize(size.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${selectedSize === size.value ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300'}`}>
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>


              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/30"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Generating your image...</>
                ) : (
                  <><Wand2 className="w-5 h-5" />Generate Image</>
                )}
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">Quick ideas:</span>
                {QUICK_PROMPTS.map(qp => (
                  <button key={qp} onClick={() => setPrompt(qp)}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all shadow-sm truncate max-w-[200px]">
                    {qp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <X className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Generation Failed</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}


        {/* Loading State */}
        {isGenerating && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center shadow-lg">
              <div className="relative mb-4">
                <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
                <Sparkles className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">Creating your masterpiece...</p>
              <p className="text-gray-500 text-sm mt-1">AI is generating "{prompt.slice(0, 50)}{prompt.length > 50 ? '...' : ''}"</p>
              <div className="mt-4 flex gap-2">
                {['🎨', '✨', '🖌️', '💫', '🌟'].map((emoji, i) => (
                  <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>{emoji}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generated Images Gallery */}
        {generatedImages.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Generated Images ({generatedImages.length})</h2>
              <button onClick={() => setGeneratedImages([])} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
                <X className="w-4 h-4" />Clear All
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map(image => (
                <div key={image.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className="aspect-square relative overflow-hidden cursor-pointer" onClick={() => setSelectedImage(image)}>
                    <img src={image.url} alt={image.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-3 py-1.5 rounded-full text-sm font-medium transition-opacity">View Full</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{image.prompt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">{image.style}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleDownload(image)} className="text-gray-400 hover:text-purple-600 transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                        <button onClick={() => { setPrompt(image.prompt); }} className="text-gray-400 hover:text-purple-600 transition-colors" title="Reuse prompt"><RefreshCw className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Empty State */}
        {generatedImages.length === 0 && !isGenerating && (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="bg-gradient-to-br from-purple-100 to-fuchsia-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Wand2 className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Anything You Imagine</h3>
            <p className="text-gray-600 max-w-lg mx-auto mb-8">
              Type a description and let AI generate stunning images. Create posters, logos, characters, CGI art, thumbnails, social media graphics & more!
            </p>
            <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {[
                { emoji: '🖼️', title: 'AI Images', desc: 'Any concept' },
                { emoji: '🎭', title: 'Characters', desc: 'Anime, realistic' },
                { emoji: '🏷️', title: 'Logos', desc: 'Brand design' },
                { emoji: '🎬', title: 'CGI / VFX', desc: 'Movie quality' },
                { emoji: '📱', title: 'Social Media', desc: 'Posts & stories' },
                { emoji: '🎮', title: 'Thumbnails', desc: 'YouTube, gaming' },
                { emoji: '🎨', title: 'Digital Art', desc: 'All styles' },
                { emoji: '📊', title: 'Posters', desc: 'Professional' },
              ].map(item => (
                <div key={item.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all">
                  <span className="text-3xl mb-2 block">{item.emoji}</span>
                  <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p className="text-xs text-gray-400">
          AI Image Generator - Powered by Pollinations.ai (Free) | Optional: Stability AI, Hugging Face
        </p>
      </footer>
    </div>
  );
}
