import React, { useState, useMemo } from "react";
import { ArrowLeft, Receipt, Trash2, Search } from "../../../shared/utils/icons";
import { PharmacyBill } from "../services/pharmacyService";

interface SalesBillsViewProps {
  recentBills: PharmacyBill[];
  setRecentBills: React.Dispatch<React.SetStateAction<PharmacyBill[]>>;
  onPrintBill: (bill: PharmacyBill) => void;
  setPharmacyView: (view: "dashboard" | "createMedicine" | "purchaseEntry" | "salesEntry" | "salesBills") => void;
}

const SalesBillsView: React.FC<SalesBillsViewProps> = ({
  recentBills,
  setRecentBills,
  onPrintBill,
  setPharmacyView
}) => {
  const [searchValue, setSearchValue] = useState("");

  const filteredBills = useMemo(
    () =>
      recentBills.filter((bill) => {
        const normalizedSearch = searchValue.trim().toLowerCase();
        if (!normalizedSearch) return true;
        return (
          bill.id.toLowerCase().includes(normalizedSearch) ||
          bill.patientName.toLowerCase().includes(normalizedSearch)
        );
      }),
    [recentBills, searchValue],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPharmacyView("dashboard")}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="bg-white border-t-[6px] border-hospital-blue shadow-sm rounded-3xl overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
            PHARMACY BILLING ARCHIVES
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search by Bill No or Patient"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 outline-none focus:border-hospital-blue focus:ring-2 focus:ring-hospital-blue/10"
              />
            </div>
            <div className="text-sm text-slate-500">
              Showing {filteredBills.length} of {recentBills.length} bills
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-4 py-4">Bill No</th>
                  <th className="px-4 py-4">Date / Time</th>
                  <th className="px-4 py-4">Patient Name</th>
                  <th className="px-4 py-4">Items</th>
                  <th className="px-4 py-4 text-right">Total Amount</th>
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-5 text-xs font-black text-slate-900">{bill.id}</td>
                    <td className="px-4 py-5 text-[10px] font-bold text-slate-500 uppercase">
                      {bill.date} • {bill.time}
                    </td>
                    <td className="px-4 py-5 text-xs font-bold text-slate-700">{bill.patientName}</td>
                    <td className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase">
                      {bill.items.length} Items
                    </td>
                    <td className="px-4 py-5 text-right font-black text-emerald-600">
                      ₹{bill.total.toFixed(0)}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => onPrintBill(bill)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-hospital-blue hover:text-white transition-all"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete?")) {
                              setRecentBills((prev) => prev.filter((b) => b.id !== bill.id));
                            }
                          }}
                          className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBills.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]"
                    >
                      {searchValue
                        ? "No bills match that bill number or patient name."
                        : "No billing records found in archives"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesBillsView;
