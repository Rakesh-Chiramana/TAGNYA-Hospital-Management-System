import React from "react";
import { Patient } from "../../../shared/types";
import {
  Receipt,
  User,
  IndianRupee,
  History,
} from "../../../shared/utils/icons";
import { LedgerEntry } from "../hooks/useLedger";
import BillingData from "../data/billingMockData.json";

interface LedgerTableProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  setIsModalOpen: (val: boolean) => void;
  filteredEntries: LedgerEntry[];
  loading: boolean;
  patients: Patient[];
  generateMasterBill: (patient: Patient, invoice?: any) => void;
  onMarkPaid: (id: number, amount: number) => void;
  onDelete: (id: number) => void;
}

const LedgerTable: React.FC<LedgerTableProps> = ({
  filterStatus,
  setFilterStatus,
  setIsModalOpen,
  filteredEntries,
  loading,
  patients,
  generateMasterBill,
  onMarkPaid,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 md:items-center justify-between bg-slate-50/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-hospital-blue rounded-full"></div>
            <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Revenue Management
            </h1>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Financial Ledger Control
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
            {BillingData.filterStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === status
                    ? "bg-white text-hospital-blue shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-hospital-blue transition-all text-[9px] font-black uppercase tracking-widest shadow-lg shadow-slate-100 flex items-center space-x-2"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Create Entry</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-hospital-blue border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold uppercase tracking-widest">Loading Ledger…</span>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <IndianRupee className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-xs font-bold uppercase tracking-widest">No entries found</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Ledger No.</th>
                <th className="px-8 py-5">Patient Details</th>
                <th className="px-8 py-5">Department / Service</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEntries.map((entry) => {
                const patientObj = patients.find(
                  (p) =>
                    p.name?.toLowerCase() === entry.patient_name?.toLowerCase() ||
                    String(p.id) === String(entry.patient_id)
                );
                // Fallback patient so that the "Report" button is always available to view statement
                const patient = patientObj || {
                  id: entry.patient_id ? String(entry.patient_id) : "GUEST",
                  name: entry.patient_name,
                  age: 0,
                  gender: "N/A",
                  blood: "Unknown",
                  address: "N/A",
                  emergencyContact: { name: "", phone: "" },
                  type: "OP",
                  status: "Active",
                  admissionDate: entry.created_at ? new Date(entry.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
                  admissionTime: entry.created_at ? new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  doctor: "N/A",
                  serial: "",
                  contact: "N/A",
                  dob: "",
                  email: "",
                  fee: 0,
                  paymentMethod: "Cash",
                  cause: "",
                  signature: ""
                };
                const dateStr = entry.created_at
                  ? new Date(entry.created_at).toLocaleDateString("en-IN")
                  : "—";

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/80 transition-all group"
                  >
                    {/* Ledger No + Date */}
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-hospital-blue font-mono">
                          {entry.ledger_no}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                          {dateStr}
                        </span>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-hospital-blue/10 group-hover:text-hospital-blue transition-colors">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 tracking-tight group-hover:text-hospital-blue/70 transition-colors">
                            {entry.patient_name}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">
                            PID: {entry.patient_id ?? "GUEST"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department / Service */}
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-tight inline-block w-fit">
                          {entry.department}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {entry.service_name}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-1 text-xs font-black text-slate-900">
                        <IndianRupee className="w-3 h-3 text-slate-400" />
                        <span>
                          {Number(entry.amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          entry.payment_status === "Paid"
                            ? "bg-hospital-blue/10 text-hospital-blue/70"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {entry.payment_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Mark Paid — only if Pending */}
                        {entry.payment_status === "Pending" && (
                          <button
                            onClick={() => onMarkPaid(entry.id, Number(entry.amount))}
                            className="p-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg text-emerald-600 transition-all flex items-center space-x-1.5"
                            title="Mark as Paid"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span className="text-[8px] font-black uppercase">Paid</span>
                          </button>
                        )}

                        {/* Patient Report — only if linked patient */}
                        {patientObj && (
                          <button
                            onClick={() => generateMasterBill(patient, {
                              id: entry.id,
                              name: entry.patient_name,
                              patientId: entry.patient_id? String(entry.patient_id): "GUEST",                            
                              services: `${entry.department} - ${entry.service_name}`,
                              amount: `₹${Number(entry.amount).toFixed(0)}`,
                              date: entry.created_at ? new Date(entry.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
                              time: entry.created_at ? new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              status: entry.payment_status,
                              charges: entry.charges, 
                            })}
                            className="p-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg text-slate-400 transition-all flex items-center space-x-1.5"
                            title="View Statement"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase">Report</span>
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="p-2 bg-slate-100 hover:bg-red-600 hover:text-white rounded-lg text-slate-400 transition-all"
                          title="Delete Entry"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LedgerTable;
