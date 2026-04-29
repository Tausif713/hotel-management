import { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Flame,
  MoreVertical,
  Timer,
  Utensils
} from 'lucide-react';
import { cn } from '../lib/utils';

const INITIAL_ORDERS: any[] = [];

export default function KitchenPanel() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  const moveOrder = (id: string, nextStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: nextStatus } : o));
  };

  const columns = [
    { title: 'New Orders', status: 'pending', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-100/50', border: 'border-amber-100' },
    { title: 'Cooking', status: 'cooking', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-100/50', border: 'border-rose-100' },
    { title: 'Ready', status: 'ready', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100/50', border: 'border-emerald-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kitchen Operations</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Real-time KOT management and preparation tracking</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black flex items-center gap-3 shadow-sm">
              <Timer className="w-5 h-5 text-indigo-500" />
              AVG PREP TIME: 18m
           </div>
           <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            <Timer className="w-5 h-5 opacity-50" />
            FILTER KOT
          </button>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-14rem)]">
        {columns.map((col) => (
          <div key={col.status} className="flex-1 flex flex-col bg-slate-50/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
             <div className="p-6 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-slate-50">
                <div className="flex items-center gap-3">
                   <div className={cn("p-2 rounded-xl", col.bg, col.color)}>
                      <col.icon className="w-5 h-5" />
                   </div>
                   <h3 className="font-black text-sm text-slate-900 uppercase tracking-widest">{col.title}</h3>
                </div>
                <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
                  {orders.filter(o => o.status === col.status).length}
                </span>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {orders.filter(o => o.status === col.status).map((order) => (
                  <div key={order.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all animate-in zoom-in-95 duration-300">
                     <div className={cn(
                       "px-6 py-4 flex items-center justify-between border-b border-slate-50",
                       order.priority === 'high' ? "bg-rose-50/30" : "bg-slate-50/30"
                     )}>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                              T{order.table}
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-900 leading-none">ORDER #{order.id}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                 <Clock className="w-3 h-3 text-slate-400" />
                                 <span className="text-[10px] font-bold text-slate-500">{order.time}</span>
                              </div>
                           </div>
                        </div>
                        {order.priority === 'high' && (
                           <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest animate-pulse">High Priority</span>
                        )}
                        <button className="text-slate-300 hover:text-slate-600 ml-2">
                           <MoreVertical className="w-4 h-4" />
                        </button>
                     </div>

                     <div className="p-6 space-y-4">
                        <div className="space-y-3">
                           {order.items.map((item, i) => (
                             <div key={i} className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                   <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                                      {item.qty}
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-800">{item.name}</p>
                                      {item.note && (
                                        <p className="text-[10px] text-amber-600 font-bold mt-0.5 flex items-center gap-1 italic">
                                           <AlertCircle className="w-2.5 h-2.5" />
                                           {item.note}
                                        </p>
                                      )}
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex gap-2">
                           {col.status === 'pending' && (
                             <button 
                               onClick={() => moveOrder(order.id, 'cooking')}
                               className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                             >
                               Start Cooking
                               <Flame className="w-4 h-4" />
                             </button>
                           )}
                           {col.status === 'cooking' && (
                             <button 
                               onClick={() => moveOrder(order.id, 'ready')}
                               className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                             >
                               Order Ready
                               <CheckCircle2 className="w-4 h-4" />
                             </button>
                           )}
                           {col.status === 'ready' && (
                             <div className="w-full text-center py-3 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center gap-2">
                               <Utensils className="w-4 h-4" />
                               Waiting for Service
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
                ))}

                {orders.filter(o => o.status === col.status).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 py-20 grayscale">
                     <div className={cn("p-6 rounded-[2rem] mb-4 bg-slate-100", col.color)}>
                        <col.icon className="w-12 h-12" />
                     </div>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active orders</p>
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
