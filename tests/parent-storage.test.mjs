import test from "node:test";
import assert from "node:assert/strict";
import { readParentArray } from "../app/lib/parent-storage.ts";
import { readApiJson } from "../app/lib/api-json.ts";
import { linkEnrollmentParents } from "../app/lib/enrollment-parent-linking.js";

test("a first enrollment import creates a missing parent registry without reading a missing blob", async () => {
  let saved;
  let bodyReads = 0;
  const store = {
    async getMetadata() { return saved ? { etag: "existing" } : null; },
    async get() {
      bodyReads += 1;
      assert.ok(saved, "never issue the GET that stalls for a missing registry");
      return structuredClone(saved);
    },
  };
  const rows = [{ studentId: "student-1", slots: "Lundi", school: "École Test", parentFirstName: "Camille", parentLastName: "Martin", parentEmails: ["camille@example.test"], parentPhones: ["+33 (0)6 12 34 56 78"] }];
  const contacts = await readParentArray(store, "parents-crm/contacts.json");
  assert.equal(bodyReads, 0);
  const first = linkEnrollmentParents(rows, contacts, "parents.csv");
  saved = structuredClone(first.contacts);
  assert.equal(first.linkedEnrollmentRows, 1);
  assert.equal(first.createdParentContacts, 1);
  const second = linkEnrollmentParents(rows, await readParentArray(store, "parents-crm/contacts.json"), "parents.csv");
  assert.equal(bodyReads, 1);
  assert.equal(second.createdParentContacts, 0);
  assert.equal(second.contacts[0].fullName, "Camille Martin");
  assert.deepEqual(second.rows[0].parentContactIds, first.rows[0].parentContactIds);
});

test("registry failures never turn existing data into an empty registry", async () => {
  await assert.rejects(readParentArray({ getMetadata: async () => { throw new Error("unavailable"); }, get: async () => [] }, "contacts"), /unavailable/);
  await assert.rejects(readParentArray({ getMetadata: async () => ({ etag: "exists" }), get: async () => { throw new Error("read failed"); } }, "contacts"), /read failed/);
  await assert.rejects(readParentArray({ getMetadata: async () => ({ etag: "exists" }), get: async () => ({ error: "invalid" }) }, "contacts"), /registre Parents est invalide/);
});

test("gateway HTML is reported as HTTP 504 rather than a browser JSON pattern error", async () => {
  await assert.rejects(readApiJson(new Response("<HTML>Gateway timeout</HTML>", { status: 504 })), /HTTP 504/);
  assert.deepEqual(await readApiJson(Response.json({ error: "Import invalide" }, { status: 400 })), { error: "Import invalide" });
  assert.deepEqual(await readApiJson(Response.json({ parentLinking: { linkedEnrollmentRows: 2 } })), { parentLinking: { linkedEnrollmentRows: 2 } });
});
