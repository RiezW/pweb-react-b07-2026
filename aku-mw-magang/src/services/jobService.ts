// ini bagian Ciko

import type { JobListing } from "../types/job";

interface RemotiveResponse {
  "job-count": number;
  jobs: JobListing[];
}

const REMOTIVE_API =
  "https://remotive.com/api/remote-jobs?category=software-dev&limit=30";

export async function fetchRemotiveJobs(
  signal: AbortSignal
): Promise<JobListing[]> {
  const response = await fetch(REMOTIVE_API, { signal });

  if (!response.ok) {
    throw new Error("Failed to fetch jobs from Remotive API.");
  }

  const result: RemotiveResponse = await response.json();

  return result.jobs;
}

export async function fetchFallbackJobs(
  signal: AbortSignal
): Promise<JobListing[]> {
  const response = await fetch("/magang-fallback.json", { signal });

  if (!response.ok) {
    throw new Error("Failed to load local fallback jobs.");
  }

  const result: JobListing[] = await response.json();

  return result;
}

// ini bagian ciko