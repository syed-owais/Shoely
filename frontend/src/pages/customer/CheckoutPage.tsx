import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Truck, ShieldCheck, Lock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { orderApi } from '@/api/consumer/orderApi';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getCartTotal, clearCart } = useStore();

  const appliedPromoCode = location.state?.promoCode;
  const promoDiscount = location.state?.promoDiscount || 0;

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: '',
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const tax = Math.round(subtotal * 0.0875 * 100) / 100;
  const total = subtotal + shipping + tax - promoDiscount;

  if (cart.length === 0 && step !== 'confirmation') {
    navigate('/cart');
    return null;
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      const res = await orderApi.checkout({
        email: shippingInfo.email,
        first_name: shippingInfo.firstName,
        last_name: shippingInfo.lastName,
        phone: shippingInfo.phone,
        address: shippingInfo.street,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zip_code: shippingInfo.zipCode,
        country: shippingInfo.country,
        promo_code: appliedPromoCode || undefined,
        items: cart.map(item => ({
          product_id: item.productId,
          size: item.size,
          quantity: item.quantity,
        })),
      });

      const order = res.data.data || res.data;
      setOrderId(order.orderNumber || order.id);
      clearCart();
      setStep('confirmation');
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isShippingValid = () => {
    return (
      shippingInfo.firstName &&
      shippingInfo.lastName &&
      shippingInfo.email &&
      shippingInfo.phone &&
      shippingInfo.street &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.zipCode
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress */}
      {step !== 'confirmation' && (
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-[#FF4D6D]' : 'text-white'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-[#FF4D6D]' : 'bg-green-500'
                }`}>
                {step === 'shipping' ? '1' : <Check className="w-4 h-4" />}
              </div>
              <span className="hidden sm:inline font-medium">Shipping</span>
            </div>
            <div className="w-12 h-px bg-white/20" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-[#FF4D6D]' : 'text-white/40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-[#FF4D6D]' : 'bg-white/10'
                }`}>
                2
              </div>
              <span className="hidden sm:inline font-medium">Payment</span>
            </div>
            <div className="w-12 h-px bg-white/20" />
            <div className="flex items-center gap-2 text-white/40">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                3
              </div>
              <span className="hidden sm:inline font-medium">Confirmation</span>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Step */}
      {step === 'shipping' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => navigate('/cart')} className="text-white/60 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-display font-bold text-2xl text-white">Shipping Information</h1>
            </div>

            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.firstName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.lastName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.street}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.zipCode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isShippingValid()}
                className="w-full py-4 bg-[#FF4D6D] text-white rounded-full font-semibold hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                Continue to Payment
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white/5 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-48 overflow-auto">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.name}</p>
                      <p className="text-white/50 text-xs">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-white text-sm">${item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 mt-4 border-t border-white/10">
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>Discount</span>
                    <span>-${promoDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Tax</span>
                  <span>${tax}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Step */}
      {step === 'payment' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setStep('shipping')} className="text-white/60 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-display font-bold text-2xl text-white">Payment</h1>
            </div>

            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-5 h-5 text-[#FF4D6D]" />
                <div>
                  <p className="text-white font-medium">Shipping to</p>
                  <p className="text-white/60 text-sm">
                    {shippingInfo.firstName} {shippingInfo.lastName}, {shippingInfo.street}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    required
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Name on Card</label>
                <input
                  type="text"
                  required
                  value={paymentInfo.nameOnCard}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, nameOnCard: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    required
                    value={paymentInfo.expiry}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    required
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-white/5 rounded-lg mt-4">
                <Lock className="w-5 h-5 text-green-500" />
                <p className="text-white/60 text-sm">Your payment information is secure and encrypted</p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#FF4D6D] text-white rounded-full font-semibold hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50 mt-6"
              >
                {isProcessing ? 'Processing...' : `Pay $${total}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white/5 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-2 pt-4 border-t border-white/10">
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>Discount</span>
                    <span>-${promoDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Tax</span>
                  <span>${tax}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Step */}
      {step === 'confirmation' && orderId && (
        <div className="text-center max-w-lg mx-auto py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-4">Order Confirmed!</h1>
          <p className="text-white/60 mb-2">Thank you for your purchase.</p>
          <p className="text-white font-medium mb-8">Order #{orderId}</p>

          <div className="bg-white/5 rounded-xl p-6 mb-8 text-left">
            <p className="text-white/60 text-sm mb-4">
              We&apos;ve sent a confirmation email to <span className="text-white">{shippingInfo.email}</span>
            </p>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-[#FF4D6D]" />
              <div>
                <p className="text-white font-medium">What happens next?</p>
                <p className="text-white/60 text-sm">Your order will be authenticated within 2 business days, then shipped to you.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate(`/order/${orderId}`)}
              className="flex-1 py-4 bg-[#FF4D6D] text-white rounded-full font-semibold hover:bg-[#FF4D6D]/90 transition-colors"
            >
              Track Order
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="flex-1 py-4 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
