import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Activity,
  User,
  Zap,
  FlaskConical,
  Pill,
  MapPin,
} from "../../../shared/utils/icons";
import Modal from "../../../shared/components/Modal";
import LabReport from "../../../shared/components/LabReport";
import { Patient } from "../../../shared/types";

interface DoctorDashboardProps {
  doctorAppointments: any[];
  waitingList: any[];
  doctorPatients: Patient[];
  currentDoctor: any;
  onUpdateDoctorStatus?: (id: string, status: string) => void;
  currentDoctorName: string;
  notify: (msg: string, type: string) => void;
  doctorLabTests: any[];
  patients: Patient[];
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctorAppointments,
  waitingList,
  doctorPatients,
  currentDoctor,
  onUpdateDoctorStatus,
  currentDoctorName,
  notify,
  doctorLabTests,
  patients,
}) => {
  const [selectedReport, setSelectedReport] = useState<any>(null);

  return (
    <div className="space-y-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-[3rem] bg-blue-50 border border-blue-200 shadow-lg shadow-blue-100/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-100/50 rounded-full -mr-14 -mt-14 group-hover:scale-125 transition-transform duration-700"></div>
          <div className="relative z-10">
            <Calendar className="w-8 h-8 mb-4 text-blue-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              Scheduled Appointments
            </p>
            <h4 className="text-3xl font-black tracking-tighter text-blue-700">
              {doctorAppointments.length}
            </h4>
          </div>
        </div>
        <div className="p-8 rounded-[3rem] bg-amber-50 border border-amber-200 shadow-lg shadow-amber-100/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-100/50 rounded-full -mr-14 -mt-14 group-hover:scale-125 transition-transform duration-700"></div>
          <div className="relative z-10">
            <Clock className="w-8 h-8 mb-4 text-amber-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Waiting Patients
            </p>
            <h4 className="text-3xl font-black tracking-tighter text-amber-700">
              {waitingList.length}
            </h4>
          </div>
        </div>
        <div className="p-8 rounded-[3rem] bg-teal-50 border border-teal-200 shadow-lg shadow-teal-100/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-teal-100/50 rounded-full -mr-14 -mt-14 group-hover:scale-125 transition-transform duration-700"></div>
          <div className="relative z-10">
            <Activity className="w-8 h-8 mb-4 text-teal-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-teal-400">
              Total Assigned
            </p>
            <h4 className="text-3xl font-black tracking-tighter text-teal-700">
              {doctorPatients.length}
            </h4>
          </div>
        </div>
      </div>

      {/* Doctor Specific Round List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center justify-between group md:col-span-1">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-hospital-blue/10 rounded-2xl flex items-center justify-center text-hospital-blue group-hover:scale-110 transition-transform">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Current Status
              </p>
              <h4 className="text-xl font-black text-slate-900">
                {currentDoctor?.status || "Available"}
              </h4>
            </div>
          </div>
          <select
            value={currentDoctor?.status || "Available"}
            onChange={(e) =>
              currentDoctor &&
              onUpdateDoctorStatus?.(currentDoctor.id, e.target.value)
            }
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-hospital-blue"
          >
            {[
              "Available",
              "On Rounds",
              "In Surgery",
              "On Leave",
              "Emergency Only",
            ].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-10 rounded-[3rem]">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">
                Patient Locator & Queue
              </h3>
              <button
                onClick={() => {
                  const next = patients.find(
                    (p) =>
                      p.doctor?.includes(currentDoctorName || "") &&
                      p.status === "Waiting"
                  );
                  if (next)
                    notify(
                      `Calling Next Patient: ${next.name} (${next.serial})`,
                      "success"
                    );
                  else notify("No waiting patients in queue.", "info");
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-hospital-blue transition-all flex items-center space-x-2"
              >
                <Zap className="w-3 h-3 text-hospital-blue/40" />
                <span>Call Next Patient</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-hospital-blue rounded-full"></span>
              <span className="text-[10px] font-black text-hospital-blue uppercase tracking-widest">
                Live Queue
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {doctorPatients.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-hospital-blue/20 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-hospital-blue rounded-xl flex items-center justify-center text-white">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{p.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {p.type === "IP"
                        ? `${p.ward} • ${p.room}`
                        : "Outpatient Area"}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-black text-hospital-blue uppercase">
                        Cause: {p.cause || "General Checkup"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                          p.status === "Waiting"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-hospital-blue/10 text-hospital-blue/70"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        notify(`Ordering Lab Test for ${p.name}`, "info")
                      }
                      className="p-2 bg-white border border-slate-200 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <FlaskConical className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        notify(
                          `Redirecting to Pharmacy for ${p.name}`,
                          "success"
                        )
                      }
                      className="p-2 bg-white border border-slate-200 rounded-xl text-hospital-blue hover:bg-hospital-blue hover:text-white transition-all shadow-sm"
                    >
                      <Pill className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      Locator
                    </p>
                    <div className="flex items-center justify-end text-hospital-blue font-black text-xs">
                      <MapPin className="w-3 h-3 mr-1" />{" "}
                      {p.type === "IP" ? p.bed : "OP-Zone"}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-hospital-blue hover:text-white transition-all">
                    Open Case
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-10 rounded-[3rem] bg-slate-900 text-white">
          <h3 className="text-lg font-black uppercase tracking-widest mb-6 text-hospital-blue/40">
            Scheduled Appointments
          </h3>
          <div className="space-y-6">
            {doctorAppointments.map((a) => (
              <div
                key={a.id}
                className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10"
              >
                <Clock className="w-8 h-8 text-white/40" />
                <div>
                  <p className="text-xs font-black">{a.name}</p>
                  <p className="text-[10px] text-hospital-blue font-bold">
                    {a.type} • {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Lab Reports for Doctor */}
      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-600/20">
              <FlaskConical className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                My Related Lab Reports
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Automatic lab reports assigned to you
              </p>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-purple-50 border border-purple-100 rounded-2xl">
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
              {doctorLabTests.length} Total Reports
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {doctorLabTests.length > 0 ? (
            doctorLabTests.map((report: any) => (
              <div
                key={report.id}
                className="group p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-purple-200 hover:bg-white hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-[3rem] -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest ${
                        report.status === "Completed"
                          ? "bg-hospital-blue/10 text-hospital-blue/70"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 font-mono">
                      {report.id}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-1">
                    {report.patient}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    {report.test}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                        Reported On
                      </span>
                      <span className="text-[10px] font-bold text-slate-900">
                        {report.time}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">
                No lab reports found for your account
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lab Report Modal for Doctor */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Diagnostic Investigation Report"
      >
        {selectedReport && (
          <div className="p-4">
            <div id="printable-report">
              <LabReport test={selectedReport} />
            </div>
            <div className="mt-8 flex justify-center print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-3 px-10 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-hospital-blue transition-all shadow-2xl"
              >
                <span>Print PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
