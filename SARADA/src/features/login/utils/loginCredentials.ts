import { UserRole } from "../../../shared/types";

export const ROLE_CREDENTIALS: Record<string, { user: string; pass: string }> = {
  [UserRole.ADMIN]: { user: "admin", pass: "admin123" },
  [UserRole.DOCTOR]: { user: "doctor", pass: "doctor123" },
  [UserRole.RECEPTIONIST]: { user: "reception", pass: "reception123" },
  [UserRole.PHARMACIST]: { user: "pharmacy", pass: "pharmacy123" },
  [UserRole.LABORATORY]: { user: "lab", pass: "lab123" },
};

/**
 * Maps a staff role string (from StaffManagement) to the correct UserRole enum.
 * This allows dynamically registered staff to log in and land on the right dashboard.
 */
export const mapStaffRoleToUserRole = (role: string): UserRole | null => {
  const normalized = role.toLowerCase();

  if (normalized.includes("doctor")) return UserRole.DOCTOR;
  if (normalized.includes("receptionist")) return UserRole.RECEPTIONIST;
  if (normalized.includes("pharmacist") || normalized.includes("pharmacy")) return UserRole.PHARMACIST;
  if (normalized.includes("lab")) return UserRole.LABORATORY;
  if (normalized.includes("nurse")) return UserRole.NURSE;

  return null; // Other roles like Ward Boy, Security — not given system access
};
