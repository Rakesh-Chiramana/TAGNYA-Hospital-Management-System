import React from "react";
import Modal from "../../../shared/components/Modal";
import { User, Stethoscope, Activity, Calendar, Bed, ClipboardList } from "../../../shared/utils/icons";
import { Patient } from "../../../shared/types";

interface DashboardModalsProps {
  showAllInvoicesModal: boolean;
  setShowAllInvoicesModal: (val: boolean) => void;
  invoices: any[];
  showAllPatientsModal: "IP" | "OP" | "ALL" | null;
  setShowAllPatientsModal: (val: "IP" | "OP" | "ALL" | null) => void;
  patients: Patient[];
  selectedProfile: Patient | null;
  setSelectedProfile: (val: Patient | null) => void;
}

const DashboardModals: React.FC<DashboardModalsProps> = ({
  showAllInvoicesModal,
  setShowAllInvoicesModal,
  invoices,
  showAllPatientsModal,
  setShowAllPatientsModal,
  patients,
  selectedProfile,
  setSelectedProfile,
}) => {
  return (
    <>
      {/* Hospital Oversight: All Invoices Modal */}
      <Modal
        isOpen={showAllInvoicesModal}
        onClose={() => setShowAllInvoicesModal(false)}
        title="Hospital Billing Oversight - Complete Ledger"
        size="xl"
      >
        <div className="overflow-x-auto p-4">
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
              {invoices.map((inv, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
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
      </Modal>

      {/* Hospital Monitor: Patient Directory Modal */}
      <Modal
        isOpen={showAllPatientsModal !== null}
        onClose={() => setShowAllPatientsModal(null)}
        title={`Patient Registry - ${
          showAllPatientsModal === "IP"
            ? "Inpatients"
            : showAllPatientsModal === "OP"
            ? "Outpatients"
            : "Complete Directory"
        }`}
        size="xl"
      >
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 rounded-l-2xl">Patient ID</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Dept/Doctor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 rounded-r-2xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {patients
                .filter((p) => {
                  if (showAllPatientsModal === "ALL") return true;
                  if (showAllPatientsModal === "IP")
                    return p?.type?.toUpperCase() === "IP";
                  if (showAllPatientsModal === "OP")
                    return (
                      p?.type?.toUpperCase() === "OP" ||
                      p?.type?.toUpperCase() === "CONSULTING" ||
                      !p?.type
                    );
                  return false;
                })
                .map((p, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-5 text-xs font-black text-slate-400">
                      {p.id}
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-600">
                      {p.name}
                    </td>
                    <td className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {p.doctor || "General"}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          p.type === "IP"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-hospital-blue/10 text-hospital-blue/70"
                        }`}
                      >
                        {p.type === "IP" ? "Admitted" : "OPD"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-medium text-slate-500">
                      {p.contact || "N/A"}
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => setSelectedProfile(p)}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-hospital-blue hover:text-white transition-all"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Patient Profile Modal */}
      <Modal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        title="Patient Profile"
        size="md"
      >
        {selectedProfile && (
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 bg-hospital-blue/10 rounded-2xl flex items-center justify-center text-hospital-blue shadow-inner">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {selectedProfile.name}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {selectedProfile.id} •{" "}
                  {selectedProfile.type?.toUpperCase() === "IP"
                    ? "Inpatient"
                    : "Outpatient"}
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      selectedProfile.status === "Critical"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {selectedProfile.status || "Active"}
                  </span>
                  <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                    {selectedProfile.gender} • {selectedProfile.age}Y
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  Contact
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {selectedProfile.contact || "N/A"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" /> Assigned Doctor
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {selectedProfile.doctor || "General"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Blood Group
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {selectedProfile.blood || "Unknown"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Admission Date
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {selectedProfile.admissionDate || "N/A"}
                </p>
              </div>
              {selectedProfile.type?.toUpperCase() === "IP" && (
                <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Bed className="w-3 h-3" /> Location
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedProfile.ward || "N/A"} •{" "}
                    {selectedProfile.room || "N/A"} •{" "}
                    {selectedProfile.bed || "N/A"}
                  </p>
                </div>
              )}
              {selectedProfile.cause && (
                <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" /> Reason for Visit
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedProfile.cause}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default DashboardModals;
