// Orang 2 - Helper warna match

export function getMatchClass(score: number): string {
  if (score >= 70) {
    return "match-green";
  }

  if (score >= 40) {
    return "match-yellow";
  }

  return "match-red";
}
