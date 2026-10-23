import type { ParentContact, ParentEvidence, ParentSource } from "./parents";

export type ParentEvent = {
  source: ParentSource;
  fileName: string;
  occurredAt: string;
  importedAt: string;
  dateKind: "source" | "import";
  timestamp: number;
};

export function parseParentDate(value: string | undefined): number | null {
  const text = value?.trim();
  if (!text) return null;
  const french = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(text);
  if (french) {
    const [, day, month, year, hour = "0", minute = "0", second = "0"] = french;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)
      && date.getHours() === Number(hour) && date.getMinutes() === Number(minute) ? date.getTime() : null;
  }
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatParentDate(value: string | undefined): string {
  const timestamp = parseParentDate(value);
  if (timestamp === null) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", /\d{1,2}:\d{2}/.test(value ?? "") ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(timestamp);
}

function latestSourceDate(contact: ParentContact, evidence: ParentEvidence): string {
  const dates = evidence.source === "brochure"
    ? (contact.brochureRequests ?? []).filter((item) => item.fileName === evidence.fileName).map((item) => item.submittedAt)
    : evidence.source === "visio"
      ? (contact.visioRegistrations ?? []).filter((item) => item.fileName === evidence.fileName).map((item) => item.submittedAt)
      : evidence.source === "aircall"
        ? (contact.aircallCalls ?? []).filter((item) => item.fileName === evidence.fileName).map((item) => item.lastIncoming || item.firstIncoming)
        : [];
  return dates.filter((value) => parseParentDate(value) !== null).sort((left, right) => (parseParentDate(right) ?? 0) - (parseParentDate(left) ?? 0))[0] ?? "";
}

export function parentEvents(contact: ParentContact): ParentEvent[] {
  return (contact.provenance ?? []).map((evidence) => {
    const actualDate = parseParentDate(evidence.occurredAt) !== null ? evidence.occurredAt ?? "" : latestSourceDate(contact, evidence);
    const dateKind = actualDate ? "source" as const : "import" as const;
    const occurredAt = actualDate || evidence.importedAt;
    return {
      source: evidence.source,
      fileName: evidence.fileName,
      occurredAt,
      importedAt: evidence.importedAt,
      dateKind,
      timestamp: parseParentDate(occurredAt) ?? 0,
    };
  }).sort((left, right) => right.timestamp - left.timestamp);
}
