import React from "react";
import {
  Package,
  Zap,
  AlertCircle,
  ReceiptIndianRupee,
  ClipboardList,
  ShoppingCart,
  PlusCircle,
  Receipt
} from "../../../shared/utils/icons";
import { Medicine, PharmacyBill } from "../services/pharmacyService";

interface PharmacyDashboardProps {
  totalPharmacyRevenue: number;
  medicines: Medicine[];
  recentBills: PharmacyBill[];
  setPharmacyView: (view: "dashboard" | "salesEntry" | "purchaseEntry" | "createMedicine" | "salesBills") => void;
  setIsStockCheckModalOpen: (open: boolean) => void;
  setIsCreateMedModalOpen: (open: boolean) => void;
}

const PharmacyDashboard: React.FC<PharmacyDashboardProps> = ({
  totalPharmacyRevenue,
  medicines,
  recentBills,
  setPharmacyView,
  setIsStockCheckModalOpen,
  setIsCreateMedModalOpen
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bg-hospital-blue/10 border border-hospital-blue/10 p-6 rounded-[2.5rem] flex items-center space-x-4">
          <div className="w-12 h-12 bg-hospital-blue rounded-2xl flex items-center justify-center text-white">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-hospital-blue/80 uppercase tracking-widest">Inventory Status</p>
            <p className="text-sm font-black text-hospital-blue">Healthy & Stable</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2.5rem] flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Total Sales</p>
            <p className="text-sm font-black text-blue-600">₹{totalPharmacyRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2.5rem] flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Low Stock</p>
            <p className="text-sm font-black text-amber-600">
              {medicines.filter((m) => m.stock < 100).length} Items
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setPharmacyView("salesEntry")}
            className="p-8 bg-white border border-slate-200 hover:border-hospital-blue rounded-[2.5rem] transition-all flex flex-col items-center text-center group shadow-sm"
          >
            <div className="w-16 h-16 bg-hospital-blue/10 rounded-[1.5rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ReceiptIndianRupee className="w-8 h-8 text-hospital-blue" />
            </div>
            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">New Billing</h5>
            <p className="text-[10px] font-medium text-slate-400 uppercase leading-tight">
              Generate professional receipts and process sales instantly.
            </p>
          </button>
          <button
            onClick={() => setIsStockCheckModalOpen(true)}
            className="p-8 bg-white border border-slate-200 hover:border-amber-500 rounded-[2.5rem] transition-all flex flex-col items-center text-center group shadow-sm"
          >
            <div className="w-16 h-16 bg-amber-50 rounded-[1.5rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-8 h-8 text-amber-600" />
            </div>
            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Inventory Audit</h5>
            <p className="text-[10px] font-medium text-slate-400 uppercase leading-tight">
              Perform a comprehensive stock check and audit inventory.
            </p>
          </button>
          <button
            onClick={() => setPharmacyView("purchaseEntry")}
            className="p-8 bg-white border border-slate-200 hover:border-purple-500 rounded-[2.5rem] transition-all flex flex-col items-center text-center group shadow-sm"
          >
            <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Purchase Orders</h5>
            <p className="text-[10px] font-medium text-slate-400 uppercase leading-tight">
              Connect with vendors and create large-scale supply orders.
            </p>
          </button>
          <button
            onClick={() => setIsCreateMedModalOpen(true)}
            className="p-8 bg-white border border-slate-200 hover:border-emerald-500 rounded-[2.5rem] transition-all flex flex-col items-center text-center group shadow-sm"
          >
            <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Add Medicine</h5>
            <p className="text-[10px] font-medium text-slate-400 uppercase leading-tight">
              Register new drug formulations and clinical molecules.
            </p>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Recent Activity</h4>
            <div className="space-y-6">
              {recentBills.slice(0, 3).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black">{bill.patientName}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase">
                        {bill.date} • {bill.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-emerald-400">₹{bill.total.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PharmacyDashboard;
