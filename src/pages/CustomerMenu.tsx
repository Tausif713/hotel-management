import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  ChevronRight, 
  Flame,
  Search,
  Star,
  Info,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

const MENU: any[] = [];

export default function CustomerMenu() {
  const { id } = useParams();
  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const addToCart = (item: any) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.qty + delta);
        return newQty === 0 ? null : { ...i, qty: newQty };
      }
      return i;
    }).filter(Boolean));
  };

  const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const itemCount = cart.reduce((acc, i) => acc + i.qty, 0);

  const filteredMenu = MENU.filter(item => 
    (activeCategory === 'All' || item.category === activeCategory) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans max-w-md mx-auto relative shadow-2xl h-screen overflow-hidden border-x border-slate-200">
      {/* Visual Header Background */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-slate-900 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Actual Header */}
      <header className="relative z-10 px-6 pt-8 pb-4">
        <div className="flex justify-between items-center mb-6">
          <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-white font-black text-xl tracking-tighter uppercase">GrandHotel</h1>
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em]">Table NO. {id}</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
            <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="What would you like to eat?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium placeholder:text-slate-400"
          />
        </div>
      </header>

      {/* Categories */}
      <div className="relative z-10 px-6 py-4 overflow-x-auto scrollbar-hide flex gap-3">
        {['All', 'Starter', 'Main Course', 'Breads', 'Beverages'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeCategory === cat 
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                : "bg-white text-slate-500 border border-slate-100"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-40 pt-2 z-10 scrollbar-hide">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recommended</h2>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            20-30 MIN
          </div>
        </div>

        {filteredMenu.map((item) => (
          <div 
            key={item.id} 
            className="bg-white p-4 rounded-[2rem] flex gap-5 border border-slate-100 shadow-sm relative overflow-hidden group active:scale-[0.98] transition-transform"
          >
            <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-2 left-2">
                {item.isVeg ? (
                  <div className="w-4 h-4 bg-white/90 backdrop-blur border border-emerald-500 p-[2px] rounded-sm">
                    <div className="w-full h-full bg-emerald-500 rounded-full" />
                  </div>
                ) : (
                  <div className="w-4 h-4 bg-white/90 backdrop-blur border border-rose-500 p-[2px] rounded-sm">
                    <div className="w-full h-full bg-rose-500 rounded-full" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                   <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-slate-900">{item.rating}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(item.spicy)].map((_, i) => <Flame key={i} className="w-3 h-3 text-rose-500 fill-rose-500" />)}
                  </div>
                </div>
                <h3 className="font-black text-base text-slate-900 leading-tight mb-1">{item.name}</h3>
                <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{item.description}</p>
              </div>

              <div className="flex justify-between items-center mt-2">
                <p className="font-black text-lg text-slate-900 tracking-tighter">₹{item.price}</p>
                
                {cart.find(i => i.id === item.id) ? (
                  <div className="flex items-center gap-3 bg-slate-900 px-2 py-1.5 rounded-xl shadow-lg shadow-slate-200">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-white/10 rounded-lg text-white"><Minus className="w-3 h-3" /></button>
                    <span className="font-black text-xs text-white min-w-[14px] text-center">{cart.find(i => i.id === item.id).qty}</span>
                    <button onClick={() => addToCart(item)} className="p-1.5 hover:bg-white/10 rounded-lg text-white"><Plus className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(item)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 active:scale-90"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredMenu.length === 0 && (
          <div className="py-20 text-center opacity-20 flex flex-col items-center">
            <Search className="w-12 h-12 mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">No dishes found</p>
          </div>
        )}
      </div>

      {/* Premium Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-3rem)] z-50">
          <div className="bg-slate-900 p-5 rounded-[2rem] flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-3 rounded-2xl">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-[10px] font-black text-white">
                  {itemCount}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Grand Total</p>
                <h4 className="text-2xl font-black text-white tracking-tighter">₹{total}</h4>
              </div>
            </div>
            <button className="px-8 py-4 bg-white text-slate-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 active:scale-95 transition-all shadow-xl hover:bg-indigo-50 group">
              Checkout
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
