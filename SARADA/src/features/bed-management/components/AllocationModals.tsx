import React, { useState, useEffect } from "react";
import { Bed as BedInterface, Patient, UserRole, Invoice } from "../../../shared/types";
import Modal from "../../../shared/components/Modal";
import CountdownTimer from "./CountdownTimer";
import {
  Bookmark,
  User,
  ShieldCheck,
  Timer,
  CheckCircle2,
  TrendingDown,
  Activity,
  Users,
  Zap,
  Shield,
  ArrowRight,
  X,
  ChevronDown,
} from "../../../shared/utils/icons";
import hospitalLogo from "../../../assets/sarada_logo.png";
import {
  HOSPITAL_NAME_LINE1,
  HOSPITAL_ADDRESS,
  HOSPITAL_PHONE,
  HOSPITAL_EMAIL,
} from "../../../shared/constants/hospitalBranding";


interface AllocationModalsProps {
  selectedBedForReservation: BedInterface | null;
  setSelectedBedForReservation: (bed: BedInterface | null) => void;
  selectedBedForBooking: BedInterface | null;
  setSelectedBedForBooking: (bed: BedInterface | null) => void;
  selectedBedForDetails: BedInterface | null;
  setSelectedBedForDetails: (bed: BedInterface | null) => void;
  handleReservationSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  beds: BedInterface[];
  reservationName: string;
  setReservationName: (val: string) => void;
  handleBookingSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  bookingPatientName: string;
  setBookingPatientName: (val: string) => void;
  bookingPatientAge: string;
  setBookingPatientAge: (val: string) => void;
  bookingPatientGender: string;
  setBookingPatientGender: (val: string) => void;
  bookingProfilePhoto: string | null;
  setBookingProfilePhoto: (val: string | null) => void;
  bookingDoctor: string;
  setBookingDoctor: (val: string) => void;
  bookingEmergencyContact: string;
  setBookingEmergencyContact: (val: string) => void;
  bookingCharge: number;
  setBookingCharge: (val: number) => void;
  bookingDischarge: string;
  setBookingDischarge: (val: string) => void;
  patients: Patient[];
  onReleaseBed: (bedId: string) => void;
  onUpdateBed: (bedId: string, updates: Partial<BedInterface>) => void;
  userRole: UserRole;
  isEditingCharge: boolean;
  setIsEditingCharge: (val: boolean) => void;
  editedCharge: number;
  setEditedCharge: (val: number) => void;
  onAddInvoice?: (invoice: Invoice) => void;
  generateReleaseBillPDF: (bed: BedInterface, patient: Patient | undefined, formData?: any, pharmacyItems?: any[]) => void;
  setInvoiceFormData: (data: any) => void;
  setShowInvoiceFormModal: (val: boolean) => void;
  showReleaseBedModal: boolean;
  setShowReleaseBedModal: (val: boolean) => void;
  releaseBedFormData: any;
  setReleaseBedFormData: (data: any) => void;
}

const AllocationModals: React.FC<AllocationModalsProps> = ({
  selectedBedForReservation,
  setSelectedBedForReservation,
  selectedBedForBooking,
  setSelectedBedForBooking,
  selectedBedForDetails,
  setSelectedBedForDetails,
  handleReservationSubmit,
  reservationName,
  setReservationName,
  handleBookingSubmit,
  bookingPatientName,
  setBookingPatientName,
  bookingPatientAge,
  setBookingPatientAge,
  bookingPatientGender,
  setBookingPatientGender,
  bookingProfilePhoto,
  setBookingProfilePhoto,
  bookingDoctor,
  setBookingDoctor,
  bookingEmergencyContact,
  setBookingEmergencyContact,
  bookingCharge,
  setBookingCharge,
  bookingDischarge,
  setBookingDischarge,
  patients,
  beds,
  onReleaseBed,
  onUpdateBed,
  userRole,
  isEditingCharge,
  setIsEditingCharge,
  editedCharge,
  setEditedCharge,
  onAddInvoice,
  generateReleaseBillPDF,
  setInvoiceFormData,
  setShowInvoiceFormModal,
  showReleaseBedModal,
  setShowReleaseBedModal,
  releaseBedFormData,
  setReleaseBedFormData,
}) => {
  const [shiftDestinationBedId, setShiftDestinationBedId] = useState<string>("");
  const [pharmacyItems, setPharmacyItems] = useState<any[]>([]);
  const [isLoadingPharmacy, setIsLoadingPharmacy] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Partially paid" | "Pending">("Paid");
  const [paymentMode, setPaymentMode] = useState<string>("Cash");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [transactionId, setTransactionId] = useState<string>("TXN-2026-00842");
  const [receivedBy, setReceivedBy] = useState<string>("Front desk staff name");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [showDischargeInvoice, setShowDischargeInvoice] = useState(false);

  const totalAmount = releaseBedFormData
    ? (releaseBedFormData.totalBedCharge || 0) +
    (releaseBedFormData.pharmacyCharge || 0) +
    (releaseBedFormData.nursingCharge || 0) +
    (releaseBedFormData.miscCharge || 0) -
    (releaseBedFormData.discountAmount || 0)
    : 0;

  useEffect(() => {
    if (showReleaseBedModal && releaseBedFormData) {
      if (paymentStatus === "Paid") {
        setAmountPaid(totalAmount);
      } else if (paymentStatus === "Pending") {
        setAmountPaid(0);
      }
    }
  }, [showReleaseBedModal, totalAmount, paymentStatus, releaseBedFormData]);

  const fetchPharmacyChargesForPatient = async (patientId: string, patientName: string, initialData: any) => {
    setIsLoadingPharmacy(true);
    let ipNo = "";
    const ipIndex: string[] = JSON.parse(localStorage.getItem("accendia_ip_index") || "[]");
    for (const ip of ipIndex) {
      const stored = localStorage.getItem(`accendia_ip_${ip}`);
      if (stored) {
        try {
          const record = JSON.parse(stored);
          if (record.uhid === patientId) {
            ipNo = ip;
            break;
          }
        } catch (e) { }
      }
    }

    try {
      const url = `http://localhost:5000/api/sales/items?patientId=${encodeURIComponent(patientId)}&ipNo=${encodeURIComponent(ipNo)}&patientName=${encodeURIComponent(patientName)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.items)) {
          setPharmacyItems(data.items);
          const totalMedCost = data.items.reduce((sum: number, item: any) => sum + Number(item.total || 0), 0);
          setReleaseBedFormData({
            ...initialData,
            pharmacyCharge: totalMedCost,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching patient sales items:", err);
    } finally {
      setIsLoadingPharmacy(false);
    }
  };

  const availableDestinationBeds = beds.filter(
    (bed) =>
      bed.id !== selectedBedForDetails?.id &&
      !bed.isOccupied &&
      !bed.isReserved
  );

  const selectedDestinationBed = shiftDestinationBedId
    ? beds.find((bed) => bed.id === shiftDestinationBedId) || null
    : null;

  const handleShiftPatient = () => {
    if (!selectedBedForDetails || !shiftDestinationBedId) return;

    const destinationBed = beds.find((bed) => bed.id === shiftDestinationBedId);
    if (!destinationBed) return;

    const updatedDestinationBed: BedInterface = {
      ...destinationBed,
      isOccupied: true,
      isReserved: false,
      patientName: selectedBedForDetails.patientName || undefined,
      patientId: selectedBedForDetails.patientId || undefined,
      estimatedDischarge: selectedBedForDetails.estimatedDischarge,
      reservationExpiry: undefined,
    };

    // Save transfer segment history
    if (selectedBedForDetails.patientId) {
      const transferKey = `accendia_patient_transfers_${selectedBedForDetails.patientId}`;
      let history = [];
      try {
        history = JSON.parse(localStorage.getItem(transferKey) || "[]");
      } catch (e) { }

      const patient = patients.find(p => p.id === selectedBedForDetails.patientId);
      const parseHospitalDateHelper = (dateStr: string | undefined): Date => {
        if (!dateStr) return new Date();
        let d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          } else {
            d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
          }
          if (!isNaN(d.getTime())) return d;
        }
        return new Date();
      };

      if (history.length === 0) {
        const start = parseHospitalDateHelper(patient?.admissionDate);
        history.push({
          bedId: selectedBedForDetails.id,
          wardType: selectedBedForDetails.wardType,
          chargePerDay: selectedBedForDetails.chargePerDay || 500,
          startDate: start.toISOString(),
          endDate: new Date().toISOString()
        });
      } else {
        history[history.length - 1].endDate = new Date().toISOString();
      }

      history.push({
        bedId: destinationBed.id,
        wardType: destinationBed.wardType,
        chargePerDay: destinationBed.chargePerDay || 500,
        startDate: new Date().toISOString(),
        endDate: null
      });

      localStorage.setItem(transferKey, JSON.stringify(history));
    }

    onUpdateBed(shiftDestinationBedId, {
      isOccupied: true,
      isReserved: false,
      patientName: selectedBedForDetails.patientName || undefined,
      patientId: selectedBedForDetails.patientId || undefined,
      estimatedDischarge: selectedBedForDetails.estimatedDischarge,
      reservationExpiry: undefined,
    });

    onUpdateBed(selectedBedForDetails.id, {
      isOccupied: false,
      isReserved: false,
      patientName: undefined,
      patientId: undefined,
      estimatedDischarge: undefined,
      reservationExpiry: undefined,
    });

    setSelectedBedForDetails(updatedDestinationBed);
    setShiftDestinationBedId("");
  };

  return (
    <>
      {/* Pre-booking Reservation Modal */}
      <Modal
        isOpen={!!selectedBedForReservation}
        onClose={() => setSelectedBedForReservation(null)}
        title="Advance Bed Reservation"
      >
        <div className="space-y-8 animate-scale-in">
          <div className="p-8 bg-indigo-50 rounded-[3rem] border border-indigo-100 flex items-start space-x-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-100">
              <Bookmark className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-black text-indigo-900 uppercase tracking-tight">
                Facility Pre-booking
              </h4>
              <p className="text-sm font-medium text-indigo-600 mt-1 leading-relaxed">
                Secure unit {selectedBedForReservation?.id} for an incoming
                patient. This hold expires in 60 minutes if admission is not
                finalized.
              </p>
            </div>
          </div>

          <form onSubmit={handleReservationSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                Reservation Entity Name
              </label>
              <div className="relative group">
                <input
                  required
                  type="text"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="Enter patient name..."
                  value={reservationName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setReservationName(e.target.value)
                  }
                />
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-6 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 transition-all active:scale-95"
            >
              Initialize Bed Hold
            </button>
          </form>
        </div>
      </Modal>

      {/* Immediate Allocation Modal */}
      <Modal
        isOpen={!!selectedBedForBooking}
        onClose={() => setSelectedBedForBooking(null)}
        title={`Finalize Allocation: ${selectedBedForBooking?.id}`}
        size="xl"
      >
        <div className="space-y-8">
          <div className="p-8 bg-hospital-blue/10 rounded-[3rem] border border-hospital-blue/10 flex items-start space-x-6">
            <div className="w-16 h-16 bg-hospital-blue rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-hospital-blue/10">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-black text-hospital-blue/90 uppercase tracking-tight">
                Confirmed Admission
              </h4>
              <p className="text-sm font-medium text-hospital-blue mt-1">
                Ready for patient transfer. Please verify clinical details for
                formal handover.
              </p>
            </div>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Photo */}
              <div className="w-full lg:w-[250px] shrink-0">
                <label className="w-full h-full min-h-[250px] border-2 border-dashed border-hospital-blue/20 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-hospital-blue/40 hover:bg-hospital-blue/50 transition-all overflow-hidden group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setBookingProfilePhoto(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {bookingProfilePhoto ? (
                    <img
                      src={bookingProfilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-16 h-16 bg-hospital-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <User className="w-8 h-8 text-hospital-blue" />
                      </div>
                      <span className="text-[10px] font-black text-hospital-blue uppercase tracking-[0.2em]">
                        Upload Photo
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Form Fields - Right Side */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Row 1 */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                      Patient Identity
                    </label>
                    <div className="relative group">
                      <input
                        required
                        type="text"
                        className="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-hospital-blue/10 outline-none transition-all"
                        placeholder="Patient Name..."
                        value={bookingPatientName}
                        onChange={(e) => setBookingPatientName(e.target.value)}
                        list="p-list"
                      />
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-hospital-blue" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                      Age
                    </label>
                    <input
                      required
                      type="number"
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-hospital-blue/10"
                      placeholder="Age..."
                      value={bookingPatientAge}
                      onChange={(e) => setBookingPatientAge(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="bookingPatientGender" className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                      Gender
                    </label>
                    <select
                      id="bookingPatientGender"
                      required
                      title="Patient gender"
                      aria-label="Patient gender"
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-hospital-blue/10 appearance-none"
                      value={bookingPatientGender}
                      onChange={(e) => setBookingPatientGender(e.target.value)}
                    >
                      <option value="" disabled>
                        Select Gender
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                      Lead Clinician
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-hospital-blue/10"
                      placeholder="Assigned MD..."
                      value={bookingDoctor}
                      onChange={(e) => setBookingDoctor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                      Emergency POC
                    </label>
                    <input
                      required
                      type="tel"
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-hospital-blue/10"
                      placeholder="+91 000..."
                      value={bookingEmergencyContact}
                      onChange={(e) =>
                        setBookingEmergencyContact(e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="bookingCharge" className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                      Charge/Day
                    </label>
                    <input
                      id="bookingCharge"
                      required
                      type="number"
                      title="Charge per day"
                      aria-label="Charge per day"
                      placeholder="Charge..."
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-hospital-blue/10"
                      value={bookingCharge}
                      onChange={(e) =>
                        setBookingCharge(Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                    Discharge Forecast
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {["Today", "Tomorrow", "Later"].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setBookingDischarge(time)}
                        className={`py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all ${bookingDischarge === time
                          ? "bg-hospital-blue border-hospital-blue text-white shadow-xl shadow-hospital-blue/20 scale-[1.02]"
                          : "bg-white border-slate-100 text-slate-400 hover:border-hospital-blue/20"
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-6 mt-6 bg-hospital-blue hover:bg-hospital-blue/70 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-hospital-blue/20 transition-all active:scale-[0.98]"
            >
              Allocate Bed & Sync EMR
            </button>
            <datalist id="p-list">
              {patients.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </form>
        </div>
      </Modal>

      {/* Bed Telemetry Modal */}
      <Modal
        isOpen={!!selectedBedForDetails}
        onClose={() => setSelectedBedForDetails(null)}
        title={`In-Patient Telemetry: ${selectedBedForDetails?.id}`}
        size="2xl"
      >
        {selectedBedForDetails && (
          <div className="space-y-6 animate-scale-in">
            <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr] items-start">
              <div className="space-y-6">
                <div className="p-6 bg-white rounded-[2.25rem] border border-slate-100 shadow-sm">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em]">
                        Live Admission Profile
                      </p>
                      <h3 className="mt-3 text-2xl font-black text-slate-900 tracking-tight leading-none">
                        {selectedBedForDetails.patientName}
                      </h3>
                      <p className="text-sm font-semibold text-slate-500 mt-2">
                        {selectedBedForDetails.patientId || "ID unavailable"} • {selectedBedForDetails.wardType} • {selectedBedForDetails.id}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-600"></span>
                      <span className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
                        {selectedBedForDetails.isReserved ? "Reserved" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="p-4 bg-slate-50 rounded-[1.75rem] border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] mb-2">
                      Ward / Bed
                    </p>
                    <p className="text-base font-black text-slate-900">{selectedBedForDetails.wardType}</p>
                    <p className="text-sm text-slate-500 mt-1">{selectedBedForDetails.id}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-[1.75rem] border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] mb-2">
                      Patient Name
                    </p>
                    <p className="text-base font-black text-slate-900">{selectedBedForDetails.patientName}</p>
                    <p className="text-sm text-slate-500 mt-1">{selectedBedForDetails.patientId || "-"}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-[1.75rem] border border-slate-100 text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] mb-2">
                      Charge / Day
                    </p>
                    <p className="text-xl font-black text-slate-900">₹{selectedBedForDetails.chargePerDay}</p>
                    <p className="text-sm text-slate-500 mt-1">{selectedBedForDetails.isReserved ? "Hold" : "Forecast"}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="p-4 bg-slate-50 rounded-[1.75rem] border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] mb-2">
                      Shift / Release
                    </p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Maintain a clean transition by shifting patient records or releasing the bed directly from this screen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {selectedBedForDetails?.isOccupied && (
                  <div className="p-6 bg-white/85 backdrop-blur-sm rounded-[2.5rem] border border-slate-200/70 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-5">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Shift Patient to Another Bed
                        </p>
                        <p className="text-sm text-slate-500">
                          Select a vacant bed destination and move the patient instantly.
                        </p>
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                        {availableDestinationBeds.length} available
                      </span>
                    </div>
                    <div className="grid gap-3">
                      <label htmlFor="shiftDestinationBed" className="sr-only">
                        Destination bed
                      </label>
                      <select
                        id="shiftDestinationBed"
                        value={shiftDestinationBedId}
                        onChange={(e) => setShiftDestinationBedId(e.target.value)}
                        title="Destination bed"
                        aria-label="Destination bed"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-hospital-blue/10"
                      >
                        <option value="">Select Destination Bed...</option>
                        {availableDestinationBeds.map((bed) => (
                          <option key={bed.id} value={bed.id}>
                            {bed.id} — {bed.wardType}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleShiftPatient}
                        disabled={!shiftDestinationBedId}
                        className="w-full py-3 rounded-[1.75rem] bg-amber-500 text-white font-black uppercase tracking-[0.35em] text-[10px] shadow-xl transition-all hover:bg-amber-600 disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        Shift Bed
                      </button>
                    </div>

                    {selectedDestinationBed && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="p-3 bg-slate-50 rounded-[1.75rem] border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] mb-2">
                            Destination Bed
                          </p>
                          <p className="text-base font-black text-slate-900">{selectedDestinationBed.wardType}</p>
                          <p className="text-sm text-slate-500 mt-1">{selectedDestinationBed.id}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-[1.75rem] border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] mb-2">
                            Patient
                          </p>
                          <p className="text-base font-black text-slate-900">{selectedBedForDetails.patientName}</p>
                          <p className="text-sm text-slate-500 mt-1">{selectedBedForDetails.patientId || "-"}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-[1.75rem] border border-slate-100 text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] mb-2">
                            New Bed Charge
                          </p>
                          <p className="text-xl font-black text-slate-900">₹{selectedDestinationBed.chargePerDay}</p>
                          <p className="text-sm text-slate-500 mt-1">Destination rate</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => {
                      const patient = patients.find(
                        (p) => p.id === selectedBedForDetails.patientId
                      );

                      const parseHospitalDateHelper = (dateStr: string | undefined): Date => {
                        if (!dateStr) return new Date();
                        let d = new Date(dateStr);
                        if (!isNaN(d.getTime())) return d;
                        const parts = dateStr.split(/[-/]/);
                        if (parts.length === 3) {
                          if (parts[0].length === 4) {
                            d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                          } else {
                            d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                          }
                          if (!isNaN(d.getTime())) return d;
                        }
                        return new Date();
                      };

                      const getTransferSegments = (pId: string, currentBed: BedInterface, admDate: string | undefined) => {
                        const transferKey = `accendia_patient_transfers_${pId}`;
                        let segs = [];
                        try {
                          segs = JSON.parse(localStorage.getItem(transferKey) || "[]");
                        } catch (e) { }

                        if (segs.length === 0) {
                          const start = parseHospitalDateHelper(admDate);
                          segs = [{
                            bedId: currentBed.id,
                            wardType: currentBed.wardType,
                            chargePerDay: currentBed.chargePerDay || 500,
                            startDate: start.toISOString(),
                            endDate: null
                          }];
                        }

                        return segs.map((seg: any) => {
                          const start = new Date(seg.startDate);
                          const end = seg.endDate ? new Date(seg.endDate) : new Date();
                          const diffTime = Math.max(0, end.getTime() - start.getTime());
                          const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                          return {
                            ...seg,
                            days,
                            amount: days * (seg.chargePerDay || 0)
                          };
                        });
                      };

                      const segments = getTransferSegments(
                        selectedBedForDetails.patientId || "",
                        selectedBedForDetails,
                        patient?.admissionDate
                      );

                      const totalDays = segments.reduce((sum, s) => sum + s.days, 0);
                      const totalBedCharge = segments.reduce((sum, s) => sum + s.amount, 0);

                      // Pre-fill the release form
                      const initialFormData = {
                        patientName: selectedBedForDetails.patientName || "",
                        patientId: selectedBedForDetails.patientId || "",
                        age: patient?.age || "",
                        mobileNo: patient?.contact || "",
                        daysStayed: totalDays,
                        chargePerDay: selectedBedForDetails.chargePerDay || 500,
                        pharmacyCharge: 0,
                        nursingCharge: 0,
                        miscCharge: 0,
                        discountAmount: 0,
                        totalBedCharge: totalBedCharge,
                        segments: segments
                      };
                      setReleaseBedFormData(initialFormData);

                      fetchPharmacyChargesForPatient(
                        selectedBedForDetails.patientId || "",
                        selectedBedForDetails.patientName || "",
                        initialFormData
                      );

                      setShowReleaseBedModal(true);
                    }}
                    className="py-3 bg-amber-50 text-amber-600 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.35em] hover:bg-amber-600 hover:text-white transition-all flex flex-col items-center justify-center space-y-1 min-h-[3.5rem] shadow-sm border border-amber-100"
                  >
                    <TrendingDown className="w-4 h-4 mb-1" />
                    <span>Release Bed</span>
                  </button>

                  <button
                    onClick={() => {
                      const patient = patients.find(
                        (p) => p.id === selectedBedForDetails.patientId
                      );
                      let days = 1;
                      if (patient?.admissionDate) {
                        const adm = new Date(patient.admissionDate);
                        const now = new Date();
                        days =
                          Math.ceil(
                            (now.getTime() - adm.getTime()) / (1000 * 60 * 60 * 24)
                          ) || 1;
                      }
                      setInvoiceFormData({
                        patientName: selectedBedForDetails.patientName || "",
                        patientId: selectedBedForDetails.patientId || "",
                        age: String(patient?.age || ""),
                        mobileNo: patient?.contact || "",
                        daysStayed: days,
                        chargePerDay: selectedBedForDetails.chargePerDay,
                      });
                      setShowInvoiceFormModal(true);
                    }}
                    className="py-3 bg-hospital-blue/10 text-hospital-blue rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.35em] hover:bg-hospital-blue hover:text-white transition-all flex flex-col items-center justify-center space-y-1 min-h-[3.5rem] shadow-sm border border-hospital-blue/10"
                  >
                    <Activity className="w-4 h-4 mb-1" />
                    <span>Print Invoice</span>
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Release Bed Form Modal */}
      <Modal
        isOpen={showReleaseBedModal}
        onClose={() => setShowReleaseBedModal(false)}
        title=""
        hideHeader={true}
        size="xl"
      >
        <div className="space-y-5">
          {/* Custom Header */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <Shield className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-none">
                  Release Bed – Exit Form
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
                  {HOSPITAL_NAME_LINE1}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowReleaseBedModal(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest flex items-center space-x-1"
            >
              <span>CLOSE</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Blue Settlement Banner */}
          <div className="p-5 bg-gradient-to-r from-blue-700 to-blue-800 text-white flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-base font-bold tracking-wide">
                  Bed release & settlement
                </h4>
                <p className="text-xs text-white/80 mt-0.5">
                  Process patient discharge, itemize charges, and finalize billing.
                </p>
              </div>
            </div>
            <span className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-[10px] font-black tracking-wider uppercase">
              READY FOR DISCHARGE
            </span>
          </div>

          {/* PATIENT DETAILS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
              <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                PATIENT DETAILS
              </h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  PATIENT NAME
                </label>
                <input
                  type="text"
                  placeholder="Enter patient name"
                  value={releaseBedFormData.patientName || ""}
                  onChange={(e) =>
                    setReleaseBedFormData({
                      ...releaseBedFormData,
                      patientName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  PATIENT ID
                </label>
                <input
                  type="text"
                  placeholder="Enter patient ID"
                  value={releaseBedFormData.patientId || ""}
                  onChange={(e) =>
                    setReleaseBedFormData({
                      ...releaseBedFormData,
                      patientId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  AGE
                </label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={releaseBedFormData.age || ""}
                  onChange={(e) =>
                    setReleaseBedFormData({
                      ...releaseBedFormData,
                      age: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  MOBILE NO.
                </label>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={releaseBedFormData.mobileNo || ""}
                  onChange={(e) =>
                    setReleaseBedFormData({
                      ...releaseBedFormData,
                      mobileNo: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* STAY & CHARGES SECTION */}
          <div className="space-y-4">
            <div className="flex items-center border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
              <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                STAY & CHARGES
              </h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">DAYS STAYED</label>
                <div className="w-full px-4 py-2.5 bg-orange-50/50 border border-orange-300 text-xs font-bold text-slate-800 flex items-center h-[38px]">{releaseBedFormData.daysStayed || 1}</div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CHARGE PER DAY (₹)</label>
                <input type="number" placeholder="0" value={releaseBedFormData.chargePerDay || ""}
                  onChange={(e) => setReleaseBedFormData({ ...releaseBedFormData, chargePerDay: Number(e.target.value), totalBedCharge: (releaseBedFormData.daysStayed || 0) * Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PHARMACY CHARGE (₹)</label>
                <input type="number" placeholder="0" value={releaseBedFormData.pharmacyCharge || ""}
                  onChange={(e) => setReleaseBedFormData({ ...releaseBedFormData, pharmacyCharge: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">NURSING CHARGE (₹)</label>
                <input type="number" placeholder="0" value={releaseBedFormData.nursingCharge || ""}
                  onChange={(e) => setReleaseBedFormData({ ...releaseBedFormData, nursingCharge: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">MISC. CHARGE (₹)</label>
                <input type="number" placeholder="0" value={releaseBedFormData.miscCharge || ""}
                  onChange={(e) => setReleaseBedFormData({ ...releaseBedFormData, miscCharge: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">DISCOUNT AMOUNT (₹)</label>
                <input type="number" placeholder="0" value={releaseBedFormData.discountAmount || ""}
                  onChange={(e) => setReleaseBedFormData({ ...releaseBedFormData, discountAmount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">BED CHARGE (₹)</label>
                <div className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center h-[38px]">₹{(releaseBedFormData.totalBedCharge || 0).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">TOTAL CHARGES (₹)</label>
                <div className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center h-[38px]">₹{totalAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* PHARMACY MEDICINES CHARGED SECTION */}
          {pharmacyItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                  PHARMACY MEDICINES CHARGED
                </h5>
              </div>
              <div className="bg-slate-50/30 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <h6 className="text-xs font-bold text-slate-800">
                    Itemized medicines
                  </h6>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-[9px] font-black uppercase">
                    {pharmacyItems.length} items
                  </span>
                </div>
                <div className="max-h-[150px] overflow-y-auto pr-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Medicine</th>
                        <th className="pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                        <th className="pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">MRP (₹)</th>
                        <th className="pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pharmacyItems.map((item, idx) => (
                        <tr key={idx} className="text-xs">
                          <td className="py-2.5 font-semibold text-slate-800">{item.medicine_name}</td>
                          <td className="py-2.5 font-bold text-slate-600 text-center">{item.qty}</td>
                          <td className="py-2.5 text-slate-600 text-right">₹{Number(item.mrp).toFixed(2)}</td>
                          <td className="py-2.5 font-bold text-slate-800 text-right">₹{Number(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-slate-200 font-bold text-slate-900 text-xs">
                        <td className="py-2.5">Subtotal</td>
                        <td></td>
                        <td></td>
                        <td className="py-2.5 text-right">
                          ₹{pharmacyItems.reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT SETTLEMENT SECTION */}
          <div className="space-y-4">
            <div className="flex items-center border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
              <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                PAYMENT SETTLEMENT
              </h5>
            </div>

            {/* Status selection tabs */}
            <div className="flex space-x-3">
              {(["Paid", "Partially paid", "Pending"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setPaymentStatus(status)}
                  className={`flex-1 py-2 px-4 rounded-xl border text-xs font-bold transition-all ${paymentStatus === status
                    ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  PAYMENT MODE
                </label>
                <div className="relative">
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 appearance-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Insurance">Insurance</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  AMOUNT PAID (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={amountPaid || ""}
                  disabled={paymentStatus === "Paid" || paymentStatus === "Pending"}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-75 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  TRANSACTION / REF. ID
                </label>
                <input
                  type="text"
                  placeholder="TXN-2026-00842"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  RECEIVED BY
                </label>
                <input
                  type="text"
                  placeholder="Front desk staff name"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  PAYMENT DATE
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Total Amount / Balance Due banner */}
          <div className="bg-blue-900 px-6 py-4 flex justify-between items-center text-white">
            <div>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                Total Amount
              </p>
              <p className="text-2xl font-bold mt-1">
                ₹{totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                Balance Due
              </p>
              <p className="text-sm font-bold mt-1">
                ₹{Math.max(0, totalAmount - amountPaid).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowReleaseBedModal(false)}
              className="flex-1 px-6 py-4 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowDischargeInvoice(true)}
              className="flex-1 px-6 py-4 bg-blue-700 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Confirm release</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Modal>

      {/* Discharge Invoice Preview Modal */}
      <Modal
        isOpen={showDischargeInvoice}
        onClose={() => setShowDischargeInvoice(false)}
        title=""
        hideHeader={true}
        size="lg"
      >
        <div className="bg-white text-slate-800 p-8 border border-slate-200 shadow-xl max-h-[80vh] overflow-y-auto select-text font-serif">
          {/* Top blue bar */}
          <div className="bg-[#0f2c59] text-white px-4 py-2 flex justify-between text-[10px] tracking-wider uppercase font-sans font-semibold">
            <span>HOSPITAL REG. NO. HOSP-AP-2014-0842</span>
            <span>NABH ACCREDITED</span>
          </div>

          {/* Hospital Brand Info */}
          <div className="flex justify-between items-start mt-6 border-b pb-6 border-slate-200 font-sans">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <img src={hospitalLogo} alt="Logo" className="w-[70px] h-[70px] object-contain shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-[#0f2c59] tracking-tight leading-tight">
                  {HOSPITAL_NAME_LINE1}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-[400px]">
                  {HOSPITAL_ADDRESS}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Phone: {HOSPITAL_PHONE} | Email: {HOSPITAL_EMAIL}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                DISCHARGE INVOICE
              </h3>
              <p className="text-base font-extrabold text-slate-900 mt-1">
                {transactionId ? `INV-${transactionId.replace("TXN-", "")}` : `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`}
              </p>
              <p className="text-[9px] text-slate-400 mt-1">
                Issued {new Date(paymentDate).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-4 border-b border-slate-200 py-4 text-xs font-sans gap-4">
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">PATIENT NAME</p>
              <p className="font-extrabold text-slate-800 mt-1">{releaseBedFormData.patientName || "Unknown"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">PATIENT ID</p>
              <p className="font-extrabold text-slate-800 mt-1">{releaseBedFormData.patientId || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">AGE</p>
              <p className="font-extrabold text-slate-800 mt-1">{releaseBedFormData.age || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">MOBILE</p>
              <p className="font-extrabold text-slate-800 mt-1">{releaseBedFormData.mobileNo || "—"}</p>
            </div>
          </div>

          {/* Invoice Table */}
          <table className="w-full mt-6 text-xs font-sans text-left border-collapse">
            <thead>
              <tr className="bg-[#0f2c59] text-white uppercase text-[9px] tracking-wider">
                <th className="px-4 py-2.5">DESCRIPTION</th>
                <th className="px-4 py-2.5 text-center">QTY</th>
                <th className="px-4 py-2.5 text-right">RATE</th>
                <th className="px-4 py-2.5 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Bed charge(s) — per-ward segment */}
              {releaseBedFormData.segments && releaseBedFormData.segments.length > 0 ? (
                releaseBedFormData.segments.map((seg: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      Bed charge ({seg.wardType})
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {seg.days} {seg.days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      ₹{(seg.chargePerDay || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      ₹{(seg.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-800">Bed charge</td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {releaseBedFormData.daysStayed || 1} {releaseBedFormData.daysStayed === 1 ? 'day' : 'days'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    ₹{(releaseBedFormData.chargePerDay || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">
                    ₹{(releaseBedFormData.totalBedCharge || 0).toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Pharmacy charge */}
              <tr>
                <td className="px-4 py-3 font-bold text-slate-800" colSpan={3}>
                  Pharmacy charge
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">
                  ₹{(releaseBedFormData.pharmacyCharge || 0).toFixed(2)}
                </td>
              </tr>

              {/* Pharmacy Sub-items */}
              {pharmacyItems && pharmacyItems.length > 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-2 bg-slate-50/50">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[11px] text-slate-500">
                      {/* Left Column */}
                      <div className="space-y-1 border-r border-slate-100 pr-4">
                        {pharmacyItems.slice(0, Math.ceil(pharmacyItems.length / 2)).map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.medicine_name || item.name}</span>
                            <span className="font-medium text-slate-600">
                              {item.qty} × ₹{Number(item.mrp || 0).toFixed(2)} = ₹{Number(item.total || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Right Column */}
                      <div className="space-y-1 pl-4">
                        {pharmacyItems.slice(Math.ceil(pharmacyItems.length / 2)).map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.medicine_name || item.name}</span>
                            <span className="font-medium text-slate-600">
                              {item.qty} × ₹{Number(item.mrp || 0).toFixed(2)} = ₹{Number(item.total || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Nursing charge */}
              <tr>
                <td className="px-4 py-3 font-bold text-slate-800">Nursing charge</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-right text-slate-400">—</td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">
                  ₹{(releaseBedFormData.nursingCharge || 0).toFixed(2)}
                </td>
              </tr>

              {/* Miscellaneous charge */}
              <tr>
                <td className="px-4 py-3 font-bold text-slate-800">Miscellaneous charge</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-right text-slate-400">—</td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">
                  ₹{(releaseBedFormData.miscCharge || 0).toFixed(2)}
                </td>
              </tr>

              {/* Discount */}
              <tr>
                <td className="px-4 py-3 font-bold text-slate-800">Discount</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-right text-slate-400">—</td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">
                  -₹{(releaseBedFormData.discountAmount || 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Subtotals & Totals */}
          <div className="flex flex-col items-end mt-4 pr-4 font-sans text-xs space-y-1.5 border-t border-slate-100 pt-4">
            <div className="flex justify-between w-64">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="font-bold text-slate-800">
                ₹{(
                  (releaseBedFormData.totalBedCharge || 0) +
                  (releaseBedFormData.pharmacyCharge || 0) +
                  (releaseBedFormData.nursingCharge || 0) +
                  (releaseBedFormData.miscCharge || 0)
                ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-slate-500 font-medium">Tax (exempt — medical services)</span>
              <span className="font-bold text-slate-800">₹0.00</span>
            </div>
            <div className="flex justify-between w-64 border-t border-slate-200 pt-2 text-sm">
              <span className="font-extrabold text-slate-800">Total payable</span>
              <span className="font-black text-[#0f2c59] text-base">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Payment Settlement Information Block */}
          <div className="grid grid-cols-4 border-t border-b border-slate-200 mt-6 py-4 text-[11px] font-sans bg-slate-50/50 px-4 gap-4">
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">PAYMENT MODE</p>
              <p className="font-extrabold text-slate-800 mt-1">{paymentMode}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">PAYMENT STATUS</p>
              <p className={`font-extrabold mt-1 uppercase ${paymentStatus === 'Paid' ? 'text-emerald-600' : paymentStatus === 'Partially paid' ? 'text-amber-500' : 'text-rose-500'}`}>
                {paymentStatus === 'Paid' ? 'Paid in full' : paymentStatus}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">TRANSACTION ID</p>
              <p className="font-extrabold text-slate-800 mt-1">{transactionId || '—'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">RECEIVED BY</p>
              <p className="font-extrabold text-slate-800 mt-1">{receivedBy || '—'}</p>
            </div>
          </div>

          {/* Signature and Amount Paid */}
          <div className="flex justify-between items-end mt-10 font-sans">
            <div className="w-1/2">
              <div className="border-t border-slate-300 w-48 mt-12"></div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 font-sans">Authorized signatory</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AMOUNT PAID</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                ₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] font-bold text-emerald-600 mt-1">
                Balance due ₹{Math.max(0, totalAmount - amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <p className="text-[9px] text-slate-400 leading-relaxed text-justify mt-8 border-t pt-4 border-slate-100 font-sans">
            This is a system-generated invoice issued at the time of patient discharge. It serves as an official record of charges and payment for insurance, reimbursement, or personal records. For billing queries, please contact the hospital billing desk quoting the invoice number above.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 mt-6 font-sans">
          <button
            onClick={() => setShowDischargeInvoice(false)}
            className="flex-1 px-6 py-4 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Back to Form
          </button>
          <button
            onClick={() => {
              if (selectedBedForDetails) {
                const patient = patients.find(
                  (p) => p.id === selectedBedForDetails.patientId
                );

                // Build normal readable services string (for Bills Archive parsing)
                const servicesString = `Bed: ${selectedBedForDetails.id} | Room: ${selectedBedForDetails.wardNo} | Stay: ${releaseBedFormData.daysStayed || 1} Days | Status: Out`;

                // Build the bed-wise charges array from segments (or single fallback)
                const bedChargesArr = (releaseBedFormData.segments && releaseBedFormData.segments.length > 0)
                  ? releaseBedFormData.segments.map((seg: any) => ({
                    type: seg.wardType || 'General',
                    days: seg.days || 1,
                    rate: seg.chargePerDay || 0,
                    amount: seg.amount || ((seg.days || 1) * (seg.chargePerDay || 0)),
                  }))
                  : [{
                    type: selectedBedForDetails.wardType || 'General',
                    days: releaseBedFormData.daysStayed || 1,
                    rate: releaseBedFormData.chargePerDay || 0,
                    amount: releaseBedFormData.totalBedCharge || 0,
                  }];

                // Build pharmacy charges array from itemized pharmacyItems
                const pharmacyChargesArr = (pharmacyItems && pharmacyItems.length > 0)
                  ? pharmacyItems.map((item: any) => ({
                    medicine: item.medicine_name || item.name || 'Medicine',
                    quantity: item.qty || 1,
                    rate: Number(item.mrp || 0),
                    amount: Number(item.total || 0),
                  }))
                  : (releaseBedFormData.pharmacyCharge > 0 ? [{
                    medicine: 'Pharmacy charges',
                    quantity: 1,
                    rate: releaseBedFormData.pharmacyCharge,
                    amount: releaseBedFormData.pharmacyCharge,
                  }] : []);

                const bedTotal = bedChargesArr.reduce((s, b) => s + b.amount, 0);
                const pharmacyTotal = pharmacyChargesArr.reduce((s, p) => s + p.amount, 0);
                const subtotal = bedTotal + pharmacyTotal + (releaseBedFormData.nursingCharge || 0) + (releaseBedFormData.miscCharge || 0);
                const finalAmount = Math.max(0, subtotal - (releaseBedFormData.discountAmount || 0));

                const finalInvoice: Invoice = {
                  id: `BD-${Math.floor(1000 + Math.random() * 9000)}`,
                  name: releaseBedFormData.patientName || "Unknown",
                  patientId: releaseBedFormData.patientId || "N/A",
                  age: releaseBedFormData.age || undefined,
                  mobileNo: releaseBedFormData.mobileNo || undefined,
                  services: servicesString,
                  amount: `₹${totalAmount.toLocaleString()}`,
                  status: paymentStatus === "Paid" ? "Paid" : paymentStatus === "Partially paid" ? "Partially paid" : "Pending",
                  date: new Date().toLocaleDateString(),
                  time: new Date().toLocaleTimeString(),
                  paymentMethod: paymentMode,
                  charges: {
                    bedCharges: bedChargesArr,
                    pharmacyCharges: pharmacyChargesArr,
                    nursingCharge: releaseBedFormData.nursingCharge || 0,
                    miscCharge: releaseBedFormData.miscCharge || 0,
                    discount: releaseBedFormData.discountAmount || 0,
                    subtotal: subtotal,
                    tax: 0,
                    total: finalAmount,
                  },
                };
                onAddInvoice?.(finalInvoice);

                generateReleaseBillPDF(selectedBedForDetails, patient, releaseBedFormData, pharmacyItems);
                onReleaseBed(selectedBedForDetails.id);
                setSelectedBedForDetails(null);
                setShowReleaseBedModal(false);
                setShowDischargeInvoice(false);
              }
            }
            }
            className="flex-1 px-6 py-4 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <span>Print & Release Bed</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </Modal>
    </>
  );
};

export default AllocationModals;
