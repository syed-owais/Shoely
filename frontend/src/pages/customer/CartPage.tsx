import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag, Tag, X, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { promoCodeApi } from '@/api/consumer/promoCodeApi';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, clearCart } = useStore();

  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const discount = appliedPromo?.discount || 0;
  const total = subtotal + shipping - discount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    try {
      const res = await promoCodeApi.validate(promoCode, subtotal);
      const result = res.data;
      if (result.valid) {
        setAppliedPromo({ code: promoCode.toUpperCase(), discount: result.discount });
        setPromoError('');
        setPromoCode('');
      } else {
        setPromoError(result.message || 'Invalid promo code');
      }
    } catch (err: any) {
      setPromoError(err.response?.data?.message || 'Failed to validate promo code');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-white/30" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Your cart is empty</h1>
          <p className="text-white/60 mb-8">Looks like you haven&apos;t added any sneakers yet.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-[#FF4D6D] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#FF4D6D]/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-white">
          Shopping Cart ({cart.length})
        </h1>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-white/60 hover:text-red-400 text-sm flex items-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 p-4 bg-white/5 rounded-xl"
            >
              <Link to={`/product/${item.productId}`} className="w-24 h-24 flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white/50 text-xs uppercase">{item.brand}</p>
                    <Link
                      to={`/product/${item.productId}`}
                      className="text-white font-semibold hover:text-[#FF4D6D] transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-white/60 text-sm mt-1">Size: US {item.size}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId, item.size)}
                    className="p-2 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.size, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.size, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[#FF4D6D] font-bold">₨{item.price * item.quantity}</p>
                </div>
              </div>
            </div>
          ))}

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white/5 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-lg">Order Summary</h2>

            {/* Promo Code */}
            {!appliedPromo ? (
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50 uppercase"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    disabled={!promoCode.trim()}
                    className="px-4 py-2.5 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-red-400 text-xs mt-2">{promoError}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-400 text-sm font-medium">{appliedPromo.code}</span>
                </div>
                <button onClick={removePromo} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>₨{subtotal}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₨${shipping}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-₨{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate('/checkout', { state: { promoCode: appliedPromo?.code } })}
              className="w-full py-4 bg-[#FF4D6D] text-white rounded-full font-semibold hover:bg-[#FF4D6D]/90 transition-colors"
            >
              Proceed to Checkout
            </button>

            <p className="text-center text-white/40 text-xs">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold text-lg mb-2">Clear your cart?</h3>
            <p className="text-white/60 text-sm mb-6">
              This will remove all items from your cart. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
