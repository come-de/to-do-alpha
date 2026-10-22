"use client";

import { FormEvent, useEffect, useState } from "react";
import { acceptInvite, getUser, handleAuthCallback, login, oauthLogin, requestPasswordRecovery, updateUser } from "@netlify/identity";

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default function AccessPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState("");
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const authHash = new URLSearchParams(window.location.hash.slice(1));
        if (authHash.has("error")) {
          history.replaceState(null, "", window.location.pathname + window.location.search);
          setError("La connexion Google a été annulée ou refusée. Réessayez ou utilisez votre adresse e-mail.");
          return;
        }
        const callback = await handleAuthCallback();
        if (!active) return;
        if (callback?.type === "invite" && callback.token) setInviteToken(callback.token);
        if (callback?.type === "recovery") setRecovering(true);
        if (callback?.type === "oauth" && callback.user) {
          const params = new URLSearchParams(window.location.search);
          window.location.replace(safeNextPath(params.get("next")));
          return;
        }
        if (!callback) {
          const params = new URLSearchParams(window.location.search);
          if (params.has("invite")) setInviteToken(params.get("invite") || "");
          if (params.has("recovery")) setRecovering(true);
          if (!params.has("invite") && !params.has("recovery")) {
            const user = await getUser();
            if (active && user) window.location.replace(safeNextPath(params.get("next")));
          }
        }
      } catch {
        if (active) setError("Ce lien d’accès a expiré ou n’est plus valide. Demandez une nouvelle invitation.");
      }
    })();
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (inviteToken) await acceptInvite(inviteToken, password);
      else if (recovering) await updateUser({ password });
      else await login(email.trim(), password);
      const params = new URLSearchParams(window.location.search);
      window.location.replace(safeNextPath(params.get("next")));
    } catch {
      setError(inviteToken
        ? "Impossible d’activer ce compte. Vérifiez le mot de passe ou demandez une nouvelle invitation."
        : recovering
          ? "Impossible de modifier le mot de passe. Le lien de récupération a peut-être expiré."
          : "Adresse e-mail ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  async function sendRecovery() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      await requestPasswordRecovery(email.trim());
      setNotice("Si ce compte existe, un lien de récupération vient d’être envoyé.");
    } catch {
      setError("Impossible d’envoyer le lien. Vérifiez l’adresse e-mail et réessayez.");
    } finally {
      setLoading(false);
    }
  }

  function signInWithGoogle() {
    setError("");
    try {
      oauthLogin("google");
    } catch (cause) {
      // oauthLogin intentionally throws after starting the browser redirect.
      if (cause instanceof Error && cause.message === "Redirecting to OAuth provider") return;
      setError("La connexion Google n’est pas disponible pour le moment. Réessayez ou utilisez votre adresse e-mail.");
    }
  }

  const title = inviteToken ? "Activer votre compte" : recovering ? "Choisir un nouveau mot de passe" : "Accès à l’application";

  return (
    <main className="access-page">
      <section className="access-card" aria-labelledby="access-title">
        <div className="access-mark" aria-hidden="true">α</div>
        <p className="eyebrow">Alpha Education</p>
        <h1 id="access-title">{title}</h1>
        <p>{inviteToken
          ? "Définissez un mot de passe personnel pour rejoindre l’équipe."
          : recovering
            ? "Choisissez un mot de passe personnel et sécurisé."
            : "Connectez-vous avec votre compte individuel Alpha Education."}</p>
        {!inviteToken && !recovering && <>
          <button className="button quiet access-google-button" type="button" onClick={signInWithGoogle} disabled={loading}>
            <span className="access-google-mark" aria-hidden="true">G</span>
            Continuer avec Google
          </button>
          <div className="access-divider" aria-hidden="true"><span>ou avec votre adresse e-mail</span></div>
        </>}
        <form onSubmit={submit} className="access-form">
          {!inviteToken && !recovering && <label>
            <span>Adresse e-mail</span>
            <input autoFocus type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.fr" autoComplete="username" required />
          </label>}
          <label>
            <span>{inviteToken || recovering ? "Nouveau mot de passe" : "Mot de passe"}</span>
            <input autoFocus={Boolean(inviteToken || recovering)} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" type="password" autoComplete={inviteToken || recovering ? "new-password" : "current-password"} minLength={8} required />
          </label>
          {error && <div className="access-error" role="alert">{error}</div>}
          {notice && <div role="status">{notice}</div>}
          <button className="button primary" type="submit" disabled={loading || password.length < 8}>
            {loading ? "Vérification..." : inviteToken ? "Activer mon compte" : recovering ? "Enregistrer le mot de passe" : "Se connecter"}
          </button>
        </form>
        {!inviteToken && !recovering && <button className="button quiet" type="button" onClick={() => void sendRecovery()} disabled={loading || !email.includes("@")}>
          Mot de passe oublié ?
        </button>}
      </section>
    </main>
  );
}
