import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  UserCheck,
  UserMinus,
  Edit2
} from 'lucide-react';
import { cn } from '../lib/utils';

const INITIAL_STAFF: any[] = [];

export default function StaffManagement() {
  const [search, setSearch] = useState('');
  const [staffList, setStaffList] = useState(INITIAL_STAFF);

  const handleAddStaff = () => {
    const newId = (staffList.length + 1).toString();
    setStaffList([...staffList, {
      id: newId,
      name: `New Staff ${newId}`,
      role: 'Staff',
      email: `staff${newId}@grandhotel.com`,
      phone: '+91 90000 00000',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'
    }]);
  };

  const toggleStatus = (id: string) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
  };

  const filteredStaff = staffList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

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
        {filteredStaff.map((staff) => (
          <div key={staff.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
             <div className="p-8 pb-4 text-center">
                <div className="relative inline-block mb-6">
                   <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-lg mx-auto">
                      <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
                   </div>
                   <div className={cn(
                     "absolute -bottom-1 -right-1 w-8 h-8 rounded-xl border-4 border-white flex items-center justify-center text-white shadow-md",
                     staff.status === 'Active' ? "bg-emerald-500" : "bg-slate-300"
                   )}>
                      {staff.status === 'Active' ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                   </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-none">{staff.name}</h3>
                <p className="text-[10px] text-indigo-600 font-extrabold uppercase mt-2 tracking-[0.2em]">{staff.role}</p>
             </div>

             <div className="px-8 pb-8 space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                   <div className="flex items-center gap-3 text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold truncate">{staff.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-500">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{staff.phone}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                   <button 
                      onClick={() => toggleStatus(staff.id)}
                      className={cn(
                        "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2",
                        staff.status === 'Active' ? "bg-rose-50 text-rose-500 hover:bg-rose-100" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                      )}
                   >
                      {staff.status === 'Active' ? 'Deactivate' : 'Activate'}
                   </button>
                   <button className="py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
