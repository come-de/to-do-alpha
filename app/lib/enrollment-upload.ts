function headerKey(value: string) {
  return value.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");
}

function csvRows(value: string): string[][] {
  const firstLine = value.split(/\r?\n/).find((line) => line.trim()) || "";
  const delimiter = [";", "\t", ","].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char === '"' && quoted && value[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && value[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function csvCell(value: string) {
  return /[;"\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Keep only the fields used by the comparison, before crossing Netlify's request gateway. */
export function projectEnrollmentCsv(rawCsv: string) {
  const rows = csvRows(rawCsv);
  if (!rows.length) throw new Error("Fichier CSV vide");
  const headers = rows[0].map(headerKey);
  const find = (aliases: string[]) => headers.findIndex((header) => aliases.includes(header));
  const id = find(["iddelenfant", "iddelefant", "idenfant", "studentid"]);
  const slots = find(["creneaux", "creneau", "slots"]);
  if (id < 0 || slots < 0) throw new Error("Colonnes « Id de l’enfant » ou « Creneaux » introuvables");
  const indexes = [
    id,
    find(["prenomdelenfant", "prenomenfant", "firstname"]),
    find(["nomdelenfant", "nomenfant", "lastname"]),
    find(["prenomparent", "prenomduparent", "parentfirstname", "firstnameparent"]),
    find(["nomparent", "nomduparent", "parentlastname", "lastnameparent"]),
    find(["classe", "class"]),
    find(["ecole", "etablissement", "school"]),
    slots,
    find(["courriel", "couriel", "email", "mail", "emailparent", "courrielparent", "emailduparent", "courrielduparent", "adresseemail", "adresseemailparent"]),
    find(["numerodetelephone", "numerodetelephoneparent", "telephone", "telephoneparent", "telephoneportable", "telephoneportableparent", "mobile", "mobileparent", "portable", "portableparent"]),
    find(["seancesponctuelles", "seanceponctuelle", "ponctuelle", "ponctuel"]),
  ];
  const projected = ["Id de l'enfant;Prénom de l'enfant;Nom de l'enfant;Prénom Parent;Nom Parent;Classe;Ecole;Creneaux;Courriel;Numéro de téléphone;Séances ponctuelles"];
  for (const row of rows.slice(1)) {
    if (!row[id]?.trim() || !row[slots]?.trim()) continue;
    projected.push(indexes.map((index) => csvCell(index < 0 ? "" : row[index] || "")).join(";"));
  }
  return { csv: projected.join("\n"), sourceRowCount: rows.length - 1, selectedRowCount: projected.length - 1 };
}

/** Send large Parents exports without exceeding the serverless request limit. */
export async function postEnrollmentCsv(rawCsv: string, fileName: string): Promise<Response> {
  const url = `/api/enrollment-imports?fileName=${encodeURIComponent(fileName)}`;
  const projected = projectEnrollmentCsv(rawCsv);
  const csv = new Blob([projected.csv], { type: "text/csv;charset=utf-8" });
  const rowCountHeader = { "X-Alpha-Source-Row-Count": String(projected.sourceRowCount) };

  if (csv.size < 256 * 1024) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/csv;charset=utf-8", ...rowCountHeader },
      body: projected.csv,
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
      ...rowCountHeader,
    },
    body: compressed,
  });
}
