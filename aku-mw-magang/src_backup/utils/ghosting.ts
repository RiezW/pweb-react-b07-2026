// Orang 2 - Fitur 3 - Ghosting

import type { Application } from "../types/application";

export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const GHOSTING_THRESHOLD_DAYS = 14;

export function isGhosting(application: Application, now: number): boolean {
  if (application.status !== "APPLIED" && application.status !== "SCREENING") {
    return false;
  }

  const lastUpdated = Date.parse(application.lastUpdatedAt);

  if (Number.isNaN(lastUpdated)) {
    return false;
  }

  return (now - lastUpdated) / MS_PER_DAY > GHOSTING_THRESHOLD_DAYS;
}
