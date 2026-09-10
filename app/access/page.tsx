"use client";

import { FormEvent, useState } from "react";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitAccess(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error("bad-code");
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/";
      window.location.href = next.startsWith("/") ? next : "/";
    } catch {
      setError("Code incorrect. Vérifiez les majuscules, minuscules et underscores.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="access-page">
      <section className="access-card" aria-labelledby="access-title">
        <div className="access-mark" aria-hidden="true">α</div>
        <p className="eyebrow">Alpha Education</p>
        <h1 id="access-title">Accès à l’application</h1>
        <p>Entrez le code partagé avec l’équipe pour ouvrir le cockpit Alpha.</p>
        <form onSubmit={submitAccess} className="access-form">
          <label>
            <span>Code d’accès</span>
            <input
              autoFocus
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Alpha_The_Best"
              type="password"
              autoComplete="current-password"
            />
          </label>
          {error && <div className="access-error" role="alert">{error}</div>}
          <button className="button primary" type="submit" disabled={loading || !code.trim()}>
            {loading ? "Vérification..." : "Entrer"}
          </button>
        </form>
      </section>
    </main>
  );
}
