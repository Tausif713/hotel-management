

interface KOTProps {
  orderId: string;
  tableNo: string;
  time: string;
  items: any[];
}

export const PrintKOT = ({ orderId, tableNo, time, items }: KOTProps) => {
  return (
    <div className="printable hidden bg-white text-slate-900 p-4 text-sm border-2 border-black">
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <h1 className="text-xl font-bold uppercase">KOT - KITCHEN</h1>
        <p className="text-xs font-black">ORDER #{orderId}</p>
      </div>

      <div className="flex justify-between mb-2 font-bold text-lg">
        <span>TABLE: {tableNo}</span>
        <span className="text-xs">{time}</span>
      </div>

      <div className="border-b border-black pb-2 mb-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-black uppercase mb-1 border-b border-slate-300">
          <span className="col-span-10">Item Name</span>
          <span className="col-span-2 text-right">Qty</span>
        </div>
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 text-base font-bold mb-1">
            <span className="col-span-10">{item.name}</span>
            <span className="col-span-2 text-right">{item.qty}</span>
            {item.note && (
              <span className="col-span-12 text-[10px] italic font-black text-rose-600">
                NOTE: {item.note}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="text-center font-black text-[10px] mt-4">
        --- End of KOT ---
      </div>
    </div>
  );
};
