// Orang 2 - Fitur 3 - Bentrok jadwal

import type { Application } from "../types/application";

export const CONFLICT_THRESHOLD_MINUTES = 60;

export interface InterviewConflict {
  first: Application;
  second: Application;
  diffMinutes: number;
}

export function detectConflicts(
  applications: Application[]
): InterviewConflict[] {
  const scheduled = applications
    .flatMap((application) => {
      if (application.status !== "INTERVIEW" || !application.interviewDateTime) {
        return [];
      }

      const time = Date.parse(application.interviewDateTime);

      return Number.isNaN(time) ? [] : [{ application, time }];
    })
    .sort((a, b) => a.time - b.time);

  const conflicts: InterviewConflict[] = [];

  for (let i = 0; i < scheduled.length; i++) {
    for (let j = i + 1; j < scheduled.length; j++) {
      const diffMinutes = (scheduled[j].time - scheduled[i].time) / 60000;

      if (diffMinutes >= CONFLICT_THRESHOLD_MINUTES) {
        break;
      }

      conflicts.push({
        first: scheduled[i].application,
        second: scheduled[j].application,
        diffMinutes: Math.round(diffMinutes),
      });
    }
  }

  return conflicts;
}
