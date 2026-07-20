import React from "react";
import Modal from "../../../shared/components/Modal";
import {
  Stethoscope,
  User,
  AlertCircle,
  Clock,
  Activity,
} from "../../../shared/utils/icons";

interface DoctorRosterModalProps {
  viewingScheduleDoc: any;
  setViewingScheduleDoc: (doc: any) => void;
  selectedRosterDay: string;
  setSelectedRosterDay: (day: string) => void;
  fullDaySlots: any[];
  isDoctorOnDutyAt: (
    docName: string,
    slot24h: string,
    dayName: string
  ) => boolean;
  appointments: any[];
  handleSlotClick: (doc: any, slot: string) => void;
  getFormattedTime: (time: string) => {
    time12: string;
    meridiem: string;
    suffix: string;
  };
  viewingAptDetails: any;
  setViewingAptDetails: (apt: any) => void;
  isRescheduling: boolean;
  setIsRescheduling: (val: boolean) => void;
  handleRescheduleStart: () => void;
  handleDeleteAptFromRoster: () => void;
  handleRescheduleSlotSelect: (slot: string) => void;
}

const DoctorRosterModal: React.FC<DoctorRosterModalProps> = ({
  viewingScheduleDoc,
  setViewingScheduleDoc,
  selectedRosterDay,
  setSelectedRosterDay,
  fullDaySlots,
  isDoctorOnDutyAt,
  appointments,
  handleSlotClick,
  getFormattedTime,
  viewingAptDetails,
  setViewingAptDetails,
  isRescheduling,
  setIsRescheduling,
  handleRescheduleStart,
  handleDeleteAptFromRoster,
  handleRescheduleSlotSelect,
}) => {
  return (
    <Modal
      isOpen={!!viewingScheduleDoc}
      onClose={() => setViewingScheduleDoc(null)}
      title="Doctor Availability Roster"
      size="lg"
    >
      {viewingScheduleDoc && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-none">
                  {viewingScheduleDoc.name}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                  {viewingScheduleDoc.specialization ||
                    viewingScheduleDoc.specialty}{" "}
                  • {selectedRosterDay}'s Timeline
                </p>
              </div>
            </div>

            <div className="flex p-1 bg-slate-50 rounded-xl">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedRosterDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    selectedRosterDay === day
                      ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {fullDaySlots.map((slot) => {
              const onDuty = isDoctorOnDutyAt(
                viewingScheduleDoc.name,
                slot,
                selectedRosterDay
              );
              
              // Check if appointment matches selected doctor, time slot, and day of week
              const bookedApt = appointments.find(
                (a) => {
                  if (a.dr !== viewingScheduleDoc.name || a.time !== slot) {
                    return false;
                  }
                  // Convert appointment date to day name and compare with selected day
                  const aptDate = new Date(a.date);
                  const aptDayName = aptDate.toLocaleDateString("en-US", {
                    weekday: "long",
                  });
                  return aptDayName === selectedRosterDay;
                }
              );

              return (
                <div
                  key={slot}
                  onClick={() =>
                    (onDuty || bookedApt) &&
                    handleSlotClick(viewingScheduleDoc, slot)
                  }
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    bookedApt
                      ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm cursor-pointer hover:bg-amber-100 hover:scale-105 active:scale-95"
                      : onDuty
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm cursor-pointer hover:bg-emerald-100 hover:scale-105 active:scale-95"
                      : "bg-red-50 border-red-100 text-red-700 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span className="text-xs font-black">
                    {getFormattedTime(slot).time12}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-tighter">
                    {getFormattedTime(slot).suffix}
                  </span>
                  <div
                    className={`mt-2 w-1.5 h-1.5 rounded-full ${
                      bookedApt
                        ? "bg-amber-400"
                        : onDuty
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-red-400"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {viewingAptDetails && (
            <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white animate-in fade-in slide-in-from-bottom-4">
              {!isRescheduling ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <User className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black tracking-tight leading-none">
                          {viewingAptDetails.name}
                        </h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                          {viewingAptDetails.patientId} • {viewingAptDetails.time} •{" "}
                          {viewingAptDetails.type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewingAptDetails(null)}
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <AlertCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleRescheduleStart}
                      className="py-3 px-6 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Reschedule Timing
                    </button>
                    <button
                      onClick={handleDeleteAptFromRoster}
                      className="py-3 px-6 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Activity className="w-4 h-4" />
                      Cancel Appointment
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">
                      Select New Timing
                    </h4>
                    <button
                      onClick={() => setIsRescheduling(false)}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {fullDaySlots.map((slot) => {
                      const onDuty = isDoctorOnDutyAt(
                        viewingScheduleDoc.name,
                        slot,
                        selectedRosterDay
                      );
                      const isBooked = appointments.some(
                        (a) =>
                          a.dr === viewingScheduleDoc.name &&
                          a.time === slot &&
                          a.date === viewingAptDetails.date
                      );
                      return (
                        <button
                          key={slot}
                          disabled={!onDuty || isBooked}
                          onClick={() => handleRescheduleSlotSelect(slot)}
                          className={`py-2 rounded-lg text-[9px] font-black border transition-all ${
                            !onDuty || isBooked
                              ? "bg-white/5 border-white/5 text-white/10 cursor-not-allowed"
                              : "bg-white/10 border-white/20 text-white hover:bg-emerald-500 hover:border-emerald-500"
                          }`}
                        >
                          {getFormattedTime(slot).time12}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center space-x-6 pt-4 border-t border-slate-50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Active Duty
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Booked Slot
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Off Duty / Not in
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DoctorRosterModal;
