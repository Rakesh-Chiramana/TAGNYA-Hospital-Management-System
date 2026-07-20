import React from "react";
import { StaffMember } from "../../../shared/types";
import { X, Briefcase, Download, Shield } from "../../../shared/utils/icons";
import { HOSPITAL_SYSTEM_NAME } from "../../../shared/constants/hospitalBranding";
import { addSaradaHospitalHeader } from "../../../shared/utils/pdfHelper";
import hospitalLogo from "../../../assets/sarada_logo.png";

interface ProfileModalProps {
  member: StaffMember;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ member, onClose }) => {
  const downloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const accent = [99, 102, 241] as [number, number, number];
    const pageW = doc.internal.pageSize.getWidth();
    let y = addSaradaHospitalHeader(doc, "Staff Profile Report", hospitalLogo);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, pageW / 2, y, { align: "center" });
    y += 8;

    // Avatar circle placeholder
    doc.setFillColor(230, 230, 250);
    doc.circle(pageW / 2, 58, 18, "F");
    doc.setTextColor(...accent);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const ini = member.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    doc.text(ini, pageW / 2, 63, { align: "center" });

    // Name & role
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(15);
    doc.text(member.name, pageW / 2, 84, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 120);
    doc.text(member.role, pageW / 2, 91, { align: "center" });

    // Status badge line
    doc.setFontSize(9);
    doc.setTextColor(
      member.status === "Active" ? 0 : 100,
      member.status === "Active" ? 92 : 100,
      member.status === "Active" ? 151 : 100
    );
    doc.text(`Status: ${member.status}`, pageW / 2, 98, { align: "center" });

    // Divider
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.5);
    doc.line(14, 103, pageW - 14, 103);

    // Fields (registration fields only — no login credentials)
    const fields: [string, string][] = [
      ["Employee ID", member.id],
      ["Full Name", member.name],
      ["Role / Department", member.role],
      ["Phone Number", member.phone],
      ["Email Address", member.email || "—"],
      ["Age", member.age || "—"],
      ["Experience", member.experience ? `${member.experience} years` : "—"],
      ["Education / Study", member.study || "—"],
      ["Emergency Contact", member.emergency || "—"],
      ["Address", member.address || "—"],
      ["Joining Date", member.joiningDate || "—"],
      ["Status", member.status],
    ];

    let fieldY = 113;
    doc.setFontSize(9);
    fields.forEach(([label, value], i) => {
      if (i % 2 === 0) doc.setFillColor(248, 248, 255);
      else doc.setFillColor(255, 255, 255);
      doc.rect(14, fieldY - 5, pageW - 28, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 120);
      doc.text(label, 18, fieldY + 1);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.text(String(value), pageW / 2 + 5, fieldY + 1);
      fieldY += 11;
    });

    // Footer
    doc.setFillColor(...accent);
    doc.rect(0, doc.internal.pageSize.getHeight() - 12, pageW, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(
      `${HOSPITAL_SYSTEM_NAME} — Confidential`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 4,
      { align: "center" }
    );

    doc.save(`${member.name.replace(/ /g, "_")}_Profile.pdf`);
  };

  const Field = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <span className="text-sm font-semibold text-slate-800">{value}</span>
      </div>
    ) : null;

  const avatarBg = [
    "bg-emerald-500",
    "bg-violet-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-teal-500",
  ];
  const bg =
    avatarBg[
      member.id.charCodeAt(member.id.length - 1) % avatarBg.length
    ];
  const ini = member.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isDoctor = member.role.toLowerCase().includes("doctor");
  const accentFrom = isDoctor ? "from-[#005c97]" : "from-violet-500";
  const accentTo = isDoctor ? "to-[#004a7a]" : "to-violet-600";
  const accentRing = isDoctor ? "ring-blue-200" : "ring-violet-200";
  const accentText = isDoctor ? "text-blue-700" : "text-violet-700";
  const accentBg = isDoctor ? "bg-blue-50" : "bg-violet-50";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 relative animate-fade-in max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div
          className={`bg-gradient-to-br ${accentFrom} ${accentTo} rounded-t-3xl p-8 text-white`}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-5">
            <div
              className={`w-20 h-20 ${bg} ring-4 ${accentRing} rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl`}
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                ini
              )}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/70 mb-1">
                Staff Profile
              </p>
              <h2 className="text-2xl font-black">{member.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Briefcase className="w-3.5 h-3.5 text-white/80" />
                <span className="text-sm font-bold text-white/90">
                  {member.role}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${accentBg} ${accentText}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isDoctor ? "bg-blue-500" : "bg-violet-500"
                } animate-pulse`}
              />
              {member.status}
            </span>
            <span className="text-xs text-white/70 font-bold">
              ID: {member.id}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Contact Section */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-slate-200" />
              Contact Information<span className="flex-1 h-px bg-slate-200" />
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone Number" value={member.phone} />
              <Field label="Email Address" value={member.email} />
              <Field label="Emergency Contact" value={member.emergency} />
              <Field label="Address" value={member.address} />
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-slate-200" />
              Personal Details<span className="flex-1 h-px bg-slate-200" />
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Age" value={member.age} />
              <Field label="Joining Date" value={member.joiningDate} />
              <Field
                label="Experience"
                value={
                  member.experience ? `${member.experience} Years` : undefined
                }
              />
              <Field label="Education / Study" value={member.study} />
            </div>
          </div>

          {/* Login Credentials (Hidden Password) */}
          <div
            className={`${accentBg} rounded-2xl p-5 border border-slate-100`}
          >
            <p
              className={`text-[10px] font-black ${accentText} uppercase tracking-widest mb-3 flex items-center gap-2`}
            >
              <Shield className="w-3.5 h-3.5" /> Login Credentials
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Username" value={member.username} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Password
                </span>
                <span className="text-sm font-semibold text-slate-800 font-mono tracking-widest">
                  {"•".repeat(member.password?.length || 8)}
                </span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadPDF}
            className={`w-full py-4 bg-gradient-to-r ${accentFrom} ${accentTo} text-white text-sm font-black rounded-2xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2`}
          >
            <Download className="w-4 h-4" /> Download Profile PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
