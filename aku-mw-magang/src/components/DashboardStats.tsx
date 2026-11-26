// Ridwan

import type { Application } from "../types/application";
import { useNow } from "../hooks/useNow";
import { isGhosting } from "../utils/ghosting";

interface DashboardStatsProps {
  applications: Application[];
}

export function DashboardStats({ applications }: DashboardStatsProps) {
  const now = useNow();

  const totalApplications = applications.length;

  const submittedApplications = applications.filter(
    (app) => app.status !== "WISHLIST"
  );

  const respondedCount = submittedApplications.filter(
    (app) =>
      app.status === "SCREENING" ||
      app.status === "INTERVIEW" ||
      app.status === "OFFER" ||
      app.status === "REJECTED"
  ).length;

  const interviewedCount = submittedApplications.filter(
    (app) =>
      app.status === "INTERVIEW" ||
      app.status === "OFFER" ||
      app.activityLogs.some((log) =>
        log.message.toUpperCase().includes("INTERVIEW")
      )
  ).length;

  const responseRate =
    submittedApplications.length === 0
      ? 0
      : Math.round((respondedCount / submittedApplications.length) * 100);

  const interviewRate =
    submittedApplications.length === 0
      ? 0
      : Math.round((interviewedCount / submittedApplications.length) * 100);

  const ghostingRiskCount = applications.filter((app) =>
    isGhosting(app, now)
  ).length;

  const totalOffers = applications.filter(
    (app) => app.status === "OFFER"
  ).length;

  const cards = [
    {
      label: "Total Lamaran",
      value: `${totalApplications}`,
      sub: `${submittedApplications.length} sudah dikirim`,
      accent: "#0f172a",
    },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      sub: `${respondedCount} dari ${submittedApplications.length} terkirim`,
      accent: "#2563eb",
    },
    {
      label: "Interview Rate",
      value: `${interviewRate}%`,
      sub: `${interviewedCount} tahap interview`,
      accent: "#7c3aed",
    },
    {
      label: "Rawan Ghosting",
      value: `${ghostingRiskCount}`,
      sub: "Idle > 14 hari",
      accent: ghostingRiskCount > 0 ? "#d97706" : "#0f172a",
    },
    {
      label: "Total Offer",
      value: `${totalOffers}`,
      sub: totalOffers >= 2 ? "Siap dibandingkan" : "Tawaran masuk",
      accent: totalOffers > 0 ? "#16a34a" : "#0f172a",
    },
  ];

  return (
    <section
      aria-label="Ringkasan Statistik Lamaran"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
        gap: "0.875rem",
        marginBottom: "1.25rem",
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            padding: "1rem 1.125rem",
            borderRadius: "0.75rem",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#64748b",
            }}
          >
            {card.label}
          </p>
          <p
            style={{
              margin: "0.35rem 0 0.25rem",
              fontSize: "1.6rem",
              fontWeight: 800,
              color: card.accent,
              lineHeight: 1.2,
            }}
          >
            {card.value}
          </p>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
            {card.sub}
          </p>
        </div>
      ))}
    </section>
  );
}

// Ridwan