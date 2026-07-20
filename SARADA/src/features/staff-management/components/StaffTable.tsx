import React, { useState } from "react";
import { StaffMember, Doctor } from "../../../shared/types";
import {
  Search,
  Briefcase,
  Edit,
  Eye,
  UserX,
  UserCheck,
  Trash2,
} from "../../../shared/utils/icons";

interface StaffTableProps {
  staff: StaffMember[];
  doctors?: Doctor[];
  setUpdateMember: (s: StaffMember) => void;
  setProfileMember: (s: StaffMember) => void;
  toggleStatus: (id: string) => void;
  handleDelete: (id: string) => void;
}

/* ── colour palette for avatar initials ── */
const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
];
const avatarColor = (id: string) =>
  AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

/* ─────────────────────────────────────────── */
/*  STATUS BADGE                               */
/* ─────────────────────────────────────────── */
const StatusBadge: React.FC<{ status: StaffMember["status"] }> = ({
  status,
}) => {
  const map: Record<string, string> = {
    Active: "bg-blue-50 text-blue-700 border-blue-200",
    Inactive: "bg-slate-100 text-slate-500 border-slate-200",
    "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
        map[status] ?? map.Active
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "Active"
            ? "bg-blue-500 animate-pulse"
            : status === "On Leave"
            ? "bg-amber-500"
            : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
};

const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  doctors = [],
  setUpdateMember,
  setProfileMember,
  toggleStatus,
  handleDelete,
}) => {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  // Map doctors into StaffMember-like shape so we can display a unified personnel table
  const doctorsMapped: StaffMember[] = doctors.map((d) => ({
    id: d.id,
    name: d.name,
    role: `Doctor – ${d.specialization}`,
    phone: (d as any).phone || d.email || "",
    username: d.email || d.id,
    password: "",
    status: (d.status as any) || "Active",
    joiningDate: "",
    email: d.email,
    avatar: d.image,
  }));

  // Combine staff + doctors and dedupe by id (staff takes precedence)
  const combined = (() => {
    const map = new Map<string, StaffMember>();
    staff.forEach((s) => map.set(s.id, s));
    doctorsMapped.forEach((d) => {
      if (!map.has(d.id)) map.set(d.id, d);
    });
    return Array.from(map.values());
  })();

  const roles = [
    "All",
    ...Array.from(new Set(combined.map((s) => s.role).filter(Boolean))),
  ];

  const filtered = combined.filter((s) => {
    const matchSearch =
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      ((s.username || s.email || "") as string)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (s.role || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "All" || s.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRole === r
                  ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {[
                "Personnel",
                "Role",
                "Contact",
                "Username",
                "Joined",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-16 text-slate-400 text-sm font-semibold"
                >
                  No personnel found.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
              >
                {/* Personnel */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 ${avatarColor(
                        s.id
                      )} rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm`}
                    >
                      {initials(s.name)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{s.name}</span>
                      <span className="font-mono text-[10px] font-black text-violet-600 mt-0.5">{s.id}</span>
                    </div>
                  </div>
                </td>
                {/* Role */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                    <Briefcase className="w-3 h-3" /> {s.role}
                  </span>
                </td>
                {/* Contact */}
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {s.phone}
                </td>
                {/* Username */}
                <td className="px-6 py-4 text-emerald-600 font-bold text-xs font-mono">
                  {s.username}
                </td>
                {/* Joined */}
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {s.joiningDate}
                </td>
                {/* Status */}
                <td className="px-6 py-4">
                  <StatusBadge status={s.status} />
                </td>
                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 transition-opacity">
                    <button
                      onClick={() => setUpdateMember(s)}
                      title="Update"
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProfileMember(s)}
                      title="View Profile"
                      className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleStatus(s.id)}
                      title="Toggle status"
                      className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                    >
                      {s.status === "Active" ? (
                        <UserX className="w-3.5 h-3.5" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      title="Remove"
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffTable;
