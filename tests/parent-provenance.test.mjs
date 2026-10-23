import assert from "node:assert/strict";
import test from "node:test";
import { parentEvents, parseParentDate } from "../app/lib/parent-provenance.ts";

test("French dates sort by day and month and reject invalid dates", () => {
  assert.ok(parseParentDate("02/10/2026 08:30") > parseParentDate("25/09/2026 17:00"));
  assert.equal(parseParentDate("31/02/2026"), null);
});

test("the latest source event takes precedence over the upload date", () => {
  const contact = {
    provenance: [
      { source: "visio", fileName: "visio.csv", importedAt: "2026-10-23T12:00:00Z", occurredAt: "15/09/2026 18:00" },
      { source: "aircall", fileName: "aircall.csv", importedAt: "2026-10-23T12:00:00Z", occurredAt: "07/10/2026 09:00" },
    ],
  };
  const events = parentEvents(contact);
  assert.equal(events[0].source, "aircall");
  assert.equal(events[0].dateKind, "source");
  assert.equal(events[1].source, "visio");
});

test("older saved records recover the event date from their source details", () => {
  const contact = {
    provenance: [{ source: "brochure", fileName: "parents.csv", importedAt: "2026-10-23T12:00:00Z" }],
    brochureRequests: [{ fileName: "parents.csv", submittedAt: "01/09/2026 07:45" }],
  };
  const [event] = parentEvents(contact);
  assert.equal(event.occurredAt, "01/09/2026 07:45");
  assert.equal(event.dateKind, "source");
});
