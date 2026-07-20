import React from "react";
import "./styles/doctor-management.css";
import {
  Star,
  Calendar,
  Zap,
  Search,
  Filter
} from "../../shared/utils/icons";
import { Doctor } from "../../shared/types";
import { useDoctorManagement } from "./hooks/useDoctorManagement";

interface Props {
  doctors: Doctor[];
  onBookSlot?: (doctorName: string) => void;
  onUpdateStatus?: (doctorId: string, status: string) => void;
  userRole?: string;
}

const DoctorManagement: React.FC<Props> = ({
  doctors,
  onBookSlot,
  onUpdateStatus,
  userRole,
}) => {
  const {
    filteredDoctors,
    searchTerm,
    handleSearch,
    statusFilter,
    handleStatusFilterChange,
    statusOptions
  } = useDoctorManagement(doctors);

  return (
    <div className="doctor-management-container">
      <div className="doctor-header animate-in fade-in duration-700">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Doctors Hub
          </h1>
          <p className="text-slate-400 font-medium text-sm mt-1">
            Directory of world-class clinicians and specialized medical staff.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-hospital-blue transition-colors" />
            <input
              type="text"
              placeholder="Search clinicians..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-hospital-blue/10 w-full sm:w-64 transition-all"
            />
          </div>

          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-hospital-blue/10 appearance-none w-full sm:w-48 transition-all cursor-pointer"
            >
              <option value="All">All Status</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="doctor-grid">
        {filteredDoctors.map((doctor, idx) => (
          <div
            key={doctor.id}
            className="doctor-card group stagger-item"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="doctor-image-wrapper">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="doctor-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
              
              <div className="absolute top-6 left-6 flex flex-col space-y-2">
                <span
                  className="doctor-status-badge"
                >
                  {doctor.status}
                </span>
                {doctor.status === "Available" && (
                  <div className="w-8 h-8 rounded-full bg-hospital-blue border-4 border-white/20 animate-pulse"></div>
                )}

                {(userRole === "Admin" || userRole === "Doctor") && (
                  <select
                    value={doctor.status}
                    onChange={(e) =>
                      onUpdateStatus?.(doctor.id, e.target.value)
                    }
                    className="mt-2 bg-slate-900/80 text-white text-[8px] font-black uppercase tracking-widest rounded-xl border border-white/20 px-2 py-1 outline-none focus:ring-2 focus:ring-hospital-blue"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900">
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex items-center space-x-2 text-hospital-blue/40 mb-2">
                  <Zap className="w-4 h-4 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {doctor.specialization}
                  </span>
                </div>
                <h3 className="text-3xl font-black tracking-tighter">
                  {doctor.name}
                </h3>
              </div>
            </div>

            {/* Card body */}
            <div className="px-2 pb-3 space-y-4">

              {/* Quals / Exp chips */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                    Qualification
                  </p>
                  <p className="text-xs font-bold text-slate-800 leading-snug truncate">
                    {doctor.qualification || "—"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                    Experience
                  </p>
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    {doctor.experience || "—"}
                  </p>
                </div>
              </div>

              {/* Rating / Fee row */}
              <div className="flex items-center justify-between px-1 py-2 border-t border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <div className="flex space-x-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Global Rank 4.9
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                    Consultation
                  </p>
                  <p className="text-xl font-black text-hospital-blue leading-none">
                    ₹{doctor.fee}
                  </p>
                </div>
              </div>

              {/* Book button */}
              <div>
                <button
                  onClick={() => onBookSlot?.(doctor.name)}
                  className="book-btn"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">No Clinician Found</h3>
          <p className="text-slate-400 font-medium text-sm mt-2">
            Try adjusting your search or filter to find who you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorManagement;
