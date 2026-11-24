// Orang 2 - Badge status

import type { ApplicationStatus } from "../types/application";
import { STATUS_LABELS } from "../utils/stateMachine";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
