import React from "react";
import { ArrowLeft, Trash2, ShieldCheck } from "../../../shared/utils/icons";
import { Medicine, SalesEntryItem } from "../services/pharmacyService";

interface SalesEntryViewProps {
  medicines: Medicine[];
  salesCurrentItem: SalesEntryItem;
  updateSalesCurrentItem: (field: keyof SalesEntryItem, value: string | number) => void;
  addSalesCurrentItem: () => void;
  salesItems: SalesEntryItem[];
  removeSalesItem: (index: number) => void;

  salesPatientIP: string;
  handleSalesPatientIPChange: (ip: string) => void;
  ipLookupStatus: "idle" | "found" | "notfound";
  allIPRecords: string[];
  salesPatientName: string;
  setSalesPatientName: (val: string) => void;
  salesPaymentMode: string;
  setSalesPaymentMode: (val: string) => void;
  salesPaidAmount: number;
  setSalesPaidAmount: (val: number) => void;
  salesBillNo: string;

  handlePharmacySubmit: (e?: React.FormEvent) => void;
  setPharmacyView: (view: "dashboard" | "createMedicine" | "purchaseEntry" | "salesEntry" | "salesBills") => void;
}

const SalesEntryView: React.FC<SalesEntryViewProps> = ({
  medicines,
  salesCurrentItem,
  updateSalesCurrentItem,
  addSalesCurrentItem,
  salesItems,
  removeSalesItem,
  salesPatientIP,
  handleSalesPatientIPChange,
  ipLookupStatus,
  allIPRecords,
  salesPatientName,
  setSalesPatientName,
  salesPaymentMode,
  setSalesPaymentMode,
  salesPaidAmount,
  setSalesPaidAmount,
  salesBillNo,
  handlePharmacySubmit,
  setPharmacyView
}) => {
  const currentTotalAmount = salesItems.reduce((acc, i) => acc + Number(i.totalAmount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPharmacyView("dashboard")}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Sales Entry Form */}
      <div className="bg-white border-t-[6px] border-hospital-blue shadow-sm rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">SALES ENTRY</h3>
        </div>
        <div className="p-6 space-y-8">
          {/* Item Entry Section */}
          <div className="grid grid-cols-7 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Medicine Name</label>
              <div className="relative">
                <input
                  type="text"
                  list="sales-med-options"
                  value={salesCurrentItem.name}
                  onChange={(e) => updateSalesCurrentItem("name", e.target.value)}
                  placeholder="Search Medicine..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-hospital-blue outline-none"
                />
                <datalist id="sales-med-options">
                  {medicines.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.id} • Stock: {m.stock}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Stock Status</label>
              <input
                readOnly
                type="text"
                value={salesCurrentItem.stockStrips ? `${salesCurrentItem.stockStrips} Available` : "0 Available"}
                className={`w-full px-3 py-2 border rounded-xl text-xs outline-none font-bold ${
                  salesCurrentItem.stockStrips && Number(salesCurrentItem.stockStrips) === 0
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-slate-100 bg-slate-50 text-slate-500"
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Batch NO</label>
              <input
                type="text"
                value={salesCurrentItem.batchNo || ""}
                onChange={(e) => updateSalesCurrentItem("batchNo", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-hospital-blue outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Quantity</label>
              <input
                type="text"
                inputMode="decimal"
                value={salesCurrentItem.qty === 0 ? "" : String(salesCurrentItem.qty)}
                onChange={(e) => updateSalesCurrentItem("qty", e.target.value)}
                placeholder="Enter Qty"
                className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none ${
                  salesCurrentItem.stockStrips &&
                  Number(salesCurrentItem.qty) > Number(salesCurrentItem.stockStrips)
                    ? "border-red-400 bg-red-50 text-red-700 focus:border-red-500"
                    : "border-slate-200 focus:border-hospital-blue"
                }`}
              />
              {salesCurrentItem.stockStrips &&
                Number(salesCurrentItem.qty) > Number(salesCurrentItem.stockStrips) && (
                <p className="text-[10px] font-bold text-red-600 mt-0.5">
                  ⚠ Only {salesCurrentItem.stockStrips} in stock
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Purchase Price (₹)</label>
              <input
                type="text"
                inputMode="decimal"
                value={salesCurrentItem.purchasePrice === 0 ? "" : String(salesCurrentItem.purchasePrice)}
                onChange={(e) => updateSalesCurrentItem("purchasePrice", e.target.value)}
                placeholder="Purchase Price"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-hospital-blue outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">MRP (₹)</label>
              <input
                type="text"
                inputMode="decimal"
                value={salesCurrentItem.mrp === 0 ? "" : String(salesCurrentItem.mrp)}
                onChange={(e) => updateSalesCurrentItem("mrp", e.target.value)}
                placeholder="Enter MRP"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-hospital-blue outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Expiry</label>
              <input
                type="text"
                value={salesCurrentItem.expiry || ""}
                onChange={(e) => updateSalesCurrentItem("expiry", e.target.value)}
                placeholder="MM-YYYY"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-hospital-blue outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Discount (%)</label>
              <input
                type="text"
                inputMode="decimal"
                value={salesCurrentItem.discount === 0 ? "" : String(salesCurrentItem.discount)}
                onChange={(e) => updateSalesCurrentItem("discount", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-hospital-blue outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Tax (%)</label>
              <input
                type="text"
                inputMode="decimal"
                value={salesCurrentItem.tax === 0 ? "" : String(salesCurrentItem.tax)}
                onChange={(e) => updateSalesCurrentItem("tax", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-hospital-blue outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Line Total</label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-hospital-blue">
                ₹{Number(salesCurrentItem.totalAmount || 0).toFixed(2)}
              </div>
            </div>
            <div className="col-span-1">
              <button
                onClick={addSalesCurrentItem}
                className="px-6 py-2 bg-hospital-blue text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Add to Bill
              </button>
            </div>
          </div>

          {/* Sales Items Table */}
          <div className="border border-slate-100 rounded-[2rem] overflow-hidden min-h-[150px]">
            <table className="w-full text-[10px] text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-widest font-black">
                <tr>
                  <th className="px-4 py-3">S.No</th>
                  <th className="px-4 py-3">Medicine</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">MRP</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Tax</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {salesItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-black text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 font-bold text-hospital-blue">{item.batchNo}</td>
                    <td className="px-4 py-3 font-black">{item.qty}</td>
                    <td className="px-4 py-3">₹{Number(item.mrp || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-500">{item.discount}%</td>
                    <td className="px-4 py-3 text-slate-500">{item.tax}%</td>
                    <td className="px-4 py-3 font-black text-emerald-600">
                      ₹{Number(item.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeSalesItem(idx)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {salesItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-slate-300 font-black uppercase tracking-widest text-[9px]"
                    >
                      No items in current sales invoice
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bill Summary */}
          <div className="pt-8 border-t border-slate-100 space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 flex items-center">
                  Patient IP Lookup
                  {ipLookupStatus === "found" && (
                    <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[8px] font-black">
                      ✓ FOUND
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  list="ip-list"
                  value={salesPatientIP}
                  onChange={(e) => handleSalesPatientIPChange(e.target.value)}
                  placeholder="Enter IP No (e.g. IP0001)"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-hospital-blue"
                />
                <datalist id="ip-list">
                  {allIPRecords.map((ip) => (
                    <option key={ip} value={ip} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Patient Name</label>
                <input
                  type="text"
                  value={salesPatientName}
                  onChange={(e) => setSalesPatientName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-hospital-blue"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Payment Mode</label>
                <select
                  value={salesPaymentMode}
                  onChange={(e) => setSalesPaymentMode(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-hospital-blue"
                >
                  <option value="">Select Payment</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / Online</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Total Bill Amount</label>
                <div className="px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-black text-lg border border-emerald-100">
                  ₹{currentTotalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Bill Ref: #{salesBillNo}
              </p>
              <button
                onClick={() => handlePharmacySubmit()}
                className="px-12 py-4 bg-hospital-blue text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center space-x-3"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Complete Transaction & Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesEntryView;
