// Ridwan

import { useEffect, useState } from "react";

const INTERVIEW_QUESTIONS: string[] = [
  "Ceritakan proyek pengembangan perangkat lunak atau sistem yang paling berkesan yang pernah kamu kerjakan, serta kontribusi spesifikmu di dalamnya.",
  "Bagaimana langkah sistematis yang kamu lakukan saat melakukan debugging pada bug yang sulit direproduksi?",
  "Jelaskan perbedaan antara state dan props di React, serta kapan waktu yang tepat menggunakan useEffect dan useRef.",
  "Pernahkah kamu mengalami perbedaan pendapat teknis saat kerja kelompok? Bagaimana cara kamu menyelesaikannya?",
  "Mengapa kamu tertarik melamar posisi magang di perusahaan ini, dan skill teknis apa yang paling ingin kamu tingkatkan selama magang?",
  "Bagaimana strategimu mengatur prioritas antara jadwal kuliah, praktikum, dan target tugas magang?",
];

const INITIAL_SECONDS = 120; // 02:00

function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function InterviewPrepTimer() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning]);

  function handleToggleRun() {
    if (secondsLeft === 0) {
      setSecondsLeft(INITIAL_SECONDS);
    }
    setIsRunning((prev) => !prev);
  }

  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(INITIAL_SECONDS);
  }

  function handleNextQuestion() {
    setIsRunning(false);
    setSecondsLeft(INITIAL_SECONDS);
    setQuestionIndex((prev) => (prev + 1) % INTERVIEW_QUESTIONS.length);
  }

  const isLowTime = secondsLeft <= 20 && secondsLeft > 0;
  const isTimeUp = secondsLeft === 0;

  return (
    <section className="detail-block">
      <div className="detail-block-header">
        <h4>
          Latihan Interview ({questionIndex + 1}/{INTERVIEW_QUESTIONS.length})
        </h4>
        <span
          className={`match-badge ${
            isTimeUp ? "match-red" : isLowTime ? "match-yellow" : "match-green"
          }`}
        >
          {formatTimer(secondsLeft)}
        </span>
      </div>

      <p style={{ margin: "0.5rem 0 1rem", lineHeight: 1.55 }}>
        &ldquo;{INTERVIEW_QUESTIONS[questionIndex]}&rdquo;
      </p>

      {isTimeUp && (
        <p
          className="ghost-note"
          role="status"
          style={{ marginBottom: "0.75rem" }}
        >
          Waktu 2 menit habis! Evaluasi poin jawabanmu atau lanjut ke soal
          berikutnya.
        </p>
      )}

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="secondary-button"
          onClick={handleToggleRun}
        >
          {isRunning ? "Pause" : secondsLeft === 0 ? "Mulai Ulang" : "Start"}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={handleReset}
        >
          Reset
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={handleNextQuestion}
        >
          Soal Berikutnya
        </button>
      </div>
    </section>
  );
}

// Ridwan