// ini bagian Ciko

import { useRef, useState, type FormEvent } from "react";
import type {
  Application,
  WorkMode,
} from "../types/application";

interface ManualApplicationFormProps {
  applications: Application[];
  onSubmitApplication: (
    company: string,
    role: string,
    workMode: WorkMode,
    status: "WISHLIST" | "APPLIED",
    requiredSkills: string[],
    cvVersion?: string,
    appliedDate?: string
  ) => void;
}

interface FormErrors {
  company?: string;
  role?: string;
  requiredSkills?: string;
  cvVersion?: string;
  appliedDate?: string;
}

export function ManualApplicationForm({
  applications,
  onSubmitApplication,
}: ManualApplicationFormProps) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("Remote");
  const [status, setStatus] =
    useState<"WISHLIST" | "APPLIED">("WISHLIST");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [cvVersion, setCvVersion] = useState("");
  const [appliedDate, setAppliedDate] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});

  const companyRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const skillsRef = useRef<HTMLInputElement>(null);
  const cvVersionRef = useRef<HTMLInputElement>(null);
  const appliedDateRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // ini bagian Ciko

    const newErrors: FormErrors = {};

    if (!company.trim()) {
      newErrors.company = "Nama perusahaan wajib diisi.";
    }

    if (!role.trim()) {
      newErrors.role = "Posisi atau role wajib diisi.";
    }

    const parsedSkills = requiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    if (parsedSkills.length === 0) {
      newErrors.requiredSkills = "Required Skills wajib diisi.";
    }

    if (status === "APPLIED") {
      if (!cvVersion.trim()) {
        newErrors.cvVersion = "CV Version wajib diisi.";
      }

      if (!appliedDate) {
        newErrors.appliedDate = "Applied Date wajib diisi.";
      }
    }

    const isDuplicate =
      company.trim() !== "" &&
      role.trim() !== "" &&
      applications.some(
        (application) =>
          application.company.trim().toLowerCase() ===
            company.trim().toLowerCase() &&
          application.role.trim().toLowerCase() ===
            role.trim().toLowerCase()
      );

    if (isDuplicate) {
      newErrors.company =
        "Kombinasi perusahaan dan posisi ini sudah terdaftar.";
    }

    setErrors(newErrors);

    // Auto-focus pada input pertama yang bermasalah

    if (newErrors.company) {
      companyRef.current?.focus();
      return;
    }

    if (newErrors.role) {
      roleRef.current?.focus();
      return;
    }

    if (newErrors.requiredSkills) {
      skillsRef.current?.focus();
      return;
    }

    if (newErrors.cvVersion) {
      cvVersionRef.current?.focus();
      return;
    }

    if (newErrors.appliedDate) {
      appliedDateRef.current?.focus();
      return;
    }

    // Submit jika seluruh validasi berhasil

    onSubmitApplication(
      company.trim(),
      role.trim(),
      workMode,
      status,
      parsedSkills,
      status === "APPLIED" ? cvVersion.trim() : undefined,
      status === "APPLIED" ? appliedDate : undefined
    );

    // Reset form

    setCompany("");
    setRole("");
    setWorkMode("Remote");
    setStatus("WISHLIST");
    setRequiredSkills("");
    setCvVersion("");
    setAppliedDate("");
    setErrors({});

    // ini bagian ciko
  }

  return (
    <section className="manual-application-form">
      <h2>Tambah Lamaran Manual</h2>
      <p>Catat peluang magang yang kamu temukan sendiri.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="company">Perusahaan</label>
          <input
            ref={companyRef}
            id="company"
            type="text"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Nama perusahaan"
          />
          {errors.company && (
            <p className="form-error">{errors.company}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="role">Posisi / Role</label>
          <input
            ref={roleRef}
            id="role"
            type="text"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="Nama posisi"
          />
          {errors.role && (
            <p className="form-error">{errors.role}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="workMode">Mode Kerja</label>
          <select
            id="workMode"
            value={workMode}
            onChange={(event) =>
              setWorkMode(event.target.value as WorkMode)
            }
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status Awal</label>
          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "WISHLIST" | "APPLIED")
            }
          >
            <option value="WISHLIST">WISHLIST</option>
            <option value="APPLIED">APPLIED</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="requiredSkills">Required Skills</label>
          <input
            ref={skillsRef}
            id="requiredSkills"
            type="text"
            value={requiredSkills}
            onChange={(event) =>
              setRequiredSkills(event.target.value)
            }
            placeholder="React, TypeScript, CSS"
          />
          {errors.requiredSkills && (
            <p className="form-error">{errors.requiredSkills}</p>
          )}
        </div>

        {status === "APPLIED" && (
          <>
            <div className="form-group">
              <label htmlFor="cvVersion">CV Version</label>
              <input
                ref={cvVersionRef}
                id="cvVersion"
                type="text"
                value={cvVersion}
                onChange={(event) =>
                  setCvVersion(event.target.value)
                }
                placeholder="CV Version"
              />
              {errors.cvVersion && (
                <p className="form-error">{errors.cvVersion}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="appliedDate">Applied Date</label>
              <input
                ref={appliedDateRef}
                id="appliedDate"
                type="date"
                value={appliedDate}
                onChange={(event) =>
                  setAppliedDate(event.target.value)
                }
              />
              {errors.appliedDate && (
                <p className="form-error">{errors.appliedDate}</p>
              )}
            </div>
          </>
        )}

        <button type="submit">Simpan Lamaran</button>
      </form>
    </section>
  );
}

// ini bagian ciko
