import React, { useState, useEffect } from "react";
import Modal from "../../../shared/components/Modal";
import { Appointment, Patient, Doctor } from "../../../shared/types";

import {
  Calendar as CalendarIcon,
  Stethoscope,
  Printer,
  Edit,
  Trash2,
  AlertCircle,
  User,
  Clock,
  CheckCircle2,
} from "../../../shared/utils/icons";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModalView: string;
  sortedAppointments: Appointment[];
  getFormattedTime: (time: string) => {
    time12: string;
    meridiem: string;
    suffix: string;
  };
  handlePrintApt: (apt: Appointment) => void;
  handleEditApt: (apt: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  handleAptSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  validationError: string | null;
  selectedPatientId: string;
  setSelectedPatientId: (val: string) => void;
  patients: Patient[];
  selectedDoctor: string;
  setSelectedDoctor: (val: string) => void;
  setSelectedSlot: (val: string) => void;
  doctors: Doctor[];
  DOCTOR_SCHEDULES: Record<string, string[]>;
  availableSlots: {
    time: string;
    isBooked: boolean;
  }[];
  selectedSlot: string;
  editingApt: Appointment | null;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  activeModalView,
  sortedAppointments,
  getFormattedTime,
  handlePrintApt,
  handleEditApt,
  onDeleteAppointment,
  handleAptSubmit,
  validationError,
  selectedPatientId,
  setSelectedPatientId,
  patients,
  selectedDoctor,
  setSelectedDoctor,
  setSelectedSlot,
  doctors,
  DOCTOR_SCHEDULES,
  availableSlots,
  selectedSlot,
  editingApt,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!editingApt && selectedPatientId) {
      const patId = selectedPatientId.split(" ")[0];
      const patient = patients.find((p) => p.id === patId);
      if (patient && patient.cause) {
        setReason(patient.cause);
      } else {
        setReason("");
      }
    } else if (editingApt) {
      setReason(editingApt.reason || "");
    } else {
      setReason("");
    }
  }, [selectedPatientId, editingApt, patients]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setSelectedDoctor("");
        setSelectedSlot("");
        setSelectedPatientId("");
      }}
      title={
        activeModalView === "details"
          ? "Daily Clinical Schedule"
          : "Clinical Session Reservation"
      }
      size="xl"
    >
      <div className="appointment-booking-form">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] -mt-4 mb-8 flex items-center gap-2">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
          {activeModalView === "details"
            ? "Complete Patient Appointment Registry"
            : "Standard Admission & Consultation Protocol"}
        </p>

        {activeModalView === "details" ? (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Patient Details
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Consulting Physician
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Reason / Priority
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {sortedAppointments.length > 0 ? (
                    sortedAppointments.map((apt) => {
                      const formattedTime = getFormattedTime(apt.time);

                      return (
                        <tr
                          key={apt.id}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-black text-slate-900 block mb-1">
                              {apt.date}
                            </span>
                            <span className="text-sm font-black text-slate-900">
                              {formattedTime.time12}
                            </span>
                            <span className="text-[8px] font-black text-slate-400 block uppercase">
                              {formattedTime.meridiem}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {apt.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                              {apt.patientId}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                <Stethoscope className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-slate-700">
                                {apt.dr}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-xs font-bold text-slate-600 line-clamp-1 max-w-[200px]">
                              {apt.reason || "General Consultation"}
                            </p>
                            {apt.urgent && (
                              <span className="inline-block bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-md mt-1 uppercase">
                                Critical
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Scheduled
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handlePrintApt(apt)}
                                className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Print Receipt"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditApt(apt)}
                                className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit Session"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteAppointment(apt.id)}
                                className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete Session"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-slate-400 italic font-medium"
                      >
                        No appointments found for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-xl"
              >
                Close Registry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAptSubmit} className="space-y-8">
            {validationError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-tight">
                  {validationError}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Patient & Date Section */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Patient Identity *
                </label>
                <div className="relative group">
                  <input
                    required
                    list="patient-registry"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    placeholder="Search ID or Type Patient Name..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  />
                  <datalist id="patient-registry">
                    {patients.map((p) => (
                      <option key={p.id} value={`${p.id} - ${p.name}`} />
                    ))}
                  </datalist>
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Appointment Date *
                </label>
                <div className="relative group">
                  <input
                    required
                    type="date"
                    name="date"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
              </div>

              {/* Physician & Priority Section */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Consulting Physician *
                </label>
                <select
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={selectedDoctor}
                  onChange={(e) => {
                    setSelectedDoctor(e.target.value);
                    setSelectedSlot("");
                  }}
                >
                  <option value="">Choose Physician...</option>
                  {doctors.length > 0
                    ? doctors.map((doc) => (
                      <option key={doc.id} value={doc.name}>
                        {doc.name}
                      </option>
                    ))
                    : Object.keys(DOCTOR_SCHEDULES).map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Clinical Priority *
                </label>
                <select
                  name="type"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                >
                  <option>Standard Consultation</option>
                  <option>Specialized Follow-up</option>
                  <option>Critical Emergency</option>
                  <option>Diagnostic Review</option>
                  <option>Surgical Consultation</option>
                </select>
              </div>

              {/* Clinical Context Section */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Chief Complaint / Reason *
                </label>
                <textarea
                  required
                  name="reason"
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe primary symptoms or reason for visit..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Brief Medical History
                </label>
                <textarea
                  name="history"
                  rows={2}
                  defaultValue={editingApt?.medicalHistory || ""}
                  placeholder="Mention any existing conditions or allergies..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                ></textarea>
              </div>

              {/* Administrative Details Section */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Referral Source
                </label>
                <input
                  type="text"
                  name="referral"
                  defaultValue={editingApt?.referralSource || ""}
                  placeholder="Self / Dr. Name / Hospital"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Preferred Notification Method
                </label>
                <select
                  name="preferredContact"
                  defaultValue={editingApt?.preferredContact || "Mobile (SMS)"}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                >
                  <option>Mobile (SMS)</option>
                  <option>Email Notification</option>
                  <option>WhatsApp Direct</option>
                  <option>No Automated Alerts</option>
                </select>
              </div>
            </div>

            {/* Time Slot Selection Grid */}
            {selectedDoctor && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                    Available Clinical Windows
                  </label>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    30min Segments
                  </span>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {availableSlots.map(({ time, isBooked }) => {
                    const formattedTime = getFormattedTime(time);

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(time)}
                        className={`py-3 rounded-xl text-[11px] font-black border transition-all ${isBooked
                          ? "bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed opacity-40"
                          : selectedSlot === time
                            ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-105"
                            : "bg-white border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600 hover:shadow-lg"
                          }`}
                      >
                        {formattedTime.time12}
                        <span className="block text-[7px] opacity-60 uppercase tracking-tighter mt-0.5">
                          {formattedTime.suffix}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                Discard Reservation
              </button>
              <button
                type="submit"
                disabled={!selectedSlot || !selectedDoctor}
                className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-2xl ${!selectedSlot || !selectedDoctor
                  ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-emerald-600 hover:scale-[1.01] active:scale-95 shadow-slate-200"
                  }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Finalize Clinical Admission
              </button>
            </div>
            {editingApt && (
              <p className="text-center text-[10px] font-black text-amber-600 uppercase tracking-widest mt-4">
                Note: You are currently modifying an existing reservation record.
              </p>
            )}
          </form>
        )}
      </div>
    </Modal>
  );
};

export default BookingModal;
