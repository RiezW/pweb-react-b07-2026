// Orang 2 - Fitur 4 - Transisi status

import { useRef, useState } from "react";
import type {
  Application,
  ApplicationStatus,
  WorkMode,
} from "../types/application";
import { formatRupiah } from "../utils/format";
import {
  STATUS_LABELS,
  getAllowedTransitions,
  validateTransition,
  type TransitionErrors,
  type TransitionPayload,
} from "../utils/stateMachine";

const WORK_MODES: WorkMode[] = ["Remote", "Hybrid", "Onsite"];

interface StatusTransitionPanelProps {
  application: Application;
  onConfirm: (target: ApplicationStatus, payload: TransitionPayload) => void;
}

export function StatusTransitionPanel({
  application,
  onConfirm,
}: StatusTransitionPanelProps) {
  const [target, setTarget] = useState<ApplicationStatus | null>(null);
  const [cvVersion, setCvVersion] = useState(application.cvVersion ?? "");
  const [appliedDate, setAppliedDate] = useState(
    application.appliedDate ?? ""
  );
  const [interviewDateTime, setInterviewDateTime] = useState(
    application.interviewDateTime ?? ""
  );
  const [salaryInput, setSalaryInput] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>(application.workMode);
  const [errors, setErrors] = useState<TransitionErrors>({});

  const cvRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const interviewRef = useRef<HTMLInputElement>(null);
  const salaryRef = useRef<HTMLInputElement>(null);

  const salaryNumber = Number(salaryInput);
  const salaryPreview =
    salaryInput.trim() !== "" && Number.isFinite(salaryNumber) && salaryNumber > 0
      ? formatRupiah(salaryNumber)
      : null;

  // Transisi yang sah
  const allowed = getAllowedTransitions(application.status);

  function handleSelect(status: ApplicationStatus) {
    setTarget(status);
    setErrors({});
  }

  function handleConfirm() {
    if (target === null) {
      return;
    }

    const payload: TransitionPayload = {
      cvVersion,
      appliedDate,
      interviewDateTime,
      salaryOffer: salaryInput.trim() === "" ? undefined : Number(salaryInput),
      workMode,
    };

    const found = validateTransition(application.status, target, payload);

    if (Object.keys(found).length > 0) {
      setErrors(found);

      // Fokus ke input pertama yang bermasalah
      if (found.cvVersion) {
        cvRef.current?.focus();
      } else if (found.appliedDate) {
        dateRef.current?.focus();
      } else if (found.interviewDateTime) {
        interviewRef.current?.focus();
      } else if (found.salaryOffer) {
        salaryRef.current?.focus();
      }

      return;
    }

    onConfirm(target, payload);
  }

  if (allowed.length === 0) {
    return (
      <section className="detail-block">
        <div className="detail-block-header">
          <h4>Pindahkan status</h4>
        </div>
        <p className="detail-empty">
          Status {STATUS_LABELS[application.status]} bersifat final dan tidak
          bisa diubah lagi.
        </p>
      </section>
    );
  }

  return (
    <section className="detail-block">
      <div className="detail-block-header">
        <h4>Pindahkan status ke</h4>

        <div className="transition-options">
          {allowed.map((status) => (
            <button
              key={status}
              type="button"
              className={target === status ? "active" : ""}
              onClick={() => handleSelect(status)}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {target !== null && (
        <div className="transition-form">
          {target === "APPLIED" && (
            <>
              <div className="field">
                <label htmlFor="tr-cv">Versi CV</label>
                <input
                  ref={cvRef}
                  id="tr-cv"
                  type="text"
                  value={cvVersion}
                  onChange={(event) => setCvVersion(event.target.value)}
                  placeholder="Contoh: Kapten-CV-v2.pdf"
                  aria-invalid={errors.cvVersion !== undefined}
                />
                {errors.cvVersion && (
                  <p className="form-error">{errors.cvVersion}</p>
                )}
              </div>

              <div className="field">
                <label htmlFor="tr-date">Tanggal lamaran</label>
                <input
                  ref={dateRef}
                  id="tr-date"
                  type="date"
                  value={appliedDate}
                  onChange={(event) => setAppliedDate(event.target.value)}
                  aria-invalid={errors.appliedDate !== undefined}
                />
                {errors.appliedDate && (
                  <p className="form-error">{errors.appliedDate}</p>
                )}
              </div>
            </>
          )}

          {target === "INTERVIEW" && (
            <div className="field">
              <label htmlFor="tr-interview">Jadwal interview</label>
              <input
                ref={interviewRef}
                id="tr-interview"
                type="datetime-local"
                value={interviewDateTime}
                onChange={(event) => setInterviewDateTime(event.target.value)}
                aria-invalid={errors.interviewDateTime !== undefined}
              />
              {errors.interviewDateTime && (
                <p className="form-error">{errors.interviewDateTime}</p>
              )}
            </div>
          )}

          {target === "OFFER" && (
            <>
              <div className="field">
                <label htmlFor="tr-salary">Uang saku per bulan (Rp)</label>
                <input
                  ref={salaryRef}
                  id="tr-salary"
                  type="number"
                  min={0}
                  value={salaryInput}
                  onChange={(event) => setSalaryInput(event.target.value)}
                  placeholder="5500000"
                  aria-invalid={errors.salaryOffer !== undefined}
                />
                {salaryPreview && (
                  <p className="field-hint">{salaryPreview} per bulan</p>
                )}
                {errors.salaryOffer && (
                  <p className="form-error">{errors.salaryOffer}</p>
                )}
              </div>

              <div className="field">
                <label htmlFor="tr-mode">Mode kerja</label>
                <select
                  id="tr-mode"
                  value={workMode}
                  onChange={(event) =>
                    setWorkMode(event.target.value as WorkMode)
                  }
                >
                  {WORK_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
                {errors.workMode && (
                  <p className="form-error">{errors.workMode}</p>
                )}
              </div>
            </>
          )}

          {errors.general && <p className="form-error">{errors.general}</p>}

          <button
            type="button"
            className="primary-button"
            onClick={handleConfirm}
          >
            Konfirmasi pindah ke {STATUS_LABELS[target]}
          </button>
        </div>
      )}
    </section>
  );
}