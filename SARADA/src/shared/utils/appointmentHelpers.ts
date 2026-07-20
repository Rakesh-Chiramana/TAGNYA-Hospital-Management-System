/**
 * Appointment Business Logic Helpers
 *
 * Contains all domain-level rules related to appointments.
 * These functions should NOT live inside React components.
 */

/**
 * Determines if an appointment type should be treated as urgent.
 * Centralizing this logic means a single change here propagates everywhere.
 */
export const URGENT_APPOINTMENT_TYPES = ["Critical Emergency"] as const;

export type AppointmentType = string;

export function isUrgentAppointment(type: AppointmentType): boolean {
  return URGENT_APPOINTMENT_TYPES.includes(type as typeof URGENT_APPOINTMENT_TYPES[number]);
}

/**
 * Generates a unique, prefixed appointment ID.
 */
export function generateAppointmentId(): string {
  // Use native crypto.randomUUID when available, otherwise fallback
  let rawId: string;
  try {
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
      rawId = (crypto as any).randomUUID();
    } else {
      // fallback: time + random base36 string
      rawId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    }
  } catch (e) {
    rawId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  return `A-${rawId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`;
}

/**
 * Validates clinical vitals and returns an error message or null if valid.
 */
export interface Vitals {
  bp: string;
  heartRate: string;
  temp: string;
  spo2: string;
}

export function validateVitals(vitals: Vitals): string | null {
  const hr = parseInt(vitals.heartRate);
  const temp = parseFloat(vitals.temp);
  const spo2 = parseInt(vitals.spo2);

  if (isNaN(hr) || hr < 0 || hr > 250) {
    return "Pulse (BPM) must be between 0 and 250.";
  }
  if (isNaN(temp) || temp < 90 || temp > 110) {
    return "Temperature (°F) must be between 90 and 110.";
  }
  if (isNaN(spo2) || spo2 < 0 || spo2 > 100) {
    return "SpO2 (%) must be between 0 and 100.";
  }

  const bpPattern = /^\d{2,3}\/\d{2,3}$/;
  if (vitals.bp && !bpPattern.test(vitals.bp)) {
    return "Blood Pressure must be in format 120/80.";
  }

  return null;
}
