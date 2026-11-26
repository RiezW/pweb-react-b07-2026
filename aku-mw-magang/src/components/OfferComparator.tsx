// Ridwan

import { useState } from "react";
import type { Application, WorkMode } from "../types/application";
import { calculateSkillMatch } from "../utils/skillMatch";
import { formatRupiah } from "../utils/format";

interface OfferComparatorProps {
  applications: Application[];
  captainSkills: string[];
}

const WORK_MODE_SCORES: Record<WorkMode, number> = {
  Remote: 100,
  Hybrid: 75,
  Onsite: 50,
};

interface EvaluatedOffer {
  application: Application;
  salary: number;
  normalizedSalary: number;
  workModeScore: number;
  skillMatchScore: number;
  totalScore: number;
}

export function OfferComparator({
  applications,
  captainSkills,
}: OfferComparatorProps) {
  const offers = applications.filter((app) => app.status === "OFFER");

  const [selectedAId, setSelectedAId] = useState<string>("");
  const [selectedBId, setSelectedBId] = useState<string>("");

  if (offers.length < 2) {
    return (
      <section
        style={{
          padding: "2.5rem 1.5rem",
          borderRadius: "0.875rem",
          border: "1px dashed #cbd5e1",
          backgroundColor: "#ffffff",
          textAlign: "center",
        }}
      >
        <h3 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>
          Offer Comparator Belum Tersedia
        </h3>
        <p
          style={{
            margin: "0 auto",
            maxWidth: "480px",
            color: "#64748b",
            lineHeight: 1.55,
          }}
        >
          Saat ini terdapat <strong>{offers.length}</strong> lamaran berstatus{" "}
          <strong>OFFER</strong>. Ubah status minimal <strong>2 lamaran</strong>{" "}
          ke tahap <strong>OFFER</strong> (beserta nominal uang saku) di
          Pipeline Lamaran untuk mulai membandingkan tawaran terbaik.
        </p>
      </section>
    );
  }

  const offerA = offers.find((item) => item.id === selectedAId) ?? offers[0];
  const offerB =
    offers.find((item) => item.id === selectedBId && item.id !== offerA.id) ??
    offers.find((item) => item.id !== offerA.id) ??
    offers[1];

  const salaryA = offerA.salaryOffer ?? 0;
  const salaryB = offerB.salaryOffer ?? 0;
  const maxSalary = Math.max(salaryA, salaryB);

  function evaluateOffer(app: Application): EvaluatedOffer {
    const salary = app.salaryOffer ?? 0;
    const normalizedSalary = maxSalary === 0 ? 0 : (salary / maxSalary) * 100;
    const workModeScore = WORK_MODE_SCORES[app.workMode];
    const skillMatchScore = calculateSkillMatch(
      captainSkills,
      app.requiredSkills
    ).matchScore;

    const totalScore =
      normalizedSalary * 0.5 +
      workModeScore * 0.25 +
      skillMatchScore * 0.25;

    return {
      application: app,
      salary,
      normalizedSalary: Math.round(normalizedSalary * 10) / 10,
      workModeScore,
      skillMatchScore,
      totalScore: Math.round(totalScore * 10) / 10,
    };
  }

  const evalA = evaluateOffer(offerA);
  const evalB = evaluateOffer(offerB);

  const isAWinner = evalA.totalScore > evalB.totalScore;
  const isBWinner = evalB.totalScore > evalA.totalScore;

  const slots = [
    {
      title: "Offer A",
      evaluated: evalA,
      otherId: offerB.id,
      onSelect: setSelectedAId,
      isWinner: isAWinner,
    },
    {
      title: "Offer B",
      evaluated: evalB,
      otherId: offerA.id,
      onSelect: setSelectedBId,
      isWinner: isBWinner,
    },
  ];

  return (
    <section
      style={{
        padding: "1.5rem",
        borderRadius: "0.875rem",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
      }}
    >
      <header style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.25rem" }}>
          Offer Comparator
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
          Skor Total = (Normalisasi Gaji × 50%) + (Skor Mode Kerja × 25%) +
          (Skill Match % × 25%)
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {slots.map((slot) => (
          <div
            key={slot.title}
            style={{
              padding: "1.25rem",
              borderRadius: "0.75rem",
              border: slot.isWinner
                ? "2px solid #16a34a"
                : "1px solid #cbd5e1",
              backgroundColor: slot.isWinner ? "#f0fdf4" : "#f8fafc",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <strong style={{ fontSize: "1rem", color: "#0f172a" }}>
                {slot.title}
              </strong>
              {slot.isWinner && (
                <span className="match-badge match-green">
                  Rekomendasi Terbaik
                </span>
              )}
            </div>

            <select
              value={slot.evaluated.application.id}
              onChange={(event) => slot.onSelect(event.target.value)}
              aria-label={`Pilih ${slot.title}`}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                marginBottom: "1rem",
                fontWeight: 500,
              }}
            >
              {offers.map((offer) => (
                <option
                  key={offer.id}
                  value={offer.id}
                  disabled={offer.id === slot.otherId}
                >
                  {offer.company} — {offer.role}
                </option>
              ))}
            </select>

            <dl
              style={{
                margin: 0,
                display: "grid",
                gap: "0.65rem",
                fontSize: "0.92rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt style={{ color: "#64748b" }}>Uang Saku / Gaji</dt>
                <dd style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>
                  {formatRupiah(slot.evaluated.salary)}
                </dd>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt style={{ color: "#64748b" }}>Normalisasi Gaji (50%)</dt>
                <dd style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>
                  {slot.evaluated.normalizedSalary} / 100
                </dd>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt style={{ color: "#64748b" }}>Mode Kerja (25%)</dt>
                <dd style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>
                  {slot.evaluated.application.workMode} (
                  {slot.evaluated.workModeScore} pts)
                </dd>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt style={{ color: "#64748b" }}>Skill Match (25%)</dt>
                <dd style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>
                  {slot.evaluated.skillMatchScore}%
                </dd>
              </div>

              <div
                style={{
                  marginTop: "0.4rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid #cbd5e1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <dt style={{ fontWeight: 700, color: "#0f172a" }}>
                  Total Skor Berbobot
                </dt>
                <dd
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: slot.isWinner ? "#15803d" : "#0f172a",
                  }}
                >
                  {slot.evaluated.totalScore} / 100
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

// Ridwan