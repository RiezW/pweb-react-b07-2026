// ini bagian Ciko

import { useEffect, useState } from "react";
import type { JobListing } from "../types/job";
import type { Application } from "../types/application";
import { calculateSkillMatch } from "../utils/skillMatch";
import type { SkillMatchResult } from "../types/skill";
import {
  fetchFallbackJobs,
  fetchRemotiveJobs,
} from "../services/jobService";
import { useDebounce } from "../hooks/useDebounce";

type DataSource = "remotive" | "fallback";

interface JobExplorerProps {
  captainSkills: string[];
  applications: Application[];
  onSaveToWishlist: (job: JobListing) => void;
}

function getMatchColor(score: number): string {
  if (score >= 70) {
    return "match-green";
  }

  if (score >= 40) {
    return "match-yellow";
  }

  return "match-red";
}

export function JobExplorer({
  captainSkills,
  applications,
  onSaveToWishlist,
}: JobExplorerProps) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataSource, setDataSource] =
    useState<DataSource>("remotive");
  const [retryCount, setRetryCount] = useState(0);

  // ini bagian Ciko

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const debouncedKeyword = useDebounce(searchKeyword, 400);

  const categories = Array.from(
    new Set(jobs.map((job) => job.category))
  ).sort();

  const filteredJobs = jobs
    .filter((job) => {
      const keyword = debouncedKeyword.trim().toLowerCase();

      const matchesSearch =
        job.title.toLowerCase().includes(keyword) ||
        job.company_name.toLowerCase().includes(keyword);

      const matchesCategory =
        selectedCategory === "all" ||
        job.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((jobA, jobB) => {
      const scoreA = calculateSkillMatch(
        captainSkills,
        jobA.tags
      ).matchScore;

      const scoreB = calculateSkillMatch(
        captainSkills,
        jobB.tags
      ).matchScore;

      return scoreB - scoreA;
    });

  // ini bagian ciko

  useEffect(() => {
    const controller = new AbortController();

    async function loadJobs() {
      setIsLoading(true);
      setError("");
      setJobs([]);

      try {
        const result =
          dataSource === "remotive"
            ? await fetchRemotiveJobs(controller.signal)
            : await fetchFallbackJobs(controller.signal);

        if (!controller.signal.aborted) {
          setJobs(result);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan yang tidak diketahui.";

        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      controller.abort();
    };
  }, [dataSource, retryCount]);

  function handleRetry() {
    setDataSource("remotive");
    setRetryCount((current) => current + 1);
  }

  function handleFallback() {
    setDataSource("fallback");
  }

  return (
    <section className="job-explorer">
      <div className="job-explorer-header">
        <div>
          <h2>Eksplorasi Lowongan</h2>
          <p>
            Temukan peluang magang yang sesuai dengan keahlianmu.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="job-message">
          <p>Memuat daftar lowongan...</p>
        </div>
      )}

      {error && (
        <div className="job-error">
          <p>Gagal memuat lowongan: {error}</p>

          <div className="job-error-actions">
            <button type="button" onClick={handleRetry}>
              Coba Lagi
            </button>

            {dataSource === "remotive" && (
              <button
                type="button"
                className="fallback-button"
                onClick={handleFallback}
              >
                Gunakan Data Lokal
              </button>
            )}
          </div>
        </div>
      )}

      {!isLoading && !error && jobs.length === 0 && (
        <div className="job-message">
          <p>Belum ada lowongan yang tersedia.</p>
        </div>
      )}

      {!isLoading && !error && jobs.length > 0 && (
        <>
          {/* ini bagian Ciko */}

          <div className="job-toolbar">
            <input
              type="search"
              placeholder="Cari posisi atau perusahaan..."
              value={searchKeyword}
              onChange={(event) =>
                setSearchKeyword(event.target.value)
              }
            />

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
            >
              <option value="all">Semua Kategori</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className="sort-indicator">
              Match Tertinggi
            </div>
          </div>

          {/* ini bagian ciko */}

          <div className="job-results-info">
            <span>
              Sumber data:{" "}
              <strong>
                {dataSource === "remotive"
                  ? "Remotive API (Live)"
                  : "Dataset Magang ID (Lokal)"}
              </strong>
            </span>

            <span>
              {filteredJobs.length} dari {jobs.length} lowongan ditemukan
            </span>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="job-list">
              {filteredJobs.map((job) => {
                const match: SkillMatchResult =
                  calculateSkillMatch(captainSkills, job.tags);

                // ini bagian Ciko

                const existingApplication = applications.find(
                  (application) =>
                    application.company.toLowerCase() ===
                      job.company_name.toLowerCase() &&
                    application.role.toLowerCase() ===
                      job.title.toLowerCase()
                );

                const isAlreadyApplied =
                  existingApplication !== undefined &&
                  existingApplication.status !== "WISHLIST";

                const isWishlisted =
                  existingApplication?.status === "WISHLIST";

                // ini bagian ciko

                return (
                  <article className="job-card" key={job.id}>
                    <div className="job-card-top">
                      <div className="job-company">
                        <div className="company-logo">
                          {job.company_name
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>
                          <h3>{job.company_name}</h3>
                          <p>{job.candidate_required_location}</p>
                        </div>
                      </div>

                      <span
                        className={`match-badge ${getMatchColor(
                          match.matchScore
                        )}`}
                      >
                        {match.matchScore}% Match
                      </span>
                    </div>

                    <h4 className="job-title">{job.title}</h4>

                    <p className="job-category">
                      Kategori: {job.category}
                    </p>

                    <div className="job-tags">
                      {job.tags.map((tag, index) => {
                        const isMatched = match.matchedSkills.some(
                          (skill) =>
                            skill.toLowerCase() ===
                            tag.toLowerCase()
                        );

                        return (
                          <span
                            key={`${job.id}-${index}`}
                            className={
                              isMatched
                                ? "tag-matched"
                                : "tag-missing"
                            }
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>

                    <div className="match-details">
                      <p>
                        <strong>Skill cocok:</strong>{" "}
                        {match.matchedSkills.length > 0
                          ? match.matchedSkills.join(", ")
                          : "Belum ada"}
                      </p>

                      <p>
                        <strong>Skill belum dikuasai:</strong>{" "}
                        {match.missingSkills.length > 0
                          ? match.missingSkills.join(", ")
                          : "Tidak ada"}
                      </p>
                    </div>

                    <div className="job-card-footer">
                      <p className="job-salary">
                        {job.salary || "Gaji tidak dicantumkan"}
                      </p>

                      <div className="job-card-actions">
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="job-link"
                          >
                            Lihat Lowongan
                          </a>
                        )}

                        <button
                          type="button"
                          className="wishlist-button"
                          disabled={
                            isAlreadyApplied || isWishlisted
                          }
                          onClick={() => onSaveToWishlist(job)}
                        >
                          {isAlreadyApplied
                            ? "Sudah Dilamar"
                            : isWishlisted
                              ? "Tersimpan di Wishlist"
                              : "Simpan ke Wishlist"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="job-message">
              <p>
                Tidak ada lowongan yang sesuai dengan pencarianmu.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ini bagian ciko
