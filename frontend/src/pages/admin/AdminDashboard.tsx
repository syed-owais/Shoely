import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  DollarSign
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import gsap from 'gsap';

export default function AdminDashboard() {
  const { orders, products } = useStore();
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.querySelectorAll('.stat-card'),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  // Calculate stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  const totalOrders = orders.length;
  const lowStockProducts = products.filter(p => 
    p.sizes.some(s => s.quantity <= 2)
  ).length;

  const recentOrders = orders.slice(-5).reverse();

  const statCards = [
    { 
      label: 'Total Revenue', 
      value: `$${totalRevenue.toLocaleString()}`, 
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
      </div>

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
              recentOrders.map((order) => (
                <Link 
                  key={order.id} 
                  to={`/admin/orders/${order.id}`}
                  className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{order.id}</p>
                    <p className="text-white/60 text-sm">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">${order.total}</p>
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
