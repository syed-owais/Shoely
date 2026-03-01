import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tag, 
  Megaphone, 
  LogOut, 
  Menu, 
  ChevronRight
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Promo Codes', href: '/admin/promo-codes', icon: Tag },
  { label: 'Campaigns', href: '/admin/campaigns', icon: Megaphone },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#111113] border-r border-white/10 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
            <Link to="/admin/dashboard" className="font-display font-black text-xl text-white">
              SHOELY
            </Link>
            <span className="text-xs text-white/40 uppercase tracking-wider">Admin</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-auto">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active 
                      ? 'bg-[#FF4D6D]/10 text-[#FF4D6D]' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FF4D6D]/20 flex items-center justify-center">
                <span className="text-[#FF4D6D] font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-white/50 text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-[#111113] border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-display font-black text-lg text-white">SHOELY Admin</span>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
