import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { orderApi } from '@/api/consumer/orderApi';
import type { OrderStatus } from '@/types';

const statusSteps: { status: OrderStatus; label: string; icon: typeof Package; description: string }[] = [
  { status: 'pending', label: 'Order Placed', icon: Clock, description: 'We\'ve received your order' },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Payment verified' },
  { status: 'authenticated', label: 'Authenticated', icon: Package, description: 'Sneakers verified by experts' },
  { status: 'shipped', label: 'Shipped', icon: Truck, description: 'On its way to you' },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Enjoy your new kicks!' },
];

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await orderApi.track(orderId.toUpperCase());
      const order = res.data.data || res.data;
      setSearchedOrder(order);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order not found. Please check your order number and email.');
      setSearchedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: OrderStatus) => {
    return statusSteps.findIndex(step => step.status === status);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-2xl lg:text-3xl text-white text-center mb-2">
        Track Your Order
      </h1>
      <p className="text-white/60 text-center mb-8">
        Enter your order number and email to track your shipment
      </p>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12">
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">Order Number</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="e.g., ORD-ABC123XYZ"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50 uppercase"
              />
            </div>
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50"
            />
          </div>
          <button
            type="submit"
            disabled={!orderId || !email || loading}
            className="w-full py-3 bg-[#FF4D6D] text-white rounded-full font-semibold hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </form>

      {/* Order Details */}
      {searchedOrder && (
        <div className="space-y-6">
          {/* Order Header */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-white/60 text-sm">Order #{searchedOrder.orderNumber}</p>
                <p className="text-white">
                  Placed on {new Date(searchedOrder.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-white/60 text-sm">Total</p>
                <p className="text-[#FF4D6D] font-bold text-xl">${searchedOrder.financials?.totalAmount}</p>
              </div>
            </div>
          </div>

          {/* Tracking Progress */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-6">Order Status</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />

              {/* Steps */}
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const currentStatusIndex = getStatusIndex(searchedOrder.status);
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${isCompleted
                          ? isCurrent
                            ? 'bg-[#FF4D6D]'
                            : 'bg-green-500'
                          : 'bg-white/10'
                        }`}>
                        <Icon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-white/40'}`} />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`font-medium ${isCompleted ? 'text-white' : 'text-white/40'}`}>
                          {step.label}
                        </p>
                        <p className={`text-sm ${isCompleted ? 'text-white/60' : 'text-white/30'}`}>
                          {step.description}
                        </p>
                        {isCurrent && searchedOrder.tracking?.number && (
                          <a
                            href={searchedOrder.tracking.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#FF4D6D] text-sm mt-1 hover:underline"
                          >
                            Track shipment: {searchedOrder.tracking.number}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Items */}
          {searchedOrder.items && (
            <div className="bg-white/5 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4">Order Items</h2>
              <div className="space-y-4">
                {searchedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-white/60 text-sm">{item.brand}</p>
                      <p className="text-white/60 text-sm">Size: US {item.size}</p>
                    </div>
                    <p className="text-white font-medium">${item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Shipping Address</h2>
            <p className="text-white">{searchedOrder.customer?.firstName} {searchedOrder.customer?.lastName}</p>
            <p className="text-white/60">{searchedOrder.shippingAddress?.address}</p>
            <p className="text-white/60">
              {searchedOrder.shippingAddress?.city}, {searchedOrder.shippingAddress?.state} {searchedOrder.shippingAddress?.zipCode}
            </p>
            <p className="text-white/60">{searchedOrder.shippingAddress?.country}</p>
          </div>
        </div>
      )}
    </div>
  );
}
