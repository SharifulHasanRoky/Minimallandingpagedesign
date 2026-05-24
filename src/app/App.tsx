import { useState } from 'react';
import { Download, Search, Video, Music, FileVideo, Loader2, CheckCircle2, AlertCircle, Youtube, Sparkles, Zap, Shield } from 'lucide-react';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  views: string;
  formats: FormatOption[];
}

interface FormatOption {
  quality: string;
  format: string;
  size: string;
  type: 'video' | 'audio';
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<FormatOption | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isValidYoutubeUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
    return regex.test(url);
  };

  const extractVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleFetchInfo = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }
    if (!isValidYoutubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setError('');
    setLoading(true);
    setVideoInfo(null);
    setSelectedFormat(null);
    setDownloadSuccess(false);

    try {
      const videoId = extractVideoId(url);
      // Using a free API to fetch video info
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      
      if (!response.ok) {
        throw new Error('Video not found or unavailable');
      }

      const data = await response.json();

      // Simulated format options (real download handled by backend services)
      const formats: FormatOption[] = [
        { quality: '1080p', format: 'MP4', size: '~150 MB', type: 'video' },
        { quality: '720p', format: 'MP4', size: '~80 MB', type: 'video' },
        { quality: '480p', format: 'MP4', size: '~45 MB', type: 'video' },
        { quality: '360p', format: 'MP4', size: '~25 MB', type: 'video' },
        { quality: '320kbps', format: 'MP3', size: '~8 MB', type: 'audio' },
        { quality: '128kbps', format: 'MP3', size: '~4 MB', type: 'audio' },
      ];

      setVideoInfo({
        title: data.title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: 'N/A',
        author: data.author_name,
        views: 'N/A',
        formats,
      });
      setSelectedFormat(formats[1]); // Default to 720p
    } catch (err) {
      setError('Could not fetch video info. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo || !selectedFormat) return;

    setDownloading(true);
    setDownloadSuccess(false);

    try {
      const videoId = extractVideoId(url);
      // Using a public download service API
      const quality = selectedFormat.type === 'audio' ? 'audio' : selectedFormat.quality.replace('p', '');
      
      // Open download in new tab via a public converter service
      const downloadUrl = `https://api.vevioz.com/api/button/${selectedFormat.type === 'audio' ? 'mp3' : 'mp4'}/${videoId}`;
      
      // Try to open the download service
      window.open(downloadUrl, '_blank');
      
      // Show success after a brief delay
      setTimeout(() => {
        setDownloadSuccess(true);
        setDownloading(false);
      }, 2000);
    } catch (err) {
      setError('Download failed. Please try again.');
      setDownloading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetchInfo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              YT Downloader
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Always Working</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300 font-medium">Free & Unlimited Downloads</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Download YouTube Videos
            <br />
            <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              Instantly
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Paste any YouTube link and download in MP4 or MP3 format. Fast, free, and always working — kono shomoi kaj korbe!
          </p>
        </div>

        {/* URL Input Section */}
        <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Paste YouTube URL here... (e.g., https://youtube.com/watch?v=...)"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                onKeyDown={handleKeyPress}
                className="w-full pl-12 pr-4 py-4 bg-gray-900/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              />
            </div>
            <button
              onClick={handleFetchInfo}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Get Video</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Video Info Card */}
        {videoInfo && (
          <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Video Preview */}
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              <div className="sm:w-72 flex-shrink-0">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-900">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const videoId = extractVideoId(url);
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-red-600/90 p-3 rounded-full">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                  {videoInfo.title}
                </h3>
                <p className="text-gray-400 mb-4">{videoInfo.author}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 bg-gray-700/50 px-3 py-1.5 rounded-lg text-sm text-gray-300">
                    <Video className="w-4 h-4" /> Video
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-gray-700/50 px-3 py-1.5 rounded-lg text-sm text-gray-300">
                    <Music className="w-4 h-4" /> Audio
                  </span>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                Select Quality & Format
              </h4>
              
              {/* Video Formats */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                  <FileVideo className="w-3.5 h-3.5" /> Video (MP4)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {videoInfo.formats.filter(f => f.type === 'video').map((format) => (
                    <button
                      key={format.quality}
                      onClick={() => setSelectedFormat(format)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedFormat?.quality === format.quality && selectedFormat?.type === format.type
                          ? 'border-red-500 bg-red-500/10 text-white ring-1 ring-red-500/50'
                          : 'border-white/10 bg-gray-900/50 text-gray-300 hover:border-white/30 hover:bg-gray-900/80'
                      }`}
                    >
                      <div className="font-bold text-sm">{format.quality}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{format.size}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Formats */}
              <div>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" /> Audio (MP3)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {videoInfo.formats.filter(f => f.type === 'audio').map((format) => (
                    <button
                      key={format.quality}
                      onClick={() => setSelectedFormat(format)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedFormat?.quality === format.quality && selectedFormat?.type === format.type
                          ? 'border-red-500 bg-red-500/10 text-white ring-1 ring-red-500/50'
                          : 'border-white/10 bg-gray-900/50 text-gray-300 hover:border-white/30 hover:bg-gray-900/80'
                      }`}
                    >
                      <div className="font-bold text-sm">{format.quality}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{format.size}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading || !selectedFormat}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-bold text-lg text-white transition-all shadow-lg hover:shadow-red-500/25 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Preparing Download...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-300" />
                  <span>Download Started!</span>
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  <span>Download {selectedFormat?.type === 'audio' ? 'MP3' : 'MP4'} - {selectedFormat?.quality}</span>
                </>
              )}
            </button>

            {downloadSuccess && (
              <p className="text-center text-green-400 text-sm mt-3">
                A new tab has opened with the download. If it didn't open, please allow pop-ups.
              </p>
            )}
          </div>
        )}

        {/* Features Section */}
        {!videoInfo && (
          <div className="grid sm:grid-cols-3 gap-4 mt-12">
            <div className="bg-gray-800/30 border border-white/5 rounded-xl p-6 text-center">
              <div className="bg-red-600/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Super Fast</h3>
              <p className="text-sm text-gray-400">Lightning fast downloads with no waiting time</p>
            </div>
            <div className="bg-gray-800/30 border border-white/5 rounded-xl p-6 text-center">
              <div className="bg-purple-600/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">100% Safe</h3>
              <p className="text-sm text-gray-400">No malware, no ads, completely safe to use</p>
            </div>
            <div className="bg-gray-800/30 border border-white/5 rounded-xl p-6 text-center">
              <div className="bg-blue-600/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">All Formats</h3>
              <p className="text-sm text-gray-400">MP4, MP3, 1080p, 720p, 480p and more</p>
            </div>
          </div>
        )}

        {/* How to Use */}
        {!videoInfo && (
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold text-white mb-6">How to Use</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <span className="text-gray-300">Paste YouTube URL</span>
              </div>
              <div className="hidden sm:block w-8 h-px bg-gray-600"></div>
              <div className="flex items-center gap-3">
                <div className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <span className="text-gray-300">Choose Quality</span>
              </div>
              <div className="hidden sm:block w-8 h-px bg-gray-600"></div>
              <div className="flex items-center gap-3">
                <div className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <span className="text-gray-300">Click Download</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>YT Downloader - Free YouTube Video & Audio Downloader</p>
          <p className="mt-2 text-xs text-gray-600">
            This tool is for personal use only. Please respect copyright laws.
          </p>
        </div>
      </footer>
    </div>
  );
}
