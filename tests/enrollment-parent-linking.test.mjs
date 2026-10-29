import test from "node:test";
import assert from "node:assert/strict";
import { linkEnrollmentParents } from "../app/lib/enrollment-parent-linking.js";
import { projectEnrollmentCsv } from "../app/lib/enrollment-upload.ts";

const row = (overrides = {}) => ({
  studentId: "student-private-id", firstName: "Child", lastName: "Private", className: "CE2", slots: "Monday",
  parentFirstName: "Camille", parentLastName: "Martin", parentEmails: [" CAMILLE@example.fr "], parentPhones: ["06 12 34 56 78 | +33 (0)6 98 76 54 32"], school: "École Alpha",
  ...overrides,
});

test("the enrollment upload projection keeps parent names and contact fields", () => {
  const source = [
    "Id de l'enfant;Prénom de l'enfant;Nom de l'enfant;Classe;Ecole;Creneaux;Prénom Parent;Nom Parent;Couriel;Numéro de téléphone;Séances ponctuelles",
    '42;Léa;Martin;CE2;École Test;Lundi;Camille;Martin;camille@example.fr;"06 12 34 56 78 | +33 (0)6 98 76 54 32";Non',
  ].join("\n");
  const projected = projectEnrollmentCsv(source);
  assert.match(projected.csv, /Prénom Parent;Nom Parent/);
  assert.match(projected.csv, /Camille;Martin;CE2;École Test;Lundi;camille@example\.fr;/);
  assert.match(projected.csv, /06 12 34 56 78 \| \+33 \(0\)6 98 76 54 32/);
});

test("enrollment rows create a parent contact and split multiple French phones", () => {
  const result = linkEnrollmentParents([row()], [], "inscriptions.csv", "2026-10-29T12:00:00Z");
  assert.equal(result.contacts.length, 1);
  const [contact] = result.contacts;
  assert.equal(contact.fullName, "Camille Martin");
  assert.deepEqual(contact.phones.sort(), ["0612345678", "0698765432"]);
  assert.equal(contact.emails[0], "camille@example.fr");
  assert.deepEqual(contact.schools, ["École Alpha"]);
  assert.deepEqual(result.rows[0].parentContactIds, [contact.id]);
  assert.equal("studentId" in contact, false);
  assert.equal("firstName" in result.rows[0], true); // student data remains only in the enrollment record
});

test("enrollment contact reuses an existing parent via normalized phone", () => {
  const existing = [{ id: "parent-1", firstName: "Camille", lastName: "Martin", fullName: "Camille Martin", emails: [], phones: ["+33 (0)6 12 34 56 78"], schools: [], sources: [], provenance: [], childClasses: [], brochureRequests: [], visioRegistrations: [], needsSchoolReview: false, schoolIssues: [], enrolled: null, suppression: false, needsReview: false, followUp: "to-contact", updatedAt: "" }];
  const result = linkEnrollmentParents([row({ parentEmails: [], parentPhones: ["06 12 34 56 78"] })], existing, "inscriptions.csv");
  assert.equal(result.contacts.length, 1);
  assert.deepEqual(result.rows[0].parentContactIds, ["parent-1"]);
  assert.equal(result.contacts[0].enrolled, true);
});

test("conflicting identities stay unlinked instead of merging two parents", () => {
  const contacts = [
    { id: "one", emails: ["camille@example.fr"], phones: [] },
    { id: "two", emails: [], phones: ["0612345678"] },
  ];
  const result = linkEnrollmentParents([row()], contacts, "inscriptions.csv");
  assert.deepEqual(result.rows[0].parentContactIds, []);
  assert.equal(contacts.length, 2);
});
