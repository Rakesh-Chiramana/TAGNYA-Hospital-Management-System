import React from "react";
import { Bed as BedInterface } from "../../../shared/types";
import { Bed, Bookmark, Timer } from "../../../shared/utils/icons";
import CountdownTimer from "./CountdownTimer";

interface BedGridProps {
  filteredBedsList: BedInterface[];
  handleBedClick: (bed: BedInterface) => void;
  setSelectedBedForReservation: (bed: BedInterface) => void;
  getStatusColor: (bed: BedInterface) => string;
  onReleaseBed: (bedId: string) => void;
}

const BedGrid: React.FC<BedGridProps> = ({
  filteredBedsList,
  handleBedClick,
  setSelectedBedForReservation,
  getStatusColor,
  onReleaseBed,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {filteredBedsList.map((bed: BedInterface) => (
        <div
          key={bed.id}
          onClick={() => handleBedClick(bed)}
          className={`group glass-card p-4 rounded-3xl h-full flex flex-col justify-between transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border-t-2 cursor-pointer active:scale-95 ${
            bed.isReserved
              ? "border-t-indigo-500 bg-indigo-50"
              : bed.isOccupied
              ? bed.estimatedDischarge === "Today"
                ? "border-t-amber-500 bg-amber-50"
                : bed.estimatedDischarge === "Tomorrow"
                ? "border-t-blue-500 bg-blue-50"
                : "border-t-cyan-500 bg-cyan-50"
              : "border-t-hospital-blue bg-hospital-blue/10"
          }`}
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(
                  bed
                )} bg-opacity-10 group-hover:scale-110 transition-transform`}
              >
                <Bed
                  className={`w-5 h-5 ${getStatusColor(bed).replace(
                    "bg-",
                    "text-"
                  )}`}
                />
              </div>
              {!bed.isOccupied && !bed.isReserved ? (
                <button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSelectedBedForReservation(bed);
                  }}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  title="Add to Pre-booking List"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  {bed.wardNo}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tighter leading-none mb-1 group-hover:text-hospital-blue transition-colors">
                {bed.id}
              </h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {bed.wardType}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50">
            <div className="flex items-center space-x-2 mb-3">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(bed)}`}
              ></div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">
                {bed.isReserved
                  ? "Pre-booked"
                  : bed.isOccupied
                  ? "Occupied"
                  : "Vacant"}
              </span>
            </div>

            {bed.isOccupied || bed.isReserved ? (
              <div
                className={`p-3 rounded-xl transition-all ${
                  bed.isReserved
                    ? "bg-indigo-50 border border-indigo-100"
                    : "bg-slate-50"
                }`}
              >
                <p className="text-[10px] font-black text-slate-900 truncate uppercase leading-tight">
                  {bed.patientName}
                </p>
                <p className="text-[7px] font-bold text-slate-400 mt-0.5 uppercase">
                  ID: {bed.patientId || "GUEST"}
                </p>
                {bed.isReserved ? (
                  <div className="flex items-center text-[8px] font-black text-indigo-400 mt-1.5">
                    <Timer className="w-2.5 h-2.5 mr-1" />
                    Hold:{" "}
                    <CountdownTimer
                      expiry={bed.reservationExpiry!}
                      onFinish={() => onReleaseBed(bed.id)}
                    />
                  </div>
                ) : (
                  <p className="text-[8px] text-slate-400 font-bold mt-1.5 uppercase">
                    Forecast: {bed.estimatedDischarge}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-900 uppercase leading-tight">
                  Ready for allocation
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BedGrid;
