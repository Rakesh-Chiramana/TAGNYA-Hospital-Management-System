import React from "react";

interface DoctorStatusMonitorProps {
  doctors: any[];
}

const DoctorStatusMonitor: React.FC<DoctorStatusMonitorProps> = ({ doctors }) => {
  return (
    <div className="bg-white p-10 border border-slate-200 rounded-[3rem] shadow-xl shadow-slate-200/20 mt-10">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
            Doctors Status Monitor
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Real-time availability and rosters
          </p>
        </div>
        <div className="px-5 py-2 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Live Updates
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {doctors.map((doc) => {
          const statusConfig: Record<
            string,
            { bg: string; text: string; border: string; dot: string; glow: string }
          > = {
            Available: {
              bg: "bg-hospital-blue/10",
              text: "text-hospital-blue/70",
              border: "border-hospital-blue/20",
              dot: "bg-hospital-blue",
              glow: "shadow-hospital-blue/20",
            },
            "On Rounds": {
              bg: "bg-blue-50",
              text: "text-blue-700",
              border: "border-blue-200",
              dot: "bg-blue-500",
              glow: "shadow-blue-500/20",
            },
            "In Surgery": {
              bg: "bg-rose-50",
              text: "text-rose-700",
              border: "border-rose-200",
              dot: "bg-rose-500",
              glow: "shadow-rose-500/20",
            },
            "On Leave": {
              bg: "bg-slate-50",
              text: "text-slate-500",
              border: "border-slate-200",
              dot: "bg-slate-400",
              glow: "shadow-slate-400/20",
            },
            "Emergency Only": {
              bg: "bg-amber-50",
              text: "text-amber-700",
              border: "border-amber-200",
              dot: "bg-amber-500",
              glow: "shadow-amber-500/20",
            },
          };
          const config = statusConfig[doc.status] || statusConfig["Available"];
          const isActive = doc.status !== "On Leave";

          return (
            <div
              key={doc.id}
              className={`group relative p-6 bg-white rounded-[2rem] border ${
                config.border
              } hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
                !isActive ? "opacity-60" : ""
              }`}
            >
              <div
                className={`absolute top-0 right-0 w-28 h-28 ${config.bg} rounded-bl-[3rem] -mr-6 -mt-6 opacity-60 group-hover:opacity-100 transition-opacity`}
              ></div>

              <div className="relative z-10 flex items-start space-x-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ${
                    config.glow
                  } ${
                    doc.status === "Available"
                      ? "bg-gradient-to-br from-hospital-blue to-hospital-blue/70"
                      : doc.status === "In Surgery"
                      ? "bg-gradient-to-br from-rose-500 to-rose-700"
                      : doc.status === "On Rounds"
                      ? "bg-gradient-to-br from-blue-500 to-blue-700"
                      : doc.status === "Emergency Only"
                      ? "bg-gradient-to-br from-amber-500 to-amber-700"
                      : "bg-gradient-to-br from-slate-400 to-slate-500"
                  } shrink-0`}
                >
                  {doc.name
                    .split(" ")
                    .filter(Boolean)
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 tracking-tight truncate">
                    {doc.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                    {doc.specialization}
                  </p>

                  <div
                    className={`inline-flex items-center space-x-2 mt-3 px-3 py-1.5 rounded-xl ${config.bg} border ${config.border}`}
                  >
                    <span
                      className={`w-2 h-2 ${config.dot} rounded-full ${
                        isActive && doc.status !== "Emergency Only"
                          ? "animate-pulse"
                          : ""
                      }`}
                    ></span>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest ${config.text}`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t border-slate-100">
        {[
          {
            status: "Available",
            dot: "bg-hospital-blue",
            text: "text-slate-500",
          },
          { status: "On Rounds", dot: "bg-blue-500", text: "text-slate-500" },
          { status: "In Surgery", dot: "bg-rose-500", text: "text-slate-500" },
          {
            status: "Emergency Only",
            dot: "bg-amber-500",
            text: "text-slate-500",
          },
          { status: "On Leave", dot: "bg-slate-400", text: "text-slate-400" },
        ].map((legend) => (
          <div key={legend.status} className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 ${legend.dot} rounded-full`}></span>
            <span
              className={`text-[10px] font-bold ${legend.text} uppercase tracking-widest`}
            >
              {legend.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorStatusMonitor;
