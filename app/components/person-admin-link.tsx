import type { ReactNode } from "react";

type PersonStatus = "tutor" | "candidate" | "unknown";

function cleanPersonId(value: string | number | null | undefined) {
  const id = String(value ?? "").trim();
  return /^[A-Za-z0-9_-]+$/.test(id) ? id : "";
}

export default function PersonAdminLink({
  personId,
  status,
  children,
  className = "",
}: {
  personId: string | number | null | undefined;
  status: PersonStatus;
  children: ReactNode;
  className?: string;
}) {
  const id = cleanPersonId(personId);
  if (!id || status === "unknown") return <>{children}</>;
  const href = status === "tutor"
    ? `https://www.alphaeducation.fr/administration/tutors/${encodeURIComponent(id)}/planning`
    : `https://www.alphaeducation.fr/administration/candidates/${encodeURIComponent(id)}`;
  return (
    <a
      className={`person-admin-link ${className}`.trim()}
      href={href}
      target="_blank"
      rel="noreferrer"
      title={status === "tutor" ? "Voir les séances à venir du tuteur" : "Ouvrir la fiche du candidat"}
      onClick={(event) => event.stopPropagation()}
    >
      {children}<span aria-hidden="true">↗</span>
    </a>
  );
}
