import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Save, Edit2 } from 'lucide-react';
import { adminOrderApi } from '@/api/admin/orderApi';
import type { OrderStatus } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'authenticated', label: 'Authenticated', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'shipped', label: 'Shipped', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500/20 text-green-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-400' },
];

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await adminOrderApi.getById(id || '');
        const orderData = res.data.data || res.data;
        setOrder(orderData);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-48" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-white/5 rounded-xl" />
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-white/60">Order not found</p>
        <Link to="/admin/orders" className="text-[#FF4D6D] mt-4 inline-block hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      const res = await adminOrderApi.updateStatus(order.id, {
        status: newStatus,
        tracking_number: trackingNumber || undefined,
      });
      setOrder(res.data.data || res.data);
      setIsEditing(false);
      setShowConfirm(false);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    setNewStatus(order.status);
    setTrackingNumber(order.tracking?.number || '');
    setTrackingUrl(order.tracking?.url || '');
    setIsEditing(true);
  };

  const getStatusColor = (status: OrderStatus) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-white/10 text-white/60';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/orders"
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{order.orderNumber}</h1>
            <p className="text-white/60">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={startEditing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Update Status
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF4D6D] text-white rounded-lg hover:bg-[#FF4D6D]/90 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="font-semibold text-white mb-4">Order Status</h2>

            {!isEditing ? (
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                {order.tracking?.number && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Truck className="w-4 h-4" />
                    <span>Tracking: {order.tracking.number}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value} className="bg-[#111113]">{s.label}</option>
                    ))}
                  </select>
                </div>

                {newStatus === 'shipped' && (
                  <>
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Tracking Number</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g., 1Z999AA10123456784"
                        className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Tracking URL (optional)</label>
                      <input
                        type="text"
                        value={trackingUrl}
                        onChange={(e) => setTrackingUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="font-semibold text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-white/60 text-sm">{item.brand}</p>
                    <p className="text-white/60 text-sm">Size: US {item.size}</p>
                    <p className="text-white/60 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">₨{item.price * item.quantity}</p>
                    <p className="text-white/60 text-sm">₨{item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="font-semibold text-white mb-4">Customer</h2>
            <div className="space-y-1">
              <p className="text-white font-medium">
                {order.customer?.firstName} {order.customer?.lastName}
              </p>
              <p className="text-white/60 text-sm">{order.customer?.email}</p>
              <p className="text-white/60 text-sm">{order.customer?.phone}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="font-semibold text-white mb-4">Shipping Address</h2>
            <div className="space-y-1 text-white/60">
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-white/60 text-sm">
                <span>Subtotal</span>
                <span>₨{order.financials?.subtotal}</span>
              </div>
              <div className="flex justify-between text-white/60 text-sm">
                <span>Shipping</span>
                <span>{order.financials?.shippingFee === 0 ? 'Free' : `₨${order.financials?.shippingFee}`}</span>
              </div>
              {order.financials?.discount > 0 && (
                <div className="flex justify-between text-green-400 text-sm">
                  <span>Discount</span>
                  <span>-₨{order.financials?.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-white/60 text-sm">
                <span>Tax</span>
                <span>₨{order.financials?.tax}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                <span>Total</span>
                <span>₨{order.financials?.totalAmount}</span>
              </div>
            </div>

            {order.appliedPromoCode && (
              <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                <p className="text-green-400 text-sm">Promo code applied: {order.appliedPromoCode}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-[#111113] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Status Update</DialogTitle>
          </DialogHeader>
          <p className="text-white/60 mb-4">
            Are you sure you want to update the order status to <span className="text-white font-medium">{newStatus}</span>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={saving}
              className="flex-1 py-2 bg-[#FF4D6D] text-white rounded-lg hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Confirm'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
