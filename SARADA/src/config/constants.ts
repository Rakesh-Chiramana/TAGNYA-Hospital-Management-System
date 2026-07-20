/**
 * Application-level constants.
 * For hospital branding constants, see shared/constants/hospitalBranding.ts
 */

/** Application metadata */
export const APP_NAME = 'Tagnya Hospital Management System';
export const APP_VERSION = '2.0.0';

/** LocalStorage key prefixes used throughout the app */
export const STORAGE_KEYS = {
  BEDS: 'accendia_v2_beds',
  PATIENTS: 'accendia_v2_patients',
  INVOICES: 'accendia_v2_invoices',
  APPOINTMENTS: 'accendia_v2_appointments',
  DOCTORS: 'accendia_v2_doctors',
  STAFF: 'accendia_v2_staff',
  DISCHARGE_SUMMARIES: 'accendia_v2_discharge_summaries',
  LAB_TESTS: 'accendia_v3_lab_tests',
} as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/** Bed reservation defaults */
export const BED_RESERVATION = {
  /** Reservation hold duration in milliseconds (1 hour) */
  HOLD_DURATION_MS: 3600000,
} as const;
