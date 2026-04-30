import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Calculator, 
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  UtensilsCrossed,
  X,
  Search
} from 'lucide-react';

import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function TablesBilling() {
  const [tables, setTables] = useState<any[]>([]);
  const [activeBills, setActiveBills] = useState<Record<string, number>>({});
  const [currency, setCurrency] = useState('₹');
  const [userRole] = useState(localStorage.getItem('userRole') || 'Staff');
  
  // Management State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [formData, setFormData] = useState({
    number: '',
    capacity: '4',
    location: 'Main Hall'
  });

  const isAdmin = userRole === 'Admin' || userRole === 'Super Admin';

  const fetchAllData = async () => {
    const [{ data: tablesData }, { data: ordersData }, { data: settingsData }] = await Promise.all([
      supabase.from('app_tables').select('*').order('number', { ascending: true }),
      supabase.from('app_orders').select('*').in('status', ['pending', 'cooking', 'ready', 'served']),
      supabase.from('app_settings').select('currency, tax_percent').maybeSingle()
    ]);
    
    if (tablesData) setTables(tablesData);
    if (settingsData) setCurrency(settingsData.currency || '₹');
    
    if (ordersData) {
       const billsMap: Record<string, number> = {};
       const taxPercent = settingsData?.tax_percent || 5;
       ordersData.forEach(order => {
         let orderTotal = 0;
         if (Array.isArray(order.items)) {
           order.items.forEach((item: any) => {
             orderTotal += (item.price * item.qty);
           });
         }
         const tax = Math.round(orderTotal * (taxPercent / 100));
         billsMap[order.table_no] = (billsMap[order.table_no] || 0) + orderTotal + tax;
       });
       setActiveBills(billsMap);
    }
  };

  useEffect(() => {
    fetchAllData();
    const subscription = supabase.channel('tables_hub_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_tables' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_orders' }, fetchAllData)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const handleAddTable = () => {
    if (!isAdmin) return alert("Access Denied: Admins only");
    setEditingTable(null);
    setFormData({
      number: `T${(tables.length + 1).toString().padStart(2, '0')}`,
      capacity: '4',
      location: 'Main Hall'
    });
    setIsModalOpen(true);
  };

  const handleEditTable = (table: any) => {
    if (!isAdmin) return;
    setEditingTable(table);
    setFormData({
      number: table.number,
      capacity: table.capacity.toString(),
      location: table.location || 'Main Hall'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const dataToSave = {
      number: formData.number,
      capacity: parseInt(formData.capacity),
      location: formData.location
    };

    if (editingTable) {
      const { error } = await supabase.from('app_tables').update(dataToSave).eq('id', editingTable.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('app_tables').insert(dataToSave);
      if (error) alert(error.message);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    const { error } = await supabase.from('app_tables').delete().eq('id', id);
    if (error) alert(error.message);
    setDeleteConfirmId(null);
  };

  const filteredTables = tables.filter(t => {
    const matchesFilter = filter === 'All' || t.status === filter;
    const matchesSearch = t.number.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tables Hub</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage restaurant layout and track live billing status</p>
        </div>
        <div className="flex gap-4">
           {isAdmin && (
             <button onClick={handleAddTable} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
               <Plus className="w-5 h-5" />
               ADD TABLE
             </button>
           )}
           <Link to="/counter" className="px-6 py-3 bg-[#4f46e5] text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-100">
            <Calculator className="w-5 h-5" />
            LIVE COUNTER
          </Link>
        </div>
      </div>

      {/* Stats Quick Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Tables', value: tables.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Occupied', value: tables.filter(t => t.status === 'occupied').length, icon: UtensilsCrossed, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Reserved', value: tables.filter(t => t.status === 'reserved').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Available', value: tables.filter(t => t.status === 'free').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
             <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
          {['All', 'occupied', 'reserved', 'free'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black transition-all capitalize",
                filter === f ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search table number..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 min-w-[280px]" 
           />
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredTables.map((table) => (
          <div key={table.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
             
             {/* Admin Actions Overlay */}
             {isAdmin && (
               <div className="absolute top-6 right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditTable(table)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirmId(table.id)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
               </div>
             )}

             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg transition-all",
                     table.status === 'free' ? "bg-slate-50 text-slate-400 border border-slate-100 shadow-none" : "bg-slate-900 text-white"
                   )}>
                      {table.number}
                   </div>
                   <div>
                      <div className={cn(
                        "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block",
                        table.status === 'free' ? "bg-emerald-50 text-emerald-600" : 
                        table.status === 'occupied' ? "bg-orange-50 text-orange-600" : "bg-indigo-50 text-indigo-600"
                      )}>
                        {table.status}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{table.capacity} Seats • {table.location}</p>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Bill</span>
                   <div className="text-right">
                      <span className="text-2xl font-black text-slate-900">{currency} {activeBills[table.number] || 0}</span>
                      {activeBills[table.number] > 0 && <p className="text-[8px] text-orange-500 font-black uppercase tracking-tighter mt-0.5 animate-pulse">Payment Pending</p>}
                   </div>
                </div>

                <div className="pt-4 space-y-3">
                   <Link 
                      to={`/counter?table=${table.number}`}
                      className={cn(
                      "w-full py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                      table.status === 'free' ? "bg-slate-50 text-slate-300 border border-slate-100" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95"
                    )}>
                      <Calculator className="w-4 h-4" />
                      VIEW BILLING
                   </Link>
                   <Link to={`/customer/table/${table.number}`} className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group/link">
                      <Plus className="w-4 h-4 text-slate-300 group-hover/link:text-indigo-600 transition-colors" />
                      ADD ORDER
                   </Link>
                </div>
             </div>
          </div>
        ))}

        {isAdmin && (
          <div onClick={handleAddTable} className="bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20 transition-all min-h-[420px]">
             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-100 transition-all duration-300">
                <Plus className="w-8 h-8" />
             </div>
             <p className="mt-4 text-xs font-black text-slate-500 uppercase tracking-widest">Register New Table</p>
          </div>
        )}
      </div>

      {/* Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="p-8 pb-0 flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingTable ? 'Edit Table' : 'Add New Table'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                    <X className="w-6 h-6 text-slate-400" />
                 </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Table Number</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                      value={formData.number}
                      onChange={(e) => setFormData({...formData, number: e.target.value})}
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Capacity</label>
                    <input 
                      type="number" 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Location</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none appearance-none"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    >
                       <option value="Main Hall">Main Hall</option>
                       <option value="Rooftop">Rooftop</option>
                       <option value="Garden">Garden</option>
                       <option value="VIP Cabin">VIP Cabin</option>
                    </select>
                 </div>

                 <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                    {editingTable ? 'Save Changes' : 'Create Table'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 p-8 text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Trash2 className="w-10 h-10 text-rose-500" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Delete Table?</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">Are you sure you want to remove this table?</p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                 <button onClick={() => setDeleteConfirmId(null)} className="py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">CANCEL</button>
                 <button onClick={() => handleDelete(deleteConfirmId)} className="py-3.5 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-100">DELETE</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

