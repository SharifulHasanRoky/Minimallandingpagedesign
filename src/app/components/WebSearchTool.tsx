import { useState } from 'react';
import { Search, Globe, Clock, ExternalLink, Loader2, TrendingUp, Newspaper, Building2, Package, X, Filter } from 'lucide-react';

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

// Simulated search API - In production, replace with real API (Google Custom Search, Bing, SerpAPI, etc.)
async function performSearch(query: string): Promise<SearchResult[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Generate realistic mock results based on query
  const categories: SearchResult['category'][] = ['news', 'website', 'business', 'product', 'general'];
  const results: SearchResult[] = [];

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

  mockData.forEach((item, index) => {
    results.push({
      id: `result-${index}-${Date.now()}`,
      title: item.title,
      url: `https://${item.source}/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: item.snippet,
      source: item.source,
      publishedDate: getRandomDate(),
      category: item.category,
    });
  });

  return results;
}

function getRandomDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setActiveFilter('all');

    try {
      const searchResults = await performSearch(query.trim());
      setResults(searchResults);
      // Add to history
      setSearchHistory(prev => {
        const updated = [query.trim(), ...prev.filter(h => h !== query.trim())].slice(0, 5);
        return updated;
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    setTimeout(() => {
      setIsLoading(true);
      setHasSearched(true);
      setActiveFilter('all');
      performSearch(term).then(searchResults => {
        setResults(searchResults);
        setSearchHistory(prev => {
          const updated = [term, ...prev.filter(h => h !== term)].slice(0, 5);
          return updated;
        });
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
                <p className="text-xs text-gray-500">Search the internet for latest info</p>
              </div>
            </div>
            {hasSearched && (
              <button
                onClick={clearSearch}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
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

        {/* Results */}
        {!isLoading && hasSearched && (
          <>
            {filteredResults.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  Showing {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "<span className="font-medium text-gray-700">{query}</span>"
                </p>
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
          Connect with a real search API (Google, Bing, SerpAPI) for live results.
        </p>
      </footer>
    </div>
  );
}
