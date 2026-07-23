import React from "react";
import "./styles/dashboard.css";
import { UserRole, Patient, LabTest } from "../../shared/types";
import { useDashboard, Props } from "./hooks/useDashboard";
import { ShieldCheck, TrendingUp } from "../../shared/utils/icons";

// Subcomponents
import QuickStatsGrid from "./components/QuickStatsGrid";
import DoctorStatusMonitor from "./components/DoctorStatusMonitor";
import DoctorDashboard from "./components/DoctorDashboard";
import AdminAnalytics from "./components/AdminAnalytics";
import HospitalitySection from "./components/HospitalitySection";
import DashboardModals from "./components/DashboardModals";

const Dashboard: React.FC<Props> = (props) => {
  const {
    userRole,
    invoices = [],
    patients = [],
    doctors = [],
    onUpdateDoctorStatus,
    onRevenueReport,
    currentDoctorName,
  } = props;

  const {
    notification,
    notify,
    currentDoctor,
    waitingList,
    revenueStats,
    doctorPatients,
    doctorAppointments,
    doctorLabTests,
  } = useDashboard(props);

  interface DoctorDashboardProps {
    doctorLabTests: LabTest[];
}

  const [showAllInvoicesModal, setShowAllInvoicesModal] = React.useState(false);
  const [showAllPatientsModal, setShowAllPatientsModal] = React.useState<"IP" | "OP" | "ALL" | null>(null);
  const [selectedProfile, setSelectedProfile] = React.useState<Patient | null>(null);

  return (
    <div className="dashboard-container">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Hospital Command Center
          </p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {userRole === UserRole.ADMIN
              ? "Operations Overview"
              : userRole === UserRole.DOCTOR
              ? "Clinical Workspace"
              : userRole === UserRole.RECEPTIONIST
              ? "Status Monitor"
              : "Inventory Control"}
          </h2>
        </div>
        {userRole === UserRole.ADMIN && (
          <button
            onClick={onRevenueReport}
            className="px-6 py-2.5 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center space-x-2"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Revenue Report</span>
          </button>
        )}
      </div>

      {/* Admin / Receptionist Quick Stats */}
      {userRole !== UserRole.DOCTOR && (
        <div className="space-y-10">
          <QuickStatsGrid patients={patients} doctors={doctors} />
          <DoctorStatusMonitor doctors={doctors} />
        </div>
      )}

      {/* Doctor Exclusive Dashboard */}
      {userRole === UserRole.DOCTOR && (
        <DoctorDashboard
          doctorAppointments={doctorAppointments}
          waitingList={waitingList}
          doctorPatients={doctorPatients}
          currentDoctor={currentDoctor}
          onUpdateDoctorStatus={onUpdateDoctorStatus}
          currentDoctorName={currentDoctorName || ""}
          notify={notify}
          doctorLabTests={doctorLabTests}
          patients={patients}
        />
      )}

      {/* Admin Analytics & Oversight */}
      {userRole === UserRole.ADMIN && (
        <div className="mt-12 space-y-12">
          <AdminAnalytics
            patients={patients}
            setShowAllPatientsModal={setShowAllPatientsModal}
            revenueStats={revenueStats}
            invoices={invoices}
            setShowAllInvoicesModal={setShowAllInvoicesModal}
            setSelectedProfile={setSelectedProfile}
          />
        </div>
      )}

      {/* Hospitality Excellence Footer */}
      <div className="mt-12">
        <HospitalitySection />
      </div>

      {/* System Modals */}
      <DashboardModals
        showAllInvoicesModal={showAllInvoicesModal}
        setShowAllInvoicesModal={setShowAllInvoicesModal}
        invoices={invoices}
        showAllPatientsModal={showAllPatientsModal}
        setShowAllPatientsModal={setShowAllPatientsModal}
        patients={patients}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom">
          <div
            className={`px-8 py-5 rounded-3xl shadow-2xl flex items-center space-x-4 border backdrop-blur-xl ${
              notification.type === "success"
                ? "bg-hospital-blue/90 border-hospital-blue/30"
                : "bg-slate-900/90 border-slate-700"
            } text-white`}
          >
            <ShieldCheck className="w-6 h-6 text-hospital-blue/40" />
            <span className="text-sm font-black uppercase tracking-widest">
              {notification.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
