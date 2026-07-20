import React, { useState, useMemo } from "react";
import "./styles/appointment-management.css";
import {
  Clock,
  User,
  Calendar as CalendarIcon,
} from "../../shared/utils/icons";
import { jsPDF } from "jspdf";
import { addSaradaHospitalHeader, addProfessionalFooter } from "../../shared/utils/pdfHelper";
import hospitalLogo from "../../assets/sarada_logo.png";
import {
  isUrgentAppointment,
  generateAppointmentId,
  validateVitals,
} from "../../shared/utils/appointmentHelpers";
import appointmentData from "./data/appointmentMockData.json";
const { DOCTOR_SCHEDULES } = appointmentData;
import { generateSlots, getFormattedTime } from "./hooks/useAppointmentManagement";

// Modular Subcomponents
import DutyRoster from "./components/DutyRoster";
import AppointmentList from "./components/AppointmentList";
import BookingModal from "./components/BookingModal";
import DoctorRosterModal from "./components/DoctorRosterModal";
import ActiveSessionModal from "./components/ActiveSessionModal";
import { Appointment, Doctor, Patient } from "../../shared/types";

interface AppointmentManagementProps {
  appointments?: Appointment[];
  patients?: Patient[];
  doctors?: Doctor[];
  onAddAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onUpdateAppointment: (appointmentId: string, updates: Partial<Appointment>) => void;
  onCompleteVisit: (appointmentId: string, clinicalData: any) => void;
  userRole?: string | null;
  loggedInStaffName?: string | null;
}

const AppointmentManagement: React.FC<AppointmentManagementProps> = ({
  appointments = [],
  patients = [],
  doctors = [],
  onAddAppointment,
  onDeleteAppointment,
  onUpdateAppointment,
  onCompleteVisit,
  userRole = null,
  loggedInStaffName = null,
}) => {
  const timeTo24h = (time12h: string) => {
    if (!time12h) return "00:00";
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "PM") {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingScheduleDoc, setViewingScheduleDoc] =
    useState<Doctor | null>(null);
  const [selectedRosterDay, setSelectedRosterDay] = useState(
    new Date().toLocaleDateString("en-US", { weekday: "long" })
  );
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [activeModalView, setActiveModalView] =
    useState<"form" | "details">("form");
  const [viewingAptDetails, setViewingAptDetails] =
    useState<Appointment | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [editingApt, setEditingApt] =
    useState<Appointment | null>(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const isLoggedInDoctor = !!(userRole === "Doctor" && loggedInStaffName);
  const [filterDoctor, setFilterDoctor] = useState(isLoggedInDoctor ? loggedInStaffName : "");

  const fullDaySlots = useMemo(() => generateSlots("06:00", "22:00"), []);

  const getDoctorSchedule = (
    doctorName: string,
    dayName: string | null = null
  ): {
    start: string;
    end: string;
    specialty?: string;
  } | null => {
    const doc = doctors.find((d) => d.name === doctorName);
    if (!doc) return DOCTOR_SCHEDULES[doctorName];

    const day =
      dayName || new Date().toLocaleDateString("en-US", { weekday: "long" });
    const avail = doc.availability?.find((a) => a.day === day);

    if (!avail) return null;

    return {
      start: timeTo24h(avail.fromTime),
      end: timeTo24h(avail.toTime),
      specialty: doc.specialization,
    };
  };

  const isDoctorOnDutyAt = (
    docName: string,
    slot24h: string,
    dayName: string
  ): boolean => {
    const sched = getDoctorSchedule(docName, dayName);
    if (!sched) return false;
    return slot24h >= sched.start && slot24h < sched.end;
  };

  const handleSlotClick = (doc: Doctor, slot: string) => {
    const bookedApt = appointments.find(
      (a) =>
        a.dr === doc.name &&
        a.time === slot &&
        a.date === new Date().toISOString().split("T")[0]
    );

    if (bookedApt) {
      setViewingAptDetails(bookedApt);
      setIsRescheduling(false);
    } else {
      setSelectedDoctor(doc.name);
      setSelectedSlot(slot);
      setViewingScheduleDoc(null);
      setActiveModalView("form");
      setIsModalOpen(true);
    }
  };

  const handleDeleteAptFromRoster = () => {
    if (viewingAptDetails) {
      handleDeleteAppointment(viewingAptDetails.id);
      setViewingAptDetails(null);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!appointmentId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      console.log("Delete response:", data);
      if (data.success) {
        // call parent updater to remove from local state
        onDeleteAppointment(appointmentId);
      } else {
        setValidationError(data.error || "Failed to delete appointment on server.");
      }
    } catch (err) {
      console.error("Delete appointment error:", err);
      setValidationError("Failed to delete appointment. Check server.");
    }
  };

  const handleRescheduleStart = (): void => {
    setIsRescheduling(true);
  };

  const handleRescheduleSlotSelect = async (newSlot: string) => {
    if (!viewingAptDetails) return;

    const updatedAppointment = {
      ...viewingAptDetails,
      time: newSlot,
    };

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/${viewingAptDetails.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedAppointment),
        }
      );

      const data = await res.json();

      if (data.success) {
        onUpdateAppointment(viewingAptDetails.id, updatedAppointment);

        setViewingAptDetails(null);
        setIsRescheduling(false);
      } else {
        setValidationError(data.error || "Failed to reschedule appointment.");
      }
    } catch (err) {
      console.error("Reschedule Error:", err);
      setValidationError("Unable to connect to server.");
    }
  };

  const [isVisitActive, setIsVisitActive] = useState(false);
  const [activeApt, setActiveApt] =
    useState<Appointment | null>(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vitals, setVitals] = useState({
    bp: "",
    heartRate: "",
    temp: "",
    spo2: "",
  });
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFinishVisit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setValidationError(null);

    if (!activeApt) return;

    const vitalsError = validateVitals(vitals);
    if (vitalsError) {
      setValidationError(vitalsError);
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const diagnosis = formData.get("diagnosis") as string;
    if (!diagnosis || diagnosis.trim().length < 3) {
      setValidationError("Please enter a valid clinical diagnosis.");
      return;
    }

    const clinicalData = {
      vitals,
      prescriptions,
      diagnosis,
      notes: formData.get("clinicalNotes"),
    };
    onCompleteVisit(activeApt.id, clinicalData);
    setIsVisitActive(false);
    setActiveApt(null);
  };

  const handleEditApt = (apt: Appointment) => {
    setEditingApt(apt);
    setSelectedDoctor(apt.dr);
    setSelectedSlot(apt.time);
    setSelectedPatientId(apt.patientId + " - " + apt.name);
    setActiveModalView("form");
  };

  const handlePrintApt = (apt: Appointment) => {
    const doc = new jsPDF();
    const y = addSaradaHospitalHeader(doc, "Appointment Confirmation", hospitalLogo);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);

    let currentY = y + 15;

    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, currentY, 180, 70, 5, 5, "FD");

    currentY += 12;
    doc.setFontSize(10);
    const details = [
      ["Patient Name", apt.name],
      ["Patient ID", apt.patientId],
      ["Doctor Name", apt.dr],
      ["Scheduled Date", apt.date],
      ["Scheduled Time", `${getFormattedTime(apt.time).time12} ${getFormattedTime(apt.time).meridiem}`],
      ["Consultation Type", apt.type],
      ["Primary Reason", apt.reason || "General Consultation"],
    ];

    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(`${label}:`, 25, currentY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(String(value), 75, currentY);
      currentY += 8;
    });

    addProfessionalFooter(doc);
    doc.save(`Appointment_${apt.patientId}.pdf`);
  };

  const availableSlots = useMemo(() => {
    if (!selectedDoctor) return [];
    const schedule = getDoctorSchedule(selectedDoctor);
    if (!schedule) return [];
    const allSlots = generateSlots(schedule.start, schedule.end);
    return allSlots.map((slot) => {
      const isBooked = appointments.some(
        (apt) => apt.dr === selectedDoctor && apt.time === slot
      );
      return { time: slot, isBooked };
    });
  }, [selectedDoctor, appointments, doctors]);

  const handleAptSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setValidationError(null);

    const formData = new FormData(e.currentTarget);
    const selectedPatient = patients.find(
      (p) => p.id === selectedPatientId || `${p.id} - ${p.name}` === selectedPatientId
    );

    const aptId = editingApt ? editingApt.id : generateAppointmentId();

    const newApt = {
      id: aptId,
      time: selectedSlot,
      date: (formData.get("date") as string) || new Date().toISOString().split("T")[0],
      name: selectedPatient ? selectedPatient.name : selectedPatientId,
      patientId: selectedPatient ? selectedPatient.id : "NP-" + Math.floor(1000 + Math.random() * 9000),
      dr: selectedDoctor,
      type: (formData.get("type") as string) || "OP",
      urgent: isUrgentAppointment((formData.get("type") as string) || "OP"),
      reason: (formData.get("reason") as string) || "",
      medicalHistory: (formData.get("history") as string) || "",
      referralSource: (formData.get("referral") as string) || "",
      preferredContact: (formData.get("preferredContact") as string) || "",
    };

    try {
      if (editingApt) {
        const res = await fetch(`http://localhost:5000/api/appointments/${editingApt.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newApt),
        });
        const data = await res.json();
        console.log("Update response:", data);
        if (data.success) {
          onUpdateAppointment(editingApt.id, newApt);
          setEditingApt(null);
          setIsModalOpen(false);
        }
      } else {
        console.log("Submitting appointment:", newApt);
        const res = await fetch("http://localhost:5000/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newApt),
        });
        const data = await res.json();
        console.log("Create response:", data);
        if (data.success) {
          onAddAppointment(newApt);
          setIsModalOpen(false);
        } else {
          setValidationError(data.error || "Failed to save appointment.");
        }
      }
    } catch (err) {
      console.error("Appointment submit error:", err);
      setValidationError("Failed to save appointment. Try again.");
    }
  };
  const sortedAppointments = useMemo(() => {
    let filtered = appointments;
    if (filterDate) {
      filtered = filtered.filter((apt) => apt.date === filterDate);
    }
    const effectiveDoctorFilter = isLoggedInDoctor ? loggedInStaffName : filterDoctor;
    if (effectiveDoctorFilter) {
      filtered = filtered.filter((apt) => apt.dr === effectiveDoctorFilter);
    }
    return [...filtered].sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, filterDate, filterDoctor, isLoggedInDoctor, loggedInStaffName]);

  return (
    <div className="appointment-container">
      <div className="appointment-header">
        <div>
          <h1 className="header-title">Clinical-Operations</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5 space-x-2">
            <div className="flex items-center px-3 border-r border-slate-200 group">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-500 mr-2 group-hover:scale-110 transition-transform" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center px-3 group">
              <User className="w-3.5 h-3.5 text-emerald-500 mr-2 group-hover:scale-110 transition-transform" />
              <select
                value={isLoggedInDoctor ? loggedInStaffName : filterDoctor}
                onChange={(e) => !isLoggedInDoctor && setFilterDoctor(e.target.value)}
                disabled={!!isLoggedInDoctor}
                className={`bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none min-w-[120px] cursor-pointer ${isLoggedInDoctor ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoggedInDoctor ? (
                  <option value={loggedInStaffName}>{loggedInStaffName}</option>
                ) : (
                  <>
                    <option value="">All Doctors</option>
                    {doctors.length > 0
                      ? doctors.map((doc) => (
                        <option key={doc.id} value={doc.name}>
                          {doc.name}
                        </option>
                      ))
                      : Object.keys(DOCTOR_SCHEDULES).map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                  </>
                )}
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveModalView("details");
              setIsModalOpen(true);
            }}
            className="new-appointment-btn"
          >
            <CalendarIcon className="w-4 h-4" aria-hidden="true" />
            <span>Appointment Details</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <DutyRoster
            isLoggedInDoctor={isLoggedInDoctor}
            loggedInStaffName={loggedInStaffName}
            doctors={doctors}
            DOCTOR_SCHEDULES={DOCTOR_SCHEDULES}
            setViewingScheduleDoc={setViewingScheduleDoc}
          />
        </div>

        <AppointmentList
          sortedAppointments={sortedAppointments}
          getFormattedTime={getFormattedTime}
        />
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApt(null);
        }}
        activeModalView={activeModalView}
        sortedAppointments={sortedAppointments}
        getFormattedTime={getFormattedTime}
        handlePrintApt={handlePrintApt}
        handleEditApt={handleEditApt}
        onDeleteAppointment={handleDeleteAppointment}
        handleAptSubmit={handleAptSubmit}
        validationError={validationError}
        selectedPatientId={selectedPatientId}
        setSelectedPatientId={setSelectedPatientId}
        patients={patients}
        selectedDoctor={selectedDoctor}
        setSelectedDoctor={setSelectedDoctor}
        setSelectedSlot={setSelectedSlot}
        doctors={doctors}
        DOCTOR_SCHEDULES={DOCTOR_SCHEDULES}
        availableSlots={availableSlots}
        selectedSlot={selectedSlot}
        editingApt={editingApt}
      />

      <DoctorRosterModal
        viewingScheduleDoc={viewingScheduleDoc}
        setViewingScheduleDoc={setViewingScheduleDoc}
        selectedRosterDay={selectedRosterDay}
        setSelectedRosterDay={setSelectedRosterDay}
        fullDaySlots={fullDaySlots}
        isDoctorOnDutyAt={isDoctorOnDutyAt}
        appointments={appointments}
        handleSlotClick={handleSlotClick}
        getFormattedTime={getFormattedTime}
        viewingAptDetails={viewingAptDetails}
        setViewingAptDetails={setViewingAptDetails}
        isRescheduling={isRescheduling}
        setIsRescheduling={setIsRescheduling}
        handleRescheduleStart={handleRescheduleStart}
        handleDeleteAptFromRoster={handleDeleteAptFromRoster}
        handleRescheduleSlotSelect={handleRescheduleSlotSelect}
      />

      <ActiveSessionModal
        isOpen={isVisitActive}
        onClose={() => setIsVisitActive(false)}
        validationError={validationError}
        activeApt={activeApt}
        handleFinishVisit={handleFinishVisit}
        vitals={vitals}
        setVitals={setVitals}
        prescriptions={prescriptions}
        setPrescriptions={setPrescriptions}
        medName={medName}
        setMedName={setMedName}
        dosage={dosage}
        setDosage={setDosage}
      />
    </div>
  );
};
export default AppointmentManagement;
