import { useState, useEffect } from 'react';
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
  Image as ImageIcon,
  Printer,
  Wifi,
  Bluetooth,
  Usb,
  Plus,
  X,
  CheckCircle2,
  RefreshCw,
  Search,
  Lock,
  Moon,
  Sun,
  Layout
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface PrinterDevice {
  id: string;
  name: string;
  type: 'WiFi' | 'Bluetooth' | 'Wired';
  connection_details: {
    ip?: string;
    port?: number;
    mac?: string;
    usb_id?: string;
  };
  status: 'online' | 'offline';
  is_default: boolean;
}

interface AppSettings {
  id: string;
  restaurant_name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  tax_percent: number;
  invoice_prefix: string;
  auto_print: boolean;
  notifications_enabled: boolean;
  order_alerts: boolean;
  stock_alerts: boolean;
  theme: 'light' | 'dark';
  compact_mode: boolean;
  admin_pin: string;
  logo_url?: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  id: 'default',
  restaurant_name: 'Grand Hotel',
  tagline: 'Premium Dining Experience',
  email: 'admin@grandhotel.com',
  phone: '+91 98765 43210',
  address: '123 Luxury Avenue, Food City',
  currency: '₹',
  tax_percent: 5.0,
  invoice_prefix: 'INV-',
  auto_print: false,
  notifications_enabled: true,
  order_alerts: true,
  stock_alerts: false,
  theme: 'light',
  compact_mode: false,
  admin_pin: '1234',
  logo_url: ''
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  // Printers State
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [showAddPrinter, setShowAddPrinter] = useState(false);
  const [newPrinter, setNewPrinter] = useState<Partial<PrinterDevice>>({
    type: 'WiFi',
    status: 'online',
    is_default: false,
    connection_details: { ip: '', port: 9100 }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('app_settings')
        .select('*')
        .single();
      
      if (settingsError && settingsError.code === 'PGRST116') {
        // No settings found, create default one in DB
        const { data: newData } = await supabase
          .from('app_settings')
          .insert([DEFAULT_SETTINGS])
          .select()
          .single();
          
        setSettings(newData || DEFAULT_SETTINGS);
      } else if (settingsData) {
        setSettings(settingsData);
      } else {
        // Fallback for any other error/empty data
        setSettings(DEFAULT_SETTINGS);
      }

      // Fetch Printers
      const { data: printersData } = await supabase
        .from('app_printers')
        .select('*')
        .order('created_at', { ascending: false });
      if (printersData) setPrinters(printersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    
    const { error } = await supabase
      .from('app_settings')
      .update(settings)
      .eq('id', settings.id);

    if (error) {
      alert('Error saving settings: ' + error.message);
    } else {
      alert('Settings successfully saved!');
    }
    setIsSaving(false);
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSetting('logo_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateSetting('logo_url', '');
  };

  const handleAddPrinter = async () => {
    if (!newPrinter.name) return alert('Please enter printer name');

    const { data, error } = await supabase
      .from('app_printers')
      .insert([newPrinter])
      .select();

    if (error) {
      alert('Error adding printer');
    } else {
      if (data) setPrinters([data[0], ...printers]);
      setShowAddPrinter(false);
      setNewPrinter({
        type: 'WiFi',
        status: 'online',
        is_default: false,
        connection_details: { ip: '', port: 9100 }
      });
    }
  };

  const deletePrinter = async (id: string) => {
    const { error } = await supabase.from('app_printers').delete().eq('id', id);
    if (!error) {
      setPrinters(printers.filter(p => p.id !== id));
    }
  };

  const tabs = [
    { id: 'general', label: 'General Info', icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck },
    { id: 'display', label: 'Appearance', icon: Globe },
    { id: 'devices', label: 'Connected Devices', icon: Smartphone },
  ];

  if (isLoading || !settings) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-bold text-sm animate-pulse uppercase tracking-widest">Loading System Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Configure your restaurant profile, system preferences and security</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-8 py-4 bg-[#4f46e5] text-white rounded-2xl text-sm font-black flex items-center gap-3 hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Navigation Tabs */}
        <div className="col-span-12 lg:col-span-4 space-y-3">
           {tabs.map((tab) => (
             <div 
               key={tab.id} 
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border group",
                 activeTab === tab.id ? "bg-white border-slate-100 shadow-sm" : "border-transparent hover:bg-slate-50"
               )}
             >
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                     activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-400 group-hover:bg-white"
                   )}>
                      <tab.icon className="w-6 h-6" />
                   </div>
                   <span className={cn(
                     "text-sm font-black",
                     activeTab === tab.id ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
                   )}>{tab.label}</span>
                </div>
                <ChevronRight className={cn(
                  "w-5 h-5 text-slate-300 transition-transform",
                  activeTab === tab.id ? "translate-x-1 opacity-100" : "opacity-0 group-hover:opacity-100"
                )} />
             </div>
           ))}

           <div className="mt-8 p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100/50">
              <h4 className="text-rose-600 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                 <Trash2 className="w-4 h-4" /> Danger Zone
              </h4>
              <p className="text-[11px] text-rose-400 font-bold leading-relaxed mb-6">
                Deleting your business data is permanent and cannot be undone. All orders and historical data will be lost.
              </p>
              <button onClick={() => { if(window.confirm('Are you sure? This will delete all your data permanently!')) { alert('Data reset initiated.') } }} className="w-full py-4 bg-white text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                 RESET ALL SYSTEM DATA
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 min-h-[600px]">
              
              {activeTab === 'general' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-6 mb-12">
                     <div className="relative group">
                        <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] border-4 border-white flex items-center justify-center relative overflow-hidden shadow-2xl shadow-slate-200/50 group cursor-pointer transition-all hover:scale-105 active:scale-95">
                           {settings.logo_url ? (
                              <img src={settings.logo_url} alt="Hotel Logo" className="w-full h-full object-cover" />
                           ) : (
                              <div className="w-24 h-24 bg-amber-400 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                                 <Settings className="w-10 h-10 text-slate-900" />
                              </div>
                           )}
                           <label className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                              <ImageIcon className="w-8 h-8 text-white mb-2" />
                              <span className="text-[10px] text-white font-black uppercase tracking-widest">Change Logo</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                           </label>
                        </div>
                        {settings.logo_url && (
                           <button 
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-all z-20 border-2 border-white"
                           >
                              <X className="w-4 h-4" />
                           </button>
                        )}
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Business Profile</h3>
                        <p className="text-sm text-slate-400 mt-1 font-medium">Update your restaurant logo and information</p>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Restaurant Name</label>
                           <input type="text" value={settings.restaurant_name} onChange={(e) => updateSetting('restaurant_name', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Tagline</label>
                           <input type="text" value={settings.tagline} onChange={(e) => updateSetting('tagline', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                           <input type="email" value={settings.email} onChange={(e) => updateSetting('email', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                           <input type="text" value={settings.phone} onChange={(e) => updateSetting('phone', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Address</label>
                        <textarea rows={3} value={settings.address} onChange={(e) => updateSetting('address', e.target.value)} className="w-full bg-slate-50 border-none rounded-3xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none resize-none" />
                     </div>

                     <div className="grid grid-cols-3 gap-6 pt-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency Symbol</label>
                           <input type="text" value={settings.currency} onChange={(e) => updateSetting('currency', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all text-center outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Percentage</label>
                           <input type="number" value={settings.tax_percent} onChange={(e) => updateSetting('tax_percent', parseFloat(e.target.value))} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all text-center outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Prefix</label>
                           <input type="text" value={settings.invoice_prefix} onChange={(e) => updateSetting('invoice_prefix', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all text-center outline-none" />
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
                   <div className="flex items-center gap-6 mb-12">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Bell className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h3>
                        <p className="text-sm text-slate-400 mt-1 font-medium">Manage how you receive alerts and system updates</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      {[
                        { key: 'notifications_enabled', title: 'Global Notifications', desc: 'Enable or disable all system alerts' },
                        { key: 'order_alerts', title: 'New Order Alerts', desc: 'Get notified when a customer places an order' },
                        { key: 'stock_alerts', title: 'Low Stock Warnings', desc: 'Alert when inventory items are running low' },
                        { key: 'auto_print', title: 'Auto-Print Bills', desc: 'Automatically trigger print job after billing' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all">
                           <div>
                              <h4 className="text-sm font-black text-slate-800">{item.title}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.desc}</p>
                           </div>
                           <div 
                              onClick={() => updateSetting(item.key as any, !settings[item.key as keyof AppSettings])}
                              className={cn(
                                "w-14 h-8 rounded-full relative cursor-pointer transition-all",
                                settings[item.key as keyof AppSettings] ? "bg-indigo-600 shadow-lg shadow-indigo-100" : "bg-slate-200"
                              )}
                           >
                              <div className={cn(
                                "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all",
                                settings[item.key as keyof AppSettings] ? "right-1" : "left-1"
                              )} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="flex items-center gap-6 mb-12">
                      <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                        <Lock className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Security & Access</h3>
                        <p className="text-sm text-slate-400 mt-1 font-medium">Protect your system with PIN and access controls</p>
                      </div>
                   </div>

                   <div className="max-w-md space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Master PIN</label>
                        <div className="relative">
                           <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                           <input 
                              type="password" 
                              maxLength={4}
                              value={settings.admin_pin} 
                              onChange={(e) => updateSetting('admin_pin', e.target.value)} 
                              placeholder="****"
                              className="w-full bg-slate-50 border-none rounded-2xl py-5 px-14 text-xl font-black tracking-[1em] focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" 
                           />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-2 ml-1 italic">This 4-digit PIN is required for administrative actions</p>
                      </div>

                      <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100">
                         <div className="flex gap-4">
                            <ShieldCheck className="w-10 h-10 text-indigo-600 shrink-0" />
                            <div>
                               <h4 className="text-sm font-black text-slate-800">Two-Factor Authentication</h4>
                               <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-2">
                                  Add an extra layer of security to your account by requiring a code from your phone.
                               </p>
                               <button className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Enable 2FA</button>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'display' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="flex items-center gap-6 mb-12">
                      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <Layout className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Appearance</h3>
                        <p className="text-sm text-slate-400 mt-1 font-medium">Customize the look and feel of your management suite</p>
                      </div>
                   </div>

                   <div className="space-y-10">
                      <div className="grid grid-cols-2 gap-6">
                         {[
                           { id: 'light', label: 'Light Mode', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50' },
                           { id: 'dark', label: 'Dark Mode', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                         ].map((t) => (
                           <div 
                              key={t.id}
                              onClick={() => updateSetting('theme', t.id)}
                              className={cn(
                                "p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all flex flex-col items-center gap-4 group",
                                settings.theme === t.id ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200"
                              )}
                           >
                              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm", settings.theme === t.id ? "bg-white text-indigo-600 shadow-md" : "bg-slate-50 text-slate-300 group-hover:bg-white")}>
                                <t.icon className="w-8 h-8" />
                              </div>
                              <span className={cn("text-xs font-black uppercase tracking-widest", settings.theme === t.id ? "text-slate-900" : "text-slate-400")}>{t.label}</span>
                           </div>
                         ))}
                      </div>

                      <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                         <div className="flex gap-6 items-center">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                               <Layout className="w-7 h-7" />
                            </div>
                            <div>
                               <h4 className="text-sm font-black text-slate-800">Compact Interface</h4>
                               <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Reduce spacing to show more data at once</p>
                            </div>
                         </div>
                         <div 
                            onClick={() => updateSetting('compact_mode', !settings.compact_mode)}
                            className={cn(
                              "w-14 h-8 rounded-full relative cursor-pointer transition-all",
                              settings.compact_mode ? "bg-indigo-600 shadow-lg shadow-indigo-100" : "bg-slate-200"
                            )}
                         >
                            <div className={cn(
                              "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all",
                              settings.compact_mode ? "right-1" : "left-1"
                            )} />
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'devices' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                        <Printer className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Printer Management</h3>
                        <p className="text-sm text-slate-400 mt-1 font-medium">Add and configure WiFi, Bluetooth and Wired printers</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowAddPrinter(true)}
                      className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      ADD PRINTER
                    </button>
                  </div>

                  {/* Printer List */}
                  <div className="space-y-4">
                    {printers.length === 0 && !isLoading && (
                      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                          <Printer className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">No printers configured yet</p>
                        <button 
                          onClick={() => setShowAddPrinter(true)}
                          className="mt-4 text-indigo-600 font-black text-xs hover:underline"
                        >
                          Click here to add your first printer
                        </button>
                      </div>
                    )}

                    {printers.map((printer) => (
                      <div key={printer.id} className="group p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
                              printer.type === 'WiFi' ? "bg-blue-50 text-blue-600" :
                              printer.type === 'Bluetooth' ? "bg-purple-50 text-purple-600" :
                              "bg-emerald-50 text-emerald-600"
                            )}>
                              {printer.type === 'WiFi' ? <Wifi className="w-6 h-6" /> : 
                               printer.type === 'Bluetooth' ? <Bluetooth className="w-6 h-6" /> : 
                               <Usb className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-slate-900">{printer.name}</h4>
                                {printer.is_default && (
                                  <span className="px-2 py-0.5 bg-indigo-600 text-[8px] text-white font-black rounded-full uppercase tracking-tighter">Default</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <span className={cn("w-1.5 h-1.5 rounded-full", printer.status === 'online' ? "bg-emerald-500" : "bg-rose-500")} />
                                  {printer.status}
                                </span>
                                <span className="text-[10px] font-bold text-slate-300">•</span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {printer.type === 'WiFi' ? `${printer.connection_details.ip}:${printer.connection_details.port}` : 
                                   printer.type === 'Bluetooth' ? printer.connection_details.mac : 
                                   `USB Device ID: ${printer.connection_details.usb_id}`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => alert('Printing test page...')}
                              className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                            >
                              Test Print
                            </button>
                            <button 
                              onClick={() => deletePrinter(printer.id)}
                              className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Add Printer Modal */}
      {showAddPrinter && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Add New Printer</h3>
                  <p className="text-sm text-slate-400 font-medium">Select connection type and configure</p>
                </div>
                <button onClick={() => setShowAddPrinter(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Type Selector */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { id: 'WiFi', icon: Wifi, label: 'WiFi/Network' },
                  { id: 'Bluetooth', icon: Bluetooth, label: 'Bluetooth' },
                  { id: 'Wired', icon: Usb, label: 'Wired/USB' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setNewPrinter({ 
                      ...newPrinter, 
                      type: t.id as any,
                      connection_details: t.id === 'WiFi' ? { ip: '', port: 9100 } : 
                                         t.id === 'Bluetooth' ? { mac: '' } : 
                                         { usb_id: 'USB001' }
                    })}
                    className={cn(
                      "flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all",
                      newPrinter.type === t.id ? "border-indigo-600 bg-indigo-50/30 text-indigo-600" : "border-slate-100 hover:border-slate-200 text-slate-400"
                    )}
                  >
                    <t.icon className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Printer Display Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Main Kitchen Printer" 
                    value={newPrinter.name || ''}
                    onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" 
                  />
                </div>

                {newPrinter.type === 'WiFi' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IP Address</label>
                      <input 
                        type="text" 
                        placeholder="192.168.1.100" 
                        value={newPrinter.connection_details?.ip || ''}
                        onChange={(e) => setNewPrinter({ 
                          ...newPrinter, 
                          connection_details: { ...newPrinter.connection_details, ip: e.target.value } 
                        })}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Port</label>
                      <input 
                        type="number" 
                        placeholder="9100" 
                        value={newPrinter.connection_details?.port || 9100}
                        onChange={(e) => setNewPrinter({ 
                          ...newPrinter, 
                          connection_details: { ...newPrinter.connection_details, port: parseInt(e.target.value) } 
                        })}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" 
                      />
                    </div>
                  </div>
                )}

                {newPrinter.type === 'Bluetooth' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MAC Address / Device Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="00:11:22:33:44:55" 
                        value={newPrinter.connection_details?.mac || ''}
                        onChange={(e) => setNewPrinter({ 
                          ...newPrinter, 
                          connection_details: { ...newPrinter.connection_details, mac: e.target.value } 
                        })}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 pr-12 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" 
                      />
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 hover:scale-110 transition-transform">
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {newPrinter.type === 'Wired' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">USB Port / Device ID</label>
                    <select 
                      value={newPrinter.connection_details?.usb_id || 'USB001'}
                      onChange={(e) => setNewPrinter({ 
                        ...newPrinter, 
                        connection_details: { ...newPrinter.connection_details, usb_id: e.target.value } 
                      })}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none appearance-none"
                    >
                      <option value="USB001">USB Printer Port 1 (Standard)</option>
                      <option value="USB002">USB Printer Port 2</option>
                      <option value="LPT1">Parallel Port (LPT1)</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between py-4 px-2 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <CheckCircle2 className={cn("w-5 h-5", newPrinter.is_default ? "text-indigo-600" : "text-slate-200")} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-slate-800">Set as Default</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Primary printer for all bills</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setNewPrinter({ ...newPrinter, is_default: !newPrinter.is_default })}
                    className={cn(
                      "w-12 h-7 rounded-full relative cursor-pointer transition-all",
                      newPrinter.is_default ? "bg-indigo-600 shadow-lg shadow-indigo-100" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all",
                      newPrinter.is_default ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button 
                  onClick={() => setShowAddPrinter(false)}
                  className="py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddPrinter}
                  className="py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                  Save Printer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
