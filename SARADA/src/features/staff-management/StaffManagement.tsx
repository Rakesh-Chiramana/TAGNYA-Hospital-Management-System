import React, { useState, useEffect } from "react";
import "./styles/staff-management.css";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Stethoscope,
  Shield,
} from "../../shared/utils/icons";
import { StaffMember, Doctor } from "../../shared/types";

// Subcomponents
import AddStaffModal from "./components/AddStaffModal";
import AddDoctorModal from "./components/AddDoctorModal";
import UpdateStaffModal from "./components/UpdateStaffModal";
import ProfileModal from "./components/ProfileModal";
import StaffTable from "./components/StaffTable";

interface StaffManagementProps {
  staff: StaffMember[];
  setStaff: (
    value: StaffMember[] | ((prev: StaffMember[]) => StaffMember[])
  ) => void;
  doctors: Doctor[];
  setDoctors: (value: Doctor[] | ((prev: Doctor[]) => Doctor[])) => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({
  staff,
  setStaff,
  doctors,
  setDoctors,
}) => {
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [profileMember, setProfileMember] = useState<StaffMember | null>(null);
  const [updateMember, setUpdateMember] = useState<StaffMember | null>(null);

  useEffect(() => {
    // Fetch staff from database first
    const fetchStaffFromDB = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/staff");
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.staff) && data.staff.length > 0) {
            setStaff(data.staff);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch staff from DB; using seeded defaults", err);
      }
    };

    fetchStaffFromDB();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddStaff = async (s: StaffMember) => {
    try {
      const response = await fetch("http://localhost:5000/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });

      const data = await response.json();

      if (data.success && data.staff) {
        // Use the DB-assigned id
        setStaff((prev: StaffMember[]) => [{ ...s, id: data.staff.id }, ...prev]);
      } else {
        alert(data.message || "Failed to save staff member");
      }
    } catch (error) {
      console.error("Staff save failed", error);
      alert("Could not reach the server. Staff saved locally only.");
      // Still add locally so UI doesn't break
      setStaff((prev: StaffMember[]) => [s, ...prev]);
    }
  };

  const handleAddDoctor = async (s: StaffMember, d: Doctor) => {
    try {
      const { image, ...doctorForServer } = d;
      const response = await fetch(
        "http://localhost:5000/api/doctors",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...doctorForServer,
            username: s.username,
            password: s.password,
            phone: s.phone,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.doctor) {
        const dbDoctor = { ...data.doctor, image: d.image || data.doctor.image };
        const dbStaff = { ...s, id: dbDoctor.id };
        setStaff((prev) => [dbStaff, ...prev]);
        setDoctors((prev) => [dbDoctor, ...prev]);
      } else {
        alert(data.message || "Failed to add doctor");
      }
    } catch (error) {
      console.error("Doctor save failed", error);
      alert("An error occurred while saving the doctor.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/doctors/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete doctor from server:", err);
    }
    setStaff((prev: StaffMember[]) => prev.filter((s) => s.id !== id));
    setDoctors((prev: Doctor[]) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateStaff = (updatedStaff: StaffMember) => {
    setStaff((prev: StaffMember[]) =>
      prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
    );
    setDoctors((prev: Doctor[]) =>
      prev.map((d) =>
        d.id === updatedStaff.id
          ? {
              ...d,
              name: updatedStaff.name,
              specialization: updatedStaff.role.replace("Doctor \u2013 ", ""),
              email: updatedStaff.email,
              image: updatedStaff.avatar || d.image,
            }
          : d
      )
    );
  };

  const toggleStatus = (id: string) => {
    setStaff((prev: StaffMember[]) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" }
          : s
      )
    );
    setDoctors((prev: Doctor[]) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: d.status === "Active" ? "Inactive" : "Active" }
          : d
      )
    );
  };

  const stats = {
    total: staff.length,
    active: staff.filter((s) => s.status === "Active").length,
    onLeave: staff.filter((s) => s.status === "On Leave").length,
    inactive: staff.filter((s) => s.status === "Inactive").length,
  };

  return (
    <div className="staff-management-container">
      {/* Header */}
      <div className="staff-header">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Hospital Personnel Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage staff, roles & access credentials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddStaff(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Add Staff
          </button>
          <button
            onClick={() => setShowAddDoctor(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#005c97] to-[#004a7a] text-white text-sm font-bold hover:from-[#004a7a] hover:to-[#003a6a] transition-all shadow-lg shadow-blue-100"
          >
            <Stethoscope className="w-4 h-4" /> Add Doctor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="staff-stats-grid">
        {[
          {
            label: "Total Personnel",
            value: stats.total,
            icon: Users,
            className: "card-personnel",
          },
          {
            label: "Active",
            value: stats.active,
            icon: UserCheck,
            className: "card-active-staff",
          },
          {
            label: "On Leave",
            value: stats.onLeave,
            icon: Shield,
            className: "card-leave-staff",
          },
          {
            label: "Inactive",
            value: stats.inactive,
            icon: UserX,
            className: "card-inactive-staff",
          },
        ].map((s) => (
          <div key={s.label} className={`personnel-card ${s.className} group`}>
            {/* Animated Orbs */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-14 -mt-14 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
                  {s.label}
                </p>
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                  <s.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tighter">{s.value}</p>
              <div className="flex items-center space-x-1.5 mt-3">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">
                  Live Sync
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <StaffTable
        staff={staff}
        doctors={doctors}
        setUpdateMember={setUpdateMember}
        setProfileMember={setProfileMember}
        toggleStatus={toggleStatus}
        handleDelete={handleDelete}
      />

      {showAddStaff && (
        <AddStaffModal
          onClose={() => setShowAddStaff(false)}
          onAdd={handleAddStaff}
          staff={staff}
        />
      )}
      {showAddDoctor && (
        <AddDoctorModal
          onClose={() => setShowAddDoctor(false)}
          onAdd={handleAddDoctor}
        />
      )}
      {updateMember && (
        <UpdateStaffModal
          member={updateMember}
          onClose={() => setUpdateMember(null)}
          onUpdate={handleUpdateStaff}
        />
      )}
      {profileMember && (
        <ProfileModal
          member={profileMember}
          onClose={() => setProfileMember(null)}
        />
      )}
    </div>
  );
};

export default StaffManagement;
