import React from "react";
import { Clock, Activity } from "../../../shared/utils/icons";

interface DutyRosterProps {
  isLoggedInDoctor: boolean;
  loggedInStaffName: string | null;
  doctors: any[];
  DOCTOR_SCHEDULES: any;
  setViewingScheduleDoc: (doc: any) => void;
}

const DutyRoster: React.FC<DutyRosterProps> = ({
  isLoggedInDoctor,
  loggedInStaffName,
  doctors,
  DOCTOR_SCHEDULES,
  setViewingScheduleDoc,
}) => {
  const rosterDoctors = isLoggedInDoctor
    ? doctors.filter((doc) => doc.name === loggedInStaffName)
    : doctors;

  return (
    <div className="roster-card">
      <h3 className="font-black text-slate-900 mb-6 flex items-center uppercase tracking-widest text-xs">
        <Clock className="w-4 h-4 mr-2 text-emerald-600" />
        On-Duty Roster
      </h3>
      <div className="space-y-4">
        {rosterDoctors.length > 0 ? (
          rosterDoctors.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setViewingScheduleDoc(doc)}
              className="roster-item group cursor-pointer hover:bg-slate-50 border-l-2 border-transparent hover:border-emerald-500 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                    {doc.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                    {doc.specialization}
                  </p>
                </div>
                <Activity className="w-3 h-3 text-slate-200 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          ))
        ) : (
          Object.entries(DOCTOR_SCHEDULES).map(([name, sched]: [string, any]) => (
            <div
              key={name}
              onClick={() =>
                setViewingScheduleDoc({ name, specialization: sched.specialty })
              }
              className="roster-item group cursor-pointer hover:bg-slate-50 border-l-2 border-transparent hover:border-emerald-500 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                    {name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                    {sched.specialty}
                  </p>
                </div>
                <Activity className="w-3 h-3 text-slate-200 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DutyRoster;
