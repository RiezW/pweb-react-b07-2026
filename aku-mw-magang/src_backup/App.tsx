// ini bagian Ciko

import { useState } from "react"; // [Orang 2]
import { useLocalStorage } from "./hooks/useLocalStorage";
import { SkillProfile } from "./components/SkillProfile";
import { JobExplorer } from "./components/JobExplorer";
import { ManualApplicationForm } from "./components/ManualApplicationForm";
import type { Application, WorkMode } from "./types/application";
import type { JobListing } from "./types/job";
import { Wishlist } from "./components/Wishlist";
// Ganes - Fitur 3 & 4
import { ConflictBanner } from "./components/ConflictBanner";
import { detectConflicts } from "./utils/conflicts";

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

  // Ganes - Tab & conflicts
  const [activeView, setActiveView] = useState<"explore" | "pipeline">(
    "explore"
  );
  const conflicts = detectConflicts(applications);

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

    const workMode =
      location.includes("hybrid")
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

  // ini bagian Ciko

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

  // ini bagian ciko

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

  function handleRemoveWishlist(applicationId: string) {
    setApplications((current) =>
      current.filter(
        (application) => application.id !== applicationId
      )
    );
  }

  return (
    <div className="dashboard">
      <header className="navbar">
        <div className="navbar-brand">
          <div className="brand-logo">AM</div>
          <span>Aku Mw Magang</span>
        </div>

        <nav className="navbar-menu">
          {/* Ganes - Tab navigasi */}
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
        </nav>
      </header>

      <main className="dashboard-content">
        {/* Ganes - Banner bentrok */}
        <ConflictBanner conflicts={conflicts} />

        {/* Ganes - Tab Eksplorasi */}
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
          onRemove={handleRemoveWishlist}
        />
        </div>

        {/* Ganes - Tab Pipeline */}
        {activeView === "pipeline" && (
          <section className="main-content">
            <h2>Pipeline Lamaran</h2>
            {applications.length === 0 ? (
              <p>Belum ada lamaran.</p>
            ) : (
              applications.map((application) => (
                <article key={application.id}>
                  <h3>{application.role}</h3>
                  <p>{application.company}</p>
                  <p>Status: {application.status}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveWishlist(application.id)}
                  >
                    Hapus
                  </button>
                </article>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;

// ini bagian ciko