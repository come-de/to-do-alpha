/** Keep gateway HTML errors readable, including Safari's generic JSON errors. */
export async function readApiJson<T>(response: Response): Promise<T> {
  const body = await response.text();
  try {
    return JSON.parse(body) as T;
  } catch {
    if (response.status === 504) {
      throw new Error("Le serveur a dépassé son délai de traitement (HTTP 504). Actualisez la liste pour vérifier si l’import a été enregistré avant de réessayer.");
    }
    throw new Error(`Le serveur a renvoyé une réponse illisible (HTTP ${response.status}).`);
  }
}
