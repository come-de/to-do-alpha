import { withIdentity } from "@/app/lib/with-identity";
import { readParentArray } from "@/app/lib/parent-storage";
import { readSchools, taskStore } from "@/app/lib/shared-data";
import { normalizeParentEmail, normalizeParentPhone, splitParentPhones, type ParentContact, type ParentFollowUp, type ParentImport, type ParentImportRow, type ParentSource } from "@/app/lib/parents";

const CONTACTS_KEY = "parents-crm/contacts.json";
const IMPORTS_KEY = "parents-crm/imports.json";
const sources = new Set<ParentSource>(["alpha", "aircall", "visio", "enrolled", "brochure"]);
const clean = (value: unknown, max = 200) => typeof value === "string" ? value.trim().slice(0, max) : "";
const emailList = (value: string) => value ? [normalizeParentEmail(value)].filter((item) => item.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)) : [];
const phoneList = (value: string) => splitParentPhones(value).map(normalizeParentPhone).filter((phone) => phone.length >= 7 && phone.length <= 15);
const aircallCount = (value: unknown) => { const parsed = Number.parseInt(clean(value, 20), 10); return Number.isFinite(parsed) && parsed >= 0 ? parsed : null; };
const normalizeSchool = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/\.pdf\s*$/i, "").replace(/\bst\b/g, "saint").replace(/\bste\b/g, "sainte").replace(/[^a-z0-9]+/g, " ").trim();
const schoolStopWords = new Set(["etude", "alpha", "college", "lycee", "ecole", "groupe", "scolaire", "institution", "site", "primaire", "maternelle", "surveillance", "stage", "de", "du", "des", "la", "le", "les", "sur", "et", "a", "l", "ensemble", "sixieme", "cinquieme", "quatrieme", "troisieme", "seconde", "terminale", "premiere"]);
const schoolTokens = (value: string) => new Set(normalizeSchool(value).split(" ").filter((word) => word.length > 1 && !schoolStopWords.has(word) && !/^\d+(?:eme|e|nd)$/.test(word)));
function matchSchool(value: string, canonicalNames: string[]) {
  const normalized = normalizeSchool(value);
  if (!normalized) return { match: "", suggestions: [] as string[], review: false };
  const exact = canonicalNames.find((name) => normalizeSchool(name) === normalized);
  if (exact) return { match: exact, suggestions: [exact], review: false };
  const sourceWords = schoolTokens(value);
  const grouped = new Map<string, { name: string; words: Set<string> }>();
  for (const name of canonicalNames) {
    const words = schoolTokens(name);
    const key = [...words].sort().join(" ");
    const existing = grouped.get(key);
    if (!existing || /surveillance|etude alpha|stage/i.test(existing.name) && !/surveillance|etude alpha|stage/i.test(name)) grouped.set(key, { name, words });
  }
  const ranked = [...grouped.values()].map(({ name, words: targetWords }) => {
    const overlap = [...sourceWords].filter((word) => targetWords.has(word)).length;
    const score = sourceWords.size + targetWords.size ? 2 * overlap / (sourceWords.size + targetWords.size) : 0;
    return { name, score };
  }).sort((a, b) => b.score - a.score);
  const top = ranked[0], second = ranked[1];
  if (top && top.score >= 0.75 && (!second || top.score - second.score >= 0.15)) return { match: top.name, suggestions: [top.name], review: false };
  return { match: value.trim(), suggestions: ranked.filter((item) => item.score >= 0.55).slice(0, 3).map((item) => item.name), review: true };
}
const readArray = async <T,>(key: string): Promise<T[]> => {
  return readParentArray<T>(taskStore(), key);
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

async function getHandler() {
  try { return json({ contacts: await readArray<ParentContact>(CONTACTS_KEY), imports: await readArray<ParentImport>(IMPORTS_KEY), canonicalSchools: (await readSchools()).map((school) => school.name) }); }
  catch { return json({ error: "Impossible de charger le suivi des parents." }, 503); }
}

async function postHandler(request: Request) {
  try {
    const body = await request.json() as { source?: ParentSource | "combined"; mixedSources?: boolean; importId?: string; fileName?: string; rows?: ParentImportRow[] };
    const mixedSources = body.mixedSources === true && body.source === "combined";
    if (!body.source || (!sources.has(body.source as ParentSource) && !mixedSources) || !Array.isArray(body.rows) || body.rows.length === 0 || body.rows.length > 20000) return json({ error: "Import invalide (maximum 20 000 lignes)." }, 400);
    if (mixedSources && body.rows.some((row) => !row || typeof row !== "object" || !row.source || !sources.has(row.source))) return json({ error: "Chaque ligne de la base consolidée doit indiquer une source reconnue." }, 400);
    const contacts = await readArray<ParentContact>(CONTACTS_KEY);
    // Index contacts once so large platform exports (one row per child) do not
    // repeatedly scan the whole growing contact list for every row.
    const identityIndex = new Map<string, Set<ParentContact>>();
    const nameIndex = new Map<string, Set<ParentContact>>();
    const addToIndex = (index: Map<string, Set<ParentContact>>, key: string, contact: ParentContact) => {
      if (!key) return;
      const values = index.get(key) ?? new Set<ParentContact>();
      values.add(contact);
      index.set(key, values);
    };
    const contactName = (contact: ParentContact) => (contact.fullName || `${contact.firstName} ${contact.lastName}`).trim().toLocaleLowerCase("fr");
    const indexContact = (contact: ParentContact) => {
      for (const email of contact.emails ?? []) addToIndex(identityIndex, `email:${normalizeParentEmail(email)}`, contact);
      for (const value of contact.phones ?? []) for (const phone of splitParentPhones(value).map(normalizeParentPhone).filter((item) => item.length >= 7 && item.length <= 15)) addToIndex(identityIndex, `phone:${phone}`, contact);
      addToIndex(nameIndex, contactName(contact), contact);
    };
    contacts.forEach(indexContact);
    const canonicalNames = (await readSchools()).map((school) => school.name);
    const schoolMatchCache = new Map<string, ReturnType<typeof matchSchool>>();
    let matched = 0;
    let reviewCount = 0;
    let schoolReviewCount = 0;
    const countsBySource = new Map<ParentSource, { rows: number; matched: number; review: number; schoolReview: number }>();
    const now = new Date().toISOString();
    for (const input of body.rows) {
      const row = input && typeof input === "object" ? input : {};
      const source = mixedSources ? row.source as ParentSource : body.source as ParentSource;
      const firstName = clean(row.firstName, 100), lastName = clean(row.lastName, 100);
      const fullName = clean(row.fullName, 180);
      const emails = [...new Set([...(Array.isArray(row.emails) ? row.emails.flatMap((email) => emailList(clean(email, 254))) : []), ...emailList(clean(row.email, 254))])];
      const phones = [...new Set([...(Array.isArray(row.phones) ? row.phones.flatMap((phone) => phoneList(clean(phone, 40))) : []), ...phoneList(clean(row.phone, 40))])];
      const rawSchool = clean(row.school, 180);
      const schoolKey = normalizeSchool(rawSchool);
      let schoolMatch = schoolMatchCache.get(schoolKey);
      if (!schoolMatch) {
        schoolMatch = matchSchool(rawSchool, canonicalNames);
        schoolMatchCache.set(schoolKey, schoolMatch);
      }
      if (schoolMatch.review && rawSchool) schoolReviewCount++;
      const school = schoolMatch.review ? "" : schoolMatch.match;
      const childClass = clean(row.childClass, 100);
      const submittedAt = clean(row.submittedAt, 80);
      const brochure = clean(row.brochure, 160);
      const aircallStatus = source === "aircall" ? clean(row.aircallStatus, 120) : "";
      const aircallNeedsReview = source === "aircall" && /a verifier|a vérifier|partage/i.test(aircallStatus.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      if (!firstName && !lastName && !fullName && !emails.length && !phones.length) continue;
      const exactMatches = new Set<ParentContact>();
      for (const email of emails) for (const contact of identityIndex.get(`email:${email}`) ?? []) exactMatches.add(contact);
      for (const phone of phones) for (const contact of identityIndex.get(`phone:${phone}`) ?? []) exactMatches.add(contact);
      const ids = new Set([...exactMatches].map((contact) => contact.id));
      const target = ids.size === 1 && !aircallNeedsReview ? [...exactMatches][0] : undefined;
      const incomingName = (fullName || `${firstName} ${lastName}`).trim().toLocaleLowerCase("fr");
      const sameNameContacts = nameIndex.get(incomingName) ?? new Set<ParentContact>();
      const sameName = sameNameContacts.size > 0;
      const uncertain = ids.size > 1 || aircallNeedsReview || (!target && sameName);
      if (ids.size > 1 || aircallNeedsReview || (source === "enrolled" && sameName && !target)) {
        for (const contact of exactMatches.size ? exactMatches : sameNameContacts) {
          contact.needsReview = true;
          if (source === "enrolled") { contact.suppression = true; contact.followUp = "do-not-contact"; }
          else if (!contact.suppression) contact.followUp = "review";
        }
      }
      if (target) matched++;
      const suppression = source === "enrolled" || Boolean(target?.suppression);
      const nextSources = [...new Set([...(target?.sources ?? []), source])];
      const followUp: ParentFollowUp = suppression ? "do-not-contact" : uncertain ? "review" : target?.followUp === "review" ? "review" : "to-contact";
      const fileName = clean(body.fileName, 180) || "import.csv";
      const occurredAt = source === "aircall" ? clean(row.aircallLastIncoming, 80) || clean(row.aircallFirstIncoming, 80) : submittedAt;
      const provenance = target?.provenance ?? [];
      const nextProvenance = provenance.some((item) => item.source === source && item.fileName === fileName && (item.occurredAt ?? "") === occurredAt)
        ? provenance
        : [...provenance, { source, fileName, importedAt: now, occurredAt }];
      const visioAnswer = clean(row.visioInterested, 80).toLocaleLowerCase("fr");
      const visioInterested = /^(oui|yes|true|1|bien sur|volontiers)/.test(visioAnswer) ? true : /^(non|no|false|0)/.test(visioAnswer) ? false : null;
      const request = source === "brochure" ? { submittedAt, brochure, childClass, visioInterested, fileName } : null;
      const requestKey = (item: typeof request) => item ? [item.submittedAt, item.brochure, item.childClass].join("|") : "";
      const brochureRequests = target?.brochureRequests ?? [];
      const nextBrochureRequests = request && !brochureRequests.some((item) => requestKey(item) === requestKey(request)) ? [...brochureRequests, request] : brochureRequests;
      const visioRegistration = source === "visio" ? { submittedAt, rawSchool, childClass, enrolledAnswer: clean(row.enrolledAnswer, 160), contactPreference: clean(row.contactPreference, 160), selectedMeeting: clean(row.selectedMeeting, 180), expectations: clean(row.expectations, 1200), knownVia: clean(row.knownVia, 160), fileName } : null;
      const visioRegistrations = target?.visioRegistrations ?? [];
      const visioKey = (item: typeof visioRegistration) => item ? [item.submittedAt, item.rawSchool, item.selectedMeeting].join("|") : "";
      const nextVisioRegistrations = visioRegistration && !visioRegistrations.some((item) => visioKey(item) === visioKey(visioRegistration)) ? [...visioRegistrations, visioRegistration] : visioRegistrations;
      const aircallCall = source === "aircall" ? {
        registryStatus: aircallStatus,
        incomingCalls: aircallCount(row.aircallIncomingCalls),
        missedCalls: aircallCount(row.aircallMissedCalls),
        answeredCalls: aircallCount(row.aircallAnsweredCalls),
        firstIncoming: clean(row.aircallFirstIncoming, 80),
        lastIncoming: clean(row.aircallLastIncoming, 80),
        fileName,
      } : null;
      const aircallCalls = target?.aircallCalls ?? [];
      const aircallKey = (item: typeof aircallCall) => item ? [item.fileName, item.firstIncoming, item.lastIncoming, item.registryStatus].join("|") : "";
      const nextAircallCalls = aircallCall && !aircallCalls.some((item) => aircallKey(item) === aircallKey(aircallCall)) ? [...aircallCalls, aircallCall] : aircallCalls;
      const schoolIssues = target?.schoolIssues ?? [];
      const nextSchoolIssues = schoolMatch.review && rawSchool && !schoolIssues.some((item) => normalizeSchool(item.raw) === normalizeSchool(rawSchool))
        ? [...schoolIssues, { raw: rawSchool, suggestions: schoolMatch.suggestions }]
        : schoolIssues;
      const next: ParentContact = {
        id: target?.id ?? crypto.randomUUID(),
        firstName: target?.firstName || firstName,
        lastName: target?.lastName || lastName,
        fullName: target?.fullName || fullName,
        emails: [...new Set([...(target?.emails ?? []), ...emails])],
        phones: [...new Set([...(target?.phones ?? []), ...phones])],
        schools: [...new Set([...(target?.schools ?? []), ...(school ? [school] : [])])],
        needsSchoolReview: nextSchoolIssues.length > 0,
        schoolIssues: nextSchoolIssues,
        childClasses: [...new Set([...(target?.childClasses ?? []), ...(childClass ? [childClass] : [])])],
        brochureRequests: nextBrochureRequests,
        visioRegistrations: nextVisioRegistrations,
        aircallCalls: nextAircallCalls,
        // Several child rows may belong to one parent. A single active slot is
        // enough to keep that household out of the non-enrolled follow-up list.
        enrolled: source === "alpha" && typeof row.enrolled === "boolean" ? row.enrolled || target?.enrolled === true : source === "aircall" && /non inscrit/i.test(aircallStatus) && target?.enrolled !== true && !target?.suppression ? false : target?.enrolled ?? null,
        sources: nextSources,
        provenance: nextProvenance,
        suppression,
        needsReview: Boolean(target?.needsReview || uncertain),
        followUp,
        updatedAt: now,
      };
      if (uncertain) reviewCount++;
      if (target) Object.assign(target, next);
      else contacts.unshift(next);
      indexContact(target ?? next);
      const sourceCounts = countsBySource.get(source) ?? { rows: 0, matched: 0, review: 0, schoolReview: 0 };
      sourceCounts.rows++;
      if (target) sourceCounts.matched++;
      if (uncertain) sourceCounts.review++;
      if (schoolMatch.review && rawSchool) sourceCounts.schoolReview++;
      countsBySource.set(source, sourceCounts);
    }
    const imports = await readArray<ParentImport>(IMPORTS_KEY);
    const fileName = clean(body.fileName, 180) || "import.csv";
    if (mixedSources) {
      for (const [source, counts] of countsBySource) {
        const id = `${clean(body.importId, 80) || crypto.randomUUID()}:${source}`;
        const previous = imports.find((item) => item.id === id);
        const entry: ParentImport = {
          id, source, fileName, importedAt: previous?.importedAt ?? now,
          rows: (previous?.rows ?? 0) + counts.rows,
          matched: (previous?.matched ?? 0) + counts.matched,
          review: (previous?.review ?? 0) + counts.review,
          schoolReview: (previous?.schoolReview ?? 0) + counts.schoolReview,
        };
        const existingIndex = imports.findIndex((item) => item.id === id);
        if (existingIndex >= 0) imports[existingIndex] = entry;
        else imports.unshift(entry);
      }
    } else {
      const id = clean(body.importId, 80);
      const previous = id ? imports.find((item) => item.id === id) : undefined;
      const entry: ParentImport = { id: id || crypto.randomUUID(), source: body.source as ParentSource, fileName, importedAt: previous?.importedAt ?? now, rows: (previous?.rows ?? 0) + body.rows.length, matched: (previous?.matched ?? 0) + matched, review: (previous?.review ?? 0) + reviewCount, schoolReview: (previous?.schoolReview ?? 0) + schoolReviewCount };
      if (previous) imports[imports.indexOf(previous)] = entry;
      else imports.unshift(entry);
    }
    const store = taskStore();
    await store.setJSON(CONTACTS_KEY, contacts);
    await store.setJSON(IMPORTS_KEY, imports.slice(0, 100));
    return json({ imported: body.rows.length, matched, review: reviewCount, schoolReview: schoolReviewCount });
  } catch { return json({ error: "L’import n’a pas pu être enregistré." }, 400); }
}

async function patchHandler(request: Request) {
  try {
    const body = await request.json() as { id?: string; followUp?: ParentFollowUp; confirmed?: boolean; rawSchool?: string; canonicalSchool?: string };
    if (!body.id) return json({ error: "Fiche introuvable." }, 400);
    const contacts = await readArray<ParentContact>(CONTACTS_KEY);
    const index = contacts.findIndex((contact) => contact.id === body.id);
    if (index < 0) return json({ error: "Fiche introuvable." }, 404);
    const current = contacts[index];
    const suppression = current.suppression;
    const followUp = suppression ? "do-not-contact" : body.confirmed ? "review" : body.followUp === "do-not-contact" || body.followUp === "review" ? body.followUp : current.followUp;
    let updated = { ...current, needsReview: body.confirmed ? false : current.needsReview, followUp, updatedAt: new Date().toISOString() };
    if (body.rawSchool && body.canonicalSchool) {
      const canonical = (await readSchools()).find((school) => school.name === body.canonicalSchool)?.name;
      const issue = updated.schoolIssues?.find((item) => item.raw === body.rawSchool);
      if (!canonical || !issue) return json({ error: "Choisis un établissement proposé dans la liste." }, 400);
      const schoolIssues = updated.schoolIssues.filter((item) => item.raw !== body.rawSchool);
      updated = { ...updated, schools: [...new Set([...updated.schools, canonical])], schoolIssues, needsSchoolReview: schoolIssues.length > 0 };
    }
    contacts[index] = updated;
    await taskStore().setJSON(CONTACTS_KEY, contacts);
    return json({ contact: contacts[index] });
  } catch { return json({ error: "Modification impossible." }, 400); }
}

async function deleteHandler(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return json({ error: "Fiche introuvable." }, 400);
    const contacts = await readArray<ParentContact>(CONTACTS_KEY);
    await taskStore().setJSON(CONTACTS_KEY, contacts.filter((contact) => contact.id !== id));
    return json({ ok: true });
  } catch { return json({ error: "Suppression impossible." }, 400); }
}

export const GET = withIdentity(getHandler);
export const POST = withIdentity(postHandler);
export const PATCH = withIdentity(patchHandler);
export const DELETE = withIdentity(deleteHandler);
