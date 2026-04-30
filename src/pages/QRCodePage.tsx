import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Download, 
  Printer, 
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';



export default function QRCodePage() {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState('T01');
  const [newTableNo, setNewTableNo] = useState('');

  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase.from('app_tables').select('*').order('number', { ascending: true });
      if (data && data.length > 0 && !error) {
        setTables(data);
        setSelectedTable(data[0].number);
      } else {
        setTables([]);
      }
    };
    fetchTables();
  }, []);

  const handleCreateQR = async () => {
    if (!newTableNo) return;
    const newTableId = 'T' + newTableNo.padStart(2, '0');
    if (!tables.find(t => t.number === newTableId)) {
      const newTable = {
        number: newTableId,
        capacity: 4,
        status: 'free',
        location: 'Main Hall'
      };
      await supabase.from('app_tables').insert(newTable);
      // It will auto update via real-time ideally, but let's manually fetch for now
      const { data } = await supabase.from('app_tables').select('*').order('number', { ascending: true });
      if (data) setTables(data);
    }
    setSelectedTable(newTableId);
    setNewTableNo('');
  };

  const handleDeleteQR = async () => {
    if (!selectedTable) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete QR code for Table ${selectedTable}?`);
    if (!confirmDelete) return;

    await supabase.from('app_tables').delete().eq('number', selectedTable);
    
    // Fetch remaining
    const { data } = await supabase.from('app_tables').select('*').order('number', { ascending: true });
    if (data && data.length > 0) {
      setTables(data);
      setSelectedTable(data[0].number);
    } else {
      setTables([]);
      setSelectedTable('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">QR Menu Systems</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Generate and manage digital menu QR codes for each table</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Printer className="w-5 h-5" />
            PRINT ALL
          </button>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Table No..." 
              value={newTableNo}
              onChange={e => setNewTableNo(e.target.value)}
              className="px-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-bold w-32 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
            <button onClick={handleCreateQR} className="px-6 py-3 bg-[#4f46e5] text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-100">
              <Plus className="w-5 h-5" />
              CREATE QR SET
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main QR Designer */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center relative">
              <div className="w-full flex items-center justify-between mb-8">
                 <h3 className="text-lg font-black text-slate-900">QR Code Designer</h3>
                 {selectedTable && (
                   <button 
                     onClick={handleDeleteQR}
                     className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold"
                   >
                     <Trash2 className="w-4 h-4" />
                     Delete QR
                   </button>
                 )}
              </div>
              
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-all duration-500" />
                <div className="relative bg-white p-12 rounded-[2.5rem] border-4 border-slate-900 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                   <img 
                     src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/customer/table/' + selectedTable)}`}
                     alt={`QR Code for ${selectedTable}`} 
                     className="w-48 h-48 rounded-xl mix-blend-multiply" 
                   />
                   <div className="absolute inset-x-0 -bottom-4 flex justify-center">
                      <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                        TABLE: {selectedTable}
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-12 w-full grid grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { label: 'Primary Color', value: '#0F172A', preview: 'bg-slate-900' },
                   { label: 'Background', value: '#FFFFFF', preview: 'bg-white border' },
                   { label: 'Corner Shape', value: 'Rounded', preview: 'bg-indigo-100' },
                   { label: 'Logo Type', value: 'Resto Icon', preview: 'bg-amber-100' },
                 ].map((opt, i) => (
                   <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-indigo-200 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{opt.label}</p>
                      <div className="flex items-center gap-2">
                         <div className={cn("w-4 h-4 rounded-full", opt.preview)} />
                         <span className="text-xs font-bold text-slate-700">{opt.value}</span>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-8 flex gap-4 w-full">
                 <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100">
                    <Download className="w-5 h-5" />
                    DOWNLOAD PNG
                 </button>
                  <button 
                    onClick={() => window.open(window.location.origin + '/customer/table/' + selectedTable, '_blank')}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
                  >
                    <ExternalLink className="w-5 h-5" />
                    LIVE PREVIEW
                  </button>
              </div>
           </div>

           <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-[2rem] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                 <h3 className="text-xl font-black mb-2">QR Analytics Dashboard</h3>
                 <p className="text-indigo-100 text-sm font-medium mb-6">Track your digital menu performance across all tables</p>
                 <div className="grid grid-cols-3 gap-8">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Scans</p>
                       <p className="text-2xl font-black">24.5k</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Active QR</p>
                       <p className="text-2xl font-black">38 / 40</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Avg Time</p>
                       <p className="text-2xl font-black">42m 15s</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Table QR List */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-black text-slate-900">Assigned Tables</h3>
                 <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase">Manage</span>
              </div>
              <div className="space-y-4">
                 {tables.map((table) => (
                   <div 
                     key={table.id} 
                     onClick={() => setSelectedTable(table.number)}
                     className={cn(
                       "p-4 rounded-2xl border transition-all group cursor-pointer",
                       selectedTable === table.number ? "bg-indigo-50/50 border-indigo-200" : "bg-slate-50 border-slate-100 hover:border-indigo-200"
                     )}
                   >
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-600 group-hover:text-indigo-600 transition-colors">
                               {table.number}
                            </div>
                            <div className="w-[120px]">
                               <p className="text-sm font-black text-slate-900 leading-none truncate" title={`Table ${table.number}`}>Table {table.number}</p>
                               <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{table.capacity} Seats</p>
                            </div>
                         </div>
                         <div className={cn(
                           "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                           table.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"
                         )}>
                           {table.status}
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Total Scans</span>
                            <span className="text-xs font-black text-slate-700">{table.scans}</span>
                         </div>
                         <div className="flex gap-2">
                            <button className="p-2 bg-white rounded-lg text-slate-400 hover:text-indigo-600 hover:shadow-sm transition-all border border-slate-100">
                               <Download className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-2 bg-white rounded-lg text-slate-400 hover:text-indigo-600 hover:shadow-sm transition-all border border-slate-100">
                               <Printer className="w-3.5 h-3.5" />
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
