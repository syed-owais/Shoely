import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, User, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function CustomerLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { getCartCount, isAuthenticated, logout } = useStore();

  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Track Order', href: '/track-order' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex flex-col">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0B0B0D]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="font-display font-black text-xl lg:text-2xl text-white tracking-tight">
                SHOELY
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Search - Desktop */}
              <form onSubmit={handleSearch} className="hidden lg:block relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 xl:w-64 bg-white/10 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50 transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              </form>

              {/* Search Icon - Mobile */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-2 text-white/70 hover:text-white transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="top" className="bg-[#0B0B0D] border-b border-white/10">
                  <form onSubmit={handleSearch} className="relative mt-4">
                    <input
                      type="text"
                      placeholder="Search sneakers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-full pl-10 pr-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                      autoFocus
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  </form>
                </SheetContent>
              </Sheet>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-white/70 hover:text-white transition-colors">
                <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF4D6D] text-white text-xs flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-2 border-l border-white/10 pl-4 ml-2">
                  <Link to="/orders" className="p-2 text-white/70 hover:text-white transition-colors" title="My Orders">
                    <User className="w-5 h-5 lg:w-6 lg:h-6" />
                  </Link>
                  <button onClick={() => { logout(); navigate('/'); }} className="p-2 text-white/70 hover:text-[#FF4D6D] transition-colors" title="Logout">
                    <LogOut className="w-5 h-5 lg:w-6 lg:h-6" />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center border-l border-white/10 pl-4 ml-2">
                  <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                    Sign In
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B0B0D]/98 backdrop-blur-lg border-t border-white/10">
            <nav className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 lg:pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0B0D] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-block">
                <span className="font-display font-black text-xl text-white">SHOELY</span>
              </Link>
              <p className="mt-4 text-white/60 text-sm leading-relaxed">
                Premium marketplace for authenticated pre-loved sneakers.
              </p>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-semibold text-white mb-4">Shop</h4>
              <ul className="space-y-2">
                <li><Link to="/shop" className="text-white/60 hover:text-white text-sm transition-colors">All Sneakers</Link></li>
                <li><Link to="/shop?brand=Jordan" className="text-white/60 hover:text-white text-sm transition-colors">Jordan</Link></li>
                <li><Link to="/shop?brand=Nike" className="text-white/60 hover:text-white text-sm transition-colors">Nike</Link></li>
                <li><Link to="/shop?brand=Adidas" className="text-white/60 hover:text-white text-sm transition-colors">Adidas</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/track-order" className="text-white/60 hover:text-white text-sm transition-colors">Track Order</Link></li>
                <li><Link to="/" className="text-white/60 hover:text-white text-sm transition-colors">FAQ</Link></li>
                <li><Link to="/" className="text-white/60 hover:text-white text-sm transition-colors">Shipping</Link></li>
                <li><Link to="/" className="text-white/60 hover:text-white text-sm transition-colors">Returns</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2">
                <li><a href="mailto:support@shoely.com" className="text-white/60 hover:text-white text-sm transition-colors">support@shoely.com</a></li>
                <li><span className="text-white/60 text-sm">Los Angeles, CA</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">© 2026 Shoely. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/" className="text-white/40 hover:text-white text-sm transition-colors">Privacy</Link>
              <Link to="/" className="text-white/40 hover:text-white text-sm transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
