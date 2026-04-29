import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import { cn } from '../lib/utils';

const weeklySalesData = [
  { name: 'Mon', sales: 4000, orders: 24 },
  { name: 'Tue', sales: 3000, orders: 18 },
  { name: 'Wed', sales: 2000, orders: 12 },
  { name: 'Thu', sales: 2780, orders: 19 },
  { name: 'Fri', sales: 1890, orders: 15 },
  { name: 'Sat', sales: 2390, orders: 22 },
  { name: 'Sun', sales: 3490, orders: 28 },
];

const categorySales = [
  { name: 'Starters', value: 400, color: '#4f46e5' },
  { name: 'Main Course', value: 300, color: '#0ea5e9' },
  { name: 'Desserts', value: 300, color: '#10b981' },
  { name: 'Beverages', value: 200, color: '#f59e0b' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Analytics</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Deep dive into your restaurant's performance and sales data</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black flex items-center gap-3 shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
              <Calendar className="w-5 h-5 text-indigo-500" />
              12 May - 19 May 2024
           </div>
           <button onClick={() => alert('Downloading PDF Report...')} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            <Download className="w-5 h-5" />
            EXPORT PDF
          </button>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
         {/* Main Chart */}
         <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Weekly Sales Performance</h3>
                  <div className="flex items-center gap-2 mt-2">
                     <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-black">
                        <TrendingUp className="w-3 h-3" /> +12.5%
                     </div>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">vs Previous Week</span>
                  </div>
               </div>
               <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
                  {['Sales', 'Orders'].map((tab) => (
                    <button key={tab} className={cn(
                      "px-6 py-2 rounded-lg text-xs font-black transition-all",
                      tab === 'Sales' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                    )}>
                      {tab}
                    </button>
                  ))}
               </div>
            </div>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySalesData}>
                  <rect rx="10" ry="10" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    tickFormatter={(val) => `₹${val/1000}k`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 10 }}
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', padding: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#6366f1', marginBottom: '4px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#6366f1" 
                    radius={[8, 8, 8, 8]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Pie Chart / Category Breakdown */}
         <div className="col-span-12 lg:col-span-4 bg-[#0f172a] p-8 rounded-[2rem] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <h3 className="text-xl font-black mb-8">Category Mix</h3>
            <div className="h-[250px] w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={categorySales}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                     >
                        {categorySales.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', color: '#000' }}
                        itemStyle={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pointer-events-none">
                  <PieChartIcon className="w-8 h-8 text-indigo-400 mb-2 opacity-50" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue Hub</p>
               </div>
            </div>
            <div className="mt-8 space-y-4">
               {categorySales.map((cat, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                       <span className="text-xs font-bold text-slate-400">{cat.name}</span>
                    </div>
                    <span className="text-sm font-black">₹{cat.value}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Secondary Stats */}
         <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <h4 className="text-lg font-black text-slate-900 leading-none">Net Profit Margin</h4>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
               <h2 className="text-4xl font-black text-slate-900">24.5%</h2>
               <span className="text-emerald-500 text-xs font-black">+2.4%</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
               Profit increased compared to last month due to lower ingredient waste.
            </p>
         </div>

         <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                  <BarChart3 className="w-6 h-6" />
               </div>
               <h4 className="text-lg font-black text-slate-900 leading-none">Average Table Order</h4>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
               <h2 className="text-4xl font-black text-slate-900">₹ 1,240</h2>
               <span className="text-rose-500 text-xs font-black">-₹ 45</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
               Order value decreased. Recommended to upsell desserts and side dishes.
            </p>
         </div>

         <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Download className="w-6 h-6" />
               </div>
               <h4 className="text-lg font-black text-slate-900 leading-none">Ready Reports</h4>
            </div>
            <div className="space-y-3">
               {['GST Report', 'Stock Inventory', 'Employee Attendance'].map((item, i) => (
                 <button key={i} className="w-full py-3 bg-slate-50 rounded-xl px-4 flex items-center justify-between hover:bg-slate-100 transition-all font-black text-[10px] text-slate-600 uppercase tracking-widest group">
                    {item}
                    <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
