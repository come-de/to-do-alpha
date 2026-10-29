/** Send large Parents exports without exceeding the serverless request limit. */
export async function postEnrollmentCsv(rawCsv: string, fileName: string): Promise<Response> {
  const url = `/api/enrollment-imports?fileName=${encodeURIComponent(fileName)}`;
  const csv = new Blob([rawCsv], { type: "text/csv;charset=utf-8" });

  if (csv.size < 1024 * 1024) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/csv;charset=utf-8" },
      body: rawCsv,
    });
  }

  if (typeof CompressionStream === "undefined") {
    throw new Error("Ce navigateur ne permet pas l’import de gros fichiers CSV. Utilisez une version récente de Chrome, Edge ou Safari.");
  }

  const compressed = await new Response(csv.stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Alpha-Csv-Compression": "gzip",
    },
    body: compressed,
  });
}
