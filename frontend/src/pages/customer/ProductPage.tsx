import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShieldCheck, Truck, RotateCcw, Check, Minus, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import gsap from 'gsap';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, addToCart, cart } = useStore();
  const product = getProductById(id || '');
  
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.querySelectorAll('.page-animate'),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-white/60 text-lg">Product not found</p>
        <Link to="/shop" className="text-[#FF4D6D] mt-4 inline-block hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const isInCart = cart.some(item => item.productId === product.id && item.size === selectedSize);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    
    addToCart({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      quantity,
      sku: product.sku,
    });
    
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div ref={pageRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="page-animate flex items-center gap-2 mb-6">
        <Link to="/shop" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to shop
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="page-animate space-y-4">
          <div className="aspect-square rounded-2xl bg-white/5 overflow-hidden">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === idx ? 'border-[#FF4D6D]' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="page-animate space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white/50 text-sm uppercase tracking-wider mb-1">{product.brand}</p>
                <h1 className="font-display font-bold text-2xl lg:text-3xl text-white">{product.name}</h1>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-3">
              <span className="text-3xl font-bold text-[#FF4D6D]">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-white/40 line-through">${product.originalPrice}</span>
                  <span className="bg-[#FF4D6D]/20 text-[#FF4D6D] text-sm font-semibold px-2 py-1 rounded-full">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Condition & SKU */}
          <div className="flex items-center gap-4 py-4 border-y border-white/10">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                product.condition === 'Like New' ? 'bg-green-500' :
                product.condition === 'Excellent' ? 'bg-blue-500' :
                'bg-yellow-500'
              }`} />
              <span className="text-white/70 text-sm">{product.condition}</span>
            </div>
            <span className="text-white/30">|</span>
            <span className="text-white/50 text-sm">SKU: {product.sku}</span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-white font-semibold mb-2">Description</h3>
            <p className="text-white/60 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-2">Features</h3>
            <ul className="space-y-1">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-white/60 text-sm">
                  <Check className="w-4 h-4 text-[#FF4D6D]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Select Size (US)</h3>
              <button className="text-[#FF4D6D] text-sm hover:underline">Size Guide</button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {product.sizes.map((sizeInfo) => (
                <button
                  key={sizeInfo.size}
                  onClick={() => setSelectedSize(sizeInfo.size)}
                  disabled={!sizeInfo.available}
                  className={`py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedSize === sizeInfo.size
                      ? 'bg-[#FF4D6D] text-white'
                      : sizeInfo.available
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-white/5 text-white/30 cursor-not-allowed line-through'
                  }`}
                >
                  {sizeInfo.size}
                </button>
              ))}
            </div>
            {!selectedSize && (
              <p className="text-[#FF4D6D] text-sm mt-2">Please select a size</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <h3 className="text-white font-semibold mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-white font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="flex-1 py-4 px-6 bg-white text-[#0B0B0D] rounded-full font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInCart ? 'Update Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!selectedSize}
              className="flex-1 py-4 px-6 bg-[#FF4D6D] text-white rounded-full font-semibold hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <ShieldCheck className="w-6 h-6 mx-auto text-[#FF4D6D] mb-1" />
              <p className="text-white/60 text-xs">Authenticated</p>
            </div>
            <div className="text-center">
              <Truck className="w-6 h-6 mx-auto text-[#FF4D6D] mb-1" />
              <p className="text-white/60 text-xs">Fast Shipping</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 mx-auto text-[#FF4D6D] mb-1" />
              <p className="text-white/60 text-xs">Easy Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Added to Cart Toast */}
      {showAddedMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-5 h-5" />
          <div>
            <p className="font-semibold">Added to cart!</p>
            <Link to="/cart" className="text-sm underline hover:no-underline">
              View cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
