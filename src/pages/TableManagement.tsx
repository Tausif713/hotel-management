import { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  UtensilsCrossed, 
  History,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';

const INITIAL_TABLES: any[] = [];

export default function TableManagement() {
  const [filter, setFilter] = useState('All');
  const [tables, setTables] = useState(INITIAL_TABLES);

  const handleAddTable = () => {
    const newId = (tables.length + 1).toString().padStart(2, '0');
    setTables([...tables, {
      id: newId,
      status: 'Available',
      seats: 4,
      type: '-',
      billAmount: '-',
      occupiedSince: '-'
    }]);
  };

  const toggleTable = (id: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === 'Available' ? 'Occupied' : 'Available',
          type: t.status === 'Available' ? 'Dine-in' : '-',
          billAmount: t.status === 'Available' ? '₹ 0' : '-',
          occupiedSince: t.status === 'Available' ? 'Just Now' : '-'
        };
      }
      return t;
    }));
  };

  const filteredTables = tables.filter(t => filter === 'All' || t.status === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Table Management</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Real-time table status and reservation management</p>
        </div>
        <button onClick={handleAddTable} className="px-6 py-3 bg-[#4f46e5] text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-100">
          <Plus className="w-5 h-5" />
          ADD NEW TABLE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tables', value: tables.length, color: 'bg-indigo-50 text-indigo-600', icon: Users },
          { label: 'Occupied', value: tables.filter(t => t.status === 'Occupied').length, color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
          { label: 'In Use', value: tables.filter(t => t.status === 'In Use').length, color: 'bg-orange-50 text-orange-600', icon: Clock },
          { label: 'Available', value: tables.filter(t => t.status === 'Available').length, color: 'bg-slate-50 text-slate-400', icon: XCircle },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.color)}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
          {['All', 'Occupied', 'In Use', 'Available'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black transition-all",
                filter === f ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input type="text" placeholder="Search tables..." className="bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 min-w-[280px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map((table) => (
          <div key={table.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={cn(
              "px-6 py-4 flex items-center justify-between",
              table.status === 'Occupied' ? "bg-emerald-50/50" : 
              table.status === 'In Use' ? "bg-orange-50/50" : "bg-slate-50/50"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                  table.status === 'Occupied' ? "bg-emerald-100 text-emerald-600" : 
                  table.status === 'In Use' ? "bg-orange-100 text-orange-600" : "bg-white text-slate-400 border border-slate-200"
                )}>
                  {table.id}
                </div>
                <div>
                   <h4 className="text-sm font-black text-slate-900 leading-none">Table {table.id}</h4>
                   <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">{table.seats} Seats</p>
                </div>
              </div>
              <button className="text-slate-300 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      table.status === 'Occupied' ? "bg-emerald-500" : 
                      table.status === 'In Use' ? "bg-orange-500" : "bg-slate-300"
                    )} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{table.status}</span>
                  </div>
                  {table.status !== 'Available' && (
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                       <Clock className="w-3 h-3 text-slate-400" />
                       <span className="text-[10px] font-bold text-slate-600">{table.occupiedSince}</span>
                    </div>
                  )}
               </div>

               <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-2">
                     <UtensilsCrossed className="w-4 h-4 text-slate-300" />
                     <span className="text-xs font-bold text-slate-700">{table.type}</span>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Current Bill</p>
                     <p className="text-sm font-black text-slate-900">{table.billAmount}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                     onClick={() => toggleTable(table.id)}
                     className={cn(
                       "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm",
                       table.status === 'Available' ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                     )}
                  >
                    {table.status === 'Available' ? 'Book Table' : 'Free Table'}
                  </button>
                  <button className="py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    History
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
