import React from "react";
import "./Sidebar.css";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Stethoscope,
  Calendar,
  BedDouble,
  FlaskConical,
  Pill,
  Receipt,
  ReceiptIndianRupee,
  Settings,
  ClipboardList,
  MapPin,
  Activity,
  LogOut,
  Microscope,
} from "../utils/icons";
import { UserRole } from "../types";
import { mapStaffRoleToUserRole } from "../../features/login/utils/loginCredentials";

import hospitalLogo from "../../assets/sarada_logo.png";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  loggedInStaffName: string | null;
  onRevenueReport?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  loggedInStaffName,
  onRevenueReport,
}) => {
  const allItems = [
    {
      id: "dashboard",
      label: "Command Center",
      icon: LayoutDashboard,
      roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST],
    },
    {
      id: "patients",
      label: "Patient Registry",
      icon: Users,
      roles: [UserRole.ADMIN, UserRole.RECEPTIONIST],
    },
    {
      id: "visitor-search",
      label: "Patient Locator",
      icon: MapPin,
      roles: [
        UserRole.RECEPTIONIST,
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.LABORATORY,
      ],
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      roles: [
        UserRole.DOCTOR,
        UserRole.ADMIN,
        UserRole.RECEPTIONIST,
        UserRole.LABORATORY,
      ],
    },
    {
      id: "doctors",
      label: "Doctors",
      icon: Stethoscope,
      roles: [UserRole.ADMIN, UserRole.RECEPTIONIST],
    },
    {
      id: "lab",
      label: "Diagnostics",
      icon: FlaskConical,
      roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.LABORATORY],
    },
    {
      id: "pharmacy",
      label: "Pharmacy OS",
      icon: Pill,
      roles: [UserRole.PHARMACIST, UserRole.ADMIN],
    },
    {
      id: "billing",
      label: "Revenue Reports",
      icon: ReceiptIndianRupee,
      roles: [UserRole.ADMIN, UserRole.PHARMACIST, UserRole.LABORATORY, UserRole.RECEPTIONIST],
    },
    {
      id: "expense",
      label: "Expense Bills",
      icon: Receipt,
      roles: [UserRole.ADMIN, UserRole.PHARMACIST, UserRole.LABORATORY, UserRole.RECEPTIONIST, UserRole.DOCTOR],
    },
    {
      id: "bed-allocation",
      label: "Bed Allocation",
      icon: BedDouble,
      roles: [UserRole.ADMIN, UserRole.RECEPTIONIST],
    },
    {
      id: "discharge-summary",
      label: "Discharge Desk",
      icon: ClipboardList,
      roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST],
    },
    {
      id: "staff-management",
      label: "Staff Management",
      icon: UserCheck,
      roles: [UserRole.ADMIN],
    },
  ];

  const effectiveRole = mapStaffRoleToUserRole(userRole as string) || userRole;
  const menuItems = allItems.filter((item) => item.roles.includes(effectiveRole));

  return (
    <div className="sidebar-container">
      {/* Premium Branding Area */}
      <div className="branding-area">
        <img src={hospitalLogo} alt="Hospital Logo" className="h-[60px] w-auto object-contain" />
        <div className="flex flex-col justify-center select-none ml-1">
          <span className="text-[17px] font-black tracking-[0.1em] text-orange-500 uppercase leading-none">Tagnya</span>
          <span className="text-[13px] font-bold tracking-[0.2em] text-slate-100 uppercase mt-1.5 leading-none">Hospital</span>
        </div>
      </div>

      {/* Navigation Space */}
      <nav className="nav-space custom-scrollbar">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="h-[1px] flex-1 bg-slate-800/50"></div>
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Workspace</span>
          <div className="h-[1px] flex-1 bg-slate-800/50"></div>
        </div>

        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-button ${activeTab === item.id
              ? "nav-button-active"
              : "nav-button-inactive"
              }`}
          >
            <div className="flex items-center space-x-4">
              <item.icon
                className={`w-5 h-5 transition-all duration-500 ${activeTab === item.id ? "text-[#f29100]" : "text-slate-600 group-hover:text-[#f29100]"}`}
              />
              <span
                className={`text-[11px] font-black uppercase tracking-widest ${activeTab === item.id ? "text-white" : "text-slate-500"}`}
              >
                {item.label}
              </span>
            </div>
            {activeTab === item.id && (
              <div className="w-1.5 h-1.5 bg-[#f29100] rounded-full shadow-[0_0_12px_rgba(242,145,0,0.8)] animate-pulse"></div>
            )}
          </button>
        ))}

      </nav>

      {/* User Context Area */}
      <div className="user-context">
        <div className="user-card group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500 opacity-[0.02] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-[#f29100] transition-colors shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 leading-none truncate">
                {userRole} Node
              </p>
              <p className="text-xs font-black text-white tracking-tight leading-none group-hover:text-[#f29100] transition-colors truncate">
                {loggedInStaffName || "System Active"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
