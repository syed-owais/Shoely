import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { orderApi } from '@/api/consumer/orderApi';
import type { Order } from '@/types';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderApi.getAll();
                setOrders(res.data.data || res.data || []);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
                <div className="h-8 bg-white/5 rounded w-48 mb-8" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-white mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-xl">
                    <Package className="w-16 h-16 mx-auto text-white/30 mb-4" />
                    <h2 className="text-xl text-white font-medium mb-2">No orders found</h2>
                    <p className="text-white/60 mb-6">Looks like you haven't placed any orders yet.</p>
                    <Link to="/shop" className="inline-block px-6 py-3 bg-[#FF4D6D] text-white rounded-full font-semibold hover:bg-[#FF4D6D]/90 transition-colors">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: any) => (
                        <div key={order.id} className="bg-white/5 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/10 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-white font-medium">{order.orderNumber}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                            order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                                                order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                                <p className="text-white/60 text-sm">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    })} • {order.items?.length || 0} items • ₨{order.financials?.totalAmount}
                                </p>
                            </div>
                            <Link
                                to={`/order/${order.orderNumber || order.id}`}
                                className="flex items-center gap-2 text-[#FF4D6D] hover:underline whitespace-nowrap"
                            >
                                View Details
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
