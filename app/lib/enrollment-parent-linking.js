import { normalizeParentPhone, splitParentPhones } from "./phone-normalization.js";

const normalizeParentEmail = (value) => value.trim().toLocaleLowerCase("fr");
const validEmail = (value) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPhone = (value) => value.length >= 7 && value.length <= 15;
const unique = (values) => [...new Set(values.filter(Boolean))];

/**
 * Adds parent identities from the Alpha enrollment export to the shared parent
 * registry, then links the corresponding enrollment rows to those contacts.
 * Child names/IDs, class, and slots are deliberately never copied to contacts.
 */
export function linkEnrollmentParents(rows, contacts, fileName, importedAt = new Date().toISOString()) {
  const emailIndex = new Map();
  const phoneIndex = new Map();
  const add = (index, key, id) => {
    if (!key) return;
    const ids = index.get(key) ?? new Set();
    ids.add(id);
    index.set(key, ids);
  };
  const indexContact = (contact) => {
    for (const email of contact.emails ?? []) add(emailIndex, normalizeParentEmail(email), contact.id);
    for (const value of contact.phones ?? []) for (const phone of splitParentPhones(value).map(normalizeParentPhone).filter(validPhone)) add(phoneIndex, phone, contact.id);
  };
  contacts.forEach(indexContact);
  const createdContactIds = new Set();

  const linkedRows = rows.map((row) => {
    const emails = unique((row.parentEmails ?? []).flatMap((value) => value.split(/[;,|\s]+/)).map(normalizeParentEmail).filter(validEmail));
    const phones = unique((row.parentPhones ?? []).flatMap(splitParentPhones).map(normalizeParentPhone).filter(validPhone));
    const matchedIds = new Set();
    for (const email of emails) for (const id of emailIndex.get(email) ?? []) matchedIds.add(id);
    for (const phone of phones) for (const id of phoneIndex.get(phone) ?? []) matchedIds.add(id);

    // If the supplied email and phone point at different existing people, do
    // not merge them or create another record from an ambiguous row.
    if (matchedIds.size > 1) return { ...row, parentContactIds: [] };
    if (!emails.length && !phones.length) return { ...row, parentContactIds: [] };

    let contact = matchedIds.size === 1 ? contacts.find((item) => item.id === [...matchedIds][0]) : undefined;
    if (!contact) {
      contact = {
        id: crypto.randomUUID(), firstName: "", lastName: "", fullName: "", emails: [], phones: [], schools: [], childClasses: [],
        brochureRequests: [], visioRegistrations: [], needsSchoolReview: false, schoolIssues: [], enrolled: true,
        sources: [], provenance: [], suppression: false, needsReview: false, followUp: "to-contact", updatedAt: importedAt,
      };
      contacts.unshift(contact);
      createdContactIds.add(contact.id);
    }
    const firstName = String(row.parentFirstName ?? "").trim().slice(0, 100);
    const lastName = String(row.parentLastName ?? "").trim().slice(0, 100);
    contact.firstName ||= firstName;
    contact.lastName ||= lastName;
    contact.fullName ||= `${firstName} ${lastName}`.trim();
    contact.emails = unique([...(contact.emails ?? []), ...emails]);
    contact.phones = unique([...(contact.phones ?? []).flatMap(splitParentPhones), ...phones]);
    const school = String(row.school ?? "").trim().slice(0, 180);
    contact.schools = unique([...(contact.schools ?? []), school]);
    contact.sources = unique([...(contact.sources ?? []), "alpha"]);
    contact.enrolled = true;
    contact.provenance ??= [];
    if (!contact.provenance.some((item) => item.source === "alpha" && item.fileName === fileName)) {
      contact.provenance.push({ source: "alpha", fileName, importedAt });
    }
    contact.updatedAt = importedAt;
    indexContact(contact);
    return { ...row, parentContactIds: [contact.id] };
  });
  return {
    rows: linkedRows,
    contacts,
    linkedEnrollmentRows: linkedRows.filter((row) => row.parentContactIds?.length).length,
    createdParentContacts: createdContactIds.size,
  };
}
