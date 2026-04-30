import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  UtensilsCrossed, 
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';



export default function TableManagement() {
  const [filter, setFilter] = useState('All');
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase.from('app_tables').select('*').order('number', { ascending: true });
      if (data && data.length > 0 && !error) {
        setTables(data);
      } else {
        setTables([]);
      }
    };
    fetchTables();
    const subscription = supabase.channel('table_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_tables' }, fetchTables)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [formData, setFormData] = useState({
    number: '',
    capacity: '4',
    location: 'Main Hall'
  });

  const handleAddTable = () => {
    setEditingTable(null);
    setFormData({
      number: `T${(tables.length + 1).toString().padStart(2, '0')}`,
      capacity: '4',
      location: 'Main Hall'
    });
    setIsModalOpen(true);
  };

  const handleEditTable = (table: any) => {
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
    const dataToSave = {
      number: formData.number,
      capacity: parseInt(formData.capacity),
      location: formData.location,
      status: editingTable ? editingTable.status : 'free',
      type: editingTable ? editingTable.type : '-',
      bill_amount: editingTable ? editingTable.bill_amount : '-',
      occupied_since: editingTable ? editingTable.occupied_since : '-'
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

  const toggleTable = async (id: string) => {
    const table = tables.find(t => t.id === id);
    if (!table) return;
    const isFree = table.status === 'free';
    
    const { error } = await supabase.from('app_tables').update({
      status: isFree ? 'occupied' : 'free',
      type: isFree ? 'Dine-in' : '-',
      bill_amount: isFree ? '₹ 0' : '-',
      occupied_since: isFree ? 'Just Now' : '-'
    }).eq('id', id);

    if (error) alert("Error toggling table: " + error.message);
  };

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const updateTableStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('app_tables').update({ 
      status,
      occupied_since: status === 'free' ? '-' : 'Just Now',
      bill_amount: status === 'free' ? '-' : '₹ 0'
    }).eq('id', id);
    if (error) alert(error.message);
    setOpenMenuId(null);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('app_tables').delete().eq('id', deleteConfirmId);
    if (error) alert("Error deleting table: " + error.message);
    setDeleteConfirmId(null);
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
          { label: 'Occupied', value: tables.filter(t => t.status === 'occupied').length, color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
          { label: 'Reserved', value: tables.filter(t => t.status === 'reserved').length, color: 'bg-orange-50 text-orange-600', icon: Clock },
          { label: 'Available', value: tables.filter(t => t.status === 'free').length, color: 'bg-slate-50 text-slate-400', icon: XCircle },
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
           <input type="text" placeholder="Search tables..." className="bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 min-w-[280px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map((table) => (
          <div key={table.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={cn(
              "px-6 py-4 flex items-center justify-between",
              table.status === 'occupied' ? "bg-emerald-50/50" : 
              table.status === 'reserved' ? "bg-orange-50/50" : "bg-slate-50/50"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                  table.status === 'occupied' ? "bg-emerald-100 text-emerald-600" : 
                  table.status === 'reserved' ? "bg-orange-100 text-orange-600" : "bg-white text-slate-400 border border-slate-200"
                )}>
                  {table.number}
                </div>
                <div>
                   <h4 className="text-sm font-black text-slate-900 leading-none">Table {table.number}</h4>
                   <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">{table.capacity} Seats</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setOpenMenuId(openMenuId === table.id ? null : table.id)}
                  className="text-slate-300 hover:text-slate-600 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {openMenuId === table.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setOpenMenuId(null)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-2 border-b border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Status</p>
                      </div>
                      {[
                        { label: 'Set as Available', status: 'free', icon: CheckCircle2, color: 'text-emerald-500' },
                        { label: 'Set as Occupied', status: 'occupied', icon: UtensilsCrossed, color: 'text-orange-500' },
                        { label: 'Set as Reserved', status: 'reserved', icon: Clock, color: 'text-indigo-500' },
                      ].map((item) => (
                        <button
                          key={item.status}
                          onClick={() => updateTableStatus(table.id, item.status)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                        >
                          <item.icon className={cn("w-4 h-4", item.color)} />
                          <span className="text-xs font-bold text-slate-700">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      table.status === 'occupied' ? "bg-emerald-500" : 
                      table.status === 'reserved' ? "bg-orange-500" : "bg-slate-300"
                    )} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{table.status}</span>
                  </div>
                  {table.status !== 'free' && (
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
                  <div className="flex gap-2">
                    <button onClick={() => handleEditTable(table)} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(table.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                     onClick={() => toggleTable(table.id)}
                     className={cn(
                       "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm",
                       table.status === 'free' ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                     )}
                  >
                    {table.status === 'free' ? 'Book Table' : 'Free Table'}
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
                      placeholder="e.g. T01"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Capacity (Seats)</label>
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
              <p className="text-sm text-slate-500 mt-2 font-medium">Are you sure you want to remove this table? This action cannot be undone.</p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                 <button 
                    onClick={() => setDeleteConfirmId(null)}
                    className="py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                    CANCEL
                 </button>
                 <button 
                    onClick={confirmDelete}
                    className="py-3.5 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-100"
                 >
                    DELETE
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
