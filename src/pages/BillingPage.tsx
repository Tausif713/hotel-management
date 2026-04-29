import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Receipt, 
  Search, 
  Filter, 
  Printer, 
  Share2, 
  Banknote,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('All Bills');
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
           <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
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
        <div className="col-span-12 lg:col-span-8 space-y-6">
           <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
                  {['All Bills', 'Paid', 'Pending'].map((t) => (
                    <button 
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-black transition-all",
                        activeTab === t ? "bg-white text-indigo-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {t}
                    </button>
                  ))}
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
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Time</th>
                       <th className="px-8 py-4"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {invoices.filter(inv => {
                      if (activeTab === 'All Bills') return true;
                      if (activeTab === 'Paid') return inv.status === 'completed';
                      if (activeTab === 'Pending') return inv.status !== 'completed';
                      return true;
                    }).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                         <td className="px-8 py-5">
                            <div className="flex flex-col">
                               <span className="text-xs font-black text-slate-900 leading-none">{inv.id}</span>
                               <span className="text-[10px] text-indigo-500 font-bold mt-1.5 uppercase tracking-widest">Table {inv.table_no}</span>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-sm font-bold text-slate-700">Customer</td>
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

        {/* Payment Processing Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="bg-[#0f172a] rounded-[2rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Receipt className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-lg font-black">Quick Pay</h3>
                    <p className="text-xs text-slate-400 font-medium">Fast check-out for tables</p>
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group/item">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600/50 flex items-center justify-center font-black">04</div>
                          <div>
                             <p className="text-sm font-black">Table 04</p>
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Bill</p>
                          </div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-500 group-hover/item:translate-x-1 transition-transform" />
                    </div>
                 </div>
                 {/* Dummy placeholders for other active tables */}
                 <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-all cursor-pointer opacity-60">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-600/50 flex items-center justify-center font-black">09</div>
                          <div>
                             <p className="text-sm font-black">Table 09</p>
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Bill</p>
                          </div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <button className="w-full py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40">
                    GENERATE TOTAL REPORT
                 </button>
                 <div className="grid grid-cols-2 gap-4">
                    <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10">
                       <Share2 className="w-4 h-4" /> E-RECEIPT
                    </button>
                    <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10">
                       <Printer className="w-4 h-4" /> BATCH PRINT
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6">Tax Summary</h3>
              <div className="space-y-4">
                 {[
                   { label: 'SGST (2.5%)', value: '₹ 1,142' },
                   { label: 'CGST (2.5%)', value: '₹ 1,142' },
                   { label: 'Service Charge', value: '₹ 560' },
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                      <span className="text-xs font-black text-slate-400 capitalize">{item.label}</span>
                      <span className="text-sm font-black text-slate-900">{item.value}</span>
                   </div>
                 ))}
                 <div className="pt-4 flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl mt-4">
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest font-mono">Total Tax Today</span>
                    <span className="text-xl font-black text-indigo-700 font-mono">₹ 2,844</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
