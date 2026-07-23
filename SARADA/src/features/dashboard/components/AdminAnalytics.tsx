import React from "react";
import { Bed, Users, TrendingUp, User, IndianRupee, Pill, FlaskConical } from "../../../shared/utils/icons";
import { Patient } from "../../../shared/types";

interface RevenueStats {
  consultation: number;
  pharmacy: number;
  lab: number;
  ipd: number;
}

interface AnalyticsInvoice {
  id: string;
  name: string;
  amount: string;
  status: "Paid" | "Pending" | "Cancelled" | string;
}
interface AdminAnalyticsProps {
  patients: Patient[];
  setShowAllPatientsModal: (type: "IP" | "OP" | "ALL") => void;
  revenueStats: RevenueStats;
  invoices: AnalyticsInvoice[];
  setShowAllInvoicesModal: (val: boolean) => void;
  setSelectedProfile: (p: Patient) => void;
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  patients,
  setShowAllPatientsModal,
  revenueStats,
  invoices,
  setShowAllInvoicesModal,
  setSelectedProfile,
}) => {
  return (
    <div className="space-y-12">
      {/* Top Analytics Cards */}
      <div className="flex flex-col xl:flex-row gap-8">
        {/* IP Members Card */}
        <div className="p-6 bg-white border border-orange-100 rounded-[2.5rem] shadow-xl shadow-orange-900/5 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex-1 max-w-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="flex items-center space-x-5 relative z-10">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/40">
              <Bed className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                {patients.filter((p) => p?.type?.toUpperCase() === "IP").length}
              </h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                IP Members (Inpatients)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAllPatientsModal("IP")}
            className="absolute z-10 bottom-5 right-6 text-[8px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest flex items-center space-x-1.5 bg-orange-50/50 px-3 py-1.5 rounded-lg transition-all border border-orange-100/50"
          >
            <span>CLICK TO VIEW LIST</span>
            <TrendingUp className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* OP Patients Card */}
        <div className="p-6 bg-white border border-hospital-blue/10 rounded-[2.5rem] shadow-xl shadow-hospital-blue/5 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex-1 max-w-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-hospital-blue/10 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="flex items-center space-x-5 relative z-10">
            <div className="w-14 h-14 bg-hospital-blue rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-hospital-blue/40">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                {
                  patients.filter(
                    (p) =>
                      p?.type?.toUpperCase() === "OP" ||
                      p?.type?.toUpperCase() === "CONSULTING" ||
                      !p?.type
                  ).length
                }
              </h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                OP Patients (Outpatients)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAllPatientsModal("OP")}
            className="absolute z-10 bottom-5 right-6 text-[8px] font-black text-hospital-blue hover:text-hospital-blue/70 uppercase tracking-widest flex items-center space-x-1.5 bg-hospital-blue/50 px-3 py-1.5 rounded-lg transition-all border border-hospital-blue/50"
          >
            <span>CLICK TO VIEW LIST</span>
            <TrendingUp className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Mini Revenue Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* OPD Revenue */}
        <div className="group relative p-7 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-[2rem] shadow-[0_8px_30px_-10px_rgba(59,130,246,0.4)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-14 -mt-14 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
                OPD Revenue
              </p>
              <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-blue-200" />
              <h4 className="text-2xl font-black tracking-tight">
                {revenueStats.consultation.toLocaleString("en-IN")}
              </h4>
            </div>
            <div className="flex items-center space-x-1.5 mt-3">
              <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-blue-200">
                Consultations
              </span>
            </div>
          </div>
        </div>

        {/* Pharmacy Revenue */}
        <div className="group relative p-7 bg-gradient-to-br from-hospital-blue via-hospital-blue to-teal-700 rounded-[2rem] shadow-[0_8px_30px_-10px_rgba(16,185,129,0.4)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-14 -mt-14 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
                Pharmacy Rev.
              </p>
              <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                <Pill className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-hospital-blue/20" />
              <h4 className="text-2xl font-black tracking-tight">
                {revenueStats.pharmacy.toLocaleString("en-IN")}
              </h4>
            </div>
            <div className="flex items-center space-x-1.5 mt-3">
              <span className="w-1.5 h-1.5 bg-hospital-blue/30 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-hospital-blue/20">
                Dispensing
              </span>
            </div>
          </div>
        </div>

        {/* Laboratory Revenue */}
        <div className="group relative p-7 bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-700 rounded-[2rem] shadow-[0_8px_30px_-10px_rgba(139,92,246,0.4)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-14 -mt-14 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
                Laboratory Rev.
              </p>
              <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-purple-200" />
              <h4 className="text-2xl font-black tracking-tight">
                {revenueStats.lab.toLocaleString("en-IN")}
              </h4>
            </div>
            <div className="flex items-center space-x-1.5 mt-3">
              <span className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-purple-200">
                Diagnostics
              </span>
            </div>
          </div>
        </div>

        {/* IPD/Services Revenue */}
        <div className="group relative p-7 bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 rounded-[2rem] shadow-[0_8px_30px_-10px_rgba(245,158,11,0.4)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-14 -mt-14 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
                IPD/Services
              </p>
              <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                <Bed className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-amber-200" />
              <h4 className="text-2xl font-black tracking-tight">
                {revenueStats.ipd.toLocaleString("en-IN")}
              </h4>
            </div>
            <div className="flex items-center space-x-1.5 mt-3">
              <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-amber-200">
                Bed Charges
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monitor & Oversight Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Hospital Billing Oversight */}
        <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                Hospital Billing Oversight
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Recent invoices across all departments
              </p>
            </div>
            <button
              onClick={() => setShowAllInvoicesModal(true)}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-hospital-blue transition-all shadow-xl shadow-slate-900/20"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 rounded-l-2xl">Invoice</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 rounded-r-2xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.slice(0, 8).map((inv, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5 text-xs font-black text-hospital-blue">
                      {inv.id}
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-600">
                      {inv.name}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        {inv.id.startsWith("PH")
                          ? "Pharmacy"
                          : inv.id.startsWith("LB")
                          ? "Laboratory"
                          : "Consultation"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-black text-slate-900">
                      ₹
                      {parseFloat(
                        (inv.amount || "0").replace(/[^\d.-]/g, "")
                      ).toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          inv.status === "Paid"
                            ? "bg-hospital-blue/10 text-hospital-blue/70"
                            : inv.status === "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Registry Monitor */}
        <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                Patient Registry Monitor
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Latest registrations & clinical status
              </p>
            </div>
            <button
              onClick={() => setShowAllPatientsModal("ALL")}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-hospital-blue transition-all shadow-xl shadow-slate-900/20"
            >
              Directory
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 rounded-l-2xl">Patient ID</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 rounded-r-2xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.slice(0, 8).map((p, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5 text-xs font-black text-slate-400">
                      {p.id}
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-600">
                      {p.name}
                    </td>
                    <td className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {p.doctor?.split(" ")[1] || "General"}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          p?.type?.toUpperCase() === "IP"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-hospital-blue/10 text-hospital-blue/70"
                        }`}
                      >
                        {p?.type?.toUpperCase() === "IP" ? "Admitted" : "OPD"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => setSelectedProfile(p)}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-hospital-blue hover:text-white transition-all"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
