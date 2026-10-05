import type { ReactNode } from "react";

function cleanSchoolId(value: string | number | null | undefined) {
  const id = String(value ?? "").trim();
  return /^[A-Za-z0-9_-]+$/.test(id) ? id : "";
}

export default function SchoolAdminLink({
  schoolId,
  children,
  className = "",
}: {
  schoolId: string | number | null | undefined;
  children: ReactNode;
  className?: string;
}) {
  const id = cleanSchoolId(schoolId);
  if (!id) return <>{children}</>;
  return (
    <a
      className={`school-admin-link ${className}`.trim()}
      href={`https://www.alphaeducation.fr/administration/schools/${encodeURIComponent(id)}`}
      target="_blank"
      rel="noreferrer"
      title={`Ouvrir la fiche établissement Alpha (ID ${id})`}
      onClick={(event) => event.stopPropagation()}
    >
      {children}<span aria-hidden="true">↗</span>
    </a>
  );
}
