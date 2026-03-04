import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, X, Search, Grid3X3, List } from 'lucide-react';
import { productApi } from '@/api/consumer/productApi';
import type { Product } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const brands = ['All', 'Nike', 'Jordan', 'Adidas', 'New Balance'];
const conditions = ['All', 'Like New', 'Excellent', 'Very Good', 'Good'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

interface FilterPanelProps {
  isMobile?: boolean;
  filters: {
    brand: string;
    condition: string;
    minPrice: string;
    maxPrice: string;
    search: string;
    sortBy: string;
  };
  updateFilter: (key: string, value: string) => void;
  updateTextFilter: (key: string, value: string) => void;
  clearFilters: () => void;
}

const FilterPanel = ({ isMobile = false, filters, updateFilter, updateTextFilter, clearFilters }: FilterPanelProps) => {
  const hasActiveFilters = filters.brand !== 'All' || filters.condition !== 'All' || filters.minPrice || filters.maxPrice || filters.search;

  return (
    <div className={`space-y-6 ${isMobile ? '' : 'sticky top-24'}`}>
      {/* Search */}
      <div>
        <label className="block text-white font-medium mb-2">Search</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => updateTextFilter('search', e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <label className="block text-white font-medium mb-2">Brand</label>
        <div className="space-y-1">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => updateFilter('brand', brand)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.brand === brand
                ? 'bg-[#FF4D6D]/20 text-[#FF4D6D]'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Condition Filter */}
      <div>
        <label className="block text-white font-medium mb-2">Condition</label>
        <div className="space-y-1">
          {conditions.map((condition) => (
            <button
              key={condition}
              onClick={() => updateFilter('condition', condition)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.condition === condition
                ? 'bg-[#FF4D6D]/20 text-[#FF4D6D]'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-white font-medium mb-2">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => updateTextFilter('minPrice', e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
          />
          <span className="text-white/50">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => updateTextFilter('maxPrice', e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full mt-4 py-2 border border-[#FF4D6D] text-[#FF4D6D] rounded-lg text-sm font-medium hover:bg-[#FF4D6D] hover:text-white transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const productsRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || 'All',
    condition: 'All',
    minPrice: '',
    maxPrice: '',
    search: searchParams.get('search') || '',
    sortBy: 'newest',
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Core fetch function that accepts a specific filter state
  const fetchProductsWithFilters = async (f: typeof filters) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (f.brand !== 'All') params.brand = f.brand;
      if (f.condition !== 'All') params.condition = f.condition;
      if (f.minPrice) params.min_price = f.minPrice;
      if (f.maxPrice) params.max_price = f.maxPrice;
      if (f.search) params.search = f.search;
      if (f.sortBy) params.sort_by = f.sortBy;

      const res = await productApi.getAll(params);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProductsWithFilters(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce effect for TEXT inputs (search, minPrice, maxPrice)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Premium UX: require at least 3 characters to search (unless it's empty/cleared)
      if (filters.search.length > 0 && filters.search.length < 3) {
        return;
      }
      fetchProductsWithFilters(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search, filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    if (loading) return;
    if (productsRef.current) {
      gsap.fromTo(
        productsRef.current.querySelectorAll('.product-item'),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [loading, products]);

  // Button filters — update state and fetch immediately
  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchProductsWithFilters(newFilters);
  };

  // Text inputs — update state ONLY (the useEffect above handles the debounced fetch)
  const updateTextFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const defaultFilters = {
      brand: 'All',
      condition: 'All',
      minPrice: '',
      maxPrice: '',
      search: '',
      sortBy: 'newest',
    };
    setFilters(defaultFilters);
    fetchProductsWithFilters(defaultFilters);
  };

  const hasActiveFilters = filters.brand !== 'All' || filters.condition !== 'All' || filters.minPrice || filters.maxPrice || filters.search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl lg:text-4xl text-white mb-2">
          Shop All Sneakers
        </h1>
        <p className="text-white/60">
          {loading ? 'Loading...' : `${products.length} authentic sneakers, hand-checked by experts`}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          {/* Mobile Filter Button */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white text-sm font-medium">
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-[#FF4D6D]" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-[#111113] border-r border-white/10 p-6">
              <SheetHeader>
                <SheetTitle className="text-white">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel isMobile filters={filters} updateFilter={updateFilter} updateTextFilter={updateTextFilter} clearFilters={clearFilters} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {filters.brand !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FF4D6D]/20 text-[#FF4D6D] text-sm rounded-full">
                  {filters.brand}
                  <button onClick={() => updateFilter('brand', 'All')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.condition !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FF4D6D]/20 text-[#FF4D6D] text-sm rounded-full">
                  {filters.condition}
                  <button onClick={() => updateFilter('condition', 'All')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FF4D6D]/20 text-[#FF4D6D] text-sm rounded-full">
                  &quot;{filters.search}&quot;
                  <button onClick={() => updateFilter('search', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Sort */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="appearance-none bg-white/10 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-white text-sm focus:outline-none focus:border-[#FF4D6D]/50 cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111113]">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
          </div>

          {/* View Mode */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <FilterPanel filters={filters} updateFilter={updateFilter} updateTextFilter={updateTextFilter} clearFilters={clearFilters} />
        </aside>

        {/* Products Grid */}
        <div ref={productsRef} className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-xl bg-white/5 mb-3" />
                  <div className="h-3 bg-white/5 rounded mb-2 w-16" />
                  <div className="h-4 bg-white/5 rounded mb-2" />
                  <div className="h-4 bg-white/5 rounded w-20" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/60 text-lg">No products found</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-[#FF4D6D] font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 lg:gap-6 ${viewMode === 'grid'
              ? 'grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
              }`}>
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className={`product-item group ${viewMode === 'list' ? 'flex gap-4 p-4 bg-white/5 rounded-xl' : ''
                    }`}
                >
                  <div className={`relative overflow-hidden rounded-xl bg-white/5 ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square mb-3'
                    }`}>
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
                  </div>

                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <p className="text-white/50 text-xs uppercase tracking-wider">{product.brand}</p>
                    <h3 className="text-white font-semibold group-hover:text-[#FF4D6D] transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    {viewMode === 'list' && (
                      <p className="text-white/60 text-sm mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[#FF4D6D] font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-white/40 text-sm line-through">${product.originalPrice}</span>
                      )}
                    </div>

                    <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${product.condition === 'Like New' ? 'bg-green-500/20 text-green-400' :
                      product.condition === 'Excellent' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {product.condition}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
