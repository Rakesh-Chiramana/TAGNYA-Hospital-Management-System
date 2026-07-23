export enum UserRole {
  ADMIN = "Admin",
  DOCTOR = "Doctor",
  NURSE = "Nurse",
  RECEPTIONIST = "Receptionist",
  LABORATORY = "Laboratory",
  PHARMACIST = "Pharmacist",
}

export enum AppointmentStatus {
  BOOKED = "BookED",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export enum WardType {
  GENERAL = "General",
  SEMI_PRIVATE = "Semi-Private",
  PRIVATE = "Private Suite",
  ICU = "ICU",
}

export interface PatientHistoryEvent {
  date: string;
  time?: string;
  event: string;
  notes: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  blood?: string;
  bloodGroup?: string; // Support both naming conventions if necessary, but better to unify
  weight?: string;
  address?: string;
  emergencyContact?: { name: string; phone: string };
  type: "OP" | "IP";
  status: string;
  admissionDate: string;
  admissionTime?: string;
  doctor?: string;
  serial?: string;
  contact?: string;
  fee?: number;
  paymentMethod?: string;
  cause?: string;
  signature?: string;
  history?: PatientHistoryEvent[];
  ward?: string;
  room?: string;
  bed?: string;
  dob?: string;
  email?: string;
  ipNumber?: string;
  attendantRelation?: string;
  attendantContactNo?: string;
  department?: string;
  primaryDoctor?: string;
}

export interface Prescription {
  name: string;
  dosage: string;
  frequency: string;
}

export interface ClinicalData {
  vitals: {
    bp: string;
    heartRate: string;
    temp: string;
    spo2: string;
  };
  prescriptions: Prescription[];
  diagnosis: string;
  notes: FormDataEntryValue | null;
}

export interface Appointment {
  id: string;
  time: string;
  date?: string;
  name: string;
  patientId: string;
  dr: string;
  type: string;
  urgent: boolean;
  patientInfo?: Patient;
  reason?: string;
  medicalHistory?: string;
  preferredContact?: string;
  referralSource?: string;
}

export interface LabTest {
  id: string;
  patient: string;
  age: string;
  sex: string;
  test: string;
  doctor: string;
  status: "Pending" | "Completed" | "Ready" | "In Progress";
  time: string;
  type?: "Pathology" | "Radiology";
  totalCost: number;
  resultData: Record<string, string>;
  healthSummary?: string;
  healthScore?: number;
  mobile?: string;
  gender?: string;
  paymentMethod?: string;
  date?: string;
  pid?: string;
  sampleCollectedAt?: string;
  collectedOn?: string;
  reportedOn?: string;
  reportedAt?: string;
}

export interface Availability {
  day: string;
  fromTime: string;
  toTime: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: string;
  fee: number;
  image: string;
  status: string;
  email?: string;
  kmc?: string;
  designation?: string;
  availability?: Availability[];
}

export interface ChargeDetails {
  bedCharges: {
    type: string;
    days: number;
    rate: number;
    amount: number;
  }[];

  pharmacyCharges: {
    medicine: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];

  nursingCharge: number;
  miscCharge: number;
  discount: number;
  subtotal: number;
  total: number;
}
export interface Invoice {
  id: string;
  name: string;
  patientId: string;
  age?: string | number;       
  mobileNo?: string; 
  department?: string;
  services: string;
  amount: string;
  status: string;
  date: string;
  time: string;
  paymentMethod?: string;
  charges?: ChargeDetails;

}

export interface Bed {
  id: string;
  wardType: WardType;
  wardNo: string;
  isOccupied: boolean;
  isReserved?: boolean;
  reservationExpiry?: number; // Timestamp
  patientName?: string;
  patientId?: string;
  estimatedDischarge?: "Immediate" | "Today" | "Tonight" | "Tomorrow" | "Later";
  chargePerDay: number;
}

export interface DischargeSummary {
  id: string;
  patientId: string;
  patientName: string;
  age: string;
  gender: string;
  admissionDate: string;
  dischargeDate: string;
  consultant: string;
  chiefComplaints: string;
  relevantHistory: string;
  hospitalCourse: string;
  vitals: {
    temp: string;
    pulse: string;
    bp: string;
    resp: string;
    spo2: string;
    condition: string;
  };
  finalDiagnosis: string;
  medications: Array<{
    medicine: string;
    dose: string;
    freq: string;
    dur: string;
  }>;
  advice: string;
  followUp: string;
  isReady: boolean;
  createdAt: string;
}

export enum StaffRole {
  DOCTOR = "Doctor",
  RECEPTIONIST = "Receptionist",
  PHARMACIST = "Pharmacist",
  PHARMACY = "Pharmacy",
  LAB_TECHNICIAN = "Lab Technician",
  LAB = "Lab",
  LABORATORY = "Laboratory",
  NURSE = "Nurse",
  WARD_BOY = "Ward Boy",
  ACCOUNTANT = "Accountant",
  SECURITY = "Security",
  IT_SUPPORT = "IT Support",
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  username: string;
  password: string;
  status: "Active" | "Inactive" | "On Leave";
  joiningDate: string;
  email?: string;
  address?: string;
  avatar?: string; // initials or color key
  age?: string;
  experience?: string;
  study?: string;
  emergency?: string;
}

export interface AdmissionData {
  patientId?: string;
  patientName: string;
  doctorName: string;
  ward?: string;
  bed?: string;
  admissionDate?: string;
  reason?: string;
}


export interface VisitData {
  diagnosis: string;
  notes: string;
  prescription?: Prescription[];
}


export interface BedBookingData {
  patientId: string;
  patientName: string;
  doctorName?: string;
  admissionDate?: string;
}


export interface BedUpdateData {
  wardType?: WardType;
  wardNo?: string;
  isOccupied?: boolean;
  patientName?: string;
  patientId?: string;
}


export interface DischargeData {
  patientId: string;
  patientName: string;
  dischargeDate: string;
  diagnosis: string;
  summary: string;
}
