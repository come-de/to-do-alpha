import assert from "node:assert/strict";
import test from "node:test";
import { parseTutorReportAuditCsv } from "../app/lib/tutor-report-audit-parser";
import type { School } from "../app/lib/shared-data";

const school = (id: string, name: string, schoolType: School["schoolType"]): School => ({
  id, externalId: id, name, category: schoolType === "alpha" ? "Étude Alpha" : "Prestation de service", schoolType,
  portfolioOwner: "", zone: "", coordinator: "", registeredCount: null, city: "", address: "", department: "",
  upcomingWeek: "", pastSessions: "", typicalWeek: "", contractSigned: "", actions: "", contact: "", nextAction: "",
  notes: "", events: [], createdAt: "", updatedAt: "",
});

test("aggregates expected and missing reports by date, tutor and Alpha school without keeping source PII", () => {
  const csv = [
    "Date;Prénom tuteur;Nom tuteur;Numéro tuteur;Prénom élève;Nom élève;Etablissement;bilan",
    "2026-10-14;Alex;Martin;0612345678;Élève;Un;Lycée Alpha A;",
    '2026-10-14;Alex;Martin;0612345678;Élève;Deux;Lycée Alpha A;"Rapport fait avec une note\nseconde ligne"',
    "2026-10-14;Alex;Martin;;Élève;Trois;Lycée Alpha B;",
    "2026-10-14;Sam;Durand;0698765432;Élève;Quatre;École Service;fait",
    "2026-10-15;Alex;Martin;0612345678;Élève;Cinq;Lycée Alpha A;",
    "2026-10-15;Zoé;Bernard;0677889900;Élève;Six;Nom d’établissement inconnu;",
  ].join("\n");
  const alphaA = school("a", "Lycée Alpha A", "alpha");
  const alphaB = school("b", "Lycée Alpha B", "alpha");
  const service = school("s", "École Service", "mise-a-dispo");
  const parsed = parseTutorReportAuditCsv(csv, "test.csv", [alphaA, alphaB, service], {}, [
    { tutorId: "100", phone: "0612345678" },
    { tutorId: "200", phone: "0698765432" },
  ]);

  assert.deepEqual(parsed.days.map((day) => day.date).sort(), ["2026-10-14", "2026-10-15"]);
  const day14 = parsed.days.find((day) => day.date === "2026-10-14")!;
  const alex = day14.tutors.find((tutor) => tutor.tutorId === "100")!;
  assert.equal(day14.sourceRowCount, 3);
  assert.equal(alex.expectedCount, 3);
  assert.equal(alex.missingCount, 2);
  assert.deepEqual(alex.schools.map((item) => [item.sourceName, item.expectedCount, item.missingCount]), [
    ["Lycée Alpha A", 2, 1], ["Lycée Alpha B", 1, 1],
  ]);
  const unknown = parsed.days.find((day) => day.date === "2026-10-15")!.tutors.find((tutor) => tutor.name === "Zoé Bernard")!;
  assert.equal(unknown.expectedCount, 1);
  assert.equal(unknown.missingCount, 1);
  assert.equal(parsed.skippedNonAlphaRows, 1);
  const persisted = JSON.stringify(parsed.days);
  assert.doesNotMatch(persisted, /0612345678|0698765432|Élève|Rapport fait avec une note/);
});

test("treats all blank report cells as missing and keeps unknown school totals for review", () => {
  const csv = [
    "Date;Prénom tuteur;Nom tuteur;Numéro tuteur;Prénom élève;Nom élève;Etablissement;bilan",
    "2026-10-14;A;B;0600000001;Élève;Un;Établissement sans fiche;",
    "2026-10-14;A;B;0600000001;Élève;Deux;Établissement sans fiche;",
  ].join("\n");
  const parsed = parseTutorReportAuditCsv(csv, "unknown.csv", [], {}, []);
  assert.equal(parsed.days[0].sourceRowCount, 2);
  assert.equal(parsed.days[0].tutors[0].expectedCount, 2);
  assert.equal(parsed.days[0].tutors[0].missingCount, 2);
  assert.equal(parsed.days[0].tutors[0].schools[0].expectedCount, 2);
});

test("groups phone-missing tutor rows independently of CSV row order", () => {
  const header = "Date;Prénom tuteur;Nom tuteur;Numéro tuteur;Etablissement;bilan";
  const blankPhone = "2026-10-14;Alex;Martin;;Lycée Alpha A;";
  const identified = "2026-10-14;Alex;Martin;0612345678;Lycée Alpha A;";
  const roster = [{ tutorId: "100", phone: "0612345678" }];
  for (const rows of [[blankPhone, identified], [identified, blankPhone]]) {
    const parsed = parseTutorReportAuditCsv([header, ...rows].join("\n"), "order.csv", [], {}, roster);
    assert.equal(parsed.days[0].tutors.length, 1);
    assert.equal(parsed.days[0].tutors[0].key, "id:100");
    assert.equal(parsed.days[0].tutors[0].expectedCount, 2);
  }
});

test("retains explicitly excluded school aggregates so mappings can be restored", () => {
  const csv = [
    "Date;Prénom tuteur;Nom tuteur;Numéro tuteur;Etablissement;bilan",
    "2026-10-14;A;B;0600000001;Établissement temporairement écarté;",
  ].join("\n");
  const parsed = parseTutorReportAuditCsv(csv, "excluded.csv", [], { "etablissement temporairement ecarte": "excluded" }, []);
  assert.equal(parsed.days[0].sourceRowCount, 1);
  assert.equal(parsed.days[0].tutors[0].missingCount, 1);
  assert.equal(parsed.days[0].tutors[0].schools[0].expectedCount, 1);
});
