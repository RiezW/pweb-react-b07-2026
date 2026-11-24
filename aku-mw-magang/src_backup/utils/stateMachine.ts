// Orang 2 - Fitur 4 - State machine

import type { ApplicationStatus, WorkMode } from "../types/application";

// Daftar status
export const ALL_STATUSES: ApplicationStatus[] = [
  "WISHLIST",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "GHOSTED",
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
};

// Transisi
export const STATUS_TRANSITIONS: Record<
  ApplicationStatus,
  ApplicationStatus[]
> = {
  WISHLIST: ["APPLIED"],
  APPLIED: ["SCREENING", "REJECTED", "GHOSTED"],
  SCREENING: ["INTERVIEW", "REJECTED", "GHOSTED"],
  INTERVIEW: ["OFFER", "REJECTED", "GHOSTED"],
  OFFER: [],
  REJECTED: [],
  GHOSTED: ["SCREENING"],
};

export function getAllowedTransitions(
  status: ApplicationStatus
): ApplicationStatus[] {
  return STATUS_TRANSITIONS[status];
}

export function canTransition(
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

export interface TransitionPayload {
  cvVersion?: string;
  appliedDate?: string;
  interviewDateTime?: string;
  salaryOffer?: number;
  workMode?: WorkMode;
}

export type TransitionField =
  | "general"
  | "cvVersion"
  | "appliedDate"
  | "interviewDateTime"
  | "salaryOffer"
  | "workMode";

export type TransitionErrors = Partial<Record<TransitionField, string>>;

// Validasi
export function validateTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
  payload: TransitionPayload
): TransitionErrors {
  const errors: TransitionErrors = {};

  if (!canTransition(from, to)) {
    errors.general = `Status ${STATUS_LABELS[from]} tidak bisa langsung pindah ke ${STATUS_LABELS[to]}.`;
    return errors;
  }

  switch (to) {
    case "APPLIED":
      if (!payload.cvVersion?.trim()) {
        errors.cvVersion = "Versi CV wajib diisi.";
      }
      if (!payload.appliedDate) {
        errors.appliedDate = "Tanggal lamaran wajib diisi.";
      }
      break;

    case "INTERVIEW":
      if (!payload.interviewDateTime) {
        errors.interviewDateTime = "Jadwal interview wajib diisi.";
      }
      break;

    case "OFFER":
      if (
        payload.salaryOffer === undefined ||
        !Number.isFinite(payload.salaryOffer) ||
        payload.salaryOffer <= 0
      ) {
        errors.salaryOffer = "Nominal gaji harus lebih dari 0.";
      }
      if (!payload.workMode) {
        errors.workMode = "Mode kerja wajib dipilih.";
      }
      break;

    default:
      break;
  }

  return errors;
}
