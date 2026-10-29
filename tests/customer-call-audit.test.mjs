import assert from "node:assert/strict";
import test from "node:test";
import { splitParentPhones } from "../app/lib/phone-normalization.js";
import {
  evaluateCustomerCallback,
  markCustomerCallbacksRecalled,
  mergeCustomerCallRecords,
  normalizeCustomerPhone,
  parseCustomerCallCsv,
} from "../app/lib/customer-call-audit-parser.ts";

const csv = [
  "datetime (tz offset incl.),datetime (utc),direction,answered,missed_call_reason,duration (total),duration (in call),call direction - type,customer number,call id,ivr branch,comments,voicemail,recording",
  '2026-10-27 10:00:00,2026-10-27 09:00:00,inbound,No,agents_did_not_answer,60,,Inbound - Missed,+33612345678,missed-1,Parent,"sensitive comment",audio,recording-url',
  '2026-10-27 10:15:00,2026-10-27 09:15:00,outbound,Yes,,90,25,Outbound,+33612345678,callback-short-1,,"must not persist",audio,recording-url',
  '2026-10-27 10:30:00,2026-10-27 09:30:00,outbound,Yes,,120,61,Outbound,+33612345678,callback-good-1,,"must not persist",audio,recording-url',
].join("\n");

test("parses Aircall fields, local business date, role, and minimal call data", () => {
  const parsed = parseCustomerCallCsv(csv, "aircall.csv", "2026-10-28T00:00:00.000Z");
  assert.equal(parsed.events.length, 3);
  assert.equal(parsed.events[0].date, "2026-10-27");
  assert.equal(parsed.events[0].timestamp, Date.UTC(2026, 9, 27, 9));
  assert.equal(parsed.events[0].role, "parent");
  assert.equal(parsed.events[0].customerNumber, "0612345678");
  assert.equal(parsed.events[1].talkSeconds, 25);
  const persisted = JSON.stringify(parsed.events);
  assert.doesNotMatch(persisted, /sensitive comment|must not persist|recording-url|audio/);
  assert.match(persisted, /0612345678/); // Retained only for server-side call matching.
});

test("recognizes a callback only when it is answered for more than 30 seconds within 24 hours", () => {
  const { events } = parseCustomerCallCsv(csv, "aircall.csv", "2026-10-28T00:00:00.000Z");
  const missed = events[0];
  assert.deepEqual(evaluateCustomerCallback(missed, events.slice(0, 2)), { state: "attempted", attemptCount: 1 });
  assert.deepEqual(evaluateCustomerCallback(missed, events), { state: "completed", attemptCount: 2 });
  const beyondWindow = { ...events[2], timestamp: missed.timestamp + 24 * 60 * 60 * 1000 + 1 };
  assert.deepEqual(evaluateCustomerCallback(missed, [missed, beyondWindow]), { state: "not-called", attemptCount: 0 });
  const atWindowEdge = { ...events[2], timestamp: missed.timestamp + 24 * 60 * 60 * 1000 };
  assert.deepEqual(evaluateCustomerCallback(missed, [missed, atWindowEdge]), { state: "completed", attemptCount: 1 });
});

test("deduplicates reimports by Aircall call ID and keeps existing records", () => {
  const { events } = parseCustomerCallCsv(csv, "aircall.csv", "2026-10-28T00:00:00.000Z");
  const editedDuplicate = { ...events[0], branch: "Établissement scolaire" };
  const merged = mergeCustomerCallRecords(events.slice(0, 1), [editedDuplicate, events[1]]);
  assert.equal(merged.addedCount, 1);
  assert.equal(merged.duplicateCount, 1);
  assert.equal(merged.calls.length, 2);
  assert.equal(merged.calls[0].role, "parent");
});

test("manual callback completion removes only pending missed calls up to the marked call", () => {
  const { events } = parseCustomerCallCsv(csv, "aircall.csv", "2026-10-28T00:00:00.000Z");
  const pending = events.slice(0, 2);
  const newerMiss = { ...events[0], id: "missed-later", timestamp: events[0].timestamp + 60 * 60 * 1000 };
  const markedAt = events[1].timestamp;
  const result = markCustomerCallbacksRecalled([...pending, newerMiss], events[0].customerNumber, markedAt, "2026-10-28T12:00:00.000Z");
  assert.equal(result.updatedCount, 1);
  assert.equal(result.calls[0].callbackCompletedManuallyAt, "2026-10-28T12:00:00.000Z");
  assert.equal(result.calls[2].callbackCompletedManuallyAt, undefined);
  const autoCompleted = markCustomerCallbacksRecalled(events, events[0].customerNumber, Date.now(), "2026-10-28T12:00:00.000Z");
  assert.equal(autoCompleted.updatedCount, 0);
});

test("normalizes French and international phone notation and role labels", () => {
  assert.equal(normalizeCustomerPhone("+33 6 12 34 56 78"), "0612345678");
  assert.equal(normalizeCustomerPhone("+33 (0)6 12 34 56 78"), "0612345678");
  assert.equal(normalizeCustomerPhone("0033 6 12 34 56 78"), "0612345678");
  const parent = parseCustomerCallCsv(csv.replace("Parent,", "tuteur ou candidat,"), "x.csv").events[0];
  assert.equal(parent.role, "tutor-candidate");
  const school = parseCustomerCallCsv(csv.replace("Parent,", "établissement scolaire,"), "x.csv").events[0];
  assert.equal(school.role, "school");
});

test("splits multiple parent phone values instead of concatenating them", () => {
  assert.deepEqual(splitParentPhones("06 12 34 56 78 | +33 (0)7 98 76 54 32"), ["06 12 34 56 78", "+33 (0)7 98 76 54 32"]);
});

test("keeps calls without a usable caller number in totals without linking them to each other", () => {
  const noNumber = csv.replaceAll("+33612345678", "");
  const parsed = parseCustomerCallCsv(noNumber, "aircall.csv");
  assert.equal(parsed.events.length, 3);
  assert.equal(parsed.events[0].customerNumber, "");
  assert.deepEqual(evaluateCustomerCallback(parsed.events[0], parsed.events), { state: "not-called", attemptCount: 0 });
});
