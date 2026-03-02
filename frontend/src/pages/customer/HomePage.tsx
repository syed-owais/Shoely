import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { productApi } from '@/api/consumer/productApi';
import { campaignApi } from '@/api/consumer/campaignApi';
import type { Product, Campaign } from '@/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: ShieldCheck, title: 'Authenticated', description: 'Every pair verified by experts' },
  { icon: Truck, title: 'Fast Shipping', description: '3-5 day delivery nationwide' },
  { icon: RotateCcw, title: 'Easy Returns', description: '30-day return policy' },
  { icon: Award, title: 'Best Prices', description: 'Up to 40% off retail' },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const campaignsRef = useRef<HTMLDivElement>(null);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, campaignsRes] = await Promise.all([
          productApi.getFeatured(),
          campaignApi.getActive(),
        ]);
        setFeaturedProducts(productsRes.data.data || []);
        setActiveCampaigns(campaignsRes.data.data || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;

    // Hero animation
    if (heroRef.current) {
      const heroElements = heroRef.current.querySelectorAll('.hero-animate');
      gsap.fromTo(
        heroElements,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out' }
      );
    }

    // Products reveal
    if (productsRef.current) {
      const productCards = productsRef.current.querySelectorAll('.product-card');
      gsap.fromTo(
        productCards,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: productsRef.current,
            start: 'top 80%',
          },
        }
      );
    }

    // Features reveal
    if (featuresRef.current) {
      const featureItems = featuresRef.current.querySelectorAll('.feature-item');
      gsap.fromTo(
        featureItems,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 85%',
          },
        }
      );
    }

    // Campaigns reveal
    if (activeCampaigns.length > 0 && campaignsRef.current) {
      gsap.fromTo(
        campaignsRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: campaignsRef.current,
            start: 'top 85%',
          },
        }
      );
    }
  }, [loading, activeCampaigns.length]);

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/90 to-transparent z-10" />
          <img
            src="/hero_jordan1_heritage.jpg"
            alt="Featured Sneaker"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[70%] lg:w-[60%] object-contain opacity-60 lg:opacity-80"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <span className="hero-animate inline-block text-[#FF4D6D] font-semibold text-sm uppercase tracking-wider mb-4">
              Premium Pre-Loved Sneakers
            </span>
            <h1 className="hero-animate font-display font-black text-4xl sm:text-5xl lg:text-7xl text-white leading-tight mb-6">
              AUTHENTIC<br />HEAT.<br />
              <span className="text-white/60">NO MARKUP.</span>
            </h1>
            <p className="hero-animate text-white/70 text-lg lg:text-xl mb-8 max-w-lg">
              Hand-checked by experts. Shop verified Jordan, Nike, Yeezy, and more at prices that beat retail.
            </p>
            <div className="hero-animate flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[#FF4D6D] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#FF4D6D]/90 transition-colors"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
              >
                View Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <section ref={campaignsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4">
            {activeCampaigns.slice(0, 2).map((campaign) => (
              <div
                key={campaign.id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF4D6D]/20 to-[#6E2B2B]/20 border border-white/10 p-6 lg:p-8"
              >
                <div className="relative z-10">
                  <span className="inline-block bg-[#FF4D6D] text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {campaign.discountType === 'percentage' ? `${campaign.discountValue}% OFF` : `$${campaign.discountValue} OFF`}
                  </span>
                  <h3 className="font-display font-bold text-xl lg:text-2xl text-white mb-2">
                    {campaign.name}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">{campaign.description}</p>
                  <Link
                    to={`/shop${campaign.brand ? `?brand=${campaign.brand}` : ''}`}
                    className="inline-flex items-center gap-2 text-[#FF4D6D] font-semibold text-sm hover:underline"
                  >
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl lg:text-3xl text-white mb-2">
              Featured Drops
            </h2>
            <p className="text-white/60">Hand-picked heat, verified authentic</p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-2 text-[#FF4D6D] font-semibold hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-white/5 mb-3" />
                <div className="h-3 bg-white/5 rounded mb-2 w-16" />
                <div className="h-4 bg-white/5 rounded mb-2" />
                <div className="h-4 bg-white/5 rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="product-card group"
              >
                <div className="relative aspect-square rounded-xl bg-white/5 overflow-hidden mb-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.originalPrice && (
                    <span className="absolute top-2 left-2 bg-[#FF4D6D] text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                  <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${product.condition === 'Like New' ? 'bg-green-500/80' :
                      product.condition === 'Excellent' ? 'bg-blue-500/80' :
                        'bg-yellow-500/80'
                    } text-white`}>
                    {product.condition}
                  </span>
                </div>
                <p className="text-white/50 text-xs uppercase tracking-wider">{product.brand}</p>
                <h3 className="text-white font-semibold text-sm lg:text-base truncate group-hover:text-[#FF4D6D] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#FF4D6D] font-bold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-white/40 text-sm line-through">${product.originalPrice}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/shop"
          className="sm:hidden flex items-center justify-center gap-2 text-[#FF4D6D] font-semibold mt-6"
        >
          View All Products <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="feature-item text-center p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#FF4D6D]/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#FF4D6D]" />
                </div>
                <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6E2B2B] to-[#0B0B0D] p-8 lg:p-16 text-center">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-2xl lg:text-4xl text-white mb-4">
              Ready to find your grail?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Browse our collection of authenticated sneakers. New drops added weekly.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white text-[#0B0B0D] px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-colors"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
