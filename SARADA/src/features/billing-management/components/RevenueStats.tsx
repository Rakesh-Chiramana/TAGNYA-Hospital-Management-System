import React from "react";
import {
  IndianRupee,
  Activity,
  CreditCard,
  FileText,
} from "../../../shared/utils/icons";

interface RevenueStatsProps {
  totalRevenue: number;
  pendingCount: number;
  paidCount: number;
  totalCount: number;
}

const RevenueStats: React.FC<RevenueStatsProps> = ({
  totalRevenue,
  pendingCount,
  paidCount,
  totalCount,
}) => {
  return (
    <div className="revenue-cluster">
      {/* Consolidated Yield */}
      <div className="yield-card group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-hospital-blue opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <h3 className="text-hospital-blue text-[8px] font-black uppercase tracking-[0.3em] mb-2">
            Consolidated Yield
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <IndianRupee className="w-6 h-6 text-hospital-blue" />
            <h4 className="text-3xl font-black tracking-tighter">
              {totalRevenue.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="flex items-center space-x-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <Activity className="w-2.5 h-2.5 text-hospital-blue" />
            <span>Ledger Active</span>
          </div>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="queue-card group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-white/60 text-[8px] font-black uppercase tracking-[0.3em] mb-1">
              Verification Queue
            </h3>
            <p className="text-3xl font-black tracking-tighter">{pendingCount}</p>
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-amber-200">
                Pending Review
              </span>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Invoices Released */}
      <div className="released-card group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-white/60 text-[8px] font-black uppercase tracking-[0.3em] mb-1">
              Invoices Released
            </h3>
            <p className="text-3xl font-black tracking-tighter">{totalCount}</p>
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-blue-200">
                {paidCount} Settled
              </span>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueStats;
