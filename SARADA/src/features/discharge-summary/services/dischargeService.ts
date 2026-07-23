const API = "http://localhost:5000/api/discharge";

interface SaveDischargePayload {
  patient_id: string;
  ip_no: string;
  patient_name: string;
  discharge_date: string;
  chief_complaints: string;
  present_history: string;
  hospital_course: string;
  temperature: string;
  pulse: string;
  bp: string;
  resp: string;
  spo2: string;
  condition_at_discharge: string;
  final_diagnosis: string;
  medications: string;
  discharge_advice: string;
  review_date: string;
  finalize_report: boolean;
}
const parseJson = async (res: Response) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response from discharge API: ${text}`);
  }
};

export const getPatients = async () => {
  const res = await fetch(`${API}/patients`);
  if (!res.ok) throw new Error(`Failed to fetch patients: ${res.status} ${res.statusText}`);
  return parseJson(res);
};

export const getPatientById = async (id: string) => {
  const res = await fetch(`${API}/patient/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch patient: ${res.status} ${res.statusText}`);
  return parseJson(res);
};

export const saveDischarge = async (data: SaveDischargePayload) => {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Discharge save failed: ${res.status} ${res.statusText} - ${errorBody}`);
  }

  return parseJson(res);
};
