

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
    <div className="printable hidden bg-white text-slate-900 p-8 text-sm">
      <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase">{hotelName}</h1>
        {tagline && <p className="text-[10px] mt-1">{tagline}</p>}
        {address && <p className="text-[10px] mt-0.5">{address}</p>}
        {phone && <p className="text-[10px] mt-0.5">Ph: {phone}</p>}
        {gstin && <p className="text-[10px] font-bold mt-1">GSTIN: {gstin}</p>}
      </div>

      <div className="flex justify-between mb-4 font-bold uppercase text-[10px]">
        <span>Table: {tableNo}</span>
        <span>Date: {new Date().toLocaleDateString()}</span>
      </div>

      <div className="border-b border-slate-200 pb-2 mb-2">
        <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase mb-2">
          <span className="col-span-6">Item</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-4 text-right">Price</span>
        </div>
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 text-[11px] mb-1">
            <span className="col-span-6 truncate">{item.name}</span>
            <span className="col-span-2 text-center">{item.qty}</span>
            <span className="col-span-4 text-right">{currency}{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1 text-right border-b border-slate-200 pb-2 mb-4">
        <div className="flex justify-between text-[10px]">
          <span>Subtotal:</span>
          <span>{currency}{subtotal}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>GST:</span>
          <span>{currency}{tax}</span>
        </div>
        <div className="flex justify-between text-base font-black pt-2">
          <span>TOTAL:</span>
          <span>{currency}{total}</span>
        </div>
        <div className="flex justify-between text-[9px] font-bold uppercase pt-2 text-slate-500">
          <span>Payment:</span>
          <span>{paymentMethod}</span>
        </div>
      </div>

      <div className="text-center italic text-[10px] mt-8">
        <p>Thank you for dining with us!</p>
        <p className="mt-1">Visit again soon</p>
      </div>
      
      <div className="mt-10 pt-10 border-t border-slate-100 text-[8px] text-center text-slate-300">
        System by GrandHotel Suite
      </div>
    </div>
  );
};
