import React, { useState } from "react";
import "./VisitorSearch.css";
import {
  MapPin,
  Hospital,
  Clock,
  User,
  Phone,
  Info,
} from "../utils/icons";
import { Patient } from "../types";

interface Props {
  patients: Patient[];
  doctors?: any[];
}

const VisitorSearch: React.FC<Props> = ({ patients, doctors = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const getDoctorStatus = (doctorName: string = "") => {
    const doc = doctors.find((d) => (doctorName || "").includes(d.name));
    return doc?.status || "Available";
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.type === "IP" &&
      (p.status === "Admitted" || p.status === "Critical") &&
      ((p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (p.id?.toLowerCase() || "").includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="visitor-search-container">
      <div className="visitor-header">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Patient Locator
        </h1>
        <p className="text-slate-500">
          Helping relatives find loved ones admitted in Tagnya Hospital.
        </p>
      </div>


      <div className="search-wrapper group">
        <input
          type="text"
          placeholder="Search patient by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input-large"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
           <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {filteredPatients.length} Nodes Found
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredPatients.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Admitted Patients Found</p>
          </div>
        ) : (
          filteredPatients.map((p, idx) => (
            <div
              key={p.id}
              className="patient-card-visitor group"
            >
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start space-x-6">
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <User className="w-10 h-10 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                          {p.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            p.status === "Critical"
                              ? "bg-red-100 text-red-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="text-slate-500 font-bold text-xs">
                        Patient ID:{" "}
                        <span className="font-mono font-black text-emerald-600">
                          {p.id}
                        </span>
                      </p>
                      <div className="flex items-center space-x-4 mt-4">
                        <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                          Admitted: {p.admissionDate}
                        </div>
                        <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <User className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                          {p.doctor.split("(")[0]}
                          <span
                            className={`ml-2 px-2 py-0.5 rounded-md text-[8px] ${
                              getDoctorStatus(p.doctor) === "Available"
                                ? "bg-emerald-100 text-emerald-700"
                                : getDoctorStatus(p.doctor) === "On Rounds"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {getDoctorStatus(p.doctor)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end space-y-3">
                    <div className="flex flex-col md:items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Current Location
                      </span>
                      <div className="location-box">
                        <MapPin className="w-6 h-6 text-emerald-400" />
                        <div>
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                            {p.ward}
                          </p>
                          <p className="text-xl font-black leading-none tracking-tighter">
                            {p.room} — Bed {p.bed}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-6 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center text-[10px] text-emerald-600 font-black uppercase tracking-widest space-x-6">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" /> Visiting: 4:00 PM -
                      6:00 PM
                    </div>
                    <div className="flex items-center">
                      <Info className="w-4 h-4 mr-2" /> One visitor at a time
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Showing map for ${p.ward}...`)}
                    className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center space-x-3 shadow-lg active:scale-95"
                  >
                    <span>Get Wayfinding Map</span>
                  </button>
                </div>
              </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VisitorSearch;
