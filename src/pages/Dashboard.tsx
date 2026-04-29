import { 
  Search,
  Bell,
  ChevronRight,
  DollarSign,
  ShoppingCart,
  Users,
  Receipt,
  Calendar,
  LayoutGrid
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const chartData: any[] = [];

const StatCard = ({ label, value, trend, trendColor, icon: Icon, colorClass, subtext }: any) => (
  <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300", colorClass)}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <span className={cn("text-[10px] font-black", trendColor)}>
              {trend}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">{subtext}</span>
          </div>
        )}
        {subtext && !trend && (
          <div className="flex items-center gap-1 mt-1">
             <div className="w-2 h-2 rounded-full bg-blue-400" />
             <span className="text-[10px] text-slate-500 font-bold">{subtext}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const topSellingItems: any[] = [];
const tableStats: any[] = [];
const staffOverview: any[] = [];

export default function Dashboard() {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ sales: 0, orders: 0, activeTables: 0, totalTables: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: orders }, { data: tables }] = await Promise.all([
        supabase.from('app_orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('app_tables').select('*')
      ]);

      if (orders) {
        setRecentOrders(orders);
        const totalSales = orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
        
        let activeTbls = 0;
        let totalTbls = 0;
        if (tables) {
          totalTbls = tables.length;
          activeTbls = tables.filter(t => t.status !== 'free').length;
        }

        setStats({ sales: totalSales, orders: orders.length, activeTables: activeTbls, totalTables: totalTbls });
      }
    };
    fetchData();
    const subscription = supabase.channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_orders' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_tables' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        
        <div className="flex items-center gap-6">
          <div className="relative group w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search here..."
              className="w-full bg-white border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-purple-500/10 focus:border-purple-200 outline-none transition-all shadow-sm"
            />
          </div>
          
          <button className="relative p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-purple-600 rounded-xl transition-all shadow-sm group">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">5</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-md">
              A
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 leading-none">Admin</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex justify-end">
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-700">12 May 2024</span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Sales" 
          value={`₹ ${stats.sales}`}
          subtext="Total revenue"
          icon={DollarSign} 
          colorClass="bg-purple-100 text-purple-600" 
        />
        <StatCard 
          label="Total Orders" 
          value={stats.orders.toString()} 
          subtext="Total orders placed"
          icon={ShoppingCart} 
          colorClass="bg-emerald-100 text-emerald-600" 
        />
        <StatCard 
          label="Active Tables" 
          value={`${stats.activeTables} / ${stats.totalTables}`} 
          subtext={`${stats.totalTables > 0 ? Math.round((stats.activeTables / stats.totalTables) * 100) : 0}% Occupied`}
          icon={Users} 
          colorClass="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          label="Total Bills" 
          value={stats.orders.toString()} 
          subtext="Generated bills"
          icon={Receipt} 
          colorClass="bg-orange-100 text-orange-600" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sales Overview */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Sales Overview</h3>
            <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 flex items-center gap-2 cursor-pointer border border-slate-100">
              Today <ChevronRight className="w-3 h-3 rotate-90" />
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(val) => `${val/1000}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: '#fff',
                  }}
                  itemStyle={{ color: '#8b5cf6', fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(value) => [`₹ ${value}`, 'Sales']}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#salesGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Top Selling Items</h3>
            <Link to="/menu" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {topSellingItems.map((item) => (
              <div key={item.rank} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-1 rounded-xl transition-all">
                <span className="text-xs font-bold text-slate-400 w-4">{item.rank}</span>
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm relative group-hover:scale-105 transition-transform">
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{item.orders}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Orders</h3>
            <Link to="/orders-live" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="text-sm font-bold text-slate-900">Order {order.id}</p>
                       <span className={cn(
                         "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                         order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                       )}>
                         {order.status}
                       </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">Table {order.table}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-slate-900">₹{order.total_amount || 0}</p>
                   <p className="text-[10px] text-slate-400 font-bold">{new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table Status */}
        <div className="col-span-12 lg:col-span-7 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Table Status</h3>
            <Link to="/tables-grid" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {tableStats.map((table) => (
              <div key={table.id} className={cn(
                "p-4 rounded-2xl border flex flex-col gap-1 transition-all cursor-pointer hover:scale-[1.02] active:scale-95",
                table.status === 'Occupied' ? "bg-emerald-50 border-emerald-100" : 
                table.status === 'In Use' ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-slate-100"
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    table.status === 'Occupied' ? "bg-white text-emerald-500" : 
                    table.status === 'In Use' ? "bg-white text-orange-500" : "bg-white text-slate-400"
                  )}>
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-bold leading-none",
                      table.status === 'Occupied' ? "text-emerald-700" : 
                      table.status === 'In Use' ? "text-orange-700" : "text-slate-700"
                    )}>Table {table.id}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">{table.seats}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-50">
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Occupied</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">In Use</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Available</span>
             </div>
          </div>
        </div>

        {/* Staff Overview */}
        <div className="col-span-12 lg:col-span-5 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Staff Overview</h3>
            <Link to="/staff" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="space-y-6">
            {staffOverview.map((staff, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md relative">
                     <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{staff.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{staff.role}</p>
                  </div>
                </div>
                <div>
                   <span className={cn(
                     "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                     staff.status === 'On Duty' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                   )}>
                     {staff.status}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
