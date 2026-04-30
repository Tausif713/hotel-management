import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';
import { 
  LayoutDashboard, 
  TableProperties as TableIcon, 
  QrCode, 
  ShoppingCart, 
  ChefHat, 
  Calculator, 
  Receipt, 
  ClipboardList, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';

import { cn } from '../lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: TableIcon, label: 'Tables', path: '/tables' },
  { icon: QrCode, label: 'QR Code', path: '/qr' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders-live' },
  { icon: ChefHat, label: 'Kitchen Panel', path: '/kitchen' },
  { icon: Calculator, label: 'Counter Panel', path: '/counter' },
  { icon: Receipt, label: 'Billing', path: '/billing' },
  { icon: ClipboardList, label: 'All Orders', path: '/orders' },
  { icon: Users, label: 'Staff Management', path: '/staff' },
  { icon: BookOpen, label: 'Menu Management', path: '/menu' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];


export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'Admin';
  const [hotelSettings, setHotelSettings] = useState<{ name: string; logo: string }>({
    name: 'Hotel Management',
    logo: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('app_settings').select('restaurant_name, logo_url').single();
    if (data) {
      setHotelSettings({
        name: data.restaurant_name,
        logo: data.logo_url || ''
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (userRole === 'Admin') return true;
    if (userRole === 'Chef') return ['Kitchen Panel', 'Orders'].includes(item.label);
    if (userRole === 'Waiter') return ['Counter Panel', 'Tables', 'Orders'].includes(item.label);
    if (userRole === 'Cashier') return ['Counter Panel', 'Billing', 'All Orders', 'Tables'].includes(item.label);

    return false;
  });

  return (
    <aside className="w-[280px] h-screen bg-[#0f172a] text-slate-300 flex flex-col z-50 sticky top-0 overflow-hidden border-r border-white/5">
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden group-hover:scale-110 transition-transform duration-300">
            {hotelSettings.logo ? (
              <img src={hotelSettings.logo} alt={hotelSettings.name} className="w-full h-full object-cover" />
            ) : (
              <Logo className="w-full h-full p-1" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-white leading-tight tracking-tight truncate">{hotelSettings.name}</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] truncate mt-0.5">{userRole} Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group",
                isActive 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-900/40" 
                  : "hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-white" : "text-slate-500 group-hover:text-slate-200"
              )} />
              <span className="text-sm font-semibold tracking-wide truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / QR Section */}
      <div className="p-6 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3.5 mb-6 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold tracking-wide">Sign Out</span>
        </button>

      </div>
    </aside>
  );
}
