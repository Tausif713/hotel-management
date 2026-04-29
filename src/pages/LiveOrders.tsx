import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  History, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  ChefHat, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const statusStyles: any = {
  'New': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'In Kitchen': 'bg-orange-50 text-orange-600 border-orange-100',
  'Preparing': 'bg-blue-50 text-blue-600 border-blue-100',
  'Ready': 'bg-purple-50 text-purple-600 border-purple-100',
  'Completed': 'bg-slate-50 text-slate-500 border-slate-100',
};

export default function LiveOrders() {
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [liveOrders, setLiveOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('app_orders')
        .select('*')
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });
        
      if (data && !error) {
        const formatted = data.map((o: any) => ({
          id: o.id.substring(0, 8),
          table: o.table_no,
          status: o.status,
          time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          items: o.items || [],
          amount: o.total_amount
        }));
        setLiveOrders(formatted);
      } else {
        // Fallback to local storage if Supabase fails or not configured
        const stored = JSON.parse(localStorage.getItem('restaurant_orders') || '[]');
        setLiveOrders(stored.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled'));
      }
    };
    
    fetchOrders();
    const subscription = supabase.channel('live_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_orders' }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live Orders Tracking</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Monitor real-time food preparation and delivery status</p>
        </div>
        <div className="flex gap-4">
           <Link to="/orders" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <History className="w-5 h-5 opacity-50" />
            ORDER HISTORY
          </Link>
          <Link to="/kitchen" className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            <ChefHat className="w-5 h-5" />
            KITCHEN VIEW
          </Link>
        </div>
      </div>

      {/* Analytics Mini-Stats */}
      <div className="grid grid-cols-5 gap-6">
         {[
           { label: 'Active', value: '12', color: 'text-indigo-600', icon: AlertCircle },
           { label: 'New', value: '3', color: 'text-emerald-500', icon: Clock },
           { label: 'Kitchen', value: '5', color: 'text-orange-500', icon: ChefHat },
           { label: 'Ready', value: '2', color: 'text-purple-500', icon: CheckCircle2 },
           { label: 'Avg Time', value: '18m', color: 'text-slate-500', icon: Clock },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center", stat.color)}>
                 <stat.icon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 tracking-widest leading-none">{stat.label}</p>
                 <p className="text-lg font-black text-slate-900 mt-1">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Main List Area */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-[1.25rem]">
              {['All Orders', 'Kitchen', 'Ready', 'Dispatch'].map((f) => (
                <button 
                  key={f} 
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black transition-all",
                    activeFilter === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                  )}
                >
                  {f}
                </button>
              ))}
           </div>
           <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Order ID / Table..."
                  className="bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 min-w-[240px]"
                />
              </div>
              <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 border border-transparent hover:border-indigo-100 transition-all">
                <Filter className="w-5 h-5" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Location</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {liveOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-slate-900 leading-none">ORDER {order.id}</span>
                       <span className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">{order.time}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <MapPin className="w-3.5 h-3.5 text-slate-300" />
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{order.table}</span>
                          <span className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter mt-0.5">{order.type}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{order.items?.length || 0} Items</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900">₹{order.items?.reduce((sum: number, i: any) => sum + (i.qty * (i.price || 0)), 0)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                      statusStyles[order.status]
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Wait Time</span>
                          <div className="flex items-center gap-1.5 mt-1">
                             <Clock className={cn("w-3 h-3", order.waitTime.includes('22') ? "text-rose-500" : "text-emerald-500")} />
                             <span className={cn("text-[10px] font-black", order.waitTime.includes('22') ? "text-rose-600" : "text-emerald-600")}>{order.waitTime}</span>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-300 hover:text-indigo-600 rounded-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-slate-100">
                       <ArrowRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
