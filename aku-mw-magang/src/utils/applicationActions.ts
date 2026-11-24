// Orang 2 - Fitur 3 & 4 - Aksi lamaran

import type {
  ActivityLog,
  Application,
  ApplicationStatus,
  ChecklistItem,
} from "../types/application";
import { MS_PER_DAY } from "./ghosting";
import { formatDate, formatDateTime, formatRupiah } from "./format";
import {
  STATUS_LABELS,
  canTransition,
  type TransitionPayload,
} from "./stateMachine";

export type ApplicationUpdater = (application: Application) => Application;
export type UpdateApplicationHandler = (
  id: string,
  updater: ApplicationUpdater
) => void;

export interface ActionMeta {
  now: string;
  logId: string;
}

export function createActionMeta(): ActionMeta {
  return { now: new Date().toISOString(), logId: crypto.randomUUID() };
}

function appendLog(
  application: Application,
  message: string,
  meta: ActionMeta
): ActivityLog[] {
  return [
    ...application.activityLogs,
    { id: meta.logId, timestamp: meta.now, message },
  ];
}

function buildTransitionMessage(
  from: ApplicationStatus,
  to: ApplicationStatus,
  payload: TransitionPayload
): string {
  switch (to) {
    case "APPLIED":
      return `Lamaran dikirim (CV: ${payload.cvVersion?.trim() ?? "-"}, tanggal ${
        payload.appliedDate ? formatDate(payload.appliedDate) : "-"
      }).`;
    case "INTERVIEW":
      return `Pindah ke Interview (jadwal ${
        payload.interviewDateTime
          ? formatDateTime(payload.interviewDateTime)
          : "-"
      }).`;
    case "OFFER":
      return `Mendapat Offer: ${
        payload.salaryOffer ? formatRupiah(payload.salaryOffer) : "-"
      } per bulan, mode ${payload.workMode ?? "-"}.`;
    default:
      return `Status berubah dari ${STATUS_LABELS[from]} ke ${STATUS_LABELS[to]}.`;
  }
}

/* ---------- Transisi status ---------- */

export function transitionApplication(
  application: Application,
  target: ApplicationStatus,
  payload: TransitionPayload,
  meta: ActionMeta
): Application {
  if (!canTransition(application.status, target)) {
    return application;
  }

  const next: Application = {
    ...application,
    status: target,
    lastUpdatedAt: meta.now,
    activityLogs: appendLog(
      application,
      buildTransitionMessage(application.status, target, payload),
      meta
    ),
  };

  switch (target) {
    case "APPLIED":
      return {
        ...next,
        cvVersion: payload.cvVersion?.trim(),
        appliedDate: payload.appliedDate,
      };
    case "INTERVIEW":
      return { ...next, interviewDateTime: payload.interviewDateTime };
    case "OFFER":
      return {
        ...next,
        salaryOffer: payload.salaryOffer,
        workMode: payload.workMode ?? application.workMode,
      };
    default:
      return next;
  }
}

/* ---------- Simulasi +15 hari ---------- */

export function simulateDaysPassed(
  application: Application,
  days: number,
  meta: ActionMeta
): Application {
  if (application.status !== "APPLIED" && application.status !== "SCREENING") {
    return application;
  }

  const shifted = new Date(
    Date.parse(application.lastUpdatedAt) - days * MS_PER_DAY
  ).toISOString();

  return {
    ...application,
    lastUpdatedAt: shifted,
    activityLogs: appendLog(
      application,
      `Simulasi: lastUpdatedAt dimundurkan ${days} hari.`,
      meta
    ),
  };
}

/* ---------- Checklist (nested immutable update) ---------- */

export function addChecklistItem(
  application: Application,
  item: ChecklistItem
): Application {
  return { ...application, checklist: [...application.checklist, item] };
}

export function toggleChecklistItem(
  application: Application,
  itemId: string
): Application {
  return {
    ...application,
    checklist: application.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    ),
  };
}

export function removeChecklistItem(
  application: Application,
  itemId: string
): Application {
  return {
    ...application,
    checklist: application.checklist.filter((item) => item.id !== itemId),
  };
}

/* ---------- Activity log manual ---------- */

export function addActivityNote(
  application: Application,
  note: string,
  meta: ActionMeta
): Application {
  return {
    ...application,
    activityLogs: appendLog(application, `Catatan: ${note}`, meta),
  };
}
