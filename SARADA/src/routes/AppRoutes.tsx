import React from "react";
import "../shared/styles/AppRouter.css";
import Dashboard from "../features/dashboard/Dashboard";
import PatientManagement from "../features/patient-management/PatientManagement";
import AppointmentManagement from "../features/appointment-management/AppointmentManagement";
import VisitorSearch from "../shared/components/VisitorSearch";
import BillingManagement from "../features/billing-management/BillingManagement";
import LabModule from "../features/lab/LabModule";
import PharmacyModule from "../features/pharmacy/PharmacyModule";
import BedManagement from "../features/bed-management/BedManagement";
import DoctorManagement from "../features/doctor-management/DoctorManagement";
import DischargeSummary from "../features/discharge-summary/DischargeSummary";
import StaffManagement from "../features/staff-management/StaffManagement";
import ExpenseModule from "../features/expense";
import {
 Appointment,
 Bed,
 DischargeSummary as DischargeSummaryType,
 Doctor,
 Invoice,
 LabTest,
 Patient,
 StaffMember,
 UserRole,
 AdmissionData,
 VisitData,
 BedBookingData,
 BedUpdateData,
 ClinicalData,
} from "../shared/types";


type AppTab =
 | "dashboard"
 | "patients"
 | "appointments"
 | "billing"
 | "lab"
 | "pharmacy"
 | "bed-allocation"
 | "doctors"
 | "staff-management"
 | "expense"
 | "visitor-search"
 | "discharge-summary";
type AppointmentUpdate = Partial<Appointment>;
interface AppRouterProps {
  activeTab: string;
  userRole: UserRole | null;
  registrationRequest: { doctorName: string } | null;
  beds: Bed[];
  patients: Patient[];
  invoices: Invoice[];
  appointments: Appointment[];
  doctors: Doctor[];
  labTests: LabTest[];
  setLabTests: (tests: LabTest[]) => void;
  staff: StaffMember[];
  loggedInStaffName: string | null;
  dischargeSummaries: DischargeSummaryType[];
  setActiveTab: (tab: AppTab) => void;
  setRegistrationRequest:(req:{doctorName:string}|null)=>void;
  setStaff: (staff: StaffMember[]) => void;
  setDoctors: (doctors: Doctor[]) => void;
  handleAddAdmission: (data: AdmissionData) => void;
  updateDoctorStatus: (id: string, status: string) => void;
  addPatient: (p: Patient) => void;
  deletePatient: (id: string) => void;
  addInvoice: (i: Invoice) => void;
  deleteInvoice: (id: string) => void;
  addAppointment: (a: Appointment) => void;
  deleteAppointment: (id: string) => void;
  updateAppointment: (id: string, updates: AppointmentUpdate) => void;
  completeVisit: (id: string, data: ClinicalData) => void;
  handleBookBed: (id: string, data: BedBookingData) => void;
  handleReserveBed: (id: string, name: string) => void;
  handleReleaseBed: (id: string) => void;
  handleAddBed: (data: BedUpdateData) => void;
  handleUpdateBed: (id: string, updates: BedUpdateData) => void;
  handleBookSlot: (name: string) => void;
  saveDischargeSummary: (s: DischargeSummaryType) => void;
  onRevenueReport: () => void;
}

const AppRouter: React.FC<AppRouterProps> = (props) => {
  const {
    activeTab,
    userRole,
    registrationRequest,
    beds,
    patients,
    invoices,
    appointments,
    doctors,
    labTests,
    setLabTests,
    staff,
    loggedInStaffName,
    dischargeSummaries,
    setActiveTab,
    setRegistrationRequest,
    setStaff,
    setDoctors,
    handleAddAdmission,
    updateDoctorStatus,
    addPatient,
    deletePatient,
    addInvoice,
    deleteInvoice,
    addAppointment,
    completeVisit,
    handleBookBed,
    handleReserveBed,
    handleReleaseBed,
    handleAddBed,
    handleUpdateBed,
    handleBookSlot,
    saveDischargeSummary,
    onRevenueReport,
  } = props;

  switch (activeTab) {
    case "dashboard":
      return (
        <Dashboard
          onVisitorSearch={() => setActiveTab("visitor-search")}
          onAddAdmission={handleAddAdmission}
          userRole={userRole!}
          invoices={invoices}
          patients={patients}
          appointments={appointments}
          currentDoctorName={userRole === UserRole.DOCTOR ? loggedInStaffName || "" : ""}
          doctors={doctors}
          labTests={labTests}
          onUpdateDoctorStatus={updateDoctorStatus}
          onRevenueReport={onRevenueReport}
        />
      );
    case "patients":
      return (
        <PatientManagement
          patients={patients}
          appointments={appointments}
          invoices={invoices}
          onAddPatient={addPatient}
          onDeletePatient={deletePatient}
          onAddInvoice={addInvoice}
          doctors={doctors}
          registrationRequest={registrationRequest}
          onRegistrationHandled={() => setRegistrationRequest(null)}
        />
      );
    case "appointments":
      return (
        <AppointmentManagement
          appointments={appointments}
          patients={patients}
          onAddAppointment={addAppointment}
          onDeleteAppointment={props.deleteAppointment}
          onUpdateAppointment={props.updateAppointment}
          onCompleteVisit={completeVisit}
          doctors={doctors}
          userRole={userRole}
          loggedInStaffName={loggedInStaffName}
        />
      );
    case "visitor-search":
      return <VisitorSearch patients={patients} doctors={doctors} />;
    case "billing":
      return (
        <BillingManagement
          invoices={invoices}
          onAddInvoice={addInvoice}
          onDeleteInvoice={deleteInvoice}
          patients={patients}
          beds={beds}
        />
      );
    case "lab":
      return (
        <LabModule
          onAddInvoice={addInvoice}
          userRole={userRole!}
          patients={patients}
          doctors={doctors}
          labTests={labTests}
          setLabTests={setLabTests}
        />
      );
    case "pharmacy":
      return (
        <PharmacyModule
          onAddInvoice={addInvoice}
          userRole={userRole!}
          patients={patients}
          doctors={doctors}
          labTests={labTests}
          setLabTests={setLabTests}
        />
      );

    case "bed-allocation":
      return (
        <BedManagement
          beds={beds}
          patients={patients}
          doctors={doctors}
          onBookBed={handleBookBed}
          onReserveBed={handleReserveBed}
          onReleaseBed={handleReleaseBed}
          onAddInvoice={addInvoice}
          onAddBed={handleAddBed}
          onUpdateBed={handleUpdateBed}
          invoices={invoices}
          onDeleteInvoice={deleteInvoice}
          userRole={userRole!}
        />
      );
    case "doctors":
      return (
        <DoctorManagement
          doctors={doctors}
          onBookSlot={handleBookSlot}
          onUpdateStatus={updateDoctorStatus}
          userRole={userRole!}
        />
      );
    case "discharge-summary":
      return (
        <DischargeSummary
          summaries={dischargeSummaries}
          patients={patients}
          userRole={userRole!}
          onSave={saveDischargeSummary}
        />
      );
    case "staff-management":
      return (
        <StaffManagement
          staff={staff}
          setStaff={setStaff}
          doctors={doctors}
          setDoctors={setDoctors}
        />
      );
    case "expense":
      return <ExpenseModule />;
    default:
      return <div>Module Not Found</div>;
  }
};

export default AppRouter;




