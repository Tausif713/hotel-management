import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Leaf,
  Flame,
  LayoutGrid,
  List as ListIcon,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = ['All Items', 'Starters', 'Main Course', 'Desserts', 'Beverages', 'Breads'];



export default function MenuPage() {
  const [menu, setMenu] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase.from('app_menu').select('*');
      if (data && !error) {
        setMenu(data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          isVeg: item.is_veg,
          isAvailable: item.is_available,
          spicy: item.spicy,
          image: item.image,
          description: item.description
        })));
      }
    };
    fetchMenu();
    const subscription = supabase.channel('menu_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_menu' }, fetchMenu)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [search, setSearch] = useState('');

  const handleAddProduct = async () => {
    const newItem = {
      name: `New Item ${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Main Course',
      price: 150,
      is_veg: true,
      is_available: true,
      spicy: 1,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80',
      description: 'A delicious new dish'
    };
    await supabase.from('app_menu').insert(newItem);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('app_menu').delete().eq('id', id);
  };

  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All Items' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Menu Management</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Create, edit and manage your digital menu items</p>
        </div>
        <button onClick={handleAddProduct} className="px-6 py-3 bg-[#4f46e5] text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-100">
          <Plus className="w-5 h-5" />
          ADD NEW PRODUCT
        </button>
      </div>

      {/* Categories Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="relative group w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search here..."
            className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-purple-500/10 outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 ml-4">
           {CATEGORIES.map((cat) => (
             <button 
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap",
                 activeCategory === cat ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
               )}
             >
               {cat}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-2 ml-8 bg-slate-50 p-1 rounded-xl flex-shrink-0">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenu.map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
               <div className="relative h-48 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                     <div className="flex items-center gap-2">
                        {item.isVeg ? (
                          <div className="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                        ) : (
                          <div className="w-4 h-4 bg-rose-500 border-2 border-white rounded-full" />
                        )}
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.category}</span>
                     </div>
                  </div>
                  <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100">
                     <MoreVertical className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-sm font-black text-slate-800 leading-tight">{item.name}</h3>
                     <div className="flex gap-0.5">
                        {[...Array(item.spicy)].map((_, i) => (
                          <Flame key={i} className="w-3 h-3 text-rose-500 fill-current" />
                        ))}
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 mb-6">
                     <p className="text-xl font-black text-indigo-600">₹{item.price}</p>
                     <div className={cn(
                       "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                       item.isAvailable ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                     )}>
                       {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                     </div>
                  </div>

                  <div className="flex gap-2">
                     <button className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Item
                     </button>
                     <button className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>
          ))}
          
          <div onClick={handleAddProduct} className="bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20 transition-all min-h-[300px]">
             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-100 transition-all duration-300">
                <Plus className="w-8 h-8" />
             </div>
             <p className="mt-4 text-xs font-black text-slate-500 uppercase tracking-widest">Add New Product</p>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-4"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredMenu.map((item) => (
                   <tr key={item.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                      <td className="px-8 py-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-black text-slate-800">{item.name}</span>
                         </div>
                      </td>
                      <td className="px-8 py-4 text-xs font-bold text-slate-500 uppercase">{item.category}</td>
                      <td className="px-8 py-4 text-sm font-black text-indigo-600 font-mono">₹{item.price}</td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                          item.isAvailable ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {item.isAvailable ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                         <div className={cn(
                           "flex items-center gap-2",
                           item.isVeg ? "text-emerald-500" : "text-rose-500"
                         )}>
                            {item.isVeg ? <Leaf className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                         </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                         <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-white rounded-lg text-slate-400 hover:text-indigo-600 border border-slate-100 shadow-sm">
                               <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-50 border border-slate-100 shadow-sm transition-all group-hover:opacity-100 opacity-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
}
