import { useState } from 'react';
import { 
  Calculator, 
  History, 
  MoreVertical,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const INITIAL_TABLES: any[] = [];

export default function TablesBilling() {
  const [tables, setTables] = useState<any[]>(INITIAL_TABLES);

  const handleRegisterTable = () => {
    const newId = 'T' + (tables.length + 1).toString().padStart(2, '0');
    setTables([...tables, {
      id: newId,
      status: 'Available',
      items: 0,
      bill: '-',
      time: '-'
    }]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Table Billing Hub</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Simplified table status and quick-bill generation</p>
        </div>
        <div className="flex gap-4">
           <Link to="/orders" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <History className="w-5 h-5 opacity-50" />
            VOD HISTORY
          </Link>
          <Link to="/counter" className="px-6 py-3 bg-[#4f46e5] text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-100">
            <Calculator className="w-5 h-5" />
            GO TO COUNTER
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tables.map((table) => (
          <div key={table.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black shadow-lg">
                      {table.id}
                   </div>
                   <div className={cn(
                     "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest",
                     table.status === 'Available' ? "bg-emerald-50 text-emerald-600" : 
                     table.status === 'In Use' ? "bg-orange-50 text-orange-600" : "bg-indigo-50 text-indigo-600"
                   )}>
                      {table.status}
                   </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
             </div>

             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Total Items</p>
                      <p className="text-lg font-black text-slate-800">{table.items || '0'}</p>
                   </div>
                   <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Duration</p>
                      <p className="text-lg font-black text-slate-800">{table.time || '0m'}</p>
                   </div>
                </div>

                <div className="flex items-center justify-between px-2">
                   <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Bill</span>
                   <span className="text-2xl font-black text-slate-900">{table.bill}</span>
                </div>

                <div className="pt-4 space-y-3">
                   <button className={cn(
                     "w-full py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                     table.status === 'Available' ? "bg-indigo-50 text-indigo-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                   )}>
                      <Calculator className="w-4 h-4" />
                      QUICK BILL
                   </button>
                   <button className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                      <Plus className="w-4 h-4" />
                      ADD ORDER
                   </button>
                </div>
             </div>
          </div>
        ))}

        <div onClick={handleRegisterTable} className="bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20 transition-all min-h-[420px]">
           <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-100 transition-all duration-300">
              <Plus className="w-8 h-8" />
           </div>
           <p className="mt-4 text-xs font-black text-slate-500 uppercase tracking-widest">Register Table</p>
        </div>
      </div>
    </div>
  );
}
