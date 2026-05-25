import { useState } from 'react';
import { Search, Globe, Clock, ExternalLink, Loader2, TrendingUp, Newspaper, Building2, Package, X, Filter, AlertCircle, Key, Settings } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate: string;
  category: 'news' | 'website' | 'business' | 'product' | 'general';
}

type CategoryFilter = 'all' | 'news' | 'website' | 'business' | 'product' | 'general';

const CATEGORY_CONFIG: Record<CategoryFilter, { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: 'All', icon: <Globe className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700 border-gray-300' },
  news: { label: 'News', icon: <Newspaper className="w-4 h-4" />, color: 'bg-red-50 text-red-700 border-red-200' },
  website: { label: 'Websites', icon: <Globe className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  business: { label: 'Business', icon: <Building2 className="w-4 h-4" />, color: 'bg-green-50 text-green-700 border-green-200' },
  product: { label: 'Products', icon: <Package className="w-4 h-4" />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  general: { label: 'General', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-orange-50 text-orange-700 border-orange-200' },
};

// ====== REAL SEARCH API INTEGRATION ======
// Uses Google Custom Search JSON API (free tier: 100 queries/day)
// Setup: https://programmablesearchengine.google.com/ + https://console.cloud.google.com/apis
// OR uses SerpAPI for more robust results

interface ApiConfig {
  provider: 'google' | 'serpapi';
  apiKey: string;
  searchEngineId?: string; // Only needed for Google CSE
}

// Detect category from URL/title
function detectCategory(url: string, title: string): SearchResult['category'] {
  const lowerUrl = url.toLowerCase();
  const lowerTitle = title.toLowerCase();

  // News sources
  const newsDomains = ['news', 'bbc', 'cnn', 'reuters', 'bloomberg', 'cnbc', 'theguardian', 'nytimes', 'washingtonpost', 'aljazeera', 'ndtv', 'times'];
  if (newsDomains.some(d => lowerUrl.includes(d)) || lowerTitle.includes('news') || lowerTitle.includes('update') || lowerTitle.includes('report')) {
    return 'news';
  }

  // Business
  const businessDomains = ['linkedin', 'forbes', 'business', 'entrepreneur', 'inc.com', 'crunchbase', 'glassdoor'];
  if (businessDomains.some(d => lowerUrl.includes(d)) || lowerTitle.includes('business') || lowerTitle.includes('company') || lowerTitle.includes('enterprise')) {
    return 'business';
  }

  // Products
  const productDomains = ['amazon', 'flipkart', 'ebay', 'producthunt', 'techradar', 'tomsguide', 'cnet', 'review'];
  if (productDomains.some(d => lowerUrl.includes(d)) || lowerTitle.includes('review') || lowerTitle.includes('product') || lowerTitle.includes('buy') || lowerTitle.includes('price')) {
    return 'product';
  }

  // Websites/Platforms
  const websiteDomains = ['github', 'stackoverflow', 'medium', 'dev.to', 'reddit', 'quora', 'wikipedia'];
  if (websiteDomains.some(d => lowerUrl.includes(d))) {
    return 'website';
  }

  return 'general';
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return url;
  }
}

// Google Custom Search API
async function searchWithGoogle(query: string, config: ApiConfig): Promise<SearchResult[]> {
  const url = `https://www.googleapis.com/customsearch/v1?key=${config.apiKey}&cx=${config.searchEngineId}&q=${encodeURIComponent(query)}&num=10&dateRestrict=m1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google API error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    return [];
  }

  return data.items.map((item: any, index: number) => ({
    id: `google-${index}-${Date.now()}`,
    title: item.title || 'No title',
    url: item.link || '',
    snippet: item.snippet || '',
    source: extractDomain(item.link || ''),
    publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time']
      ? new Date(item.pagemap.metatags[0]['article:published_time']).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recent',
    category: detectCategory(item.link || '', item.title || ''),
  }));
}

// SerpAPI Search
async function searchWithSerpApi(query: string, config: ApiConfig): Promise<SearchResult[]> {
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${config.apiKey}&num=10&tbs=qdr:m`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.organic_results || data.organic_results.length === 0) {
    return [];
  }

  return data.organic_results.map((item: any, index: number) => ({
    id: `serp-${index}-${Date.now()}`,
    title: item.title || 'No title',
    url: item.link || '',
    snippet: item.snippet || '',
    source: extractDomain(item.link || ''),
    publishedDate: item.date || 'Recent',
    category: detectCategory(item.link || '', item.title || ''),
  }));
}

// Main search function - tries real API first, falls back to demo
async function performSearch(query: string, config: ApiConfig | null): Promise<{ results: SearchResult[]; isLive: boolean }> {
  // If API config is available, use real search
  if (config && config.apiKey) {
    try {
      let results: SearchResult[];
      if (config.provider === 'google' && config.searchEngineId) {
        results = await searchWithGoogle(query, config);
      } else if (config.provider === 'serpapi') {
        results = await searchWithSerpApi(query, config);
      } else {
        throw new Error('Invalid config');
      }
      return { results, isLive: true };
    } catch (error) {
      console.error('Live search failed, using demo mode:', error);
      // Fall through to demo mode
    }
  }

  // Demo mode with simulated results
  await new Promise(resolve => setTimeout(resolve, 1200));

  const mockData = [
    {
      title: `${query} - Latest News & Updates 2026`,
      snippet: `Get the most recent information about ${query}. Stay updated with breaking news, trends, and comprehensive coverage from trusted sources worldwide.`,
      source: 'news.google.com',
      category: 'news' as const,
    },
    {
      title: `${query} | Official Website & Resources`,
      snippet: `Explore the official website for ${query}. Find detailed documentation, guides, pricing information, and get started with everything you need.`,
      source: 'official-site.com',
      category: 'website' as const,
    },
    {
      title: `${query} Business Solutions & Enterprise`,
      snippet: `Discover how ${query} can transform your business operations. Enterprise-grade solutions with 24/7 support and custom integrations available.`,
      source: 'business.com',
      category: 'business' as const,
    },
    {
      title: `${query} Product Review & Comparison 2026`,
      snippet: `In-depth review and comparison of ${query} products. Compare features, pricing, user ratings, and find the best option for your needs.`,
      source: 'techreview.com',
      category: 'product' as const,
    },
    {
      title: `Understanding ${query}: Complete Guide`,
      snippet: `A comprehensive guide to understanding ${query}. Learn everything from basics to advanced concepts with real-world examples and expert insights.`,
      source: 'wikipedia.org',
      category: 'general' as const,
    },
    {
      title: `${query} Market Analysis & Trends`,
      snippet: `Latest market analysis and emerging trends related to ${query}. Industry reports, forecasts, and strategic insights for decision-makers.`,
      source: 'bloomberg.com',
      category: 'news' as const,
    },
    {
      title: `Top ${query} Tools & Platforms`,
      snippet: `Curated list of the best tools and platforms for ${query}. Detailed features, pros & cons, and pricing breakdown to help you choose wisely.`,
      source: 'producthunt.com',
      category: 'product' as const,
    },
    {
      title: `${query} Community & Forum`,
      snippet: `Join the largest community discussing ${query}. Ask questions, share experiences, and connect with thousands of enthusiasts and professionals.`,
      source: 'reddit.com',
      category: 'website' as const,
    },
    {
      title: `How ${query} is Changing the Industry`,
      snippet: `Explore how ${query} is disrupting traditional business models. Case studies, success stories, and future predictions from industry leaders.`,
      source: 'forbes.com',
      category: 'business' as const,
    },
    {
      title: `${query} Tutorial & Getting Started`,
      snippet: `Step-by-step tutorial to get started with ${query}. From beginner to advanced, with video guides, code samples, and hands-on projects.`,
      source: 'medium.com',
      category: 'general' as const,
    },
  ];

  const now = new Date();
  const results: SearchResult[] = mockData.map((item, index) => ({
    id: `demo-${index}-${Date.now()}`,
    title: item.title,
    url: `https://${item.source}/${query.toLowerCase().replace(/\s+/g, '-')}`,
    snippet: item.snippet,
    source: item.source,
    publishedDate: new Date(now.getTime() - Math.floor(Math.random() * 30) * 86400000)
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    category: item.category,
  }));

  return { results, isLive: false };
}

function getCategoryBadge(category: SearchResult['category']) {
  const config = CATEGORY_CONFIG[category];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export default function WebSearchTool() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // API Configuration - stored in localStorage
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    try {
      const saved = localStorage.getItem('webSearchToolConfig');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { provider: 'google', apiKey: '', searchEngineId: '' };
  });

  const saveConfig = (config: ApiConfig) => {
    setApiConfig(config);
    try {
      localStorage.setItem('webSearchToolConfig', JSON.stringify(config));
    } catch {}
    setShowSettings(false);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setActiveFilter('all');
    setError(null);

    try {
      const config = apiConfig.apiKey ? apiConfig : null;
      const { results: searchResults, isLive } = await performSearch(query.trim(), config);
      setResults(searchResults);
      setIsLiveMode(isLive);
      // Add to history
      setSearchHistory(prev => {
        const updated = [query.trim(), ...prev.filter(h => h !== query.trim())].slice(0, 5);
        return updated;
      });
    } catch (err: any) {
      console.error('Search failed:', err);
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    setError(null);
    setTimeout(() => {
      setIsLoading(true);
      setHasSearched(true);
      setActiveFilter('all');
      const config = apiConfig.apiKey ? apiConfig : null;
      performSearch(term, config).then(({ results: searchResults, isLive }) => {
        setResults(searchResults);
        setIsLiveMode(isLive);
        setSearchHistory(prev => {
          const updated = [term, ...prev.filter(h => h !== term)].slice(0, 5);
          return updated;
        });
      }).catch(err => {
        setError(err.message || 'Search failed');
      }).finally(() => setIsLoading(false));
    }, 0);
  };

  const filteredResults = activeFilter === 'all'
    ? results
    : results.filter(r => r.category === activeFilter);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setActiveFilter('all');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                API Configuration
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">How to get API keys:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li><strong>Google:</strong> Go to <a href="https://console.cloud.google.com/apis" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a> → Enable "Custom Search API" → Create API Key</li>
                  <li><strong>Google CSE ID:</strong> Go to <a href="https://programmablesearchengine.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Programmable Search Engine</a> → Create → Get Search Engine ID</li>
                  <li><strong>SerpAPI:</strong> Sign up at <a href="https://serpapi.com/" target="_blank" rel="noopener noreferrer" className="underline">serpapi.com</a> → Get API key (100 free searches/month)</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Provider</label>
                <select
                  value={apiConfig.provider}
                  onChange={(e) => setApiConfig({ ...apiConfig, provider: e.target.value as 'google' | 'serpapi' })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="google">Google Custom Search (100 free/day)</option>
                  <option value="serpapi">SerpAPI (100 free/month)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key *</label>
                <input
                  type="password"
                  value={apiConfig.apiKey}
                  onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {apiConfig.provider === 'google' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Engine ID (cx) *</label>
                  <input
                    type="text"
                    value={apiConfig.searchEngineId || ''}
                    onChange={(e) => setApiConfig({ ...apiConfig, searchEngineId: e.target.value })}
                    placeholder="e.g., a1b2c3d4e5f6g7h8i"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => saveConfig(apiConfig)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Save & Connect
                </button>
                <button
                  onClick={() => saveConfig({ provider: 'google', apiKey: '', searchEngineId: '' })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Use Demo Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Web Search Tool</h1>
                <p className="text-xs text-gray-500">
                  {apiConfig.apiKey ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse"></span>
                      Live Mode ({apiConfig.provider === 'google' ? 'Google' : 'SerpAPI'})
                    </span>
                  ) : (
                    <span className="text-orange-600">Demo Mode - Add API key for live results</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasSearched && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
              >
                <Settings className="w-4 h-4" />
                API Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Box */}
        <div className={`transition-all duration-500 ${hasSearched ? 'mb-8' : 'mt-16 sm:mt-24 mb-12'}`}>
          {!hasSearched && (
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Search the Web
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find latest news, websites, business info, products & more from across the internet
              </p>
            </div>
          )}

          <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for anything... news, websites, businesses, products"
                className="w-full pl-12 pr-32 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-lg bg-white text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </button>
            </div>
          </form>

          {/* Quick Search Suggestions */}
          {!hasSearched && (
            <div className="max-w-3xl mx-auto mt-6">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-gray-500">Try:</span>
                {['AI Technology 2026', 'Latest Startups', 'E-commerce Trends', 'Digital Marketing', 'Tech Products'].map(term => (
                  <button
                    key={term}
                    onClick={() => handleQuickSearch(term)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search History */}
          {!hasSearched && searchHistory.length > 0 && (
            <div className="max-w-3xl mx-auto mt-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Recent:</span>
                {searchHistory.map(term => (
                  <button
                    key={term}
                    onClick={() => handleQuickSearch(term)}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Filters */}
        {hasSearched && !isLoading && results.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-500" />
              {(Object.keys(CATEGORY_CONFIG) as CategoryFilter[]).map(cat => {
                const config = CATEGORY_CONFIG[cat];
                const count = cat === 'all' ? results.length : results.filter(r => r.category === cat).length;
                if (cat !== 'all' && count === 0) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      activeFilter === cat
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : `${config.color} hover:shadow-sm`
                    }`}
                  >
                    {config.icon}
                    {config.label}
                    <span className={`text-xs ${activeFilter === cat ? 'text-blue-200' : 'opacity-60'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <Globe className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-4 text-gray-600 font-medium">Searching the web...</p>
            <p className="text-sm text-gray-400">Fetching latest results for "{query}"</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Search Error</p>
              <p className="text-red-600 text-sm">{error}</p>
              <p className="text-red-500 text-xs mt-1">Tip: Check your API key in Settings, or use Demo Mode</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && !error && (
          <>
            {filteredResults.length > 0 ? (
              <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Showing {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "<span className="font-medium text-gray-700">{query}</span>"
                </p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${isLiveMode ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {isLiveMode ? '🌐 Live Results' : '🎭 Demo Results'}
                </span>
              </div>
                {filteredResults.map(result => (
                  <div
                    key={result.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-green-700 truncate">{result.source}</span>
                          {getCategoryBadge(result.category)}
                        </div>
                        <h3 className="text-lg font-semibold text-blue-700 group-hover:text-blue-800 mb-2 line-clamp-2">
                          <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {result.title}
                          </a>
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {result.snippet}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.publishedDate}
                          </span>
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                          >
                            Visit <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No results found for this filter</p>
                <p className="text-gray-400 text-sm mt-1">Try a different category or search term</p>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: <Newspaper className="w-8 h-8" />, title: 'Latest News', desc: 'Breaking news & updates', color: 'from-red-500 to-rose-500' },
              { icon: <Globe className="w-8 h-8" />, title: 'Websites', desc: 'Discover new sites', color: 'from-blue-500 to-cyan-500' },
              { icon: <Building2 className="w-8 h-8" />, title: 'Business', desc: 'Company & market info', color: 'from-green-500 to-emerald-500' },
              { icon: <Package className="w-8 h-8" />, title: 'Products', desc: 'Reviews & comparisons', color: 'from-purple-500 to-violet-500' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center hover:shadow-xl transition-shadow">
                <div className={`bg-gradient-to-br ${item.color} w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Note */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p className="text-xs text-gray-400">
          Web Search Tool - Collects latest information from across the internet.
          {!apiConfig.apiKey && ' Click "API Settings" to connect Google Custom Search or SerpAPI for real-time live results.'}
        </p>
      </footer>
    </div>
  );
}
