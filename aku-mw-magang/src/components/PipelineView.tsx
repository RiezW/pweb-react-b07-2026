// Orang 2 - Fitur 3 - Pipeline

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Application } from "../types/application";
import type { InterviewConflict } from "../utils/conflicts";
import { useNow } from "../hooks/useNow";
import { calculateSkillMatch } from "../utils/skillMatch";
import { getDaysSinceUpdate, isGhosting } from "../utils/ghosting";
import { getMatchClass } from "../utils/matchColor";
import { formatDateTime, formatRupiah } from "../utils/format";
import {
  countByStatus,
  filterAndSortApplications,
  type SortMode,
  type StatusFilter,
} from "../utils/pipelineFilter";
import { ALL_STATUSES, STATUS_LABELS } from "../utils/stateMachine";
import {
  createActionMeta,
  simulateDaysPassed,
  type UpdateApplicationHandler,
} from "../utils/applicationActions";
import { StatusBadge } from "./StatusBadge";
import { ApplicationDetail } from "./ApplicationDetail";
import "../styles/pipeline.css";

function describeCard(application: Application, now: number): string | null {
  switch (application.status) {
    case "INTERVIEW":
      return application.interviewDateTime
        ? `Interview ${formatDateTime(application.interviewDateTime)}`
        : null;
    case "OFFER":
      return application.salaryOffer
        ? `Offer ${formatRupiah(application.salaryOffer)} per bulan`
        : null;
    case "APPLIED":
    case "SCREENING": {
      const days = getDaysSinceUpdate(application, now);
      return days === 0
        ? "Diperbarui hari ini"
        : `Tanpa perubahan ${days} hari`;
    }
    default:
      return null;
  }
}

interface PipelineViewProps {
  applications: Application[];
  captainSkills: string[];
  conflicts: InterviewConflict[];
  onUpdateApplication: UpdateApplicationHandler;
  onDeleteApplication: (id: string) => void;
  renderInterviewPrep?: (application: Application) => ReactNode;
}

export function PipelineView({
  applications,
  captainSkills,
  conflicts,
  onUpdateApplication,
  onDeleteApplication,
  renderInterviewPrep,
}: PipelineViewProps) {
  const now = useNow();
  const searchRef = useRef<HTMLInputElement>(null);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [onlyGhosting, setOnlyGhosting] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Shortcut "/" untuk fokus ke kolom cari
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Derived state
  const visibleApplications = filterAndSortApplications(
    applications,
    { keyword, status: statusFilter, onlyGhosting, sort: sortMode },
    now
  );
  const statusCounts = countByStatus(applications);
  const ghostingCount = applications.filter((application) =>
    isGhosting(application, now)
  ).length;
  const hasActiveFilter =
    keyword.trim() !== "" || statusFilter !== "ALL" || onlyGhosting;

  const conflictedIds = new Set(
    conflicts.flatMap((conflict) => [conflict.first.id, conflict.second.id])
  );

  const selected =
    applications.find((application) => application.id === selectedId) ?? null;

  function handleSimulate(id: string) {
    const meta = createActionMeta();
    onUpdateApplication(id, (current) => simulateDaysPassed(current, 15, meta));
  }

  function handleResetFilters() {
    setKeyword("");
    setStatusFilter("ALL");
    setOnlyGhosting(false);
  }

  return (
    <section className="pipeline">
      <div className="pipeline-header">
        <div>
          <h2>War Room Lamaran</h2>
          <p>Pantau status, jadwal, dan tindak lanjut setiap lamaran.</p>
        </div>

        <div className="pipeline-header-stats">
          <span>{applications.length} lamaran</span>
          <span className={ghostingCount > 0 ? "warn" : ""}>
            {ghostingCount} rawan ghosting
          </span>
          <span className={conflicts.length > 0 ? "danger" : ""}>
            {conflicts.length} jadwal bentrok
          </span>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="pipeline-empty">
          <h3>Belum ada lamaran</h3>
          <p>
            Simpan lowongan dari Eksplorasi Lowongan atau catat lamaran manual,
            lalu pantau statusnya di sini.
          </p>
        </div>
      ) : (
        <>
          <div className="status-chips" role="group" aria-label="Filter status">
            <button
              type="button"
              className={`status-chip${statusFilter === "ALL" ? " active" : ""}`}
              aria-pressed={statusFilter === "ALL"}
              onClick={() => setStatusFilter("ALL")}
            >
              Semua <span>{applications.length}</span>
            </button>

            {ALL_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                className={`status-chip${
                  statusFilter === status ? " active" : ""
                }`}
                aria-pressed={statusFilter === status}
                onClick={() => setStatusFilter(status)}
              >
                {STATUS_LABELS[status]} <span>{statusCounts[status]}</span>
              </button>
            ))}
          </div>

          <div className="pipeline-toolbar">
            <input
              ref={searchRef}
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Cari perusahaan, posisi, atau versi CV (tekan /)"
              aria-label="Cari lamaran"
            />

            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              aria-label="Urutkan lamaran"
            >
              <option value="newest">Terbaru</option>
              <option value="interview">Jadwal interview terdekat</option>
              <option value="offer">Offer tertinggi</option>
            </select>

            <label className="toggle">
              <input
                type="checkbox"
                checked={onlyGhosting}
                onChange={(event) => setOnlyGhosting(event.target.checked)}
              />
              Hanya rawan ghosting
            </label>
          </div>

          <div className="pipeline-layout">
            <div className="pipeline-list">
              <p className="pipeline-count">
                Menampilkan {visibleApplications.length} dari{" "}
                {applications.length} lamaran
                {hasActiveFilter && (
                  <button
                    type="button"
                    className="link-button"
                    onClick={handleResetFilters}
                  >
                    Reset filter
                  </button>
                )}
              </p>

              {visibleApplications.length === 0 ? (
                <div className="pipeline-empty">
                  <h3>Tidak ada lamaran yang cocok</h3>
                  <p>Ubah kata kunci atau filter untuk melihat lamaran lain.</p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleResetFilters}
                  >
                    Reset filter
                  </button>
                </div>
              ) : (
                visibleApplications.map((application) => {
                  const match = calculateSkillMatch(
                    captainSkills,
                    application.requiredSkills
                  );
                  const doneCount = application.checklist.filter(
                    (item) => item.done
                  ).length;
                  const ghosting = isGhosting(application, now);
                  const info = describeCard(application, now);
                  const canSimulate =
                    application.status === "APPLIED" ||
                    application.status === "SCREENING";

                  return (
                    <article
                      key={application.id}
                      className={`pipeline-card${
                        application.id === selectedId ? " selected" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="pipeline-card-main"
                        onClick={() => setSelectedId(application.id)}
                        aria-pressed={application.id === selectedId}
                      >
                        <div className="pipeline-card-top">
                          <div>
                            <h3>{application.role}</h3>
                            <p>
                              {application.company} · {application.workMode}
                            </p>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>

                        {info && <p className="pipeline-card-info">{info}</p>}

                        <div className="pipeline-card-meta">
                          <span>CV: {application.cvVersion ?? "-"}</span>
                          <span>
                            Checklist {doneCount}/{application.checklist.length}
                          </span>
                          <span
                            className={`match-badge ${getMatchClass(
                              match.matchScore
                            )}`}
                          >
                            {match.matchScore}% Match
                          </span>
                        </div>

                        {(ghosting || conflictedIds.has(application.id)) && (
                          <div className="pipeline-card-flags">
                            {ghosting && (
                              <span className="flag-badge flag-ghost">
                                Rawan Ghosting
                              </span>
                            )}
                            {conflictedIds.has(application.id) && (
                              <span className="flag-badge flag-conflict">
                                Jadwal bentrok
                              </span>
                            )}
                          </div>
                        )}
                      </button>

                      {canSimulate && (
                        <button
                          type="button"
                          className="secondary-button pipeline-simulate"
                          onClick={() => handleSimulate(application.id)}
                        >
                          Simulasi +15 Hari
                        </button>
                      )}
                    </article>
                  );
                })
              )}
            </div>

            <div className="pipeline-detail">
              {selected === null ? (
                <div className="pipeline-empty">
                  <h3>Pilih lamaran</h3>
                  <p>
                    Klik salah satu lamaran di daftar untuk mengubah status,
                    mengelola checklist, dan melihat riwayatnya.
                  </p>
                </div>
              ) : (
                <ApplicationDetail
                  key={selected.id}
                  application={selected}
                  captainSkills={captainSkills}
                  now={now}
                  hasConflict={conflictedIds.has(selected.id)}
                  onUpdate={onUpdateApplication}
                  onSimulate={handleSimulate}
                  onDelete={onDeleteApplication}
                  extraPanel={renderInterviewPrep?.(selected)}
                />
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}