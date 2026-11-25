// Orang 2 - Fitur 4 - Detail lamaran

import type { ReactNode } from "react";
import type {
  Application,
  ApplicationStatus,
} from "../types/application";
import { calculateSkillMatch } from "../utils/skillMatch";
import { getDaysSinceUpdate, isGhosting } from "../utils/ghosting";
import { formatDate, formatDateTime, formatRupiah } from "../utils/format";
import { STATUS_LABELS, type TransitionPayload } from "../utils/stateMachine";
import {
  addActivityNote,
  addChecklistItem,
  createActionMeta,
  removeChecklistItem,
  toggleChecklistItem,
  transitionApplication,
  type UpdateApplicationHandler,
} from "../utils/applicationActions";
import { StatusBadge } from "./StatusBadge";
import { StatusTransitionPanel } from "./StatusTransitionPanel";
import { ChecklistPanel } from "./ChecklistPanel";
import { ActivityLogPanel } from "./ActivityLogPanel";

const STAGES: ApplicationStatus[] = [
  "WISHLIST",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
];

interface ApplicationDetailProps {
  application: Application;
  captainSkills: string[];
  now: number;
  hasConflict: boolean;
  onUpdate: UpdateApplicationHandler;
  onSimulate: (id: string) => void;
  onDelete: (id: string) => void;
  extraPanel?: ReactNode;
}

export function ApplicationDetail({
  application,
  captainSkills,
  now,
  hasConflict,
  onUpdate,
  onSimulate,
  onDelete,
  extraPanel,
}: ApplicationDetailProps) {
  const match = calculateSkillMatch(captainSkills, application.requiredSkills);
  const ghosting = isGhosting(application, now);
  const daysIdle = getDaysSinceUpdate(application, now);
  const currentStage = STAGES.indexOf(application.status);
  const canSimulate =
    application.status === "APPLIED" || application.status === "SCREENING";

  function handleTransition(
    target: ApplicationStatus,
    payload: TransitionPayload
  ) {
    const meta = createActionMeta();
    onUpdate(application.id, (current) =>
      transitionApplication(current, target, payload, meta)
    );
  }

  function handleAddItem(text: string) {
    const item = { id: crypto.randomUUID(), text, done: false };
    onUpdate(application.id, (current) => addChecklistItem(current, item));
  }

  function handleToggleItem(itemId: string) {
    onUpdate(application.id, (current) =>
      toggleChecklistItem(current, itemId)
    );
  }

  function handleRemoveItem(itemId: string) {
    onUpdate(application.id, (current) =>
      removeChecklistItem(current, itemId)
    );
  }

  function handleAddNote(note: string) {
    const meta = createActionMeta();
    onUpdate(application.id, (current) =>
      addActivityNote(current, note, meta)
    );
  }

  return (
    <article className="application-detail">
      <header className="detail-header">
        <div className="detail-title">
          <div className="company-logo">
            {application.company.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <h3>{application.role}</h3>
            <p>
              {application.company} · {application.workMode} · CV:{" "}
              {application.cvVersion ?? "-"}
            </p>
          </div>
        </div>

        <div className="detail-actions">
          <StatusBadge status={application.status} />
          {ghosting && (
            <span className="flag-badge flag-ghost">Rawan Ghosting</span>
          )}
          {hasConflict && (
            <span className="flag-badge flag-conflict">Jadwal bentrok</span>
          )}

          {canSimulate && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => onSimulate(application.id)}
            >
              Simulasi +15 Hari
            </button>
          )}

          <button
            type="button"
            className="danger-button"
            onClick={() => onDelete(application.id)}
          >
            Hapus
          </button>
        </div>
      </header>

      <dl className="detail-info">
        <div>
          <dt>Terakhir diperbarui</dt>
          <dd>{formatDateTime(application.lastUpdatedAt)}</dd>
        </div>
        <div>
          <dt>Tanggal lamaran</dt>
          <dd>
            {application.appliedDate ? formatDate(application.appliedDate) : "-"}
          </dd>
        </div>
        <div>
          <dt>Jadwal interview</dt>
          <dd>
            {application.interviewDateTime
              ? formatDateTime(application.interviewDateTime)
              : "-"}
          </dd>
        </div>
        <div>
          <dt>Uang saku offer</dt>
          <dd>
            {application.salaryOffer
              ? formatRupiah(application.salaryOffer)
              : "-"}
          </dd>
        </div>
      </dl>

      {ghosting && (
        <p className="ghost-note" role="status">
          Tidak ada perubahan status selama {daysIdle} hari. Pertimbangkan
          follow-up ke HRD, lalu catat hasilnya di riwayat aktivitas.
        </p>
      )}

      <div className="detail-body">
        <div className="detail-column">
          <section className="detail-block">
            <div className="detail-block-header">
              <h4>Tahap seleksi</h4>
              {currentStage === -1 && (
                <span className="progress-text">
                  Proses berhenti di {STATUS_LABELS[application.status]}
                </span>
              )}
            </div>

            <ol className="stage-bar">
              {STAGES.map((stage, index) => (
                <li
                  key={stage}
                  className={index <= currentStage ? "reached" : ""}
                  aria-current={
                    stage === application.status ? "step" : undefined
                  }
                >
                  {index + 1}. {STATUS_LABELS[stage]}
                </li>
              ))}
            </ol>
          </section>

          <StatusTransitionPanel
            key={`${application.id}-${application.status}`}
            application={application}
            onConfirm={handleTransition}
          />

          <ChecklistPanel
            checklist={application.checklist}
            onAdd={handleAddItem}
            onToggle={handleToggleItem}
            onRemove={handleRemoveItem}
          />
        </div>

        <div className="detail-column">
          {extraPanel}

          <section className="detail-block">
            <div className="detail-block-header">
              <h4>Kecocokan skill</h4>
              <span
                className={`match-badge ${
                  match.matchScore >= 70
                    ? "match-green"
                    : match.matchScore >= 40
                      ? "match-yellow"
                      : "match-red"
                }`}
              >
                {match.matchScore}% cocok
              </span>
            </div>

            {application.requiredSkills.length === 0 ? (
              <p className="detail-empty">Belum ada skill yang dicantumkan.</p>
            ) : (
              <>
                <div className="skill-chips">
                  {match.matchedSkills.map((skill, index) => (
                    <span key={`m-${skill}-${index}`} className="skill-chip matched">
                      {skill}
                    </span>
                  ))}
                  {match.missingSkills.map((skill, index) => (
                    <span key={`x-${skill}-${index}`} className="skill-chip missing">
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="skill-legend">
                  Biru sudah dikuasai, merah putus-putus belum dikuasai.
                </p>
              </>
            )}
          </section>

          <ActivityLogPanel
            logs={application.activityLogs}
            onAddNote={handleAddNote}
          />
        </div>
      </div>
    </article>
  );
}