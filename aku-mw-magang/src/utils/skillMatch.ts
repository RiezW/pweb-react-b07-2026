// ini bagian Ciko

import type { SkillMatchResult } from "../types/skill";

export function calculateSkillMatch(
  captainSkills: string[],
  requiredSkills: string[]
): SkillMatchResult {
  const normalizedSkills = captainSkills.map((skill) =>
    skill.trim().toLowerCase()
  );

  const matchedSkills = requiredSkills.filter((skill) =>
    normalizedSkills.includes(skill.trim().toLowerCase())
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !normalizedSkills.includes(skill.trim().toLowerCase())
  );

  const matchScore =
    requiredSkills.length === 0
      ? 0
      : Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return {
    matchScore,
    matchedSkills,
    missingSkills,
  };
}

// ini bagian ciko