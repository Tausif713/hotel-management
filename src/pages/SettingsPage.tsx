import { 
  Settings, 
  Store, 
  Bell, 
  ShieldCheck, 
  Globe, 
  Smartphone,
  ChevronRight,
  Save,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Configure your restaurant profile, system preferences and security</p>
        </div>
        <button onClick={() => alert('Settings successfully saved!')} className="px-6 py-3 bg-[#4f46e5] text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-100">
          <Save className="w-5 h-5" />
          SAVE CHANGES
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Navigation Tabs */}
        <div className="col-span-12 lg:col-span-4 space-y-3">
           {[
             { id: 'general', label: 'General Info', icon: Store, active: true },
             { id: 'notifications', label: 'Notifications', icon: Bell, active: false },
             { id: 'security', label: 'Security & Access', icon: ShieldCheck, active: false },
             { id: 'display', label: 'Appearance', icon: Globe, active: false },
             { id: 'devices', label: 'Connected Devices', icon: Smartphone, active: false },
           ].map((tab, i) => (
             <div key={i} className={cn(
               "flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border group",
               tab.active ? "bg-white border-slate-100 shadow-sm" : "border-transparent hover:bg-slate-50"
             )}>
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                     tab.active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-400 group-hover:bg-white"
                   )}>
                      <tab.icon className="w-6 h-6" />
                   </div>
                   <span className={cn(
                     "text-sm font-black",
                     tab.active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
                   )}>{tab.label}</span>
                </div>
                <ChevronRight className={cn(
                  "w-5 h-5 text-slate-300",
                  tab.active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )} />
             </div>
           ))}

           <div className="mt-8 p-8 bg-rose-50 rounded-[2rem] border border-rose-100">
              <h4 className="text-rose-600 font-black text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Trash2 className="w-4 h-4" /> Danger Zone
              </h4>
              <p className="text-[10px] text-rose-400 font-bold leading-relaxed mb-6">
                Deleting your business data is permanent and cannot be undone. All orders and historical data will be lost.
              </p>
              <button onClick={() => { if(window.confirm('Are you sure? This will delete all your data permanently!')) { alert('Data reset initiated. (Simulated)') } }} className="w-full py-3 bg-white text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                 RESET ALL SYSTEM DATA
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
              <div className="flex items-center gap-6 mb-12">
                 <div className="w-24 h-24 bg-slate-50 rounded-3xl border-4 border-slate-50 flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-20 h-20 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                      <Settings className="w-10 h-10 text-slate-900" />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Business Profile</h3>
                    <p className="text-sm text-slate-400 mt-1 font-medium">Update your restaurant information displayed on bills</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Restaurant Name</label>
                       <input type="text" defaultValue="Hotel Management" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Tagline</label>
                       <input type="text" defaultValue="Restaurant System" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                       <input type="email" defaultValue="admin@grandhotel.com" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                       <input type="text" defaultValue="+91 98765 43210" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Address</label>
                    <textarea rows={3} defaultValue="123 Luxury Avenue, Gourmet Street, Food City - 400001" className="w-full bg-slate-50 border-none rounded-3xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none resize-none" />
                 </div>

                 <div className="grid grid-cols-3 gap-6 pt-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency Symbol</label>
                       <input type="text" defaultValue="₹" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all text-center outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Percentage</label>
                       <input type="text" defaultValue="5%" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all text-center outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Prefix</label>
                       <input type="text" defaultValue="INV-" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all text-center outline-none" />
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div>
                       <h4 className="text-sm font-black text-slate-800">Automatic Printing</h4>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Print bills automatically after saving orders</p>
                    </div>
                    <div className="w-14 h-8 bg-indigo-600 rounded-full relative cursor-pointer shadow-indigo-100 shadow-lg">
                       <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
