import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Eye, MousePointer } from 'lucide-react';

const revenueData = [
  { date: 'Jan', revenue: 42000, adSpend: 12000, roas: 3.5 },
  { date: 'Feb', revenue: 53000, adSpend: 14000, roas: 3.8 },
  { date: 'Mar', revenue: 48000, adSpend: 13500, roas: 3.6 },
  { date: 'Apr', revenue: 67000, adSpend: 16000, roas: 4.2 },
  { date: 'May', revenue: 82000, adSpend: 18000, roas: 4.6 },
  { date: 'Jun', revenue: 95000, adSpend: 20000, roas: 4.8 },
  { date: 'Jul', revenue: 110000, adSpend: 22000, roas: 5.0 },
];

const channelData = [
  { channel: 'Meta', revenue: 45000, spend: 9000, roas: 5.0 },
  { channel: 'Google', revenue: 32000, spend: 8000, roas: 4.0 },
  { channel: 'TikTok', revenue: 18000, spend: 3500, roas: 5.1 },
  { channel: 'Email', revenue: 12000, spend: 800, roas: 15.0 },
  { channel: 'YouTube', revenue: 8000, spend: 2500, roas: 3.2 },
];


const stats = [
  { label: 'Total Revenue', value: '$110,342', change: '+23.5%', up: true, icon: DollarSign },
  { label: 'Orders', value: '1,847', change: '+18.2%', up: true, icon: ShoppingCart },
  { label: 'Blended ROAS', value: '4.8x', change: '+0.6x', up: true, icon: TrendingUp },
  { label: 'CPA', value: '$18.40', change: '-12.3%', up: true, icon: MousePointer },
];

export function DashboardPreview() {
  return (
    <section id="dashboard" className="py-20 sm:py-28 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Live Dashboard</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
            Your Entire Ad Performance. One Screen.
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Real-time revenue attribution, ROAS tracking, and channel performance — all in a beautiful, actionable dashboard.
          </p>
        </div>

        {/* Dashboard Mock */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-500 text-sm ml-3">AdTrackr Dashboard — Last 30 Days</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 text-xs font-medium">Live</span>
            </div>
          </div>


          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className="w-4 h-4 text-gray-500" />
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {s.change}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-5 gap-4">
            {/* Revenue Chart */}
            <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold text-sm">Revenue vs Ad Spend</h4>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Revenue</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Ad Spend</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="adSpend" stroke="#3b82f6" fill="url(#colorSpend)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>


            {/* Channel Breakdown */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h4 className="text-white font-semibold text-sm mb-4">Channel ROAS</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={channelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                  <XAxis type="number" stroke="#6b7280" fontSize={11} />
                  <YAxis dataKey="channel" type="category" stroke="#6b7280" fontSize={11} width={50} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Bar dataKey="roas" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attribution Table */}
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-x-auto">
            <h4 className="text-white font-semibold text-sm mb-3">Top Campaigns by Attributed Revenue</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 font-medium">Campaign</th>
                  <th className="text-left py-2 font-medium">Platform</th>
                  <th className="text-right py-2 font-medium">Spend</th>
                  <th className="text-right py-2 font-medium">Revenue</th>
                  <th className="text-right py-2 font-medium">ROAS</th>
                  <th className="text-right py-2 font-medium">CPA</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800/50">
                  <td className="py-2.5 text-white font-medium">Summer Sale - Broad LAL</td>
                  <td className="py-2.5"><span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs">Meta</span></td>
                  <td className="py-2.5 text-right">$4,200</td>
                  <td className="py-2.5 text-right text-emerald-400 font-medium">$24,800</td>
                  <td className="py-2.5 text-right font-semibold text-white">5.9x</td>
                  <td className="py-2.5 text-right">$12.40</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2.5 text-white font-medium">Brand Search - Exact</td>
                  <td className="py-2.5"><span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-xs">Google</span></td>
                  <td className="py-2.5 text-right">$2,100</td>
                  <td className="py-2.5 text-right text-emerald-400 font-medium">$18,500</td>
                  <td className="py-2.5 text-right font-semibold text-white">8.8x</td>
                  <td className="py-2.5 text-right">$8.20</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2.5 text-white font-medium">UGC Creative Test #4</td>
                  <td className="py-2.5"><span className="bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded text-xs">TikTok</span></td>
                  <td className="py-2.5 text-right">$1,800</td>
                  <td className="py-2.5 text-right text-emerald-400 font-medium">$9,200</td>
                  <td className="py-2.5 text-right font-semibold text-white">5.1x</td>
                  <td className="py-2.5 text-right">$15.80</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-white font-medium">Retargeting - Cart Abandoners</td>
                  <td className="py-2.5"><span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs">Meta</span></td>
                  <td className="py-2.5 text-right">$980</td>
                  <td className="py-2.5 text-right text-emerald-400 font-medium">$7,400</td>
                  <td className="py-2.5 text-right font-semibold text-white">7.6x</td>
                  <td className="py-2.5 text-right">$9.60</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
