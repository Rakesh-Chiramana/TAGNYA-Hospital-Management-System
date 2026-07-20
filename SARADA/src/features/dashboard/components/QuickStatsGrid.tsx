import React from "react";
import { Patient } from "../../../shared/types";
import { UserPlus, Stethoscope, Zap, Users } from "../../../shared/utils/icons";

interface QuickStatsGridProps {
  patients: Patient[];
  doctors: any[];
}

const QuickStatsGrid: React.FC<QuickStatsGridProps> = ({ patients, doctors }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        {
          label: "Registry",
          title: "Patient Identity",
          count: `${patients.length} Live Records`,
          icon: UserPlus,
          color: "emerald",
          desc: "Patient enrollment and identity management",
          extraBadge: null,
        },
        {
          label: "Clinical",
          title: "Ward Management",
          count: `${patients.filter((p) => p?.type?.toUpperCase() === "IP").length} Active Rounds`,
          icon: Stethoscope,
          color: "blue",
          desc: "Real-time ward status and clinical rounds",
          extraBadge: null,
        },
        {
          label: "Emergency",
          title: "System Alerts",
          count: "No Critical Latency",
          icon: Zap,
          color: "rose",
          desc: "Critical system monitors and emergency triggers",
          extraBadge: null,
        },
        {
          label: "Physicians",
          title: "Medical Staff",
          count: `${doctors.filter((d) => d.status === "Available").length} Ready`,
          icon: Users,
          color: "indigo",
          desc: "Hospital staff availability and rosters",
          extraBadge:
            doctors.filter((d) => d.status === "In Surgery").length > 0
              ? `${doctors.filter((d) => d.status === "In Surgery").length} Busy`
              : null,
        },
      ].map((card, i) => {
        const colors: Record<
          string,
          {
            bg: string;
            text: string;
            iconBg: string;
            iconText: string;
            dot: string;
            blob: string;
            border: string;
          }
        > = {
          emerald: {
            bg: "bg-hospital-blue/80",
            text: "text-hospital-blue/70",
            iconBg: "bg-white",
            iconText: "text-hospital-blue",
            dot: "bg-hospital-blue",
            blob: "bg-hospital-blue/40",
            border: "border-hospital-blue/10",
          },
          blue: {
            bg: "bg-blue-50/80",
            text: "text-blue-700",
            iconBg: "bg-white",
            iconText: "text-blue-600",
            dot: "bg-blue-500",
            blob: "bg-blue-200/40",
            border: "border-blue-100",
          },
          rose: {
            bg: "bg-rose-50/80",
            text: "text-rose-700",
            iconBg: "bg-white",
            iconText: "text-rose-600",
            dot: "bg-rose-500",
            blob: "bg-rose-200/40",
            border: "border-rose-100",
          },
          indigo: {
            bg: "bg-indigo-50/80",
            text: "text-indigo-700",
            iconBg: "bg-white",
            iconText: "text-indigo-600",
            dot: "bg-indigo-500",
            blob: "bg-indigo-200/40",
            border: "border-indigo-100",
          },
        };
        const config = colors[card.color] || colors.emerald;

        return (
          <button
            key={i}
            className={`group relative p-8 ${config.bg} border ${config.border} rounded-[2.5rem] text-left hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden`}
          >
            {/* Decorative Background Blob */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 ${config.blob} rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}
            ></div>

            <div className="relative z-10">
              <div
                className={`w-14 h-14 ${config.iconBg} rounded-2xl flex items-center justify-center ${config.iconText} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-slate-200/20`}
              >
                <card.icon className="w-7 h-7" />
              </div>

              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                {card.label}
              </p>
              <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight">
                {card.title}
              </h4>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-white/50">
                  <span
                    className={`w-2 h-2 ${config.dot} rounded-full ${
                      card.color === "rose" ? "" : "animate-pulse"
                    }`}
                  ></span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}
                  >
                    {card.count}
                  </span>
                </div>
                {card.extraBadge && (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-xl shadow-sm border border-amber-200/50">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {card.extraBadge}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuickStatsGrid;
