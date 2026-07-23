import { useState, useMemo } from "react";
import { 
  UserRole, 
  Patient, 
  Appointment, 
  Invoice, 
  Doctor,
  LabTest
} from "../../../shared/types";


export interface Props {
  onVisitorSearch: () => void;
  onAddAdmission: (data: Partial<Patient>) => void;
  userRole: UserRole;
  invoices: Invoice[];
  patients: Patient[];
  appointments: Appointment[];
  currentDoctorName?: string;
  doctors?: Doctor[];
  onUpdateDoctorStatus?: (doctorId: string, status: string) => void;
  onRevenueReport?: () => void;
  labTests?: LabTest[];
}

export const useDashboard = ({
  userRole,
  invoices = [],
  patients = [],
  appointments = [],
  currentDoctorName,
  doctors = [],
  labTests = [],
}: Props) => {
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const notify = (message: string, type: "success" | "info" | "error" = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const currentDoctor = doctors.find((d) => d.name === currentDoctorName);

  const waitingList = useMemo(() => {
    if (!currentDoctorName) return [];
    return patients.filter(
      (p) =>
        p.doctor?.includes(currentDoctorName) &&
        p.type === "OP" &&
        p.status !== "Completed",
    );
  }, [patients, currentDoctorName]);

  const revenueStats = useMemo(() => {
    const stats = { total: 0, pharmacy: 0, lab: 0, consultation: 0, ipd: 0 };
    invoices.forEach((inv) => {
      const amount =
        parseFloat((inv.amount || "0").replace(/[^\d.-]/g, "")) || 0;
      stats.total += amount;
      if (inv.id.startsWith("PH") || inv.services === "Pharmacy") stats.pharmacy += amount;
      else if (inv.id.startsWith("LB") || inv.services === "Lab") stats.lab += amount;
      else if (inv.services === "Bed") stats.ipd += amount;
      else stats.consultation += amount;
    });
    return stats;
  }, [invoices]);

  const opdCount = patients.filter((p) => p?.type?.toUpperCase() === "OP" || p?.status === "Consulting" || !p?.type).length;

  const doctorPatients = !currentDoctorName
    ? []
    : patients.filter((p) => p.doctor?.includes(currentDoctorName));

  const doctorAppointments = !currentDoctorName
    ? []
    : appointments.filter((a) => a.dr.includes(currentDoctorName));

  const doctorLabTests = !currentDoctorName
    ? []
    : labTests.filter((t) => t.doctor === currentDoctorName);

  return {
    notification,
    notify,
    currentDoctor,
    waitingList,
    revenueStats,
    opdCount,
    doctorPatients,
    doctorAppointments,
    doctorLabTests,
  };
};
