import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Download
} from 'lucide-react';
import { adminDashboardApi } from '@/api/admin/dashboardApi';
import { adminOrderApi } from '@/api/admin/orderApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import gsap from 'gsap';

export default function AdminDashboard() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleExport = async (type: 'orders' | 'customers') => {
    try {
      const res = type === 'orders'
        ? await adminDashboardApi.exportOrders()
        : await adminDashboardApi.exportCustomers();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes, chartRes] = await Promise.all([
          adminDashboardApi.getStats(),
          adminOrderApi.getAll({ per_page: 5 }),
          adminDashboardApi.getChartData(),
        ]);
        setStats(statsRes.data.data || statsRes.data);
        const ordersData = ordersRes.data.data || [];
        setRecentOrders(ordersData.slice(0, 5));
        setChartData(chartRes.data.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.querySelectorAll('.stat-card'),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [loading]);

  const totalRevenue = stats?.totalRevenue || 0;
  const pendingOrders = stats?.pendingOrders || 0;
  const totalOrders = stats?.totalOrders || 0;
  const lowStockProducts = stats?.lowStockProducts || 0;

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₨${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500/20 text-green-400',
      change: '+12%'
    },
    {
      label: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-500/20 text-blue-400',
      change: '+8%'
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.toString(),
      icon: Package,
      color: 'bg-yellow-500/20 text-yellow-400',
      change: null
    },
    {
      label: 'Low Stock',
      value: lowStockProducts.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500/20 text-red-400',
      change: null
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'shipped': return 'bg-blue-500/20 text-blue-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-xl" />)}
        </div>
        <div className="h-64 bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="px-4 py-2 bg-[#FF4D6D] text-white rounded-lg font-medium hover:bg-[#FF4D6D]/90 transition-colors"
        >
          + Add Product
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('orders')}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Orders
          </button>
          <button
            onClick={() => handleExport('customers')}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Customers
          </button>
        </div>
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="font-semibold text-white mb-4">Revenue (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                interval={4}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                tickFormatter={(v) => `PKR ${v.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{ background: '#1a1a1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                formatter={(value: number) => [`₨${value.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#FF4D6D" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats Grid */}
      <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change} from last month
                    </p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white/5 rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-[#FF4D6D] text-sm hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-white/10">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white/60">No orders yet</p>
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{order.orderNumber}</p>
                    <p className="text-white/60 text-sm">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">₨{order.financials?.totalAmount}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/admin/products/new"
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Package className="w-5 h-5 text-[#FF4D6D]" />
                <span className="text-white">Add New Product</span>
              </Link>
              <Link
                to="/admin/promo-codes"
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <DollarSign className="w-5 h-5 text-[#FF4D6D]" />
                <span className="text-white">Create Promo Code</span>
              </Link>
              <Link
                to="/admin/campaigns"
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <TrendingUp className="w-5 h-5 text-[#FF4D6D]" />
                <span className="text-white">Start Campaign</span>
              </Link>
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts > 0 && (
            <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h2 className="font-semibold text-red-400">Low Stock Alert</h2>
              </div>
              <p className="text-white/60 text-sm mb-4">
                {lowStockProducts} product{lowStockProducts > 1 ? 's' : ''} need attention
              </p>
              <Link
                to="/admin/products"
                className="text-red-400 text-sm hover:underline"
              >
                View products →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
