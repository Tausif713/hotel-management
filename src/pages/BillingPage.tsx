import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Receipt, 
  Search, 
  Filter, 
  Printer, 
  Banknote,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase.from('app_orders').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        setInvoices(data);
      }
    };
    fetchInvoices();
    const subscription = supabase.channel('billing_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_orders' }, fetchInvoices)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage payments, generate receipts, and track financial history</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => window.print()} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Printer className="w-5 h-5 opacity-50" />
            PRINT DAY REPORT
          </button>
          <Link to="/counter" className="px-6 py-3 bg-[#4f46e5] text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-100">
            <Receipt className="w-5 h-5" />
            NEW TRANSACTION
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `₹ ${invoices.filter(i => i.status === 'completed').reduce((sum, i) => sum + (i.total_amount || 0), 0)}`, trend: 'Active', color: 'from-indigo-600 to-purple-600' },
          { label: 'Paid Bills', value: invoices.filter(i => i.status === 'completed').length.toString(), trend: 'Active', color: 'from-emerald-600 to-teal-600' },
          { label: 'Pending Amount', value: `₹ ${invoices.filter(i => i.status !== 'completed').reduce((sum, i) => sum + (i.total_amount || 0), 0)}`, trend: 'Active', color: 'from-orange-600 to-amber-600' },
          { label: 'Refunds', value: '₹ 0', trend: 'N/A', color: 'from-rose-600 to-pink-600' },
        ].map((card, i) => (
          <div key={i} className={cn("p-6 rounded-[2rem] text-white relative overflow-hidden group shadow-lg", card.color)}>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-700" />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 relative z-10">{card.label}</p>
             <h3 className="text-3xl font-black relative z-10">{card.value}</h3>
              <div className="mt-4 flex items-center gap-2 relative z-10">
                 <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-md">{card.trend}</span>
              </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 space-y-6">
           <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-800">Completed Invoices</h2>
                </div>
                <div className="flex items-center gap-3">
                   <div className="relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                     <input 
                       type="text" 
                       placeholder="Bill ID / Customer..."
                       className="bg-slate-50 border-none rounded-2xl py-2.5 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 min-w-[240px]"
                     />
                   </div>
                   <button className="p-2.5 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 border border-transparent hover:border-indigo-100 transition-all">
                     <Filter className="w-4 h-4" />
                   </button>
                </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Table</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Time</th>
                       <th className="px-8 py-4"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {invoices.filter(inv => inv.status === 'completed').map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                         <td className="px-8 py-5">
                            <div className="flex flex-col">
                               <span className="text-xs font-black text-slate-900 leading-none">INV-{inv.id.split('-')[0].toUpperCase()}</span>
                               <span className="text-[10px] text-indigo-500 font-bold mt-1.5 uppercase tracking-widest">Table {inv.table_no}</span>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex flex-col gap-1 max-w-[200px]">
                              {Array.isArray(inv.items) ? inv.items.map((item: any, idx: number) => (
                                <span key={idx} className="text-[10px] font-bold text-slate-500 truncate">
                                  {item.qty}x {item.name}
                                </span>
                              )) : <span className="text-[10px] text-slate-400">No items</span>}
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-slate-500">
                               <Banknote className="w-3.5 h-3.5" />
                               <span className="text-[10px] font-black uppercase tracking-wider">Cash</span>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-sm font-black text-slate-900">₹ {inv.total_amount || 0}</td>
                         <td className="px-8 py-5">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                              inv.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                            )}>
                              {inv.status}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-[10px] font-bold text-slate-400">{new Date(inv.created_at).toLocaleString()}</td>
                         <td className="px-8 py-5 text-right">
                            <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                               <MoreVertical className="w-5 h-5" />
                            </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
