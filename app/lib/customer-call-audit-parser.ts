export type CustomerCallRole = "parent" | "tutor-candidate" | "school" | "unknown";
export type CustomerCallDirection = "inbound" | "outbound";

/** The deliberately small retained record. The source CSV itself is never saved. */
export type CustomerCallRecord = {
  id: string;
  date: string;
  timestamp: number;
  direction: CustomerCallDirection;
  callType: string;
  answered: boolean;
  missedReason: string;
  durationSeconds: number;
  talkSeconds: number;
  waitingSeconds: number;
  role: CustomerCallRole;
  branch: string;
  customerNumber: string;
  sourceFileName: string;
  importedAt: string;
  callbackCompletedManuallyAt?: string;
};

export type CustomerCallImport = {
  id: string;
  fileName: string;
  importedAt: string;
  rowCount: number;
  addedCount: number;
  duplicateCount: number;
  skippedCount: number;
};

export type CustomerCallSettings = { shortCallThresholdSeconds: number };
export type CustomerCallData = { calls: CustomerCallRecord[]; imports: CustomerCallImport[]; settings: CustomerCallSettings; parentLinks?: Record<string, string> };
export type CustomerCallCallbackState = "not-applicable" | "completed" | "attempted" | "not-called";

export function evaluateCustomerCallback(call: CustomerCallRecord, calls: CustomerCallRecord[], windowHours = 24, minimumTalkSeconds = 30) {
  if (call.direction !== "inbound" || call.answered) return { state: "not-applicable" as CustomerCallCallbackState, attemptCount: 0 };
  if (!call.customerNumber) return { state: "not-called" as const, attemptCount: 0 };
  const attempts = calls.filter((candidate) => candidate.direction === "outbound" && candidate.customerNumber === call.customerNumber
    && candidate.timestamp >= call.timestamp && candidate.timestamp <= call.timestamp + windowHours * 60 * 60 * 1000);
  const completed = attempts.some((candidate) => candidate.answered && candidate.talkSeconds > minimumTalkSeconds);
  return { state: completed ? "completed" as const : attempts.length ? "attempted" as const : "not-called" as const, attemptCount: attempts.length };
}

export function mergeCustomerCallRecords(existing: CustomerCallRecord[], incoming: CustomerCallRecord[]) {
  const byId = new Map(existing.map((call) => [call.id, call]));
  let addedCount = 0;
  let duplicateCount = 0;
  for (const call of incoming) {
    if (byId.has(call.id)) { duplicateCount += 1; continue; }
    byId.set(call.id, call);
    addedCount += 1;
  }
  return { calls: [...byId.values()].sort((left, right) => left.timestamp - right.timestamp), addedCount, duplicateCount };
}

export function markCustomerCallbacksRecalled(calls: CustomerCallRecord[], customerNumber: string, throughTimestamp: number, completedAt = new Date().toISOString()) {
  let updatedCount = 0;
  const nextCalls = calls.map((call) => {
    if (call.customerNumber !== customerNumber || (call.role !== "parent" && call.role !== "unknown") || call.direction !== "inbound" || call.answered || call.timestamp > throughTimestamp || call.callbackCompletedManuallyAt) return call;
    if (evaluateCustomerCallback(call, calls).state === "completed") return call;
    updatedCount += 1;
    return { ...call, callbackCompletedManuallyAt: completedAt };
  });
  return { calls: nextCalls, updatedCount };
}

const normalizeHeader = (value: string) => value.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");

export function normalizeCustomerPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("33") && digits.length === 11) digits = `0${digits.slice(2)}`;
  return digits;
}

export function classifyCustomerCallRole(branch: string): CustomerCallRole {
  const value = branch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
  if (value.includes("parent")) return "parent";
  if (value.includes("tuteur") || value.includes("candidat")) return "tutor-candidate";
  if (value.includes("etablissement") || value.includes("scolaire")) return "school";
  return "unknown";
}

function parseSeconds(value: string | undefined) {
  const raw = value?.trim() ?? "";
  if (!raw) return 0;
  if (/^\d+(?:[.,]\d+)?$/.test(raw)) return Math.max(0, Number(raw.replace(",", ".")) || 0);
  const parts = raw.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function parseTimestamp(value: string, assumeUtc = false) {
  const raw = value.trim();
  if (!raw) return 0;
  const isoLike = raw.includes("T") ? raw : raw.replace(" ", "T");
  if (/Z$|[+-]\d{2}:?\d{2}$/i.test(isoLike)) {
    const withZone = Date.parse(isoLike);
    return Number.isFinite(withZone) ? withZone : 0;
  }
  const wallClock = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(isoLike);
  if (!assumeUtc && wallClock) {
    const [, year, month, day, hour, minute, second = "0"] = wallClock;
    const targetAsUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    let candidate = targetAsUtc;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const parts = new Intl.DateTimeFormat("en", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(candidate);
      const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value || 0);
      const parisAsUtc = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
      candidate += targetAsUtc - parisAsUtc;
    }
    return candidate;
  }
  const parsed = Date.parse(assumeUtc ? `${isoLike}Z` : isoLike);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseLocalDate(value: string, timestamp: number) {
  const raw = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  if (!timestamp) return "";
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(timestamp);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function parseCsvRows(value: string) {
  const first = value.split(/\r?\n/, 1)[0] || "";
  const delimiter = [",", ";", "\t"].map((candidate) => ({ candidate, count: first.split(candidate).length })).sort((a, b) => b.count - a.count)[0]?.candidate || ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const next = value[index + 1];
    if (char === "\"" && quoted && next === "\"") { current += "\""; index += 1; }
    else if (char === "\"") quoted = !quoted;
    else if (char === delimiter && !quoted) { row.push(current.trim()); current = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; current = "";
    } else current += char;
  }
  row.push(current.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function getColumn(headers: string[], aliases: string[]) {
  return headers.findIndex((header) => aliases.includes(header));
}

export function parseCustomerCallCsv(csv: string, fileName: string, importedAt = new Date().toISOString()) {
  const rows = parseCsvRows(csv.replace(/^\uFEFF/, "")).filter((row) => row.some(Boolean));
  if (rows.length < 2) throw new Error("Le CSV ne contient aucune ligne d’appel.");
  const headers = rows[0].map(normalizeHeader);
  const indexes = {
    localDate: getColumn(headers, ["datetimetzoffsetincl", "datetimetzincl", "datetimetz", "datetime"]),
    utcDate: getColumn(headers, ["datetimeutc"]),
    callId: getColumn(headers, ["callid", "callidinternal"]),
    direction: getColumn(headers, ["direction"]),
    callType: getColumn(headers, ["calldirectiontype", "calltype"]),
    answered: getColumn(headers, ["answered"]),
    missedReason: getColumn(headers, ["missedcallreason"]),
    duration: getColumn(headers, ["durationtotal"]),
    talk: getColumn(headers, ["durationincall", "incallduration"]),
    waiting: getColumn(headers, ["waitingtime"]),
    branch: getColumn(headers, ["ivrbranch"]),
    customerNumber: getColumn(headers, ["customernumber"]),
  };
  const required = ["callId", "direction", "answered", "duration", "customerNumber"] as const;
  if (required.some((field) => indexes[field] < 0) || (indexes.localDate < 0 && indexes.utcDate < 0)) {
    throw new Error("Colonnes Aircall requises introuvables (date, identifiant d’appel, sens, réponse, durée et numéro client).");
  }
  if (rows.length - 1 > 20000) throw new Error("Le fichier dépasse la limite de 20 000 appels.");

  const events: CustomerCallRecord[] = [];
  let skippedCount = 0;
  for (const row of rows.slice(1)) {
    const value = (index: number) => index < 0 ? "" : row[index] ?? "";
    const id = value(indexes.callId).trim();
    const direction = value(indexes.direction).trim().toLocaleLowerCase("fr");
    const customerNumber = normalizeCustomerPhone(value(indexes.customerNumber));
    const localDateRaw = value(indexes.localDate);
    const utcDate = value(indexes.utcDate);
    const timestamp = parseTimestamp(utcDate || localDateRaw, Boolean(utcDate));
    const date = parseLocalDate(localDateRaw, timestamp);
    if (!id || !timestamp || !date || (direction !== "inbound" && direction !== "outbound")) { skippedCount += 1; continue; }
    const branch = value(indexes.branch).trim();
    events.push({
      id, date, timestamp, direction, callType: value(indexes.callType).trim(),
      answered: /^(yes|oui|true|1)$/i.test(value(indexes.answered).trim()),
      missedReason: value(indexes.missedReason).trim(),
      durationSeconds: parseSeconds(value(indexes.duration)), talkSeconds: parseSeconds(value(indexes.talk)), waitingSeconds: parseSeconds(value(indexes.waiting)),
      role: classifyCustomerCallRole(branch), branch, customerNumber: customerNumber.length >= 7 ? customerNumber : "",
      sourceFileName: fileName.slice(0, 180), importedAt,
    });
  }
  if (!events.length) throw new Error("Aucun appel valide trouvé. Vérifiez les colonnes et les numéros client.");
  return { events, rowCount: rows.length - 1, skippedCount };
}
