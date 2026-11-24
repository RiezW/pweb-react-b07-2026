// Orang 2 - Fitur 3 - Banner bentrok

import type { InterviewConflict } from "../utils/conflicts";
import { formatDateTime } from "../utils/format";

interface ConflictBannerProps {
  conflicts: InterviewConflict[];
}

export function ConflictBanner({ conflicts }: ConflictBannerProps) {
  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="conflict-banner" role="alert">
      <strong>Jadwal interview bentrok</strong>

      <ul>
        {conflicts.map((conflict) => (
          <li key={`${conflict.first.id}-${conflict.second.id}`}>
            {conflict.first.company} (
            {formatDateTime(conflict.first.interviewDateTime ?? "", false)})
            dan {conflict.second.company} (
            {formatDateTime(conflict.second.interviewDateTime ?? "", false)})
            berselisih {conflict.diffMinutes} menit, kurang dari 60 menit.
          </li>
        ))}
      </ul>
    </div>
  );
}
