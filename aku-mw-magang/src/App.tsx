// ini bagian Ciko

import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { SkillProfile } from "./components/SkillProfile";
import { JobExplorer } from "./components/JobExplorer";
import { ManualApplicationForm } from "./components/ManualApplicationForm";
import type { Application, WorkMode } from "./types/application";
import type { JobListing } from "./types/job";
import { Wishlist } from "./components/Wishlist";
import { PipelineView } from "./components/PipelineView";
import { ConflictBanner } from "./components/ConflictBanner";
import { detectConflicts } from "./utils/conflicts";
import type { ApplicationUpdater } from "./utils/applicationActions";
import { DashboardStats } from "./components/DashboardStats";
import { OfferComparator } from "./components/OfferComparator";
import { UndoToast } from "./components/UndoToast";

import "./App.css";

function App() {
  const [captainSkills, setCaptainSkills] = useLocalStorage<string[]>(
    "captainSkills",
    ["React", "TypeScript", "CSS"]
  );

  const [applications, setApplications] = useLocalStorage<Application[]>(
    "applications",
    []
  );

  const [activeView, setActiveView] = useState<
    "explore" | "pipeline" | "comparator"
  >("explore");

  // Fitur 6: Undo Delete (5 detik) menggunakan useRef
  const [deletedApplication, setDeletedApplication] =
    useState<Application | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current !== null) {
        window.clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  const conflicts = detectConflicts(applications);
  const offerCount = applications.filter(
    (app) => app.status === "OFFER"
  ).length;

  function handleUpdateApplication(id: string, updater: ApplicationUpdater) {
    setApplications((current) =>
      current.map((application) =>
        application.id === id ? updater(application) : application
      )
    );
  }

  function handleSaveToWishlist(job: JobListing) {
    const alreadyExists = applications.some(
      (application) =>
        application.company.toLowerCase() ===
          job.company_name.toLowerCase() &&
        application.role.toLowerCase() === job.title.toLowerCase()
    );

    if (alreadyExists) {
      return;
    }

    const location = job.candidate_required_location.toLowerCase();

    const workMode = location.includes("hybrid")
      ? "Hybrid"
      : location.includes("onsite")
        ? "Onsite"
        : "Remote";

    const timestamp = new Date().toISOString();

    const newApplication: Application = {
      id: crypto.randomUUID(),
      company: job.company_name,
      role: job.title,
      workMode,
      status: "WISHLIST",
      requiredSkills: job.tags,
      lastUpdatedAt: timestamp,
      checklist: [],
      activityLogs: [
        {
          id: crypto.randomUUID(),
          timestamp,
          message: "Lowongan ditambahkan ke Wishlist.",
        },
      ],
    };

    setApplications((current) => [...current, newApplication]);
  }

  function handleManualApplication(
    company: string,
    role: string,
    workMode: WorkMode,
    status: "WISHLIST" | "APPLIED",
    requiredSkills: string[],
    cvVersion?: string,
    appliedDate?: string
  ) {
    const timestamp = new Date().toISOString();

    const newApplication: Application = {
      id: crypto.randomUUID(),
      company,
      role,
      workMode,
      status,
      requiredSkills,
      cvVersion,
      appliedDate,
      lastUpdatedAt: timestamp,
      checklist: [],
      activityLogs: [
        {
          id: crypto.randomUUID(),
          timestamp,
          message: "Lamaran ditambahkan secara manual.",
        },
      ],
    };

    setApplications((current) => [...current, newApplication]);
  }

  function handleAddSkill(skill: string) {
    setCaptainSkills((currentSkills) => [...currentSkills, skill]);
  }

  function handleRemoveSkill(skillToRemove: string) {
    setCaptainSkills((currentSkills) => {
      if (currentSkills.length <= 3) {
        return currentSkills;
      }

      return currentSkills.filter(
        (skill) => skill.toLowerCase() !== skillToRemove.toLowerCase()
      );
    });
  }

  function handleDeleteApplication(applicationId: string) {
    const target = applications.find((app) => app.id === applicationId);
    if (!target) {
      return;
    }

    // Wajib bersihkan timer lama jika menghapus 2x berturut-turut dalam < 5 detik
    if (deleteTimerRef.current !== null) {
      window.clearTimeout(deleteTimerRef.current);
    }

    setDeletedApplication(target);
    setApplications((current) =>
      current.filter((application) => application.id !== applicationId)
    );

    deleteTimerRef.current = window.setTimeout(() => {
      setDeletedApplication(null);
      deleteTimerRef.current = null;
    }, 5000);
  }

  function handleUndoDelete() {
    if (!deletedApplication) {
      return;
    }

    if (deleteTimerRef.current !== null) {
      window.clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }

    setApplications((current) => {
      const exists = current.some((app) => app.id === deletedApplication.id);
      return exists ? current : [...current, deletedApplication];
    });
    setDeletedApplication(null);
  }

  function handleDismissToast() {
    if (deleteTimerRef.current !== null) {
      window.clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
    setDeletedApplication(null);
  }

  return (
    <div className="dashboard">
      <header className="navbar">
        <div className="navbar-brand">
          <div className="brand-logo">AM</div>
          <span>Aku Mw Magang</span>
        </div>

        <nav className="navbar-menu">
          <button
            type="button"
            className={`nav-item${activeView === "explore" ? " active" : ""}`}
            onClick={() => setActiveView("explore")}
          >
            Eksplorasi Lowongan
          </button>
          <button
            type="button"
            className={`nav-item${activeView === "pipeline" ? " active" : ""}`}
            onClick={() => setActiveView("pipeline")}
          >
            Pipeline Lamaran ({applications.length})
          </button>
          <button
            type="button"
            className={`nav-item${activeView === "comparator" ? " active" : ""}`}
            onClick={() => setActiveView("comparator")}
          >
            Offer Comparator ({offerCount})
          </button>
        </nav>
      </header>

      <main className="dashboard-content">
        <ConflictBanner conflicts={conflicts} />

        <DashboardStats applications={applications} />

        <div hidden={activeView !== "explore"}>
          <div className="dashboard-layout">
            <aside className="sidebar">
              <SkillProfile
                skills={captainSkills}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
              />
            </aside>

            <section className="main-content">
              <JobExplorer
                captainSkills={captainSkills}
                applications={applications}
                onSaveToWishlist={handleSaveToWishlist}
              />
            </section>
          </div>

          <ManualApplicationForm
            applications={applications}
            onSubmitApplication={handleManualApplication}
          />

          <Wishlist
            applications={applications}
            captainSkills={captainSkills}
            onRemove={handleDeleteApplication}
          />
        </div>

        {activeView === "pipeline" && (
          <PipelineView
            applications={applications}
            captainSkills={captainSkills}
            conflicts={conflicts}
            onUpdateApplication={handleUpdateApplication}
            onDeleteApplication={handleDeleteApplication}
          />
        )}

        {activeView === "comparator" && (
          <OfferComparator
            applications={applications}
            captainSkills={captainSkills}
          />
        )}
      </main>

      <UndoToast
        deletedApplication={deletedApplication}
        onUndo={handleUndoDelete}
        onDismiss={handleDismissToast}
      />
    </div>
  );
}

export default App;
// ini bagian ciko