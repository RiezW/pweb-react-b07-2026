// Orang 2 - Helper format

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDateTime(value: string, withYear = true): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const datePart = `${date.getDate()} ${MONTHS[date.getMonth()]}${
    withYear ? ` ${date.getFullYear()}` : ""
  }`;

  return `${datePart}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value;
  }

  return `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
}

export function formatRupiah(amount: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}
