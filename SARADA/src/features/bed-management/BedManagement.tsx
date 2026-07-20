import React, { useState, useMemo, useEffect } from "react";
import {
  ClipboardList,
  Activity,
  Zap,
} from "../../shared/utils/icons";
import { WardType, Bed as BedInterface, UserRole, Patient, Invoice } from "../../shared/types";
import {
  generateAdmissionPDF,
  generateReleaseBillPDF,
  generateInvoicePDF,
  getStatusColor,
  filterBeds,
  calculateStats
} from "./hooks/useBedManagement";

import FilterSidebar from "./components/FilterSidebar";
import BedGrid from "./components/BedGrid";
import AllocationModals from "./components/AllocationModals";
import AdmissionModals from "./components/AdmissionModals";
import BillingModals from "./components/BillingModals";

interface Props {
  beds: BedInterface[];
  patients: Patient[];
  doctors: any[];
  onBookBed: (bedId: string, bookingData: any) => void;
  onReserveBed: (bedId: string, patientName: string) => void;
  onReleaseBed: (bedId: string) => void;
  onAddInvoice?: (invoice: Invoice) => void;
  onAddBed: (bed: Omit<BedInterface, "isOccupied" | "isReserved">) => void;
  onUpdateBed: (bedId: string, updates: Partial<BedInterface>) => void;
  invoices: Invoice[];
  onDeleteInvoice: (id: string) => void;
  userRole: UserRole;
}

const BedManagement: React.FC<Props> = ({
  beds,
  patients,
  doctors,
  onBookBed,
  onReserveBed,
  onReleaseBed,
  onAddInvoice,
  onAddBed,
  onUpdateBed,
  invoices,
  onDeleteInvoice,
  userRole,
}) => {
  const [activeWard, setActiveWard] = useState<WardType | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [selectedBedForDetails, setSelectedBedForDetails] = useState<BedInterface | null>(null);
  const [selectedBedForBooking, setSelectedBedForBooking] = useState<BedInterface | null>(null);
  const [selectedBedForReservation, setSelectedBedForReservation] = useState<BedInterface | null>(null);

  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [newBedData, setNewBedData] = useState({
    id: "",
    wardType: WardType.GENERAL,
    wardNo: "",
    chargePerDay: 500,
  });

  const [bookingPatientName, setBookingPatientName] = useState("");
  const [bookingPatientAge, setBookingPatientAge] = useState("");
  const [bookingPatientGender, setBookingPatientGender] = useState("");
  const [bookingProfilePhoto, setBookingProfilePhoto] = useState<string | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState("");
  const [bookingEmergencyContact, setBookingEmergencyContact] = useState("");
  const [bookingDischarge, setBookingDischarge] = useState("Later");
  const [bookingCharge, setBookingCharge] = useState(0);
  const [isEditingCharge, setIsEditingCharge] = useState(false);
  const [editedCharge, setEditedCharge] = useState(0);
  const [showInvoiceFormModal, setShowInvoiceFormModal] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState({
    patientName: "",
    patientId: "",
    age: "",
    mobileNo: "",
    daysStayed: 1,
    chargePerDay: 500,
    pharmacyCharge: 0,
    nursingCharge: 0,
    miscCharge: 0,
    discountAmount: 0,
    amountPaid: 0,
    paymentMethod: "Cash",
  });
  const [showBillsArchiveModal, setShowBillsArchiveModal] = useState(false);
  const [reservationName, setReservationName] = useState("");
  const [showReleaseBedModal, setShowReleaseBedModal] = useState(false);
  const [releaseBedFormData, setReleaseBedFormData] = useState({
    patientName: "",
    patientId: "",
    age: "",
    mobileNo: "",
    daysStayed: 1,
    chargePerDay: 500,
    pharmacyCharge: 0,
    nursingCharge: 0,
    miscCharge: 0,
    discountAmount: 0,
    totalBedCharge: 0,
  });

  const [showCreateAdmissionModal, setShowCreateAdmissionModal] = useState(false);
  const [admissionData, setAdmissionData] = useState({
    admissionDateTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    uhid: "",
    patientName: "",
    age: "",
    mobileNo: "",
    attendantRelation: "",
    attendantContactNo: "",
    admittingWard: "",
    admittingDoctor: "",
    primaryDoctor: "DR.Ramesh",
    ipNo: "",
    department: "",
  });

  useEffect(() => {
    if (showCreateAdmissionModal && !admissionData.ipNo) {
      const lastIpNum = localStorage.getItem("accendia_last_ip_num") || "1";
      const nextIpNum = parseInt(lastIpNum) + 1;
      const formattedIp = `IP${String(nextIpNum).padStart(6, '0')}`;
      setAdmissionData(prev => ({ ...prev, ipNo: formattedIp }));
    }
  }, [showCreateAdmissionModal]);

  useEffect(() => {
    if (selectedBedForBooking) {
      setBookingCharge(selectedBedForBooking.chargePerDay || 500);
    }
  }, [selectedBedForBooking]);

  const filteredBedsList = useMemo(() => {
    return filterBeds(beds, activeWard, searchTerm, showOnlyAvailable);
  }, [beds, activeWard, searchTerm, showOnlyAvailable]);

  const stats = useMemo(() => {
    return calculateStats(beds);
  }, [beds]);

  const handleBedClick = (bed: BedInterface) => {
    if (bed.isOccupied || bed.isReserved) {
      setSelectedBedForDetails(bed);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBedForBooking) {
      const bookingData = {
        patientName: bookingPatientName,
        age: bookingPatientAge,
        gender: bookingPatientGender,
        profilePhoto: bookingProfilePhoto,
        doctor: bookingDoctor,
        emergencyContact: bookingEmergencyContact,
        chargePerDay: bookingCharge,
        discharge: bookingDischarge,
      };

      onBookBed(selectedBedForBooking.id, {
        ...bookingData,
        estimatedDischarge: bookingDischarge,
      });

      generateAdmissionPDF(selectedBedForBooking, bookingData);

      setSelectedBedForBooking(null);
      setBookingPatientName("");
      setBookingPatientAge("");
      setBookingPatientGender("");
      setBookingProfilePhoto(null);
      setBookingDoctor("");
      setBookingEmergencyContact("");
      setBookingDischarge("Later");
    }
  };

  const handleAddBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBed(newBedData);
    setShowAddBedModal(false);
    setNewBedData({
      id: "",
      wardType: WardType.GENERAL,
      wardNo: "",
      chargePerDay: 500,
    });
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBedForReservation) {
      onReserveBed(
        selectedBedForReservation.id,
        reservationName || "Unnamed Pre-booking",
      );
      setSelectedBedForReservation(null);
      setReservationName("");
    }
  };

  return (
    <div className="bed-management-container">
      <div className="bed-header">
        <div>
          <h2 className="header-title">
            Bed Management
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowBillsArchiveModal(true)}
            className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center space-x-3 shadow-xl"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Bills Archive</span>
          </button>
          <button
            onClick={() => setShowCreateAdmissionModal(true)}
            className="px-6 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center space-x-3"
          >
            <Activity className="w-4 h-4 text-hospital-blue" />
            <span>Create New Admission</span>
          </button>
          {userRole === UserRole.ADMIN && (
            <button
              onClick={() => setShowAddBedModal(true)}
              className="action-button"
            >
              <Zap className="w-4 h-4 mr-2" />
              New Bed
            </button>
          )}
          <div className="stats-panel-dark">
            <div className="text-center">
              <p className="text-[9px] font-black text-hospital-blue uppercase tracking-widest mb-1.5 leading-none">
                Vacancy
              </p>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-3xl font-black text-white leading-none">
                  {stats.vacant}
                </p>
              </div>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="text-center">
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 leading-none">
                Holds
              </p>
              <p className="text-3xl font-black text-white leading-none">
                {stats.reserved}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <FilterSidebar
            activeWard={activeWard}
            setActiveWard={setActiveWard}
            showOnlyAvailable={showOnlyAvailable}
            setShowOnlyAvailable={setShowOnlyAvailable}
          />
        </div>

        <div className="xl:col-span-3 space-y-8">
          <BedGrid
            filteredBedsList={filteredBedsList}
            handleBedClick={handleBedClick}
            setSelectedBedForReservation={setSelectedBedForReservation}
            getStatusColor={getStatusColor}
            onReleaseBed={onReleaseBed}
          />
        </div>
      </div>

      <AllocationModals
        selectedBedForReservation={selectedBedForReservation}
        setSelectedBedForReservation={setSelectedBedForReservation}
        selectedBedForBooking={selectedBedForBooking}
        setSelectedBedForBooking={setSelectedBedForBooking}
        selectedBedForDetails={selectedBedForDetails}
        setSelectedBedForDetails={setSelectedBedForDetails}
        handleReservationSubmit={handleReservationSubmit}
        reservationName={reservationName}
        setReservationName={setReservationName}
        handleBookingSubmit={handleBookingSubmit}
        bookingPatientName={bookingPatientName}
        setBookingPatientName={setBookingPatientName}
        bookingPatientAge={bookingPatientAge}
        setBookingPatientAge={setBookingPatientAge}
        bookingPatientGender={bookingPatientGender}
        setBookingPatientGender={setBookingPatientGender}
        bookingProfilePhoto={bookingProfilePhoto}
        setBookingProfilePhoto={setBookingProfilePhoto}
        bookingDoctor={bookingDoctor}
        setBookingDoctor={setBookingDoctor}
        bookingEmergencyContact={bookingEmergencyContact}
        setBookingEmergencyContact={setBookingEmergencyContact}
        bookingCharge={bookingCharge}
        setBookingCharge={setBookingCharge}
        bookingDischarge={bookingDischarge}
        setBookingDischarge={setBookingDischarge}
        patients={patients}
        beds={beds}
        onReleaseBed={onReleaseBed}
        onUpdateBed={onUpdateBed}
        userRole={userRole}
        isEditingCharge={isEditingCharge}
        setIsEditingCharge={setIsEditingCharge}
        editedCharge={editedCharge}
        setEditedCharge={setEditedCharge}
        onAddInvoice={onAddInvoice}
        generateReleaseBillPDF={generateReleaseBillPDF}
        setInvoiceFormData={setInvoiceFormData}
        setShowInvoiceFormModal={setShowInvoiceFormModal}
        showReleaseBedModal={showReleaseBedModal}
        setShowReleaseBedModal={setShowReleaseBedModal}
        releaseBedFormData={releaseBedFormData}
        setReleaseBedFormData={setReleaseBedFormData}
      />

      <AdmissionModals
        showCreateAdmissionModal={showCreateAdmissionModal}
        setShowCreateAdmissionModal={setShowCreateAdmissionModal}
        admissionData={admissionData}
        setAdmissionData={setAdmissionData}
        patients={patients}
        doctors={doctors}
        beds={beds}
        onBookBed={onBookBed}
        showAddBedModal={showAddBedModal}
        setShowAddBedModal={setShowAddBedModal}
        newBedData={newBedData}
        setNewBedData={setNewBedData}
        handleAddBedSubmit={handleAddBedSubmit}
        userRole={userRole}
      />

      <BillingModals
        showInvoiceFormModal={showInvoiceFormModal}
        setShowInvoiceFormModal={setShowInvoiceFormModal}
        invoiceFormData={invoiceFormData}
        setInvoiceFormData={setInvoiceFormData}
        selectedBedForDetails={selectedBedForDetails}
        onAddInvoice={onAddInvoice}
        generateInvoicePDF={generateInvoicePDF}
        generateReleaseBillPDF={generateReleaseBillPDF}
        showBillsArchiveModal={showBillsArchiveModal}
        setShowBillsArchiveModal={setShowBillsArchiveModal}
        invoices={invoices}
        beds={beds}
        onDeleteInvoice={onDeleteInvoice}
      />
    </div>
  );
};

export default BedManagement;
