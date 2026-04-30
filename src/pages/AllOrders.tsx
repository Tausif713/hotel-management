import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Eye, 
  Calendar,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AllOrders() {
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase.from('app_orders').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        const formatted = data.map((o: any) => ({
          ...o,
          id: typeof o.id === 'string' ? o.id.replace(/-/g, '').substring(0, 12).toUpperCase() : o.id
        }));
        setOrders(formatted);
      }
    };
    fetchOrders();
    const subscription = supabase.channel('all_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_orders' }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Archives</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Browse and manage historical order records and audit logs</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black flex items-center gap-3 shadow-sm hover:bg-slate-50 transition-all">
              <Calendar className="w-5 h-5 text-indigo-500" />
              SELECT RANGE
           </button>
           <button className="px-6 py-3 bg-[#4f46e5] text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-100">
            <Download className="w-5 h-5" />
            EXPORT ALL
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
              {['All Orders', 'Completed', 'In Progress', 'Cancelled'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeFilter === f ? "bg-white text-indigo-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {f}
                </button>
              ))}
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Order ID / Customer..."
                  className="bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 min-w-[280px]"
                />
              </div>
              <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-transparent hover:border-indigo-100 hover:text-indigo-600 transition-all">
                <Filter className="w-5 h-5" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer / Table</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.filter(order => {
                if (activeFilter === 'All Orders') return true;
                if (activeFilter === 'Completed') return order.status === 'completed';
                if (activeFilter === 'In Progress') return order.status !== 'completed' && order.status !== 'cancelled';
                if (activeFilter === 'Cancelled') return order.status === 'cancelled';
                return true;
              }).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900">{order.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-slate-700 leading-none">Customer</span>
                       <span className="text-[10px] text-indigo-500 font-bold mt-1.5 uppercase tracking-widest">{order.table_no}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-bold text-slate-500">{new Date(order.created_at).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                      Dine-in
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-slate-900">₹{order.total_amount || 0}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                      order.status === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      order.status === 'Cancelled' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-orange-50 text-orange-600 border-orange-100"
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-2.5 bg-white rounded-xl text-slate-400 hover:text-indigo-600 border border-slate-100 shadow-sm">
                          <Eye className="w-4 h-4" />
                       </button>
                       <button className="p-2.5 bg-white rounded-xl text-slate-400 hover:text-slate-600 border border-slate-100 shadow-sm">
                          <Printer className="w-4 h-4" />
                       </button>
                       <button className="p-2.5 bg-white rounded-xl text-slate-400 hover:text-slate-600 border border-slate-100 shadow-sm">
                          <MoreVertical className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400">Showing <span className="text-slate-900">1-6</span> of <span className="text-slate-900">420</span> orders</p>
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 cursor-not-allowed">PREV</button>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm transition-all">NEXT</button>
           </div>
        </div>
      </div>
    </div>
  );
}
