// ini bagian Ciko

import { useState, type FormEvent } from "react";

interface SkillProfileProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

export function SkillProfile({
  skills,
  onAddSkill,
  onRemoveSkill,
}: SkillProfileProps) {
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedSkill = newSkill.trim();

    if (!trimmedSkill) {
      setError("Silakan masukkan nama skill.");
      return;
    }

    const alreadyExists = skills.some(
      (skill) => skill.toLowerCase() === trimmedSkill.toLowerCase()
    );

    if (alreadyExists) {
      setError("Skill tersebut sudah terdaftar.");
      return;
    }

    onAddSkill(trimmedSkill);
    setNewSkill("");
    setError("");
  }

  return (
    <section className="skill-profile">
      <h2>Profil Skill Kapten</h2>

      <p className="skill-description">
        Digunakan untuk menghitung persentase kecocokan tiap lowongan.
      </p>

      <form onSubmit={handleSubmit} className="skill-form">
        <input
          type="text"
          value={newSkill}
          onChange={(event) => setNewSkill(event.target.value)}
          placeholder="Tambah skill..."
        />

        <button type="submit">Tambah</button>
      </form>

      {error && <p className="skill-error">{error}</p>}

      <div className="skill-list">
        {skills.map((skill) => (
          <div className="skill-item" key={skill}>
            <span>{skill}</span>

            <button
              type="button"
              onClick={() => onRemoveSkill(skill)}
              disabled={skills.length <= 3}
              aria-label={`Hapus ${skill}`}
              title={
                skills.length <= 3
                  ? "Minimal harus memiliki 3 skill"
                  : `Hapus ${skill}`
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <p className="skill-count">
        {skills.length} skill terdaftar (minimal 3)
      </p>
    </section>
  );
}

// ini bagian ciko
