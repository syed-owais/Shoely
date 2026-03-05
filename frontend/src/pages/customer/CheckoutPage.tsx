import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Truck, ShieldCheck, Lock, Banknote } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { orderApi } from '@/api/consumer/orderApi';

// ── Input masking helpers ──────────────────────────────────────
function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 7)}-${d.slice(7)}`;
}

function maskCard(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 16);
  return d.replace(/(.{4})/g, '$1 ').trim();
}

function maskExpiry(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function maskCvv(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 4);
}

function maskZip(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 5);
}

function onlyLetters(raw: string): string {
  return raw.replace(/[^a-zA-Z\s]/g, '');
}

// ── Inline validators ──────────────────────────────────────────
type FieldErrors = Record<string, string>;

function validateShipping(info: typeof defaultShipping, touched: Set<string>): FieldErrors {
  const e: FieldErrors = {};
  if (touched.has('firstName') && !info.firstName.trim()) e.firstName = 'First name is required';
  if (touched.has('lastName') && !info.lastName.trim()) e.lastName = 'Last name is required';
  if (touched.has('email')) {
    if (!info.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) e.email = 'Enter a valid email';
  }
  if (touched.has('phone')) {
    const digits = info.phone.replace(/\D/g, '');
    if (!digits) e.phone = 'Phone is required';
    else if (digits.length < 10) e.phone = 'Enter at least 10 digits';
  }
  if (touched.has('street') && !info.street.trim()) e.street = 'Street address is required';
  if (touched.has('city') && !info.city.trim()) e.city = 'City is required';
  if (touched.has('state') && !info.state.trim()) e.state = 'State / Province is required';
  if (touched.has('zipCode')) {
    if (!info.zipCode.trim()) e.zipCode = 'ZIP code is required';
    else if (info.zipCode.replace(/\D/g, '').length < 5) e.zipCode = 'Enter a valid 5-digit code';
  }
  return e;
}

function validatePayment(info: typeof defaultPayment, method: string, touched: Set<string>): FieldErrors {
  const e: FieldErrors = {};
  if (method !== 'credit_card') return e;
  if (touched.has('cardNumber')) {
    const digits = info.cardNumber.replace(/\D/g, '');
    if (!digits) e.cardNumber = 'Card number is required';
    else if (digits.length < 16) e.cardNumber = 'Enter 16 digits';
  }
  if (touched.has('nameOnCard')) {
    if (!info.nameOnCard.trim()) e.nameOnCard = 'Name on card is required';
    else if (info.nameOnCard.trim().length < 3) e.nameOnCard = 'Enter full name';
  }
  if (touched.has('expiry')) {
    const d = info.expiry.replace(/\D/g, '');
    if (!d) e.expiry = 'Expiry date is required';
    else if (d.length < 4) e.expiry = 'Enter MM/YY';
    else {
      const month = parseInt(d.slice(0, 2), 10);
      if (month < 1 || month > 12) e.expiry = 'Invalid month';
    }
  }
  if (touched.has('cvv')) {
    const d = info.cvv.replace(/\D/g, '');
    if (!d) e.cvv = 'CVV is required';
    else if (d.length < 3) e.cvv = 'Enter 3-4 digits';
  }
  return e;
}

// ── Defaults ───────────────────────────────────────────────────
const defaultShipping = {
  firstName: '', lastName: '', email: '', phone: '',
  street: '', city: '', state: '', zipCode: '', country: 'PK',
};

const defaultPayment = {
  cardNumber: '', expiry: '', cvv: '', nameOnCard: '',
};

// ── Error display component ────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-400 text-xs mt-1">{msg}</p>;
}

// ── Main Component ─────────────────────────────────────────────
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

  const [shippingInfo, setShippingInfo] = useState({ ...defaultShipping });
  const [paymentInfo, setPaymentInfo] = useState({ ...defaultPayment });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'credit_card'>('cod');

  const [shippingTouched, setShippingTouched] = useState<Set<string>>(new Set());
  const [paymentTouched, setPaymentTouched] = useState<Set<string>>(new Set());

  const shippingErrors = validateShipping(shippingInfo, shippingTouched);
  const paymentErrors = validatePayment(paymentInfo, paymentMethod, paymentTouched);

  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 ? 0 : 250;
  const tax = 0;
  const total = subtotal + shipping + tax - promoDiscount;

  if (cart.length === 0 && step !== 'confirmation') {
    navigate('/cart');
    return null;
  }

  const touchShipping = (field: string) => {
    setShippingTouched(prev => new Set(prev).add(field));
  };

  const touchPayment = (field: string) => {
    setPaymentTouched(prev => new Set(prev).add(field));
  };

  const updateShipping = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const isShippingValid = () => {
    const all = new Set(['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'zipCode']);
    const errs = validateShipping(shippingInfo, all);
    return Object.keys(errs).length === 0;
  };

  const isPaymentValid = () => {
    if (paymentMethod === 'cod') return true;
    const all = new Set(['cardNumber', 'nameOnCard', 'expiry', 'cvv']);
    const errs = validatePayment(paymentInfo, paymentMethod, all);
    return Object.keys(errs).length === 0;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all fields to show errors
    setShippingTouched(new Set(['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'zipCode']));
    if (!isShippingValid()) return;
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'credit_card') {
      setPaymentTouched(new Set(['cardNumber', 'nameOnCard', 'expiry', 'cvv']));
      if (!isPaymentValid()) return;
    }
    setIsProcessing(true);
    setError('');

    try {
      const res = await orderApi.checkout({
        email: shippingInfo.email,
        first_name: shippingInfo.firstName,
        last_name: shippingInfo.lastName,
        phone: shippingInfo.phone.replace(/\D/g, ''),
        address: shippingInfo.street,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zip_code: shippingInfo.zipCode,
        country: shippingInfo.country,
        payment_method: paymentMethod,
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

  // ── Shared input class ───────────────────────────────────────
  const inputCls = (hasError: boolean) =>
    `w-full bg-white/10 border rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none transition-colors ${hasError ? 'border-red-500/60 focus:border-red-400' : 'border-white/10 focus:border-[#FF4D6D]/50'
    }`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress */}
      {step !== 'confirmation' && (
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-[#FF4D6D]' : 'text-white'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-[#FF4D6D]' : 'bg-green-500'}`}>
                {step === 'shipping' ? '1' : <Check className="w-4 h-4" />}
              </div>
              <span className="hidden sm:inline font-medium">Shipping</span>
            </div>
            <div className="w-12 h-px bg-white/20" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-[#FF4D6D]' : 'text-white/40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-[#FF4D6D]' : 'bg-white/10'}`}>
                2
              </div>
              <span className="hidden sm:inline font-medium">Payment</span>
            </div>
            <div className="w-12 h-px bg-white/20" />
            <div className="flex items-center gap-2 text-white/40">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">3</div>
              <span className="hidden sm:inline font-medium">Confirmation</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Shipping Step ─────────────────────────────────────── */}
      {step === 'shipping' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => navigate('/cart')} className="text-white/60 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-display font-bold text-2xl text-white">Shipping Information</h1>
            </div>

            <form onSubmit={handleShippingSubmit} className="space-y-4" noValidate>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">First Name</label>
                  <input
                    type="text"
                    value={shippingInfo.firstName}
                    onChange={(e) => updateShipping('firstName', onlyLetters(e.target.value))}
                    onBlur={() => touchShipping('firstName')}
                    placeholder="John"
                    className={inputCls(!!shippingErrors.firstName)}
                  />
                  <FieldError msg={shippingErrors.firstName} />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Last Name</label>
                  <input
                    type="text"
                    value={shippingInfo.lastName}
                    onChange={(e) => updateShipping('lastName', onlyLetters(e.target.value))}
                    onBlur={() => touchShipping('lastName')}
                    placeholder="Doe"
                    className={inputCls(!!shippingErrors.lastName)}
                  />
                  <FieldError msg={shippingErrors.lastName} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => updateShipping('email', e.target.value)}
                    onBlur={() => touchShipping('email')}
                    placeholder="john@example.com"
                    className={inputCls(!!shippingErrors.email)}
                  />
                  <FieldError msg={shippingErrors.email} />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Phone</label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => updateShipping('phone', maskPhone(e.target.value))}
                    onBlur={() => touchShipping('phone')}
                    placeholder="0300-123-4567"
                    className={inputCls(!!shippingErrors.phone)}
                  />
                  <FieldError msg={shippingErrors.phone} />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Street Address</label>
                <input
                  type="text"
                  value={shippingInfo.street}
                  onChange={(e) => updateShipping('street', e.target.value)}
                  onBlur={() => touchShipping('street')}
                  placeholder="House #, Street, Area"
                  className={inputCls(!!shippingErrors.street)}
                />
                <FieldError msg={shippingErrors.street} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">City</label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => updateShipping('city', onlyLetters(e.target.value))}
                    onBlur={() => touchShipping('city')}
                    placeholder="Karachi"
                    className={inputCls(!!shippingErrors.city)}
                  />
                  <FieldError msg={shippingErrors.city} />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">State / Province</label>
                  <input
                    type="text"
                    value={shippingInfo.state}
                    onChange={(e) => updateShipping('state', onlyLetters(e.target.value))}
                    onBlur={() => touchShipping('state')}
                    placeholder="Sindh"
                    className={inputCls(!!shippingErrors.state)}
                  />
                  <FieldError msg={shippingErrors.state} />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={shippingInfo.zipCode}
                    onChange={(e) => updateShipping('zipCode', maskZip(e.target.value))}
                    onBlur={() => touchShipping('zipCode')}
                    placeholder="75500"
                    className={inputCls(!!shippingErrors.zipCode)}
                  />
                  <FieldError msg={shippingErrors.zipCode} />
                </div>
              </div>

              <button
                type="submit"
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
                    <p className="text-white text-sm">PKR {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 mt-4 border-t border-white/10">
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Subtotal</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `PKR ${shipping}`}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>Discount</span>
                    <span>-PKR {promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Payment Step ──────────────────────────────────────── */}
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
              <div className="flex items-center gap-3">
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

            {/* Payment Method Selector */}
            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-3 font-medium">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cod'
                      ? 'border-[#FF4D6D] bg-[#FF4D6D]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                >
                  <Banknote className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-[#FF4D6D]' : 'text-white/50'}`} />
                  <div className="text-left">
                    <p className={`font-medium text-sm ${paymentMethod === 'cod' ? 'text-white' : 'text-white/70'}`}>Cash on Delivery</p>
                    <p className="text-white/40 text-xs">Pay when you receive</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'credit_card'
                      ? 'border-[#FF4D6D] bg-[#FF4D6D]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                >
                  <CreditCard className={`w-6 h-6 ${paymentMethod === 'credit_card' ? 'text-[#FF4D6D]' : 'text-white/50'}`} />
                  <div className="text-left">
                    <p className={`font-medium text-sm ${paymentMethod === 'credit_card' ? 'text-white' : 'text-white/70'}`}>Credit / Debit Card</p>
                    <p className="text-white/40 text-xs">Pay securely online</p>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4" noValidate>
              {/* Card fields — only visible for card payment */}
              {paymentMethod === 'credit_card' && (
                <>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: maskCard(e.target.value) })}
                        onBlur={() => touchPayment('cardNumber')}
                        className={`${inputCls(!!paymentErrors.cardNumber)} pl-12`}
                      />
                    </div>
                    <FieldError msg={paymentErrors.cardNumber} />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-1">Name on Card</label>
                    <input
                      type="text"
                      placeholder="Full name as on card"
                      value={paymentInfo.nameOnCard}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, nameOnCard: onlyLetters(e.target.value) })}
                      onBlur={() => touchPayment('nameOnCard')}
                      className={inputCls(!!paymentErrors.nameOnCard)}
                    />
                    <FieldError msg={paymentErrors.nameOnCard} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentInfo.expiry}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: maskExpiry(e.target.value) })}
                        onBlur={() => touchPayment('expiry')}
                        className={inputCls(!!paymentErrors.expiry)}
                      />
                      <FieldError msg={paymentErrors.expiry} />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: maskCvv(e.target.value) })}
                        onBlur={() => touchPayment('cvv')}
                        className={inputCls(!!paymentErrors.cvv)}
                      />
                      <FieldError msg={paymentErrors.cvv} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-white/5 rounded-lg mt-2">
                    <Lock className="w-5 h-5 text-green-500" />
                    <p className="text-white/60 text-sm">Your payment information is secure and encrypted</p>
                  </div>
                </>
              )}

              {paymentMethod === 'cod' && (
                <div className="flex items-center gap-3 p-5 bg-white/5 rounded-xl border border-white/10">
                  <Banknote className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Pay with Cash on Delivery</p>
                    <p className="text-white/50 text-sm">You will pay <span className="text-white font-semibold">PKR {total.toLocaleString()}</span> when your order is delivered.</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#FF4D6D] text-white rounded-full font-semibold hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50 mt-6"
              >
                {isProcessing
                  ? 'Processing...'
                  : paymentMethod === 'cod'
                    ? `Place Order — PKR ${total.toLocaleString()}`
                    : `Pay PKR ${total.toLocaleString()}`}
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
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `PKR ${shipping}`}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>Discount</span>
                    <span>-PKR {promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirmation Step ─────────────────────────────────── */}
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
                <p className="text-white/60 text-sm">
                  {paymentMethod === 'cod'
                    ? 'Your order will be processed and shipped. Pay with cash when it arrives.'
                    : 'Your order will be authenticated within 2 business days, then shipped to you.'}
                </p>
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
