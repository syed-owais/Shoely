import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, Clock, Truck } from 'lucide-react';
import { orderApi } from '@/api/consumer/orderApi';
import type { OrderStatus } from '@/types';

const statusSteps: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'pending', label: 'Order Placed', description: 'We\'ve received your order' },
  { status: 'confirmed', label: 'Confirmed', description: 'Payment verified' },
  { status: 'authenticated', label: 'Authenticated', description: 'Sneakers verified by experts' },
  { status: 'shipped', label: 'Shipped', description: 'On its way to you' },
  { status: 'delivered', label: 'Delivered', description: 'Enjoy your new kicks!' },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getById(id || '');
        setOrder(res.data.data || res.data);
      } catch (err) {
        console.error('Failed to load order:', err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-48 mb-8" />
        <div className="h-32 bg-white/5 rounded-xl mb-6" />
        <div className="h-48 bg-white/5 rounded-xl mb-6" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-white/30 mb-4" />
        <h1 className="font-display font-bold text-2xl text-white mb-2">Order Not Found</h1>
        <p className="text-white/60 mb-6">We couldn&apos;t find an order with that number.</p>
        <Link
          to="/track-order"
          className="inline-flex items-center gap-2 text-[#FF4D6D] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Track another order
        </Link>
      </div>
    );
  }

  const getStatusIndex = (status: OrderStatus) => {
    return statusSteps.findIndex(step => step.status === status);
  };

  const currentStatusIndex = getStatusIndex(order.status);
  const progressPercent = ((currentStatusIndex + 1) / statusSteps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Link to="/track-order" className="text-white/60 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl text-white">Order Details</h1>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-white font-medium">{order.orderNumber}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                  order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                    order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <p className="text-white/60 text-sm">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-white/60 text-sm">Total</p>
            <p className="text-[#FF4D6D] font-bold text-xl">${order.financials?.totalAmount}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {order.status !== 'cancelled' && (
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <div className="relative">
            {/* Background Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-white/10 rounded-full" />
            {/* Progress Line */}
            <div
              className="absolute top-5 left-0 h-1 bg-[#FF4D6D] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isCompleted
                        ? isCurrent
                          ? 'bg-[#FF4D6D] ring-4 ring-[#FF4D6D]/20'
                          : 'bg-green-500'
                        : 'bg-white/10'
                      }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Clock className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <p className={`text-xs font-medium text-center ${isCompleted ? 'text-white' : 'text-white/40'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tracking Info */}
          {order.tracking?.number && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#FF4D6D]" />
                <div>
                  <p className="text-white text-sm">Tracking Number</p>
                  <p className="text-white/60 text-sm">{order.tracking.number}</p>
                </div>
              </div>
              {order.tracking.url && (
                <a
                  href={order.tracking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF4D6D] text-sm hover:underline"
                >
                  Track shipment
                </a>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Items</h2>
            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-lg">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-white/60 text-sm">{item.brand}</p>
                    <p className="text-white/60 text-sm">Size: US {item.size}</p>
                    <p className="text-white/60 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-white font-medium">${item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Shipping */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-white/60 text-sm">
                <span>Subtotal</span>
                <span>${order.financials?.subtotal}</span>
              </div>
              <div className="flex justify-between text-white/60 text-sm">
                <span>Shipping</span>
                <span>{order.financials?.shippingFee === 0 ? 'Free' : `$${order.financials?.shippingFee}`}</span>
              </div>
              {order.financials?.discount > 0 && (
                <div className="flex justify-between text-green-400 text-sm">
                  <span>Discount</span>
                  <span>-${order.financials?.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-white/60 text-sm">
                <span>Tax</span>
                <span>${order.financials?.tax}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                <span>Total</span>
                <span>${order.financials?.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Shipping Address</h2>
            <div className="space-y-1">
              <p className="text-white">{order.customer?.firstName} {order.customer?.lastName}</p>
              <p className="text-white/60">{order.shippingAddress?.address}</p>
              <p className="text-white/60">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
              </p>
              <p className="text-white/60">{order.shippingAddress?.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
