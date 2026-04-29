import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Search, 
  User, 
  History, 
  LayoutGrid, 
  List, 
  RefreshCcw, 
  Printer, 
  Share2, 
  Plus, 
  Minus, 
  Trash2, 
  Banknote, 
  CreditCard, 
  Smartphone, 
  FileText,
  Pause,
  X,
  Flame
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useSearchParams } from 'react-router-dom';

export default function CounterPanel() {
  const [searchParams] = useSearchParams();
  const initialTable = searchParams.get('table');
  const [selectedTableId, setSelectedTableId] = useState<string>(initialTable || 'T01');
  const [activeView, setActiveView] = useState<'table' | 'order'>('table');
  const [tables, setTables] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [bills, setBills] = useState<Record<string, any[]>>({});
  const [showAddItem, setShowAddItem] = useState(false);
  const [searchMenu, setSearchMenu] = useState('');

  useEffect(() => {
    const fetchTablesAndMenu = async () => {
      const [tablesRes, menuRes] = await Promise.all([
        supabase.from('app_tables').select('*').order('number', { ascending: true }),
        supabase.from('app_menu').select('*')
      ]);
      
      if (tablesRes.data) setTables(tablesRes.data);
      if (menuRes.data) setMenuItems(menuRes.data.map(item => ({
        id: item.id, name: item.name, price: item.price, category: item.category, 
        image: item.image, spicy: item.spicy, isVeg: item.is_veg
      })));
    };
    
    const fetchActiveOrders = async () => {
      const { data } = await supabase.from('app_orders').select('*').in('status', ['pending', 'cooking', 'ready', 'served']);
      if (data) {
        const activeBills: Record<string, any[]> = {};
        data.forEach(order => {
          if (!activeBills[order.table_no]) activeBills[order.table_no] = [];
          if (Array.isArray(order.items)) {
             order.items.forEach((item: any) => {
               const existing = activeBills[order.table_no].find(i => i.name === item.name && !i.isNew);
               if (existing) {
                 existing.qty += item.qty;
               } else {
                 activeBills[order.table_no].push({ ...item, id: Math.random().toString(), isNew: false });
               }
             });
          }
        });
        
        setBills(currentBills => {
          const mergedBills = { ...activeBills };
          Object.keys(currentBills).forEach(tableNo => {
            const newItems = currentBills[tableNo].filter((i: any) => i.isNew);
            if (newItems.length > 0) {
              if (!mergedBills[tableNo]) mergedBills[tableNo] = [];
              mergedBills[tableNo] = [...mergedBills[tableNo], ...newItems];
            }
          });
          return mergedBills;
        });
      }
    };

    fetchTablesAndMenu();
    fetchActiveOrders();

    const subscription = supabase.channel('counter_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_tables' }, fetchTablesAndMenu)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_orders' }, fetchActiveOrders)
      .subscribe();
      
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const currentBillItems = bills[selectedTableId] || [];
  const subTotal = currentBillItems.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0);
  const tax = Math.round(subTotal * 0.05);
  const total = subTotal + tax;

  useEffect(() => {
    if (selectedTableId && total >= 0) {
      const currentTable = tables.find(t => t.number === selectedTableId);
      if (currentTable && currentTable.status === 'occupied') {
        supabase.from('app_tables').update({ bill_amount: `₹ ${total}` }).eq('number', selectedTableId).then();
      }
    }
  }, [total, selectedTableId]);

  const handleUpdateQty = (itemName: string, delta: number, isNew: boolean) => {
    if (!isNew) {
      alert("Cannot change quantity of already sent items. Please add a new item instead.");
      return;
    }
    const updatedItems = currentBillItems.map((item: any) => {
      if (item.name === itemName && item.isNew) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    });
    setBills({ ...bills, [selectedTableId]: updatedItems });
  };

  const handleRemoveItem = (itemName: string, isNew: boolean) => {
    if (!isNew) {
      alert("Cannot remove already sent items. Please manage from Kitchen Panel.");
      return;
    }
    const updatedItems = currentBillItems.filter((item: any) => !(item.name === itemName && item.isNew));
    setBills({ ...bills, [selectedTableId]: updatedItems });
  };

  const handleAddItem = async (menuItem: any) => {
    const existingItem = currentBillItems.find((item: any) => item.name === menuItem.name && item.isNew);
    let updatedItems;
    if (existingItem) {
      updatedItems = currentBillItems.map((item: any) => {
        if (item.name === menuItem.name && item.isNew) {
          return { ...item, qty: Math.max(1, item.qty + 1) };
        }
        return item;
      });
    } else {
      updatedItems = [...currentBillItems, { ...menuItem, qty: 1, isNew: true }];
    }
    setBills({ ...bills, [selectedTableId]: updatedItems });
    
    // Update table status in Supabase
    const currentTable = tables.find(t => t.number === selectedTableId);
    if (currentTable && currentTable.status !== 'occupied') {
      await supabase.from('app_tables').update({ status: 'occupied', occupied_since: 'Just Now' }).eq('number', selectedTableId);
    }
    
    // Refresh tables to trigger re-render properly if needed, though real-time should handle it.
  };

  const handleGenerateBill = async () => {
    alert(`Bill Generated for ${selectedTableId}! Total: ₹${total}`);
    setBills({ ...bills, [selectedTableId]: [] });
    await supabase.from('app_tables').update({ status: 'free', bill_amount: '-', occupied_since: '-' }).eq('number', selectedTableId);
    
    // Mark active orders for this table as completed
    await supabase.from('app_orders').update({ status: 'completed' }).eq('table_no', selectedTableId).in('status', ['pending', 'cooking', 'ready', 'served']);
  };

  const handleSendKOT = async () => {
    const newItems = currentBillItems.filter((item: any) => item.isNew);
    if (newItems.length === 0) {
       alert('No new items to send to Kitchen!');
       return;
    }
    
    const itemsData = newItems.map((item: any) => ({ name: item.name, qty: item.qty, note: '', price: item.price }));
    const newSubTotal = newItems.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0);
    const newTotal = newSubTotal + Math.round(newSubTotal * 0.05);
    
    const { error } = await supabase.from('app_orders').insert({
      table_no: selectedTableId,
      status: 'pending',
      priority: 'normal',
      items: itemsData,
      total_amount: newTotal
    });
    
    if (!error) {
      await supabase.from('app_tables').update({ status: 'occupied', occupied_since: 'Just Now' }).eq('number', selectedTableId);
      
      // Update local state to remove isNew flags now that they are sent
      setBills(currentBills => {
        const updated = { ...currentBills };
        if (updated[selectedTableId]) {
          updated[selectedTableId] = updated[selectedTableId].map((item: any) => ({ ...item, isNew: false }));
        }
        return updated;
      });
      
      alert('KOT Sent to Kitchen!');
    } else {
      alert('Failed to send KOT: ' + error.message);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col bg-[#f8fafc] -mt-8 -mx-8 overflow-hidden font-sans relative">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-2 rounded-lg lg:hidden">
             <List className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Counter Panel</h1>
            <p className="text-xs text-slate-400 font-medium">Create Order & Generate Bill</p>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search menu items..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
              value={searchMenu}
              onChange={(e) => setSearchMenu(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-all">
            <User className="w-4 h-4" />
            Walk-in Customer
          </button>
          <div className="flex items-center gap-3 ml-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none">Admin</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cashier 01</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Col: Table Layout */}
        <div className="flex-[1.2] flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setActiveView('table')}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all", activeView === 'table' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Table View
              </button>
              <button 
                onClick={() => setActiveView('order')}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all", activeView === 'order' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <List className="w-3.5 h-3.5" />
                Order View
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
             {activeView === 'table' ? (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Table Layout</h3>
                  <div className="flex flex-wrap gap-4 mb-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Occupied</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-600" /> In Use</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Reserved</div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {tables.map((table) => (
                      <div 
                        key={table.id}
                        onClick={() => setSelectedTableId(table.number)}
                        className={cn(
                          "p-4 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95",
                          selectedTableId === table.number && "ring-2 ring-indigo-600 ring-offset-2",
                          table.status === 'free' && "bg-emerald-50 border-emerald-100 text-emerald-700",
                          table.status === 'occupied' && "bg-orange-50 border-orange-100 text-orange-700",
                          table.status === 'in-use' && "bg-blue-50 border-blue-100 text-blue-700",
                          table.status === 'reserved' && "bg-slate-50 border-slate-200 text-slate-400"
                        )}
                      >
                        <span className="text-sm font-black">{table.number}</span>
                        <span className="text-[10px] font-bold opacity-70">{table.status === 'reserved' ? 'Reserved' : `${table.capacity} Seats`}</span>
                        {table.bill_amount && table.bill_amount !== '-' && <span className="text-[10px] font-black mt-1">{table.bill_amount}</span>}
                      </div>
                    ))}
                  </div>
                </div>
             ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Menu</h3>
                  <div className="grid grid-cols-2 gap-3">
                     {menuItems.slice(0, 10).map((item, i) => (
                        <div 
                           key={i} 
                           onClick={() => handleAddItem(item)}
                           className="p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
                        >
                           <p className="text-xs font-bold text-slate-800">{item.name}</p>
                           <p className="text-[10px] text-indigo-600 font-black mt-1">₹ {item.price}</p>
                        </div>
                     ))}
                  </div>
                </div>
             )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-5 gap-2">
            {[
              { label: 'Total Tables', value: tables.length },
              { label: 'Occupied', value: tables.filter(t => t.status === 'occupied').length },
              { label: 'In Use', value: tables.filter(t => t.status === 'in-use').length },
              { label: 'Available', value: tables.filter(t => t.status === 'free').length },
              { label: 'Reserved', value: tables.filter(t => t.status === 'reserved').length },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">{stat.label}</p>
                <p className="text-sm font-black text-slate-800">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Col: Current Status */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Live Status ({selectedTableId})</h3>
            <div className="flex items-center gap-2">
              <RefreshCcw className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-slate-50/50">
             <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-indigo-50/50 border-b border-indigo-100 flex justify-between items-center">
                  <span className="text-xs font-black text-indigo-600">Active Order: {selectedTableId}</span>
                  <span className="text-[10px] font-bold text-slate-400">Preparation: Normal</span>
                </div>
                <div className="p-4 space-y-3">
                   {currentBillItems.length > 0 ? (
                      currentBillItems.map((item: any, idx: number) => (
                         <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-700">
                           <span className="flex-1">{item.name}</span>
                           <div className="flex items-center gap-4">
                              <span className="text-slate-400">x{item.qty}</span>
                              <span className="font-black text-slate-900 w-12 text-right">₹ {item.price * item.qty}</span>
                           </div>
                         </div>
                      ))
                   ) : (
                      <div className="text-center py-10">
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Items Added</p>
                      </div>
                   )}
                   <div className="pt-4 mt-2 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Sub Total</span>
                      <span className="text-sm font-black text-indigo-600">₹ {subTotal}</span>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recent Activity</h4>
                <div className="space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-[10px] font-medium text-slate-600">Table T04 generated bill at 12:45 PM</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <p className="text-[10px] font-medium text-slate-600">3 New items added to T05</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Col: Billing - POS Style Receipt */}
        <div className="flex-[1.5] flex flex-col bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl relative">
          <div className="p-8 border-b border-dashed border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Table {selectedTableId}</h3>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Order Details</p>
              </div>
              <button 
                 onClick={() => setShowAddItem(true)}
                 className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
              >
                 <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide">
            {currentBillItems.length > 0 ? (
              <div className="space-y-6">
                {currentBillItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group animate-in slide-in-from-right duration-300 border-b border-slate-50 pb-4 last:border-0" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        {item.isNew && <span className="text-[8px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">NEW</span>}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">₹{item.price} x {item.qty}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <button 
                           onClick={() => handleUpdateQty(item.name, -1, item.isNew)}
                           className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-white rounded-lg hover:text-rose-500 hover:shadow-sm transition-all"
                        >
                           <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-black min-w-[20px] text-center text-slate-900">{item.qty}</span>
                        <button 
                           onClick={() => handleUpdateQty(item.name, 1, item.isNew)}
                           className="w-7 h-7 flex items-center justify-center text-indigo-600 hover:bg-white rounded-lg hover:shadow-sm transition-all"
                        >
                           <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="w-20 text-right">
                        <p className="text-sm font-black text-slate-900 font-mono">₹{item.price * item.qty}</p>
                      </div>
                      
                      <button 
                         onClick={() => handleRemoveItem(item.name, item.isNew)}
                         className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                  <FileText className="w-16 h-16 text-slate-300 mb-4 stroke-1" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Items Added Yet</p>
               </div>
            )}
          </div>

          <div className="p-8 bg-slate-50/80 backdrop-blur-md border-t border-dashed border-slate-200">
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <span>Sub Total</span>
                <span className="text-slate-900">₹ {subTotal}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <span>Tax (GST 5%)</span>
                <span className="text-slate-900">₹ {tax}</span>
              </div>
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">Total Amount</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">₹ {total}</span>
              </div>
            </div>

            <div className="space-y-4">
               {/* Payment Methods Integration */}
               <div className="bg-white rounded-2xl border border-slate-200 p-2 flex items-center justify-between gap-1">
                  {[
                    { label: 'Cash', icon: Banknote, bg: 'hover:bg-emerald-50 hover:text-emerald-600', active: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                    { label: 'Card', icon: CreditCard, bg: 'hover:bg-blue-50 hover:text-blue-600', active: 'bg-blue-50 text-blue-600 border-blue-100' },
                    { label: 'UPI', icon: Smartphone, bg: 'hover:bg-purple-50 hover:text-purple-600', active: 'bg-purple-50 text-purple-600 border-purple-100' },
                  ].map((p, i) => (
                    <button 
                       key={i} 
                       className={cn(
                          "flex-1 py-3 rounded-xl flex flex-col items-center gap-1.5 border border-transparent transition-all",
                          i === 0 ? p.active : `text-slate-400 ${p.bg}`
                       )}
                    >
                       <p.icon className="w-4 h-4" />
                       <span className="text-[9px] font-black uppercase tracking-widest">{p.label}</span>
                    </button>
                  ))}
               </div>

               <button 
                  onClick={handleGenerateBill}
                  disabled={currentBillItems.length === 0}
                  className={cn(
                     "w-full py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-4 group/btn",
                     currentBillItems.length > 0 
                      ? "bg-[#10b981] hover:bg-[#059669] text-white shadow-emerald-200/50 hover:-translate-y-1 active:translate-y-0" 
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
               >
                  <Printer className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
                  GENERATE BILL
               </button>

               <div className="grid grid-cols-2 gap-4">
                  <button onClick={handleSendKOT} className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                    <Flame className="w-4 h-4" />
                    SEND KOT
                  </button>
                  <button onClick={() => alert('Opening WhatsApp to share bill...')} className="py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    SHARE BILL
                  </button>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add Item Modal */}
      {showAddItem && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
               <div className="p-8 pb-0 flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Quick Menu Add</h2>
                  <button onClick={() => setShowAddItem(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                     <X className="w-6 h-6 text-slate-400" />
                  </button>
               </div>
               
               <div className="p-8">
                  <div className="grid grid-cols-2 gap-4">
                     {menuItems.map((item, i) => (
                        <div 
                           key={i} 
                           onClick={() => {
                              handleAddItem(item);
                              setShowAddItem(false);
                           }}
                           className="p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] cursor-pointer hover:bg-white hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-1 transition-all group"
                        >
                           <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-indigo-600 opacity-60 uppercase tracking-widest">{item.category}</span>
                              <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                           </div>
                           <p className="text-sm font-black text-slate-800 mt-2">{item.name}</p>
                           <p className="text-lg font-black text-indigo-600 mt-1">₹ {item.price}</p>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button onClick={() => setShowAddItem(false)} className="px-8 py-3 bg-white text-slate-600 rounded-xl text-sm font-black border border-slate-200">CLOSE</button>
               </div>
            </div>
         </div>
      )}

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-8">
           <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</p>
              <div className="flex items-center gap-3">
                 <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-all">
                    <Plus className="w-3.5 h-3.5" />
                    New Order
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-all">
                    <Pause className="w-3.5 h-3.5" />
                    Hold Order
                 </button>
                 <Link to="/orders" className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-orange-100 transition-all">
                    <History className="w-3.5 h-3.5" />
                    History
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
