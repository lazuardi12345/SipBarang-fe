const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function invalidRange() {
  return {
    valid: false,
    start: null,
    endExclusive: null,
    label: "Rentang tanggal tidak valid",
    granularity: "day",
  };
}

export function getFinancialDateRange({ mode, year, month, date, from, to }) {
  if (mode === "YEAR") {
    const start = new Date(Date.UTC(year, 0, 1));
    return {
      valid: true,
      start,
      endExclusive: new Date(Date.UTC(year + 1, 0, 1)),
      label: `Tahun ${year}`,
      granularity: "month",
    };
  }

  if (mode === "MONTH") {
    const start = new Date(Date.UTC(year, month, 1));
    const label = new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(start);
    return {
      valid: true,
      start,
      endExclusive: new Date(Date.UTC(year, month + 1, 1)),
      label,
      granularity: "day",
    };
  }

  if (mode === "DAY") {
    const start = parseDateInput(date);
    if (!start) return invalidRange();
    return {
      valid: true,
      start,
      endExclusive: new Date(start.getTime() + DAY_MS),
      label: formatDate(start),
      granularity: "day",
    };
  }

  if (mode === "CUSTOM") {
    const start = parseDateInput(from);
    const end = parseDateInput(to);
    if (!start || !end || start > end) return invalidRange();

    const endExclusive = new Date(end.getTime() + DAY_MS);
    const dayCount = (endExclusive.getTime() - start.getTime()) / DAY_MS;
    return {
      valid: true,
      start,
      endExclusive,
      label: `${formatDate(start)} – ${formatDate(end)}`,
      granularity: dayCount <= 31 ? "day" : "month",
    };
  }

  return invalidRange();
}

export function isDateWithinFinancialRange(date, range) {
  return Boolean(
    date &&
    range.valid &&
    date >= range.start &&
    date < range.endExclusive
  );
}

export function getFinancialDateKey(date, granularity) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  if (granularity === "month") return `${year}-${month}`;

  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
