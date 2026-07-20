import React from "react";
import {
  User,
  Stethoscope,
  Calendar as CalendarIcon,
} from "../../../shared/utils/icons";

import { Appointment } from "../../../shared/types";

interface AppointmentListProps {
  sortedAppointments: Appointment[];
  getFormattedTime: (time: string) => {
    time12: string;
    meridiem: string;
    suffix: string;
  };
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  sortedAppointments,
  getFormattedTime,
}) => {
  return (
    <div
      role="list"
      aria-label="Scheduled appointments"
      className="lg:col-span-3 space-y-4"
    >
      {sortedAppointments.length > 0 ? (
        sortedAppointments.map((apt) => {
          const formattedTime = getFormattedTime(apt.time);

          return (
            <div
              role="listitem"
              key={apt.id}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              {apt.urgent && (
                <div className="absolute top-0 left-0 w-2 h-full bg-red-500 shadow-[2px_0_10px_rgba(239,68,68,0.3)] animate-pulse"></div>
              )}
              <div className="w-28 text-sm font-black text-slate-400 flex flex-col items-center justify-center border-r border-slate-100 mr-8">
                <span className="text-2xl text-slate-900 tracking-tighter leading-none group-hover:text-emerald-600 transition-colors">
                  {formattedTime.time12}
                </span>
                <span className="text-[10px] uppercase font-black mt-1 tracking-widest">
                  {formattedTime.meridiem}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">
                      {apt.name}
                    </h4>
                    <div className="flex items-center space-x-4 mt-0.5">
                      <span className="text-xs text-slate-500 font-bold flex items-center">
                        <Stethoscope className="w-3 h-3 mr-1 text-emerald-500" /> {apt.dr}
                      </span>
                      {apt.urgent && (
                        <span
                          role="status"
                          aria-label="Critical priority appointment"
                          className="bg-red-50 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-lg border border-red-100 uppercase tracking-widest"
                        >
                          Critical Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex flex-col items-end mr-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Session Type
                  </span>
                  <span className="text-xs font-bold text-slate-600">{apt.type}</span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white py-24 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center text-slate-400">
          <div className="p-6 bg-slate-50 rounded-full mb-6">
            <CalendarIcon className="w-16 h-16 opacity-20" />
          </div>
          <p className="font-black text-xl text-slate-300 uppercase tracking-widest">
            Quiet Ward
          </p>
          <p className="text-sm font-medium mt-2">
            No clinical sessions queued for the next 24 hours.
          </p>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
