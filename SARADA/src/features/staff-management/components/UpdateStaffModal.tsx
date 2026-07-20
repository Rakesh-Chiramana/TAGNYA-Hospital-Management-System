import React, { useState } from "react";
import { StaffMember } from "../../../shared/types";
import {
  X,
  Users,
  Shield,
  Eye,
  EyeOff,
  Edit,
} from "../../../shared/utils/icons";
import { compressImage } from "../utils/imageUtils";

interface UpdateStaffModalProps {
  member: StaffMember;
  onClose: () => void;
  onUpdate: (s: StaffMember) => void;
}

const UpdateStaffModal: React.FC<UpdateStaffModalProps> = ({
  member,
  onClose,
  onUpdate,
}) => {
  const [form, setForm] = useState({
    name: member.name,
    role: member.role,
    phone: member.phone,
    email: member.email || "",
    username: member.username,
    password: member.password || "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    member.avatar || null
  );

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        // Compress before storing to avoid localStorage quota crash
        const compressed = await compressImage(reader.result as string);
        setImagePreview(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.username) return;
    onUpdate({ ...member, ...form, avatar: imagePreview || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Edit className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Update Personnel
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Modify Staff Information
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-blue-50 bg-white flex items-center justify-center shadow-inner">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8 text-slate-200" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-600 transition-colors border-2 border-white">
                  <Edit className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Update Photo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Staff Name
              </label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Phone Number
              </label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Role
              </label>
              <input
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-4 h-4 text-blue-600" />
              <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
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
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white"
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
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white pr-12"
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
              className="flex-[2] py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-black rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" /> Save Updates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStaffModal;
