import React, { useState } from "react";
import { Calendar, Receipt, Activity, History } from "../../../shared/utils/icons";
import { Patient, Appointment, Invoice } from "../../../shared/types";

interface PatientHistoryTimelineProps {
  patient: Patient;
  appointments: Appointment[];
  invoices: Invoice[];
}

interface PatientHistory {
  date?: string;
  time?: string;
  event: string;
  notes?: string;
}

const PatientHistoryTimeline: React.FC<PatientHistoryTimelineProps> = ({
  patient,
  appointments,
  invoices,
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const events = [
    ...appointments
      .filter((a) => a.patientId === patient.id || a.name === patient.name)
      .map((a) => ({
        id: `apt-${a.id}`,
        date: a.date || patient.admissionDate,
        time: a.time,
        type: "Appointment",
        title: a.type,
        description: `Consultation with ${a.dr}`,
        icon: <Calendar className="w-4 h-4" />,
        color: "bg-emerald-500",
        details: a,
      })),
    ...invoices
      .filter((i) => i.patientId === patient.id || i.name === patient.name)
      .map((i) => ({
        id: `inv-${i.id}`,
        date: i.date,
        time: i.time,
        type: "Billing",
        title: i.services,
        description: `Amount: ${i.amount} - Status: ${i.status}`,
        icon: <Receipt className="w-4 h-4" />,
        color: "bg-emerald-500",
        details: i,
      })),
    ...(patient.history || []).map((h: PatientHistory, idx: number) => ({
      id: `hist-${idx}`,
      date: h.date,
      time: h.time || "",
      type: "Medical Event",
      title: h.event,
      description: h.notes,
      icon: <Activity className="w-4 h-4" />,
      color: "bg-emerald-600",
      details: h,
    })),
  ].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return (dateB || 0) - (dateA || 0);
  });

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      {events.length === 0 ? (
        <div className="text-center py-10">
          <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            No history records found
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-100 ml-3 pl-8 space-y-8 py-4">
          {events.map((event) => (
            <div key={event.id} className="relative">
              <div
                className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full ${event.color} flex items-center justify-center text-white shadow-lg ring-4 ring-white`}
              >
                {event.icon}
              </div>
              <div
                className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group"
                onClick={() => toggleItem(event.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {event.date} {event.time && `• ${event.time}`}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter text-white ${event.color}`}
                      >
                        {event.type}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 tracking-tight">
                      {event.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistoryTimeline;
