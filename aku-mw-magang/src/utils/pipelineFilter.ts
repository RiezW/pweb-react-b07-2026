// Orang 2 - Fitur 3 - Filter & sorting

import type { Application, ApplicationStatus } from "../types/application";
import { isGhosting } from "./ghosting";

export type SortMode = "newest" | "interview" | "offer";
export type StatusFilter = ApplicationStatus | "ALL";

export interface PipelineFilters {
  keyword: string;
  status: StatusFilter;
  onlyGhosting: boolean;
  sort: SortMode;
}

export function countByStatus(
  applications: Application[]
): Record<ApplicationStatus, number> {
  const initial: Record<ApplicationStatus, number> = {
    WISHLIST: 0,
    APPLIED: 0,
    SCREENING: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0,
    GHOSTED: 0,
  };

  return applications.reduce(
    (counts, application) => ({
      ...counts,
      [application.status]: counts[application.status] + 1,
    }),
    initial
  );
}

function getInterviewTime(application: Application): number {
  if (application.status !== "INTERVIEW" || !application.interviewDateTime) {
    return Number.NaN;
  }

  return Date.parse(application.interviewDateTime);
}

function compareByInterview(a: Application, b: Application, now: number) {
  const timeA = getInterviewTime(a);
  const timeB = getInterviewTime(b);
  const hasA = !Number.isNaN(timeA);
  const hasB = !Number.isNaN(timeB);

  if (!hasA && !hasB) return 0;
  if (!hasA) return 1;
  if (!hasB) return -1;

  const upcomingA = timeA >= now;
  const upcomingB = timeB >= now;

  if (upcomingA !== upcomingB) {
    return upcomingA ? -1 : 1;
  }

  return upcomingA ? timeA - timeB : timeB - timeA;
}

function getOfferValue(application: Application): number {
  return application.status === "OFFER" ? (application.salaryOffer ?? 0) : -1;
}

export function filterAndSortApplications(
  applications: Application[],
  filters: PipelineFilters,
  now: number
): Application[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return applications
    .filter((application) => {
      const matchesKeyword =
        keyword === "" ||
        application.company.toLowerCase().includes(keyword) ||
        application.role.toLowerCase().includes(keyword) ||
        (application.cvVersion?.toLowerCase().includes(keyword) ?? false);

      const matchesStatus =
        filters.status === "ALL" || application.status === filters.status;

      const matchesGhosting =
        !filters.onlyGhosting || isGhosting(application, now);

      return matchesKeyword && matchesStatus && matchesGhosting;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case "interview":
          return compareByInterview(a, b, now);
        case "offer":
          return getOfferValue(b) - getOfferValue(a);
        case "newest":
          return Date.parse(b.lastUpdatedAt) - Date.parse(a.lastUpdatedAt);
      }
    });
}