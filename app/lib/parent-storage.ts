type ParentArrayStore = {
  getMetadata(key: string, options: { consistency: "strong" }): Promise<unknown>;
  get(key: string, options: { type: "json"; consistency: "strong" }): Promise<unknown>;
};

/** Missing optional blobs must be checked with HEAD before requesting their body.
 * In production, a GET for a missing key can stall while acquiring/reading its
 * signed URL. Only confirmed absence means an empty registry: read errors and
 * invalid data must propagate so a subsequent import cannot overwrite them.
 */
export async function readParentArray<T>(store: ParentArrayStore, key: string): Promise<T[]> {
  const metadata = await store.getMetadata(key, { consistency: "strong" });
  if (metadata === null) return [];
  const value = await store.get(key, { type: "json", consistency: "strong" });
  if (!Array.isArray(value)) throw new Error("Le registre Parents est invalide ; aucune donnée existante n’a été remplacée.");
  return value as T[];
}
