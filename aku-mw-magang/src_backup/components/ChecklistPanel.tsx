// Orang 2 - Fitur 4 - Activity log

import { useState, type FormEvent } from "react";
import type { ActivityLog } from "../types/application";
import { formatDateTime } from "../utils/format";

interface ActivityLogPanelProps {
  logs: ActivityLog[];
  onAddNote: (note: string) => void;
}

export function ActivityLogPanel({ logs, onAddNote }: ActivityLogPanelProps) {
  const [note, setNote] = useState("");

  const latestFirst = [...logs].reverse();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = note.trim();

    if (!text) {
      return;
    }

    onAddNote(text);
    setNote("");
  }

  return (
    <section className="detail-block">
      <div className="detail-block-header">
        <h4>Riwayat aktivitas</h4>
      </div>

      {latestFirst.length === 0 ? (
        <p className="detail-empty">Belum ada aktivitas tercatat.</p>
      ) : (
        <ul className="activity-list">
          {latestFirst.map((log) => (
            <li key={log.id}>
              <time dateTime={log.timestamp}>
                {formatDateTime(log.timestamp)}
              </time>
              <p>{log.message}</p>
            </li>
          ))}
        </ul>
      )}

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Tulis catatan, misalnya HRD minta portofolio..."
        />
        <button type="submit">Catat</button>
      </form>
    </section>
  );
}