import React, { useState } from "react";
import { StaffMember, Doctor } from "../../../shared/types";
import { X, Eye, EyeOff } from "../../../shared/utils/icons";

interface AddDoctorModalProps {
  onClose: () => void;
  onAdd: (s: StaffMember, d: Doctor) => void;
}

const AddDoctorModal: React.FC<AddDoctorModalProps> = ({ onClose, onAdd }) => {
  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [image, setImage] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    designation: "",
    username: "",
    password: "",
    fee: "",
    kmc: "",
    study: "",
    experience: "",
  });

  const [availability, setAvailability] = useState(
    DAYS.map((day) => ({
      day,
      fromTime: "07:00 AM",
      toTime: "07:00 PM",
    }))
  );

  const [showPwd, setShowPwd] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAvailability = (
    index: number,
    key: "fromTime" | "toTime",
    value: string
  ) => {
    const next = [...availability];
    next[index] = { ...next[index], [key]: value };
    setAvailability(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.username || !form.password || !form.email) {
      alert("Please fill in all required fields, including email.");
      return;
    }

    let finalName = form.name.trim();
    if (
      !finalName.toLowerCase().startsWith("dr.") &&
      !finalName.toLowerCase().startsWith("dr ")
    ) {
      finalName = `Dr. ${finalName}`;
    }

    const id = `d${Date.now()}`;
    const newStaff: StaffMember = {
      id,
      name: finalName,
      role: `Doctor – ${form.designation}`,
      phone: form.phone,
      username: form.username,
      password: form.password,
      status: "Active",
      joiningDate: new Date().toISOString().split("T")[0],
      email: form.email,
      avatar: image || undefined,
    };

    const newDoctor: Doctor = {
      id,
      name: finalName,
      specialization: form.designation,
      qualification: form.study,
      experience: form.experience ? `${form.experience} Years` : "",
      fee: Number(form.fee) || 0,
      image:
        image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=150&h=150&auto=format&fit=crop",
      status: "Available",
      email: form.email,
      kmc: form.kmc,
      designation: form.designation,
      availability: availability,
    };

    onAdd(newStaff, newDoctor);
    onClose();
  };

  const TIME_SLOTS = [
    "06:00 AM",
    "07:00 AM",
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
    "10:00 PM",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 relative animate-fade-in max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
            CREATE DOCTOR
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="flex items-center gap-4 col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="w-32 text-xs font-black text-slate-500 uppercase tracking-wider">
                Doctor Photo
              </label>
              <div className="flex items-center gap-4">
                {image && (
                  <img src={image} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-xs font-bold text-slate-500">
                Doctor Name
              </label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Enter Doctor Name"
                className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-xs font-bold text-slate-500">
                Mobile No
              </label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="Enter valid Mobile No"
                className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-32 text-xs font-bold text-slate-500">
                Email
              </label>
              <input
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="Enter Email"
                className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-xs font-bold text-slate-500">
                Designation
              </label>
              <input
                value={form.designation}
                onChange={(e) => set("designation", e.target.value)}
                placeholder="Enter Designation"
                className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-32 text-xs font-bold text-slate-500">
                User Name
              </label>
              <input
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="Enter User Name"
                className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-xs font-bold text-slate-500">
                Password
              </label>
              <div className="flex-1 relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Enter Password"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-32 text-xs font-bold text-slate-500">
                Study
              </label>
              <input
                value={form.study}
                onChange={(e) => set("study", e.target.value)}
                placeholder="e.g. MBBS, MD"
                className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-xs font-bold text-slate-500">
                Experience
              </label>
              <input
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
                placeholder="e.g. 5"
                className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-32 text-xs font-bold text-slate-500">
                Consultancy
              </label>
              <input
                value={form.fee}
                onChange={(e) => set("fee", e.target.value)}
                placeholder="Enter Consultancy"
                className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-xs font-bold text-slate-500">
                KMC
              </label>
              <input
                value={form.kmc}
                onChange={(e) => set("kmc", e.target.value)}
                placeholder="Enter KMC"
                className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Availability Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-blue-800 uppercase italic">
              AVAILABILITY
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-bold text-slate-500 w-1/3">
                      Week
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-slate-500 w-1/3">
                      From Time
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-slate-500 w-1/3">
                      To Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {availability.map((item, idx) => (
                    <tr
                      key={item.day}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700 bg-slate-50/30">
                        {item.day}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={item.fromTime}
                          onChange={(e) =>
                            updateAvailability(idx, "fromTime", e.target.value)
                          }
                          className="w-full border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                        >
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={item.toTime}
                          onChange={(e) =>
                            updateAvailability(idx, "toTime", e.target.value)
                          }
                          className="w-full border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                        >
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-cyan-700 text-white px-8 py-2 rounded shadow-md hover:bg-cyan-800 font-bold transition-all"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal;
