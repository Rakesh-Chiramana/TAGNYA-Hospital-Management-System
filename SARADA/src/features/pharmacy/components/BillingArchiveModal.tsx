import React, { useState } from "react";
import Modal from "../../../shared/components/Modal";
import { History, Receipt } from "../../../shared/utils/icons";
import { generateBulkOrderPDF, generatePharmacyBillPDF } from "../services/pharmacyPDFService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recentBills: any[];
  stockBills: any[];
}

const BillingArchiveModal: React.FC<Props> = ({ isOpen, onClose, recentBills, stockBills }) => {
  const [billFilterTab, setBillFilterTab] = useState<"All" | "Sales" | "Procurement">("All");
  const [dateFilter, setDateFilter] = useState("");

  const filteredBills = (billFilterTab === "All"
    ? [...(recentBills || []).map(b => ({ ...b, billType: 'Sales' })), ...(stockBills || []).map(b => ({ ...b, billType: 'Procurement' }))]
    : billFilterTab === "Sales"
      ? (recentBills || []).map(b => ({ ...b, billType: 'Sales' }))
      : (stockBills || []).map(b => ({ ...b, billType: 'Procurement' }))) || [];

  const finalBills = filteredBills.filter((b: any) => !dateFilter || (b.date && b.date.includes(dateFilter.split("-").reverse().join("/"))));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pharmacy Billing Archives" size="xl">
      <div className="space-y-8 min-h-[500px]">
        <div className="flex justify-between items-center bg-slate-100 p-2 rounded-[2rem]">
          <div className="flex space-x-2">
            {(["All", "Sales", "Procurement"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setBillFilterTab(tab)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${billFilterTab === tab ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab === "All" ? "All Records" : tab === "Sales" ? "Medicine Sales" : "Stock Procurement"}
              </button>
            ))}
          </div>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none" />
        </div>
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left">
            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">
              <tr><th className="px-5 py-4">ID / Date</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Name</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {finalBills.map((bill: any) => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-5 text-xs font-black text-slate-900">{bill.id}</td>
                  <td className="px-5 py-5"><span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${bill.billType === "Sales" ? "bg-hospital-blue/10 text-hospital-blue" : "bg-blue-50 text-blue-600"}`}>{bill.billType}</span></td>
                  <td className="px-5 py-5 text-xs font-black text-slate-700">{bill.billType === "Sales" ? bill.patientName : bill.vendor}</td>
                  <td className="px-5 py-5 text-xs font-black text-hospital-blue">₹{(bill.total || 0).toFixed(0)}</td>
                  <td className="px-5 py-5 text-right">
                    <button onClick={() => bill.billType === "Sales" ? generatePharmacyBillPDF(bill) : generateBulkOrderPDF(bill)} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-hospital-blue transition-all"><Receipt className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {finalBills.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400 uppercase text-[10px] font-black">No matching records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

export default BillingArchiveModal;
