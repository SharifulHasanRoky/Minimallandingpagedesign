export function LogoCloud() {
  const platforms = [
    { name: 'Meta Ads', icon: '📘' },
    { name: 'Google Ads', icon: '🔍' },
    { name: 'TikTok Ads', icon: '🎵' },
    { name: 'Shopify', icon: '🛒' },
    { name: 'Klaviyo', icon: '📧' },
    { name: 'YouTube', icon: '▶️' },
    { name: 'Snapchat', icon: '👻' },
    { name: 'Pinterest', icon: '📌' },
  ];

  return (
    <section className="bg-gray-900 border-y border-gray-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 text-sm font-medium mb-6 uppercase tracking-wider">
          Integrates with all your ad platforms
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {platforms.map((p) => (
            <div key={p.name} className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50">
              <span className="text-lg">{p.icon}</span>
              <span className="text-gray-300 text-sm font-medium">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
