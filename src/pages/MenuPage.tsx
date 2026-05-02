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
  Camera,
  X
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
          code: item.code || '',
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: '',
    category: 'Main Course',
    isVeg: true,
    isAvailable: true,
    image: '',
    description: ''
  });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleAddProduct = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      price: '',
      category: 'Main Course',
      isVeg: true,
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code || '',
      price: item.price.toString(),
      category: item.category,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      image: item.image,
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      name: formData.name,
      code: formData.code,
      price: parseFloat(formData.price),
      category: formData.category,
      is_veg: formData.isVeg,
      is_available: formData.isAvailable,
      image: formData.image,
      description: formData.description
    };

    if (editingItem) {
      const { error } = await supabase.from('app_menu').update(dataToSave).eq('id', editingItem.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('app_menu').insert(dataToSave);
      if (error) alert(error.message);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this item?")) {
      await supabase.from('app_menu').delete().eq('id', id);
    }
  };

  const handleChangeImage = async (item: any) => {
    const newImage = window.prompt("Paste the new image URL here:", item.image);
    if (newImage) {
      await supabase.from('app_menu').update({ image: newImage }).eq('id', item.id);
    }
  };

  const filteredMenu = menu.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      (item.code && item.code.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'All Items' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (window.confirm(`Delete ${selectedItems.length} items?`)) {
      const { error } = await supabase.from('app_menu').delete().in('id', selectedItems);
      if (!error) setSelectedItems([]);
      else alert(error.message);
    }
  };

  const handleBulkStatus = async (available: boolean) => {
    if (selectedItems.length === 0) return;
    const { error } = await supabase.from('app_menu').update({ is_available: available }).in('id', selectedItems);
    if (!error) setSelectedItems([]);
    else alert(error.message);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Menu Management</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Create, edit and manage your digital menu items</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right duration-300">
               <button onClick={() => handleBulkStatus(true)} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
                  Set Available ({selectedItems.length})
               </button>
               <button onClick={() => handleBulkStatus(false)} className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all">
                  Set Hidden ({selectedItems.length})
               </button>
               <button onClick={handleBulkDelete} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all">
                  Delete Selected ({selectedItems.length})
               </button>
               <div className="h-8 w-px bg-slate-200 mx-2" />
            </div>
          )}
          <button onClick={handleAddProduct} className="px-6 py-3 bg-[#4f46e5] text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-100">
            <Plus className="w-5 h-5" />
            ADD NEW PRODUCT
          </button>
        </div>
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
                   <div className="absolute top-4 left-4 z-10">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg border-white/20 bg-black/20 backdrop-blur-md checked:bg-indigo-600 transition-all cursor-pointer"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                   </div>
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
                   <button 
                      onClick={() => handleChangeImage(item)}
                      className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                      title="Change Photo"
                   >
                      <Camera className="w-5 h-5" />
                   </button>
               </div>
               
               <div className="p-6">
                  <div className="flex justify-between items-start mb-1">
                     <div>
                        <h3 className="text-sm font-black text-slate-800 leading-tight">{item.name}</h3>
                        {item.code && <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-0.5">Code: {item.code}</p>}
                     </div>
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
                     <button onClick={() => handleEdit(item)} className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Item
                     </button>
                     <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all">
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
                    <th className="px-8 py-4 w-10">
                       <input 
                         type="checkbox" 
                         className="rounded border-slate-300"
                         checked={selectedItems.length === filteredMenu.length && filteredMenu.length > 0}
                         onChange={(e) => {
                           if (e.target.checked) setSelectedItems(filteredMenu.map(i => i.id));
                           else setSelectedItems([]);
                         }}
                       />
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-4"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredMenu.map((item) => (
                   <tr key={item.id} className={cn("hover:bg-slate-50 transition-colors group cursor-pointer", selectedItems.includes(item.id) && "bg-indigo-50/30")}>
                      <td className="px-8 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td className="px-8 py-4" onClick={() => handleEdit(item)}>
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-black text-slate-800">{item.name}</span>
                         </div>
                      </td>
                      <td className="px-8 py-4 text-xs font-black text-indigo-500 uppercase">{item.code || '-'}</td>
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
                             <button onClick={() => handleChangeImage(item)} className="p-2 bg-white rounded-lg text-slate-400 hover:text-indigo-600 border border-slate-100 shadow-sm" title="Change Photo">
                                <Camera className="w-3.5 h-3.5" />
                             </button>
                             <button onClick={() => handleEdit(item)} className="p-2 bg-white rounded-lg text-slate-400 hover:text-indigo-600 border border-slate-100 shadow-sm">
                                <Edit2 className="w-3.5 h-3.5" />
                             </button>
                             <button onClick={() => handleDelete(item.id)} className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-50 border border-slate-100 shadow-sm transition-all">
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
      {/* Menu Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="p-8 pb-0 flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingItem ? 'Edit Menu Item' : 'Add New Item'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                    <X className="w-6 h-6 text-slate-400" />
                 </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Item Name</label>
                       <input 
                         type="text" 
                         required
                         placeholder="e.g. Butter Chicken"
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Item Code</label>
                       <input 
                         type="text" 
                         placeholder="e.g. BC101"
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                         value={formData.code}
                         onChange={(e) => setFormData({...formData, code: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none appearance-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                       {CATEGORIES.filter(c => c !== 'All Items').map(c => (
                         <option key={c} value={c}>{c}</option>
                       ))}
                    </select>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Image URL</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                    />
                 </div>

                 <div className="flex gap-4 pt-2">
                    <label className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer border-2 border-transparent has-[:checked]:border-indigo-600 transition-all">
                       <input 
                         type="checkbox" 
                         className="hidden" 
                         checked={formData.isVeg} 
                         onChange={(e) => setFormData({...formData, isVeg: e.target.checked})} 
                       />
                       <div className={cn("w-5 h-5 rounded-full border-2", formData.isVeg ? "bg-emerald-500 border-emerald-500" : "border-slate-300")} />
                       <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Veg Item</span>
                    </label>
                    <label className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer border-2 border-transparent has-[:checked]:border-indigo-600 transition-all">
                       <input 
                         type="checkbox" 
                         className="hidden" 
                         checked={formData.isAvailable} 
                         onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} 
                       />
                       <div className={cn("w-5 h-5 rounded-full border-2", formData.isAvailable ? "bg-indigo-500 border-indigo-500" : "border-slate-300")} />
                       <span className="text-xs font-black text-slate-700 uppercase tracking-widest">In Stock</span>
                    </label>
                 </div>

                 <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                    {editingItem ? 'Save Changes' : 'Create Product'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
