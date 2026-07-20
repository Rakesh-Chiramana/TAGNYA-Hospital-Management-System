import React, { useState } from "react";
import { StaffMember } from "../../../shared/types";
import {
  X,
  Users,
  UserPlus,
  Shield,
  Eye,
  EyeOff,
} from "../../../shared/utils/icons";
import { compressImage } from "../utils/imageUtils";

const STAFF_ROLES = [
  "Doctor",
  "Receptionist",
  "Pharmacist",
  "Pharmacy",
  "Lab Technician",
  "Lab",
  "Laboratory",
  "Nurse",
  "Ward Boy",
  "Accountant",
  "Security",
  "IT Support",
];

interface AddStaffModalProps {
  onClose: () => void;
  onAdd: (s: StaffMember) => void;
  staff: StaffMember[];
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose, onAdd, staff }) => {
  const nextIdNum = React.useMemo(() => {
    let maxNum = 1000;
    staff.forEach((s) => {
      const match = s.id.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });
    return maxNum + 1;
  }, [staff]);

  const [form, setForm] = useState({
    staffId: `S-${nextIdNum}`,
    name: "",
    role: "Receptionist",
    phone: "",
    email: "",
    age: "",
    emergency: "",
    experience: "",
    study: "",
    joiningDate: new Date().toISOString().split("T")[0],
    username: "",
    password: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setImagePreview(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.username || !form.password) return;
    const newStaff: StaffMember = {
      id: form.staffId,
      ...form,
      avatar: imagePreview || undefined,
      status: "Active",
    };
    onAdd(newStaff);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Register New Staff Member
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Hospital Personnel Details
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Profile Image */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-violet-50 bg-white flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-10 h-10 text-slate-200" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-violet-500 text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-violet-600 transition-colors border-2 border-white">
                  <UserPlus className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Staff Photo
              </p>
            </div>

            {/* Right: Main Form */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Staff ID
                  </label>
                  <input
                    value={form.staffId}
                    readOnly
                    className="w-full border border-slate-100 bg-slate-50 text-slate-400 font-mono font-bold rounded-xl px-4 py-3 text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Staff Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Age
                  </label>
                  <input
                    value={form.age}
                    onChange={(e) => set("age", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => set("role", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition bg-white"
                  >
                    {STAFF_ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Study / Education
                  </label>
                  <input
                    value={form.study}
                    onChange={(e) => set("study", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    value={form.experience}
                    onChange={(e) => set("experience", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Emergency Contact
                  </label>
                  <input
                    value={form.emergency}
                    onChange={(e) => set("emergency", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) => set("joiningDate", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-4 h-4 text-violet-600" />
                  <p className="text-[10px] font-black text-violet-700 uppercase tracking-widest">
                    Login Credentials
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Username
                    </label>
                    <input
                      value={form.username}
                      onChange={(e) => set("username", e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition bg-white pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPwd ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 text-sm font-black rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-black rounded-2xl hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Register Staff
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
