// Ridwan

import type { Application } from "../types/application";

interface UndoToastProps {
  deletedApplication: Application | null;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({
  deletedApplication,
  onUndo,
  onDismiss,
}: UndoToastProps) {
  if (!deletedApplication) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        padding: "0.875rem 1.125rem",
        borderRadius: "0.75rem",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        boxShadow: "0 12px 28px rgba(15, 23, 42, 0.28)",
        border: "1px solid #334155",
        maxWidth: "calc(100vw - 3rem)",
      }}
    >
      <span style={{ fontSize: "0.9rem", lineHeight: 1.4 }}>
        Lamaran <strong>{deletedApplication.role}</strong> (
        {deletedApplication.company}) dihapus.
      </span>

      <button
        type="button"
        onClick={onUndo}
        style={{
          padding: "0.4rem 0.8rem",
          borderRadius: "0.5rem",
          border: "none",
          backgroundColor: "#38bdf8",
          color: "#0f172a",
          fontWeight: 700,
          fontSize: "0.85rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Undo (5d)
      </button>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        style={{
          background: "transparent",
          border: "none",
          color: "#94a3b8",
          cursor: "pointer",
          fontSize: "1rem",
          lineHeight: 1,
          padding: "0.2rem",
        }}
      >
        ✕
      </button>
    </div>
  );
}

// Ridwan