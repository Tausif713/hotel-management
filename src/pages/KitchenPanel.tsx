import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Flame,
  MoreVertical,
  Timer,
  Printer,
  Wifi,
  Bluetooth,
  Usb,
  Plus,
  X,
  Search,
  Utensils
} from 'lucide-react';

import { cn } from '../lib/utils';
import { LoadingScreen } from '../components/LoadingScreen';
import { PrintKOT } from '../components/PrintKOT';

interface PrinterDevice {
  id: string;
  name: string;
  type: 'WiFi' | 'Bluetooth' | 'Wired';
  role: 'billing' | 'kitchen';
  connection_details: {
    ip?: string;
    port?: number;
    mac?: string;
    usb_id?: string;
  };
  status: 'online' | 'offline';
  is_default: boolean;
}

export default function KitchenPanel() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [printOrder, setPrintOrder] = useState<any>(null);
  
  // Printer State
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [showAddPrinter, setShowAddPrinter] = useState(false);
  const [newPrinter, setNewPrinter] = useState<Partial<PrinterDevice>>({
    type: 'WiFi',
    role: 'kitchen',
    status: 'online',
    is_default: true,
    connection_details: { ip: '', port: 9100 }
  });

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('app_orders')
        .select('*')
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true });
        
      if (data && !error) {
        const formatted = data.map((o: any) => ({
          id: o.id.replace(/-/g, '').substring(0, 8).toUpperCase(),
          dbId: o.id,
          table: o.table_no,
          status: o.status,
          priority: o.priority,
          time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          items: o.items || []
        }));
        setOrders(formatted);
      }
    } catch (err) {
      console.error("Error fetching kitchen orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrinters = async () => {
    const { data } = await supabase
      .from('app_printers')
      .select('*')
      .eq('role', 'kitchen')
      .order('is_default', { ascending: false });
    if (data) setPrinters(data);
  };

  useEffect(() => {
    fetchOrders();
    fetchPrinters();
    const subscription = supabase.channel('kitchen_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_orders' }, fetchOrders)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_printers' }, fetchPrinters)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const moveOrder = async (id: string, nextStatus: string) => {
    const orderToUpdate = orders.find(o => o.id === id);
    if (!orderToUpdate) return;

    if (nextStatus === 'cooking') {
      const defaultKitchenPrinter = printers.find(p => p.is_default);
      if (defaultKitchenPrinter) {
        alert(`🖨️ Printing KOT for Order #${id} to ${defaultKitchenPrinter.name}...`);
      } else {
        // Fallback to browser print
        setPrintOrder(orderToUpdate);
        setTimeout(() => {
          window.print();
          setPrintOrder(null);
        }, 500);
      }
    }

    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));
    
    if (orderToUpdate.dbId) {
      const { error } = await supabase.from('app_orders').update({ status: nextStatus }).eq('id', orderToUpdate.dbId);
      if (error) {
        alert("Error updating order status: " + error.message);
        fetchOrders();
      }
    }
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
      if (data) setPrinters([...printers, data[0]]);
      setShowAddPrinter(false);
      setNewPrinter({
        type: 'WiFi',
        role: 'kitchen',
        status: 'online',
        is_default: true,
        connection_details: { ip: '', port: 9100 }
      });
    }
  };

  const activeKitchenPrinter = printers.find(p => p.is_default);

  const columns = [
    { title: 'New Orders', status: 'pending', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-100/50', border: 'border-amber-100' },
    { title: 'Cooking', status: 'cooking', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-100/50', border: 'border-rose-100' },
    { title: 'Ready', status: 'ready', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100/50', border: 'border-emerald-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      {loading && <LoadingScreen />}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kitchen Operations</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Real-time KOT management and preparation tracking</p>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Kitchen Printer Status */}
           {activeKitchenPrinter ? (
             <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <div className="text-emerald-600">
                  {activeKitchenPrinter.type === 'WiFi' ? <Wifi className="w-4 h-4" /> : 
                   activeKitchenPrinter.type === 'Bluetooth' ? <Bluetooth className="w-4 h-4" /> : 
                   <Usb className="w-4 h-4" />}
                </div>
                <div>
                   <p className="text-[10px] font-black text-emerald-700 leading-none">{activeKitchenPrinter.name}</p>
                   <p className="text-[8px] text-emerald-500 font-bold uppercase mt-0.5 tracking-widest">KOT Printer Online</p>
                </div>
                <button onClick={() => setShowAddPrinter(true)} className="ml-2 text-emerald-400 hover:text-emerald-600">
                   <Plus className="w-4 h-4" />
                </button>
             </div>
           ) : (
             <button 
               onClick={() => setShowAddPrinter(true)}
               className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white transition-all group"
             >
                <Printer className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest">Setup KOT Printer</span>
             </button>
           )}

           <div className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black flex items-center gap-3 shadow-sm">
              <Timer className="w-5 h-5 text-indigo-500" />
              AVG PREP: 18m
           </div>
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
                           {order.items.map((item: any, i: number) => (
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
                             <button 
                               onClick={() => moveOrder(order.id, 'served')}
                               className="w-full py-3 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-100/20 active:scale-95"
                             >
                               <Utensils className="w-4 h-4" />
                               Mark as Served
                             </button>
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

      {/* Add Kitchen Printer Modal */}
      {showAddPrinter && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Setup KOT Printer</h3>
                  <p className="text-sm text-slate-400 font-medium">Configure printer for kitchen order tickets</p>
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
                    placeholder="e.g. Kitchen Main KOT" 
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
                        placeholder="192.168.1.101" 
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MAC Address</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="00:11:22:33:44:55" 
                        value={newPrinter.connection_details?.mac || ''}
                        onChange={(e) => setNewPrinter({ 
                          ...newPrinter, 
                          connection_details: { ...newPrinter.connection_details, mac: e.target.value } 
                        })}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" 
                      />
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 hover:scale-110 transition-transform">
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {newPrinter.type === 'Wired' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">USB Port</label>
                    <select 
                      value={newPrinter.connection_details?.usb_id || 'USB001'}
                      onChange={(e) => setNewPrinter({ 
                        ...newPrinter, 
                        connection_details: { ...newPrinter.connection_details, usb_id: e.target.value } 
                      })}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none appearance-none"
                    >
                      <option value="USB001">USB Port 1 (Standard)</option>
                      <option value="USB002">USB Port 2</option>
                    </select>
                  </div>
                )}
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
              {/* Hidden Print KOT */}
      {printOrder && (
        <PrintKOT 
          orderId={printOrder.id}
          tableNo={printOrder.table}
          time={printOrder.time}
          items={printOrder.items}
        />
      )}
    </div>
          </div>
        </div>
      )}
    </div>
  );
}
