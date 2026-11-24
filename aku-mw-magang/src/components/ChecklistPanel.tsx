// Orang 2 - Fitur 4 - Checklist

import { useState, type FormEvent } from "react";
import type { ChecklistItem } from "../types/application";

interface ChecklistPanelProps {
  checklist: ChecklistItem[];
  onAdd: (text: string) => void;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

export function ChecklistPanel({
  checklist,
  onAdd,
  onToggle,
  onRemove,
}: ChecklistPanelProps) {
  const [draft, setDraft] = useState("");

  // Derived state
  const doneCount = checklist.filter((item) => item.done).length;
  const percent =
    checklist.length === 0
      ? 0
      : Math.round((doneCount / checklist.length) * 100);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();

    if (!text) {
      return;
    }

    onAdd(text);
    setDraft("");
  }

  return (
    <section className="detail-block">
      <div className="detail-block-header">
        <h4>Daftar persiapan</h4>
        <span className="progress-text">
          {doneCount} / {checklist.length} selesai
        </span>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      {checklist.length === 0 ? (
        <p className="detail-empty">
          Belum ada tugas persiapan. Tambahkan yang pertama di bawah.
        </p>
      ) : (
        <ul className="checklist">
          {checklist.map((item) => (
            <li key={item.id} className={item.done ? "done" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggle(item.id)}
                />
                <span>{item.text}</span>
              </label>

              <button
                type="button"
                className="icon-button"
                aria-label={`Hapus tugas ${item.text}`}
                onClick={() => onRemove(item.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Tambah tugas persiapan baru..."
        />
        <button type="submit">Tambah</button>
      </form>
    </section>
  );
}
