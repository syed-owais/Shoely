import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { adminOrderApi } from '@/api/admin/orderApi';
import type { OrderStatus } from '@/types';

const statusFilters: { value: OrderStatus | 'all'; label: string; icon: typeof Package }[] = [
  { value: 'all', label: 'All Orders', icon: Package },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { value: 'authenticated', label: 'Authenticated', icon: Package },
  { value: 'shipped', label: 'Shipped', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params: Record<string, any> = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        const res = await adminOrderApi.getAll(params);
        setOrders(res.data.data || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'shipped': return 'bg-blue-500/20 text-blue-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'authenticated': return 'bg-purple-500/20 text-purple-400';
      case 'confirmed': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-white/10 text-white/60';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-48" />
        <div className="h-12 bg-white/5 rounded-lg" />
        <div className="h-64 bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-white/60">Manage and track customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-lg pl-12 pr-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${statusFilter === filter.value
                    ? 'bg-[#FF4D6D] text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 font-medium text-sm px-6 py-4">Order</th>
                <th className="text-left text-white/60 font-medium text-sm px-6 py-4">Customer</th>
                <th className="text-left text-white/60 font-medium text-sm px-6 py-4">Date</th>
                <th className="text-left text-white/60 font-medium text-sm px-6 py-4">Total</th>
                <th className="text-left text-white/60 font-medium text-sm px-6 py-4">Status</th>
                <th className="text-right text-white/60 font-medium text-sm px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{order.orderNumber}</p>
                    <p className="text-white/60 text-sm">{order.items?.length || 0} item(s)</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white">{order.customer?.firstName} {order.customer?.lastName}</p>
                    <p className="text-white/60 text-sm">{order.customer?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-white/60">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">₨{order.financials?.totalAmount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-white/30 mb-4" />
            <p className="text-white/60">No orders found</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-white">{orders.length}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            {orders.filter((o: any) => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">To Authenticate</p>
          <p className="text-2xl font-bold text-purple-400">
            {orders.filter((o: any) => o.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">
            ₨{orders.reduce((sum: number, o: any) => sum + (o.financials?.totalAmount || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
