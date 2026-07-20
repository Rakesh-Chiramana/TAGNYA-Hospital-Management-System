import React from "react";
import "./styles/discharge-summary.css";
import {
  FileText,
  Plus,
  Download,
  Edit,
  Search,
  User,
  Calendar,
  Activity,
  ClipboardList,
  Pill,
  Clock,
  Heart,
  Thermometer,
  Droplets,
  Zap,
  CheckCircle2,
} from "../../shared/utils/icons";
import Modal from "../../shared/components/Modal";
import { DischargeSummary as DischargeSummaryType, UserRole } from "../../shared/types";
import { useDischargeSummary } from "./hooks/useDischargeSummary";

interface Props {
  summaries: DischargeSummaryType[];
  patients: any[];
  userRole: UserRole;
  onSave: (summary: DischargeSummaryType) => void;
}

const DischargeSummary: React.FC<Props> = ({
  summaries,
  patients,
  userRole,
  onSave,
}) => {
  const {
    isModalOpen,
    setIsModalOpen,
    editingSummary,
    setEditingSummary,
    searchQuery,
    setSearchQuery,
    formData,
    setFormData,
    canEdit,
    emptySummary,
    patientList,
    handlePatientChange,
    handleAddMedication,
    handleMedChange,
    handleSave,
    handleEdit,
    generatePDF,
  } = useDischargeSummary({ onSave, patients, userRole });

  const filteredSummaries = summaries.filter(
    (s) =>
      s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="discharge-summary-container">
      {/* Header Area */}
      <div className="discharge-header">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase text-[10px] mb-2 opacity-40">
            Administrative Desk
          </h1>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            Discharge Summaries
          </h2>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setFormData(emptySummary);
              setEditingSummary(null);
              setIsModalOpen(true);
            }}
            className="px-8 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl flex items-center space-x-3"
          >
            <Plus className="w-5 h-5" />
            <span>Generate New Summary</span>
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="search-bar-discharge">
        <Search className="w-5 h-5 text-slate-400 ml-4" />
        <input
          type="text"
          placeholder="Search by Patient Name or ID..."
          className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Summaries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredSummaries.map((summary) => (
          <div
            key={summary.id}
            className="summary-card group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-[0.02] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="flex justify-between items-start mb-8 border-b border-slate-50 pb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">
                    {summary.patientName}
                  </h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {summary.patientId} • {summary.age}y • {summary.gender}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${summary.isReady ? 'bg-hospital-blue/10 text-hospital-blue border border-hospital-blue/10' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                  {summary.isReady ? 'Finalized' : 'Draft'}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-2">
                  {summary.dischargeDate}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Consultant</p>
                <p className="text-xs font-black text-slate-700">{summary.consultant}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Diagnosis</p>
                <p className="text-xs font-black text-blue-600 truncate">{summary.finalDiagnosis}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => generatePDF(summary)}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Print PDF</span>
              </button>
              {canEdit && (
                <button
                  onClick={() => handleEdit(summary)}
                  className="px-6 py-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSummary ? "Edit Discharge Summary" : "Generate Discharge Summary"}
        size="2xl"
      >
        <form onSubmit={handleSave} className="discharge-modal-content space-y-8 max-h-[80vh] overflow-y-auto px-4 custom-scrollbar">
          {/* Patient Selection */}
          <div className="discharge-form-section">
            <div className="discharge-grid-2">
              <div className="discharge-input-group">
                <label>Select Patient</label>
                <select
                  className=""
                  name="patientId"
                  value={formData.patientId}
                  onChange={handlePatientChange}
                  required
                >
                  <option value="">Choose Patient...</option>
                  {patientList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.patient_name || p.name} ({p.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="discharge-input-group">
                <label>Discharge Date</label>
                <input
                  type="date"
                  value={formData.dischargeDate}
                  onChange={(e) => setFormData({...formData, dischargeDate: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="discharge-main-column">
              {/* Clinical Summary */}
              <div className="discharge-form-section">
                <div className="discharge-section-heading">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Clinical Findings
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="discharge-input-group">
                    <label>Chief Complaints</label>
                    <textarea
                      value={formData.chiefComplaints}
                      onChange={(e) => setFormData({...formData, chiefComplaints: e.target.value})}
                      placeholder="Enter chief complaints..."
                    />
                  </div>
                  <div className="discharge-input-group">
                    <label>Relevant History</label>
                    <textarea
                      value={formData.relevantHistory}
                      onChange={(e) => setFormData({...formData, relevantHistory: e.target.value})}
                      placeholder="Enter patient's relevant history..."
                    />
                  </div>
                  <div className="discharge-input-group">
                    <label>Hospital Course</label>
                    <textarea
                      value={formData.hospitalCourse}
                      onChange={(e) => setFormData({...formData, hospitalCourse: e.target.value})}
                      placeholder="Describe the clinical course during hospitalization..."
                    />
                  </div>
                </div>
              </div>

              {/* Observations & Vitals */}
              <div className="discharge-form-section">
                <div className="discharge-section-heading">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Observations at Discharge
                </div>
                <div className="discharge-grid-3">
                  {[
                    { label: "Temp (°F)", field: "temp", icon: Thermometer },
                    { label: "Pulse", field: "pulse", icon: Activity },
                    { label: "BP", field: "bp", icon: Heart },
                    { label: "Resp", field: "resp", icon: Droplets },
                    { label: "SpO2 (%)", field: "spo2", icon: Activity },
                    { label: "Condition", field: "condition", icon: ClipboardList },
                  ].map((vital) => (
                    <div key={vital.field} className="discharge-input-group">
                      <label>{vital.label}</label>
                      <input
                        type="text"
                        value={(formData.vitals as any)[vital.field]}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitals: { ...formData.vitals, [vital.field]: e.target.value }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Diagnosis */}
              <div className="discharge-form-section">
                <div className="discharge-input-group">
                  <label>Final Diagnosis</label>
                  <input
                    type="text"
                    value={formData.finalDiagnosis}
                    onChange={(e) => setFormData({...formData, finalDiagnosis: e.target.value})}
                    placeholder="Primary diagnostic conclusion..."
                    required
                  />
                </div>
              </div>

              {/* Medications Table */}
              <div className="discharge-form-section">
                <div className="flex justify-between items-center gap-4">
                  <div className="discharge-section-heading">
                    <Pill className="w-4 h-4 text-blue-600" />
                    Medications Advised
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                  >
                    Add Row
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.medications.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <input
                        placeholder="Medicine"
                        className="bg-transparent border-none outline-none text-xs font-bold"
                        value={med.medicine}
                        onChange={(e) => handleMedChange(idx, "medicine", e.target.value)}
                      />
                      <input
                        placeholder="Dose"
                        className="bg-transparent border-none outline-none text-xs font-bold"
                        value={med.dose}
                        onChange={(e) => handleMedChange(idx, "dose", e.target.value)}
                      />
                      <input
                        placeholder="Freq"
                        className="bg-transparent border-none outline-none text-xs font-bold"
                        value={med.freq}
                        onChange={(e) => handleMedChange(idx, "freq", e.target.value)}
                      />
                      <input
                        placeholder="Dur"
                        className="bg-transparent border-none outline-none text-xs font-bold"
                        value={med.dur}
                        onChange={(e) => handleMedChange(idx, "dur", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice & Follow-up */}
              <div className="discharge-form-section">
                <div className="discharge-grid-2">
                  <div className="discharge-input-group">
                    <label>General Advice</label>
                    <textarea
                      value={formData.advice}
                      onChange={(e) => setFormData({...formData, advice: e.target.value})}
                      placeholder="Lifestyle, diet, or specific instructions..."
                    />
                  </div>
                  <div className="discharge-input-group">
                    <label>Follow-up Schedule</label>
                    <input
                      type="text"
                      value={formData.followUp}
                      onChange={(e) => setFormData({...formData, followUp: e.target.value})}
                      placeholder="Date or timeline for next visit..."
                    />
                  </div>
                </div>
              </div>

              {/* Ready for Download Toggle */}
              <div className="finalize-box">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Finalize Report</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Mark this report as ready for patient download</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.isReady}
                    onChange={(e) => setFormData({...formData, isReady: e.target.checked})}
                  />
                  <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          <button
            type="submit"
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl"
          >
            {editingSummary ? "Update Summary" : "Save Discharge Report"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DischargeSummary;
