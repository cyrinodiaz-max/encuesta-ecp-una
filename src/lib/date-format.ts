const monthLabels = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."];

export function formatAsuncionDate(value: string | null) {
  if (!value) {
    return "Sin registros";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin registros";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Asuncion",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const parts = formatter.formatToParts(date);
  const lookup = parts.reduce<Record<string, string>>((accumulator, part) => {
    if (part.type !== "literal") {
      accumulator[part.type] = part.value;
    }

    return accumulator;
  }, {});

  const day = lookup.day?.padStart(2, "0") ?? "00";
  const monthNumber = Number(lookup.month ?? "1");
  const month = monthLabels[Math.max(0, Math.min(monthLabels.length - 1, monthNumber - 1))];
  const year = lookup.year ?? "0000";
  const hour = lookup.hour ?? "0";
  const minute = lookup.minute ?? "00";
  const dayPeriod = (lookup.dayPeriod ?? "AM").toUpperCase() === "PM" ? "p. m." : "a. m.";

  return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
}
