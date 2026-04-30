import { useState, useEffect } from 'react';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';

export default function TopHeader() {
  const [hotelSettings, setHotelSettings] = useState<{ name: string; logo: string }>({
    name: 'GrandHotel',
    logo: ''
  });
  const userRole = localStorage.getItem('userRole') || 'Admin';

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

  return (
    <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
          Live System
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative group w-80 hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search analytics, orders, staff..."
            className="w-full bg-white border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-200 outline-none transition-all shadow-sm"
          />
        </div>
        
        <button className="relative p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm group">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">3</span>
        </button>
        
        <div className="h-10 w-px bg-slate-100 mx-2" />

        <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all cursor-pointer group">
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform">
            {hotelSettings.logo ? (
              <img src={hotelSettings.logo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Logo className="w-full h-full" />
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{userRole}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Management</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
