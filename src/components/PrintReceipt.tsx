
interface ReceiptProps {
  hotelName: string;
  tagline?: string;
  address?: string;
  phone?: string;
  gstin?: string;
  tableNo: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string;
}

export const PrintReceipt = ({ 
  hotelName, tagline, address, phone, gstin,
  tableNo, items, subtotal, tax, total, currency, paymentMethod 
}: ReceiptProps) => {
  return (
    <div className="flex flex-col gap-8 p-4">
      {/* WEB INVOICE - Visible in browser preview if not hidden */}
      <div className="web-invoice bg-white p-8 rounded-2xl shadow-xl border border-slate-100 no-print max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{hotelName}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Table: {tableNo} | Dine In</p>
          </div>
          <div className="text-right text-xs text-slate-400 font-bold uppercase tracking-widest">
            <p>Invoice: #{Math.floor(Math.random() * 10000)}</p>
            <p className="mt-1">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
              <th className="text-center py-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
              <th className="text-right py-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
              <th className="text-right py-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                <td className="py-4 px-2 text-sm font-bold text-slate-700">{item.name}</td>
                <td className="py-4 px-2 text-center text-sm font-medium text-slate-500">{item.qty}</td>
                <td className="py-4 px-2 text-right text-sm font-medium text-slate-500">{currency}{item.price}</td>
                <td className="py-4 px-2 text-right text-sm font-black text-slate-900">{currency}{item.price * item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <div className="w-64 space-y-2 text-right">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Subtotal:</span>
              <span className="text-slate-900">{currency}{subtotal}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>GST (5%):</span>
              <span className="text-slate-900">{currency}{tax}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <span className="text-sm font-black text-slate-900 uppercase">Total Amount:</span>
              <span className="text-3xl font-black text-[#6c5ce7]">{currency}{total}</span>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Paid via {paymentMethod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* THERMAL PRINT - Designed for thermal printers, hidden in UI, shown in print */}
      <div className="printable thermal hidden bg-white p-4 font-mono text-[12px] border border-dashed border-black w-[280px]">
        <h3 className="text-center font-bold text-base mb-1 uppercase">{hotelName}</h3>
        <div className="text-center text-[10px] mb-2">{address || 'Ahmedabad'}</div>
        <div className="border-t border-dashed border-black my-2"></div>

        <div className="flex justify-between mb-1">
          <span>Table</span>
          <span>{tableNo}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Date</span>
          <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
        </div>
        <div className="border-t border-dashed border-black my-2"></div>

        <div className="flex justify-between font-bold mb-2">
          <span>Item</span>
          <span>Total</span>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex justify-between mb-1">
            <span className="truncate max-w-[180px]">{item.name} {item.qty > 1 ? `x${item.qty}` : ''}</span>
            <span>{item.price * item.qty}</span>
          </div>
        ))}

        <div className="border-t border-dashed border-black my-2"></div>
        <div className="flex justify-between mb-1">
          <span>Subtotal</span>
          <span>{subtotal}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>GST</span>
          <span>{tax}</span>
        </div>
        <div className="flex justify-between font-bold text-sm mt-1">
          <span>Total</span>
          <span>{currency}{total}</span>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>
        <div className="text-center mt-4">Thank You!</div>
        <div className="text-center text-[8px] mt-2 text-gray-400">Visit Again</div>
      </div>
    </div>
  );
};
