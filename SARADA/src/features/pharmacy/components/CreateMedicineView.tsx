import React from "react";
import { ArrowLeft } from "../../../shared/utils/icons";

interface Medicine {
  id: string;
  name: string;
  dosage?: string;
  hsnCode?: string;
  pack?: string;
  taxPercentage?: string | number;
  companyName?: string;
}

interface Vendor {
  id: string;
  name: string;
  status?: string;
}

interface CreateMedicineViewProps {
  recentlyCreatedMedicines: Medicine[];
  vendors?: Vendor[];
  handleCreateMedicine: (e: React.FormEvent) => void;
  setPharmacyView: (view: "dashboard") => void;
}

const CreateMedicineView: React.FC<CreateMedicineViewProps> = ({
  recentlyCreatedMedicines,
  vendors = [],
  handleCreateMedicine,
  setPharmacyView
}) => {
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

      {/* Create Medicine Form */}
      <div className="bg-white border-t-[6px] border-hospital-blue shadow-sm rounded-3xl overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em]">CREATE MEDICINE</h3>
        </div>
        <div className="p-10">
          <form onSubmit={handleCreateMedicine} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-8">
              {/* Left Side */}
              <div className="space-y-8">
                <div className="flex items-center">
                  <label className="w-40 text-xs font-bold text-slate-700">Medicine Name</label>
                  <input
                    required
                    name="medicineName"
                    type="text"
                    placeholder="Enter Medicine Name"
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-100 focus:border-hospital-blue outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-xs font-bold text-slate-700">HSN Code</label>
                  <input
                    required
                    name="hsnCode"
                    type="text"
                    placeholder="Enter HSN Code"
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-100 focus:border-hospital-blue outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-xs font-bold text-slate-700">Tax Percentage</label>
                  <input
                    required
                    name="taxPercentage"
                    type="text"
                    placeholder="Enter Tax Percentage"
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-100 focus:border-hospital-blue outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-xs font-bold text-slate-700">Supplier Vendor</label>
                  <input
                    name="vendorName"
                    list="vendors-datalist"
                    placeholder="Type or select Vendor (Optional)"
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-100 focus:border-hospital-blue outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                  />
                  <datalist id="vendors-datalist">
                    {vendors.filter((v: any) => v.status === "Active").map((v: any) => (
                      <option key={v.id} value={v.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Right Side */}
              <div className="space-y-8">
                <div className="flex items-center">
                  <label className="w-40 text-xs font-bold text-slate-700">Dosage</label>
                  <input
                    required
                    name="dosage"
                    type="text"
                    placeholder="Enter Dosage"
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-100 focus:border-hospital-blue outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-40 text-xs font-bold text-slate-700">Quantity</label>
                  <input
                    required
                    name="quantity"
                    type="text"
                    placeholder="Enter Quantity"
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-100 focus:border-hospital-blue outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="flex items-start pt-1">
                  <label className="w-40 text-xs font-bold text-slate-700 mt-2">Company Name</label>
                  <textarea
                    required
                    name="companyName"
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-100 focus:border-hospital-blue outline-none transition-all min-h-[80px]"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-10 py-3 bg-hospital-blue text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recently Added Table */}
      {recentlyCreatedMedicines.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Added Medicines in this Session
            </h4>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black">
              {recentlyCreatedMedicines.length} ITEMS
            </span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Medicine Name</th>
                <th className="px-8 py-5">Dosage</th>
                <th className="px-8 py-5">HSN Code</th>
                <th className="px-8 py-5">Quantity</th>
                <th className="px-8 py-5">Tax %</th>
                <th className="px-8 py-5">Company Name</th>
                <th className="px-8 py-5 text-right">ID Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentlyCreatedMedicines.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 text-xs font-black text-slate-900">{m.name}</td>
                  <td className="px-8 py-5 text-xs font-medium text-slate-600">{m.dosage}</td>
                  <td className="px-8 py-5 text-xs font-medium text-slate-600">{m.hsnCode}</td>
                  <td className="px-8 py-5 text-xs font-medium text-slate-600">{m.pack}</td>
                  <td className="px-8 py-5 text-xs font-black text-emerald-600">{m.taxPercentage}</td>
                  <td className="px-8 py-5 text-xs font-medium text-slate-600">{m.companyName}</td>
                  <td className="px-8 py-5 text-right text-[10px] font-black text-slate-400 font-mono">
                    {m.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CreateMedicineView;
