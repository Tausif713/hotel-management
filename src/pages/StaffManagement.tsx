import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  UserCheck,
  UserMinus,
  Edit2,
  Trash2,
  X,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';

const INITIAL_STAFF: any[] = [];

export default function StaffManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      const { data, error } = await supabase.from('app_staff').select('*');
      if (data && !error) {
        setStaff(data);
      } else {
        setStaff(INITIAL_STAFF);
      }
    };
    fetchStaff();
    const subscription = supabase.channel('staff_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_staff' }, fetchStaff)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Waiter',
    email: '',
    contact: '',
    image: '',
    pin: ''
  });

  const handleAddStaff = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      role: 'Waiter',
      email: '',
      contact: '',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      pin: ''
    });
    setIsModalOpen(true);
  };

  const handleEditStaff = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email || '',
      contact: member.contact || member.phone || '',
      image: member.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      pin: member.pin || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      name: formData.name,
      role: formData.role,
      email: formData.email,
      contact: formData.contact,
      image: formData.image,
      pin: formData.pin,
      department: 'Service',
      status: editingMember ? editingMember.status : 'Active',
      shift: 'Morning',
      join_date: editingMember ? editingMember.join_date : new Date().toLocaleDateString()
    };

    if (editingMember) {
      const { error } = await supabase.from('app_staff').update(dataToSave).eq('id', editingMember.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('app_staff').insert(dataToSave);
      if (error) alert(error.message);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this staff member?")) {
      const { error } = await supabase.from('app_staff').delete().eq('id', id);
      if (error) alert("Error deleting staff: " + error.message);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const { error } = await supabase.from('app_staff').update({ status: newStatus }).eq('id', id);
    if (error) alert("Error updating status: " + error.message);
  };

  const filteredStaff = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Directory</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage employee profiles, access levels and attendance</p>
        </div>
        <button onClick={handleAddStaff} className="px-6 py-3 bg-[#4f46e5] text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-100">
          <Plus className="w-5 h-5" />
          ADD NEW STAFF
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name..."
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.map((member) => (
          <div key={member.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
             <div className="p-8 pb-4 text-center">
                <div className="relative inline-block mb-6">
                   <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-lg mx-auto">
                      <img src={member.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'} alt={member.name} className="w-full h-full object-cover" />
                   </div>
                   <div className={cn(
                     "absolute -bottom-1 -right-1 w-8 h-8 rounded-xl border-4 border-white flex items-center justify-center text-white shadow-md",
                     member.status === 'Active' ? "bg-emerald-500" : "bg-slate-300"
                   )}>
                      {member.status === 'Active' ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                   </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-none">{member.name}</h3>
                <p className="text-[10px] text-indigo-600 font-extrabold uppercase mt-2 tracking-[0.2em]">{member.role}</p>
             </div>

             <div className="px-8 pb-8 space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                   <div className="flex items-center gap-3 text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold truncate">{member.email || 'N/A'}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-500">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{member.contact || member.phone || 'N/A'}</span>
                   </div>
                   {member.pin && (
                     <div className="flex items-center gap-3 text-indigo-500">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">PIN: {member.pin}</span>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                   <button 
                      onClick={() => toggleStatus(member.id, member.status)}
                      className={cn(
                        "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-1",
                        member.status === 'Active' ? "bg-rose-50 text-rose-500 hover:bg-rose-100" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                      )}
                   >
                      {member.status === 'Active' ? 'Deactivate' : 'Activate'}
                   </button>
                   <button onClick={() => handleEditStaff(member)} className="py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                   </button>
                   <button onClick={() => handleDelete(member.id)} className="py-2.5 bg-slate-100 text-rose-500 hover:bg-rose-50 rounded-xl flex items-center justify-center transition-all">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
      {/* Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="p-8 pb-0 flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingMember ? 'Edit Staff Member' : 'Add New Staff'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                    <X className="w-6 h-6 text-slate-400" />
                 </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Role</label>
                       <select 
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none appearance-none"
                         value={formData.role}
                         onChange={(e) => setFormData({...formData, role: e.target.value})}
                       >
                          <option value="Admin">Admin</option>
                          <option value="Chef">Chef</option>
                          <option value="Waiter">Waiter</option>
                          <option value="Cashier">Cashier</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Number</label>
                       <input 
                         type="text" 
                         required
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                         value={formData.contact}
                         onChange={(e) => setFormData({...formData, contact: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                       <input 
                         type="email" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Login PIN (4 Digits)</label>
                       <input 
                         type="text" 
                         maxLength={4}
                         placeholder="e.g. 1234"
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                         value={formData.pin}
                         onChange={(e) => setFormData({...formData, pin: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Photo URL</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                    />
                 </div>

                 <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                    {editingMember ? 'Save Changes' : 'Register Staff'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
