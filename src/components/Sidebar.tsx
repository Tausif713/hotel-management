import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  TableProperties as TableIcon, 
  QrCode, 
  ShoppingCart, 
  ChefHat, 
  Calculator, 
  Receipt, 
  ClipboardList, 
  History, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: TableIcon, label: 'Table Management', path: '/tables-grid' },
  { icon: QrCode, label: 'QR Code', path: '/qr' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders-live' },
  { icon: ChefHat, label: 'Kitchen Panel', path: '/kitchen' },
  { icon: Calculator, label: 'Counter Panel', path: '/counter' },
  { icon: Receipt, label: 'Billing', path: '/billing' },
  { icon: ClipboardList, label: 'All Orders', path: '/orders' },
  { icon: History, label: 'Table Billing', path: '/tables' },
  { icon: Users, label: 'Staff Management', path: '/staff' },
  { icon: BookOpen, label: 'Menu Management', path: '/menu' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'Admin';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (userRole === 'Admin') return true;
    if (userRole === 'Chef') return ['Kitchen Panel', 'Orders'].includes(item.label);
    if (userRole === 'Waiter') return ['Counter Panel', 'Table Management', 'Orders'].includes(item.label);
    if (userRole === 'Cashier') return ['Counter Panel', 'Billing', 'All Orders', 'Table Billing'].includes(item.label);
    return false;
  });

  return (
    <aside className="w-[280px] h-screen bg-[#0f172a] text-slate-300 flex flex-col z-50 sticky top-0 overflow-hidden border-r border-white/5">
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20 flex-shrink-0">
             {/* Custom Cloche SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V2" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"/>
              <path d="M21 16C21 11.0294 16.9706 7 12 7C7.02944 7 3 11.0294 3 16H21Z" fill="#0f172a" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M21 16H3V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V16Z" fill="#0f172a" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-white leading-tight tracking-tight truncate">Hotel Management</h1>
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
