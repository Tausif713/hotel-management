import { useState } from "react";

export default function CounterPanel() {
  const tables = [
    { id: "T01", status: "available" },
    { id: "T02", status: "available" },
    { id: "T03", status: "occupied" },
    { id: "T04", status: "available" },
    { id: "T05", status: "inuse" },
    { id: "T06", status: "available" },
  ];

  const [selectedTable, setSelectedTable] = useState("T05");

  const items = [
    { name: "Paneer Tikka", qty: 1, price: 220 },
    { name: "Veg Biryani", qty: 1, price: 220 },
    { name: "Butter Naan", qty: 2, price: 40 },
  ];

  const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* LEFT TABLE VIEW */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">Table View</h2>
        <div className="grid grid-cols-3 gap-4">
          {tables.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTable(t.id)}
              className={`p-4 rounded-xl cursor-pointer shadow ${
                t.status === "available"
                  ? "bg-green-100"
                  : t.status === "occupied"
                  ? "bg-red-100"
                  : "bg-yellow-100"
              } ${selectedTable === t.id ? "ring-2 ring-purple-500" : ""}`}
            >
              <h3 className="font-bold">{t.id}</h3>
              <p className="text-sm capitalize">{t.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT BILL PANEL */}
      <div className="w-1/2 p-4">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Invoice</h2>
          <p className="mb-2">Table: {selectedTable}</p>

          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{i.name}</td>
                  <td className="py-2 text-center">{i.qty}</td>
                  <td className="py-2 text-right">₹{i.price}</td>
                  <td className="py-2 text-right">₹{i.qty * i.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right space-y-1">
            <p className="text-sm text-gray-600">Subtotal: ₹{subtotal}</p>
            <p className="text-sm text-gray-600">GST (5%): ₹{gst.toFixed(2)}</p>
            <h3 className="text-lg font-bold text-purple-600">
              Total: ₹{total.toFixed(2)}
            </h3>
          </div>

          <button className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors">
            Generate Bill
          </button>
        </div>
      </div>
    </div>
  );
}
