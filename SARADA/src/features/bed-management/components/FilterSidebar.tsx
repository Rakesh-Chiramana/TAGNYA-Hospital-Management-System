import React from "react";
import { WardType } from "../../../shared/types";
import { CheckCircle2 } from "../../../shared/utils/icons";

interface FilterSidebarProps {
  activeWard: WardType | "All";
  setActiveWard: (ward: WardType | "All") => void;
  showOnlyAvailable: boolean;
  setShowOnlyAvailable: (val: boolean) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  activeWard,
  setActiveWard,
  showOnlyAvailable,
  setShowOnlyAvailable,
}) => {
  return (
    <div className="filter-sidebar">
      <h3 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-widest text-xs">
        Allocation Filters
      </h3>

      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
            Ward Selection
          </p>
          <div className="flex flex-col space-y-2">
            {["All", ...Object.values(WardType)].map((type) => (
              <button
                key={type}
                onClick={() => setActiveWard(type as "All" | WardType)}
                className={`ward-btn ${
                  activeWard === type
                    ? "ward-btn-active"
                    : "ward-btn-inactive"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-widest">
                  {type}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <button
            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
            className={`w-full p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center space-y-2 ${
              showOnlyAvailable
                ? "bg-hospital-blue border-hospital-blue text-white shadow-2xl scale-[1.02]"
                : "bg-white border-slate-100 text-slate-500 hover:border-hospital-blue/20"
            }`}
          >
            <CheckCircle2
              className={`w-8 h-8 ${
                showOnlyAvailable ? "text-hospital-blue/20" : "text-slate-200"
              }`}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Show Available Only
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
