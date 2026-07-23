import React from "react";
import "./styles/patient-management.css";
import {
  UserPlus,
  User,
  History,
  Activity,
  FileText,
  Trash2,
} from "../../shared/utils/icons";
import Modal from "../../shared/components/Modal";
import { Patient, Appointment, Invoice, Doctor } from "../../shared/types";
import { usePatientManagement } from "./services/patientService";
import PatientData from "./data/patientMockData.json";

// New Modular Subcomponents
import PatientHistoryTimeline from "./components/PatientHistoryTimeline";
import PrescriptionModal from "./components/PrescriptionModal";
import RegistrationModal from "./components/RegistrationModal";
import AdmissionReceiptModal from "./components/AdmissionReceiptModal";

interface PatientDataType {
  DOCTOR_FEES: Record<string, number>;
}

const DOCTOR_FEES = (PatientData as PatientDataType).DOCTOR_FEES as Record<string, number> || {};

interface Props {
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  doctors: Doctor[];
  onAddPatient: (p: Patient) => void;
  onDeletePatient: (id: string) => void;
  onAddInvoice: (i: Invoice) => void;
  registrationRequest?: { doctorName: string } | null;
  onRegistrationHandled?: () => void;
}

const PatientManagemnt: React.FC<Props> = (props) => {
  const { doctors = [] } = props;
  const {
    searchTerm,
    setSearchTerm,
    filteredPatients,
    isModalOpen,
    setIsModalOpen,
    showReceipt,
    setShowReceipt,
    latestPatient,
    selectedDoctor,
    setSelectedDoctor,
    selectedHistoryPatient,
    setSelectedHistoryPatient,
    selectedPrescriptionPatient,
    setSelectedPrescriptionPatient,
    patientFirstName,
    setPatientFirstName,
    patientLastName,
    setPatientLastName,
    followUp,
    handleRegister,
    handleDeletePatient,
    generateAdmissionPDF,
  } = usePatientManagement(props);

  return (
    <div className="patient-management-container">
      <div className="management-header print:hidden">
        <div>
          <h1 className="header-title">Patient Registry</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group flex-1 md:w-80">
            <input
              type="text"
              placeholder="Search Identity..."
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setSelectedDoctor("");
            }}
            className="action-button"
          >
            <UserPlus className="w-5 h-5" />
            <span>New Patient</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.05)] overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">
                <th className="px-10 py-8">ID Handle</th>
                <th className="px-10 py-8">Identity Meta</th>
                <th className="px-10 py-8">Assigned Clinician</th>
                <th className="px-10 py-8 text-center">Prescription</th>
                <th className="px-10 py-8 text-center">Status</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-emerald-50/20 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-emerald-600 font-black">{p.id}</span>
                      <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter opacity-50">
                        {p.serial}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-lg tracking-tighter group-hover:text-emerald-600 transition-colors">
                        {p.name}
                      </span>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          {p.age}Y • {p.gender}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">
                          Group {p.blood}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700 tracking-tight leading-none mb-1">{p.doctor}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialist Physician</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <button
                      onClick={() => setSelectedPrescriptionPatient(p)}
                      className="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 hover:border-emerald-600"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === "Critical" ? "bg-red-50 text-red-600 shadow-sm shadow-red-100" : "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100"}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === "Critical" ? "bg-red-600 animate-pulse" : "bg-emerald-500"}`} />
                      <span>{p.status}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right flex items-center justify-end space-x-2">
                    <button
                      onClick={() => generateAdmissionPDF(p)}
                      className="p-4 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-2xl text-emerald-600 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-1"
                      title="Download Admission Form"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedHistoryPatient(p)}
                      className="p-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl text-slate-400 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-1"
                      title="Comprehensive EMR History"
                    >
                      <History className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePatient(p)}
                      className="p-4 bg-red-50 hover:bg-red-600 hover:text-white rounded-2xl text-red-500 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-1"
                      title="Delete Patient"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selectedHistoryPatient}
        onClose={() => setSelectedHistoryPatient(null)}
        title={`Medical History: ${selectedHistoryPatient?.name}`}
      >
        {selectedHistoryPatient && (
          <div>
            <div className="flex items-center space-x-4 mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedHistoryPatient.name}</h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {selectedHistoryPatient.id} • {selectedHistoryPatient.age}Y • {selectedHistoryPatient.gender} •{" "}
                  {selectedHistoryPatient.blood} GROUP
                </p>
              </div>
            </div>

            <PatientHistoryTimeline
              patient={selectedHistoryPatient}
              appointments={props.appointments}
              invoices={props.invoices}
            />
          </div>
        )}
      </Modal>

      <PrescriptionModal
        isOpen={!!selectedPrescriptionPatient}
        onClose={() => setSelectedPrescriptionPatient(null)}
        selectedPrescriptionPatient={selectedPrescriptionPatient}
      />

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientFirstName={patientFirstName}
        setPatientFirstName={setPatientFirstName}
        patientLastName={patientLastName}
        setPatientLastName={setPatientLastName}
        selectedDoctor={selectedDoctor}
        setSelectedDoctor={setSelectedDoctor}
        doctors={doctors}
        DOCTOR_FEES={DOCTOR_FEES}
        followUp={followUp}
        handleRegister={handleRegister}
      />

      <AdmissionReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        latestPatient={latestPatient}
        generateAdmissionPDF={generateAdmissionPDF}
      />
    </div>
  );
};

export default PatientManagemnt;
