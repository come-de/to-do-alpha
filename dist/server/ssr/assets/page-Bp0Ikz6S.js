import { a as require_react, o as __toESM, t as require_jsx_runtime } from "../index.js";
//#region app/components/enrollment-comparison.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var schoolOwnerLabels$3 = {
	"": "Non attribués",
	kelly: "Kelly",
	pierre: "Pierre",
	julie: "Julie"
};
function sortTimestamp(value) {
	const timestamp = new Date(value).getTime();
	return Number.isFinite(timestamp) ? timestamp : 0;
}
function normalizeImport(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: raw.id || `enrollment-${crypto.randomUUID()}`,
		importedAt: raw.importedAt || now,
		displayName: raw.displayName || raw.fileName?.replace(/\.[^.]+$/, "") || "Export inscriptions",
		fileName: raw.fileName || "parents.csv",
		sourceRowCount: Math.max(0, Number(raw.sourceRowCount) || 0),
		rows: Array.isArray(raw.rows) ? raw.rows.filter((row) => Boolean(row?.studentId && row?.slots)) : [],
		createdAt: raw.createdAt || now
	};
}
function normalizeSchool$1(value) {
	return value.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}
function importDate$1(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "short",
		timeStyle: "short"
	}).format(date);
}
function studentName(row) {
	return `${row.firstName} ${row.lastName}`.trim() || row.studentId;
}
function studentMap(rows) {
	return new Map(rows.filter((row) => row.studentId && row.slots).map((row) => [row.studentId, row]));
}
function csvCell$4(value) {
	const text = String(value ?? "");
	return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}
function EnrollmentComparison({ onOpenFiles }) {
	const [imports, setImports] = (0, import_react.useState)([]);
	const [loadedImports, setLoadedImports] = (0, import_react.useState)({});
	const [schoolAssignments, setSchoolAssignments] = (0, import_react.useState)([]);
	const [referenceId, setReferenceId] = (0, import_react.useState)("");
	const [recentId, setRecentId] = (0, import_react.useState)("");
	const [schoolFilter, setSchoolFilter] = (0, import_react.useState)("all");
	const [view, setView] = (0, import_react.useState)("new");
	const [query, setQuery] = (0, import_react.useState)("");
	const [nameDrafts, setNameDrafts] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const [detailError, setDetailError] = (0, import_react.useState)("");
	const [detailRetry, setDetailRetry] = (0, import_react.useState)(0);
	const loadImports = (0, import_react.useCallback)(async (silent = false) => {
		const results = await Promise.allSettled([fetch("/api/enrollment-imports?summary=1", { cache: "no-store" }).then(async (response) => {
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Fichiers d’inscriptions indisponibles");
			return data;
		}), fetch("/api/schools", { cache: "no-store" }).then(async (response) => {
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Répartition des établissements indisponible");
			return data;
		})]);
		const errors = results.flatMap((result) => result.status === "rejected" ? [result.reason instanceof Error ? result.reason.message : "Chargement impossible"] : []);
		if (results[0]?.status === "fulfilled") {
			const nextImports = Array.isArray(results[0].value.imports) ? results[0].value.imports.map(normalizeImport).sort((a, b) => sortTimestamp(b.importedAt) - sortTimestamp(a.importedAt)) : [];
			setImports(nextImports);
			setNameDrafts(Object.fromEntries(nextImports.map((item) => [item.id, item.displayName])));
			setRecentId((current) => nextImports.some((item) => item.id === current) ? current : nextImports[0]?.id || "");
			setReferenceId((current) => nextImports.some((item) => item.id === current) ? current : nextImports[1]?.id || nextImports[0]?.id || "");
		}
		if (results[1]?.status === "fulfilled") setSchoolAssignments(results[1].value.schools ?? []);
		setMessage(errors.length ? errors.join(" · ") : silent ? "" : "Historique chargé");
	}, []);
	(0, import_react.useEffect)(() => {
		const initialTimer = window.setTimeout(() => void loadImports(true), 0);
		const refreshTimer = window.setInterval(() => void loadImports(true), 3e4);
		return () => {
			window.clearTimeout(initialTimer);
			window.clearInterval(refreshTimer);
		};
	}, [loadImports]);
	(0, import_react.useEffect)(() => {
		const ids = Array.from(new Set([referenceId, recentId].filter(Boolean))).filter((id) => !loadedImports[id]);
		if (!ids.length) return;
		let cancelled = false;
		Promise.all(ids.map(async (id) => {
			const response = await fetch(`/api/enrollment-imports?id=${encodeURIComponent(id)}`, { cache: "no-store" });
			const data = await response.json();
			if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Fichier d’inscriptions indisponible");
			return normalizeImport(data.import);
		})).then((items) => {
			if (!cancelled) {
				setLoadedImports((current) => ({
					...current,
					...Object.fromEntries(items.map((item) => [item.id, item]))
				}));
				setDetailError("");
			}
		}).catch((error) => {
			if (!cancelled) {
				const text = error instanceof Error ? error.message : "Chargement du fichier impossible";
				setDetailError(text);
				setMessage(text);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [
		detailRetry,
		loadedImports,
		recentId,
		referenceId
	]);
	const referenceImport = loadedImports[referenceId] ?? null;
	const recentImport = loadedImports[recentId] ?? null;
	const alphaSchoolKeys = (0, import_react.useMemo)(() => new Set(schoolAssignments.filter((school) => school.schoolType === "alpha" || normalizeSchool$1(school.category).includes("etude alpha")).map((school) => normalizeSchool$1(school.name))), [schoolAssignments]);
	const isAlphaStudent = (0, import_react.useCallback)((row) => {
		const schoolKey = normalizeSchool$1(row.school);
		return alphaSchoolKeys.has(schoolKey) || schoolKey.includes("etude alpha");
	}, [alphaSchoolKeys]);
	const alphaRows = (0, import_react.useCallback)((rows) => rows.filter(isAlphaStudent), [isAlphaStudent]);
	const schools = (0, import_react.useMemo)(() => {
		const labels = /* @__PURE__ */ new Map();
		[referenceImport, recentImport].flatMap((item) => alphaRows(item?.rows ?? [])).forEach((row) => {
			const key = normalizeSchool$1(row.school);
			if (key && !labels.has(key)) labels.set(key, row.school.trim());
		});
		return Array.from(labels.entries()).sort((a, b) => a[1].localeCompare(b[1], "fr"));
	}, [
		alphaRows,
		recentImport,
		referenceImport
	]);
	const comparison = (0, import_react.useMemo)(() => {
		const filterRows = (rows) => {
			const scopedRows = alphaRows(rows);
			return schoolFilter === "all" ? scopedRows : scopedRows.filter((row) => normalizeSchool$1(row.school) === schoolFilter);
		};
		const referenceMap = studentMap(filterRows(referenceImport?.rows ?? []));
		const recentMap = studentMap(filterRows(recentImport?.rows ?? []));
		const newStudents = Array.from(recentMap.values()).filter((student) => !referenceMap.has(student.studentId));
		const lostStudents = Array.from(referenceMap.values()).filter((student) => !recentMap.has(student.studentId));
		const sameStudents = Array.from(recentMap.values()).filter((student) => referenceMap.has(student.studentId));
		const sort = (rows) => rows.sort((a, b) => studentName(a).localeCompare(studentName(b), "fr"));
		return {
			referenceCount: referenceMap.size,
			recentCount: recentMap.size,
			newStudents: sort(newStudents),
			lostStudents: sort(lostStudents),
			sameStudents: sort(sameStudents)
		};
	}, [
		alphaRows,
		recentImport,
		referenceImport,
		schoolFilter
	]);
	const schoolSummary = (0, import_react.useMemo)(() => {
		const referenceBySchool = /* @__PURE__ */ new Map();
		const recentBySchool = /* @__PURE__ */ new Map();
		const add = (target, row) => {
			const schoolKey = normalizeSchool$1(row.school);
			if (!schoolKey) return;
			if (!target.has(schoolKey)) target.set(schoolKey, /* @__PURE__ */ new Map());
			target.get(schoolKey)?.set(row.studentId, row);
		};
		alphaRows(referenceImport?.rows ?? []).forEach((row) => add(referenceBySchool, row));
		alphaRows(recentImport?.rows ?? []).forEach((row) => add(recentBySchool, row));
		return schools.map(([key, label]) => {
			const before = referenceBySchool.get(key) ?? /* @__PURE__ */ new Map();
			const after = recentBySchool.get(key) ?? /* @__PURE__ */ new Map();
			const added = Array.from(after.keys()).filter((id) => !before.has(id)).length;
			const lost = Array.from(before.keys()).filter((id) => !after.has(id)).length;
			return {
				key,
				label,
				before: before.size,
				after: after.size,
				added,
				lost,
				net: after.size - before.size
			};
		}).filter((item) => item.before || item.after).sort((a, b) => Math.abs(b.added + b.lost) - Math.abs(a.added + a.lost) || a.label.localeCompare(b.label, "fr"));
	}, [
		alphaRows,
		recentImport,
		referenceImport,
		schools
	]);
	const studentsByOwner = (0, import_react.useMemo)(() => {
		const counts = {
			"": 0,
			kelly: 0,
			pierre: 0,
			julie: 0
		};
		const ownersBySchool = new Map(schoolAssignments.map((school) => [normalizeSchool$1(school.name), school.portfolioOwner]));
		studentMap(alphaRows(recentImport?.rows ?? [])).forEach((student) => {
			counts[ownersBySchool.get(normalizeSchool$1(student.school)) ?? ""] += 1;
		});
		return counts;
	}, [
		alphaRows,
		recentImport,
		schoolAssignments
	]);
	const excludedStudentCounts = (0, import_react.useMemo)(() => ({
		reference: studentMap(referenceImport?.rows ?? []).size - studentMap(alphaRows(referenceImport?.rows ?? [])).size,
		recent: studentMap(recentImport?.rows ?? []).size - studentMap(alphaRows(recentImport?.rows ?? [])).size
	}), [
		alphaRows,
		recentImport,
		referenceImport
	]);
	const displayedStudents = (0, import_react.useMemo)(() => {
		const rows = view === "new" ? comparison.newStudents : view === "lost" ? comparison.lostStudents : comparison.sameStudents;
		const normalizedQuery = query.trim().toLocaleLowerCase("fr");
		if (!normalizedQuery) return rows;
		return rows.filter((row) => [
			row.studentId,
			row.firstName,
			row.lastName,
			row.className,
			row.school,
			row.slots
		].join(" ").toLocaleLowerCase("fr").includes(normalizedQuery));
	}, [
		comparison,
		query,
		view
	]);
	async function importFile(file) {
		if (!file) return;
		setSaving(true);
		setMessage("Import en cours…");
		try {
			const text = await file.text();
			const response = await fetch(`/api/enrollment-imports?fileName=${encodeURIComponent(file.name)}`, {
				method: "POST",
				headers: { "Content-Type": "text/csv;charset=utf-8" },
				body: text
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Import impossible");
			const nextImports = (data.imports ?? []).map(normalizeImport).sort((a, b) => sortTimestamp(b.importedAt) - sortTimestamp(a.importedAt));
			const created = data.import ? normalizeImport(data.import) : nextImports[0];
			const previousNewestId = imports[0]?.id || "";
			setImports(nextImports);
			if (created) setLoadedImports((current) => ({
				...current,
				[created.id]: created
			}));
			setNameDrafts(Object.fromEntries(nextImports.map((item) => [item.id, item.displayName])));
			if (created) setRecentId(created.id);
			setReferenceId(previousNewestId || nextImports[1]?.id || created?.id || "");
			setSchoolFilter("all");
			setView("new");
			setMessage(`Import sauvegardé : ${created ? studentMap(alphaRows(created.rows)).size : 0} élève(s) Étude Alpha inscrit(s)`);
		} catch (error) {
			setMessage(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Import non sauvegardé");
		} finally {
			setSaving(false);
		}
	}
	async function renameImport(id) {
		const displayName = (nameDrafts[id] || "").trim();
		if (!displayName) return setMessage("Le nom de l’import est obligatoire");
		setSaving(true);
		try {
			const response = await fetch("/api/enrollment-imports", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id,
					displayName
				})
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Renommage impossible");
			const nextImports = (data.imports ?? []).map(normalizeImport).sort((a, b) => sortTimestamp(b.importedAt) - sortTimestamp(a.importedAt));
			setImports(nextImports);
			setLoadedImports((current) => current[id] ? {
				...current,
				[id]: {
					...current[id],
					displayName
				}
			} : current);
			setNameDrafts(Object.fromEntries(nextImports.map((item) => [item.id, item.displayName])));
			setMessage("Nom sauvegardé");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Renommage impossible");
		} finally {
			setSaving(false);
		}
	}
	async function deleteImport(item) {
		if (!window.confirm(`Placer l’import « ${item.displayName} » dans la corbeille ?`)) return;
		setSaving(true);
		try {
			const response = await fetch(`/api/enrollment-imports?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Suppression impossible");
			const nextImports = (data.imports ?? []).map(normalizeImport).sort((a, b) => sortTimestamp(b.importedAt) - sortTimestamp(a.importedAt));
			setImports(nextImports);
			setLoadedImports((current) => {
				const next = { ...current };
				delete next[item.id];
				return next;
			});
			setRecentId((current) => nextImports.some((entry) => entry.id === current) ? current : nextImports[0]?.id || "");
			setReferenceId((current) => nextImports.some((entry) => entry.id === current) ? current : nextImports[1]?.id || nextImports[0]?.id || "");
			setMessage("Import placé dans la corbeille");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Suppression impossible");
		} finally {
			setSaving(false);
		}
	}
	function exportCurrentView() {
		const category = view === "new" ? "Nouvelle inscription" : view === "lost" ? "Inscription perdue" : "Inscription stable";
		const rows = [[
			"Catégorie",
			"ID enfant",
			"Prénom",
			"Nom",
			"Classe",
			"Établissement",
			"Créneaux"
		], ...displayedStudents.map((row) => [
			category,
			row.studentId,
			row.firstName,
			row.lastName,
			row.className,
			row.school,
			row.slots
		])];
		const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell$4).join(";")).join("\r\n")}`], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `comparaison-inscriptions-${view}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}
	const importLabel = (item) => `${item.displayName} · ${importDate$1(item.importedAt)}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "task-panel enrollment-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Suivi des inscriptions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Comparer les inscriptions par établissement" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Seuls les élèves rattachés à un établissement Étude Alpha et possédant au moins un créneau sont comptés." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ghost-button",
					onClick: () => void loadImports(),
					disabled: saving,
					children: "↻ Actualiser"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "availability-import-box",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Importer un export Parents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Les données bancaires et les coordonnées des parents ne sont jamais enregistrées." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "import-button",
					children: [saving ? "Enregistrement…" : "Choisir un fichier CSV", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: ".csv,text/csv",
						disabled: saving,
						onChange: (event) => {
							importFile(event.target.files?.[0]);
							event.currentTarget.value = "";
						}
					})]
				})]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "enrollment-message",
				children: message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "enrollment-controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Fichier de référence", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: referenceId,
						onChange: (event) => setReferenceId(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Sélectionner"
						}), imports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.id,
							children: importLabel(item)
						}, item.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Fichier récent", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: recentId,
						onChange: (event) => setRecentId(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Sélectionner"
						}), imports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.id,
							children: importLabel(item)
						}, item.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Établissement", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: schoolFilter,
						onChange: (event) => setSchoolFilter(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "Tous les établissements"
						}), schools.map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: key,
							children: label
						}, key))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Rechercher", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Élève, ID, classe…"
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "enrollment-summary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Inscrits référence" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: comparison.referenceCount })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Inscrits récents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: comparison.recentCount })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "positive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nouvelles inscriptions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["+", comparison.newStudents.length] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "negative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Inscriptions perdues" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["-", comparison.lostStudents.length] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Évolution nette" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [comparison.recentCount - comparison.referenceCount > 0 ? "+" : "", comparison.recentCount - comparison.referenceCount] })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "enrollment-scope-note",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Périmètre : Étude Alpha uniquement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					excludedStudentCounts.reference,
					" élève(s) hors périmètre exclu(s) du fichier de référence · ",
					excludedStudentCounts.recent,
					" du fichier récent"
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "owner-count-strip enrollment-owner-counts",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "owner-count-title",
					children: "Élèves inscrits par RH · fichier récent"
				}), [
					"kelly",
					"pierre",
					"julie",
					""
				].map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: !owner ? "unassigned" : "",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: schoolOwnerLabels$3[owner] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: studentsByOwner[owner] })]
				}, owner || "unassigned"))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "enrollment-school-summary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "enrollment-section-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Évolution par établissement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Cliquez sur une ligne pour voir les élèves concernés." })] }), schoolFilter !== "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-button",
						onClick: () => setSchoolFilter("all"),
						children: "Voir tous"
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "enrollment-school-table",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "enrollment-school-head",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Établissement" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Avant" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Après" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nouvelles" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Perdues" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Net" })
						]
					}), schoolSummary.slice(0, 40).map((school) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: schoolFilter === school.key ? "active" : "",
						onClick: () => setSchoolFilter(school.key),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: school.label }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: school.before }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: school.after }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "positive",
								children: ["+", school.added]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "negative",
								children: ["-", school.lost]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [school.net > 0 ? "+" : "", school.net] })
						]
					}, school.key))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "availability-history enrollment-history",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Fichiers enregistrés" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [imports.length, " export(s) conservé(s)"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "availability-history-list",
					children: imports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "availability-import-name",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nom de l’import" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: nameDrafts[item.id] ?? item.displayName,
								onChange: (event) => setNameDrafts((current) => ({
									...current,
									[item.id]: event.target.value
								})),
								onKeyDown: (event) => {
									if (event.key === "Enter") renameImport(item.id);
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
							importDate$1(item.importedAt),
							" · ",
							item.fileName,
							" · ",
							item.sourceRowCount,
							" ligne(s)"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "availability-history-actions",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-button",
								onClick: () => void renameImport(item.id),
								children: "Enregistrer le nom"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-button danger",
								onClick: () => void deleteImport(item),
								children: "Supprimer"
							})]
						})
					] }, item.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "availability-tabs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: view === "new" ? "active" : "",
						onClick: () => setView("new"),
						children: [
							"✨ Nouvelles (",
							comparison.newStudents.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: view === "lost" ? "active" : "",
						onClick: () => setView("lost"),
						children: [
							"↘ Perdues (",
							comparison.lostStudents.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: view === "same" ? "active" : "",
						onClick: () => setView("same"),
						children: [
							"= Stables (",
							comparison.sameStudents.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "ghost-button",
						onClick: exportCurrentView,
						disabled: !displayedStudents.length,
						children: "Export CSV"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `enrollment-results ${view === "new" ? "is-new" : view === "lost" ? "is-lost" : ""}`,
				children: !imports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state compact",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucun fichier d’inscriptions enregistré" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ajoutez vos exports depuis la bibliothèque partagée." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "button quiet",
							onClick: () => onOpenFiles("enrollments"),
							children: "Ouvrir Fichiers"
						})
					]
				}) : detailError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state compact",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Fichier sélectionné indisponible" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: detailError }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "button quiet",
							onClick: () => {
								setDetailError("");
								setDetailRetry((value) => value + 1);
							},
							children: "Réessayer"
						})
					]
				}) : !referenceImport || !recentImport ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "empty-state compact",
					children: "Chargement des fichiers sélectionnés…"
				}) : displayedStudents.length ? displayedStudents.map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "enrollment-student-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: studentName(student) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"ID ",
							student.studentId,
							student.className ? ` · ${student.className}` : ""
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: student.school || "Établissement non renseigné" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [student.slots.split(/\r?\n/).filter(Boolean).length, " créneau(x)"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "Voir les créneaux" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: student.slots })] })
					]
				}, student.studentId)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "empty-state compact",
					children: "Aucun élève dans cette catégorie."
				})
			})
		]
	});
}
//#endregion
//#region app/components/files-hub.tsx
var fileConfig = {
	availability: {
		title: "Disponibilités des tuteurs",
		description: "Utilisées dans Comparaison dispos et Tuteurs dispo sans séance.",
		endpoint: "/api/availability-imports",
		icon: "📆",
		canUpload: true
	},
	assignments: {
		title: "Séances affectées",
		description: "Extraire entre aujourd’hui et samedi de la semaine prochaine.",
		endpoint: "/api/tutor-assignment-imports",
		icon: "🧩",
		canUpload: true
	},
	interests: {
		title: "Intérêts tuteurs et candidats",
		description: "Croisés avec les séances non affectées.",
		endpoint: "/api/tutor-interest-imports",
		icon: "🙋",
		canUpload: true
	},
	upcomingSessions: {
		title: "Séances des semaines à venir",
		description: "Utilisées pour repérer les séances encore non affectées.",
		endpoint: "/api/upcoming-session-imports",
		icon: "📋",
		canUpload: true
	},
	enrollments: {
		title: "Inscriptions parents",
		description: "Utilisées dans Comparaison inscriptions.",
		endpoint: "/api/enrollment-imports",
		icon: "🎒",
		canUpload: true
	},
	tutors: {
		title: "Listes de tuteurs",
		description: "Imports datés utilisés dans le suivi et les autres analyses.",
		endpoint: "/api/tutor-tracking",
		icon: "👨‍🏫",
		canUpload: true
	}
};
function formatDate$4(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "short",
		timeStyle: "short"
	}).format(date);
}
function FilesHub({ onOpen, focusKind = null }) {
	const [files, setFiles] = (0, import_react.useState)({
		availability: [],
		assignments: [],
		interests: [],
		upcomingSessions: [],
		enrollments: [],
		tutors: []
	});
	const [draftNames, setDraftNames] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const [trash, setTrash] = (0, import_react.useState)([]);
	const [showTrash, setShowTrash] = (0, import_react.useState)(false);
	const [highlightedKind, setHighlightedKind] = (0, import_react.useState)(focusKind);
	const [tutorImportDate, setTutorImportDate] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const load = (0, import_react.useCallback)(async (silent = false) => {
		try {
			const kinds = Object.keys(fileConfig);
			const responses = await Promise.all([...kinds.map((kind) => fetch(`${fileConfig[kind].endpoint}?summary=1`, { cache: "no-store" })), fetch("/api/file-trash", { cache: "no-store" })]);
			const payloads = await Promise.all(responses.map((response) => response.json()));
			const next = {
				availability: [],
				assignments: [],
				interests: [],
				upcomingSessions: [],
				enrollments: [],
				tutors: []
			};
			responses.slice(0, kinds.length).forEach((response, index) => {
				if (!response.ok) throw new Error(payloads[index]?.detail || payloads[index]?.error || "Chargement impossible");
				const kind = kinds[index];
				next[kind] = Array.isArray(payloads[index]?.imports) ? payloads[index].imports : [];
			});
			if (!responses[kinds.length]?.ok) throw new Error(payloads[kinds.length]?.detail || payloads[kinds.length]?.error || "Corbeille indisponible");
			setTrash(Array.isArray(payloads[kinds.length]?.imports) ? payloads[kinds.length].imports : []);
			setFiles(next);
			setDraftNames(Object.fromEntries(kinds.flatMap((kind) => next[kind].map((item) => [item.id, item.displayName]))));
			if (!silent) setMessage("Bibliothèque actualisée");
		} catch (error) {
			if (!silent) setMessage(error instanceof Error ? error.message : "Bibliothèque indisponible");
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(() => void load(true), 0);
		return () => window.clearTimeout(timer);
	}, [load]);
	(0, import_react.useEffect)(() => {
		if (!focusKind) return;
		const highlightTimer = window.setTimeout(() => setHighlightedKind(focusKind), 0);
		const scrollTimer = window.setTimeout(() => document.getElementById(`files-${focusKind}`)?.scrollIntoView({
			behavior: "smooth",
			block: "center"
		}), 50);
		const clearTimer = window.setTimeout(() => setHighlightedKind(null), 2600);
		return () => {
			window.clearTimeout(highlightTimer);
			window.clearTimeout(scrollTimer);
			window.clearTimeout(clearTimer);
		};
	}, [focusKind]);
	async function upload(kind, file) {
		if (!file) return;
		if (kind === "tutors" && !tutorImportDate) return setMessage("Choisissez la date liée à la liste de tuteurs");
		setSaving(true);
		setMessage("Import en cours…");
		try {
			const rawCsv = await file.text();
			const config = fileConfig[kind];
			const response = kind === "availability" ? await fetch(config.endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fileName: file.name,
					rawCsv
				})
			}) : kind === "tutors" ? await fetch(config.endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					date: tutorImportDate,
					fileName: file.name,
					rawCsv
				})
			}) : await fetch(`${config.endpoint}?fileName=${encodeURIComponent(file.name)}`, {
				method: "POST",
				headers: { "Content-Type": "text/csv;charset=utf-8" },
				body: rawCsv
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Import impossible");
			await load(true);
			setMessage(`${config.title} : fichier sauvegardé`);
		} catch (error) {
			setMessage(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Import non sauvegardé");
		} finally {
			setSaving(false);
		}
	}
	async function rename(kind, item) {
		const displayName = (draftNames[item.id] || "").trim();
		if (!displayName) return setMessage("Le nom du fichier est obligatoire");
		setSaving(true);
		try {
			const response = await fetch(fileConfig[kind].endpoint, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: item.id,
					displayName
				})
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Renommage impossible");
			await load(true);
			setMessage("Nom sauvegardé");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Renommage impossible");
		} finally {
			setSaving(false);
		}
	}
	async function remove(kind, item) {
		if (!window.confirm(`Placer « ${item.displayName} » dans la corbeille ?`)) return;
		setSaving(true);
		try {
			const response = await fetch(`${fileConfig[kind].endpoint}?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Suppression impossible");
			await load(true);
			setMessage("Fichier placé dans la corbeille");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Suppression impossible");
		} finally {
			setSaving(false);
		}
	}
	async function restore(item) {
		setSaving(true);
		try {
			const response = await fetch("/api/file-trash", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					kind: item.kind,
					id: item.id
				})
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Restauration impossible");
			await load(true);
			setMessage(`« ${item.displayName} » a été restauré`);
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Restauration impossible");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "task-panel files-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Bibliothèque partagée"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Fichiers" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Un fichier importé ici devient disponible dans tous les onglets qui l’utilisent." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "files-heading-actions",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "ghost-button",
						onClick: () => setShowTrash((current) => !current),
						disabled: saving,
						children: [
							"Corbeille (",
							trash.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "ghost-button",
						onClick: () => void load(),
						disabled: saving,
						children: "↻ Actualiser"
					})]
				})]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "enrollment-message",
				children: message
			}) : null,
			showTrash ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "files-trash",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "files-trash-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Corbeille" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Les fichiers restent conservés sans limite et peuvent être restaurés." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-button",
						onClick: () => setShowTrash(false),
						children: "Fermer"
					})]
				}), trash.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "files-trash-list",
					children: trash.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.displayName }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							fileConfig[item.kind].title,
							" · supprimé le ",
							formatDate$4(item.deletedAt)
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
							formatDate$4(item.importedAt),
							" · ",
							item.fileName,
							item.sourceRowCount ? ` · ${item.sourceRowCount} lignes` : ""
						] })
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "button quiet",
						onClick: () => void restore(item),
						disabled: saving,
						children: "Restaurer"
					})] }, `${item.kind}-${item.id}`))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "files-empty",
					children: "La corbeille est vide."
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "files-grid",
				children: Object.keys(fileConfig).map((kind) => {
					const config = fileConfig[kind];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: `files-category ${highlightedKind === kind ? "is-highlighted" : ""}`,
						id: `files-${kind}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "files-category-heading",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: config.icon }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: config.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: config.description })] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `files-category-actions ${kind === "tutors" ? "with-date" : ""}`,
								children: [
									kind === "tutors" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "files-import-date",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date de la liste" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "date",
											value: tutorImportDate,
											onChange: (event) => setTutorImportDate(event.target.value),
											disabled: saving
										})]
									}) : null,
									config.canUpload ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "import-button",
										children: ["Importer un CSV", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "file",
											accept: ".csv,text/csv",
											disabled: saving,
											onChange: (event) => {
												upload(kind, event.target.files?.[0]);
												event.currentTarget.value = "";
											}
										})]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-button",
										onClick: () => onOpen(kind),
										children: "Ouvrir l’analyse"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "files-list",
								children: files[kind].length ? files[kind].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: draftNames[item.id] ?? item.displayName,
										onChange: (event) => setDraftNames((current) => ({
											...current,
											[item.id]: event.target.value
										})),
										onKeyDown: (event) => {
											if (event.key === "Enter") rename(kind, item);
										},
										"aria-label": `Nom du fichier ${item.fileName}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										kind === "tutors" && item.date ? `Liste du ${new Intl.DateTimeFormat("fr-FR").format(/* @__PURE__ */ new Date(`${item.date}T12:00:00`))} · ` : "",
										formatDate$4(item.importedAt),
										" · ",
										item.fileName,
										item.sourceRowCount ? ` · ${item.sourceRowCount} lignes` : ""
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "files-item-actions",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "text-button",
											onClick: () => void rename(kind, item),
											children: "Enregistrer"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "text-button danger-text",
											onClick: () => void remove(kind, item),
											children: "Supprimer"
										})]
									})
								] }, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "files-empty",
									children: "Aucun fichier enregistré."
								})
							})
						]
					}, kind);
				})
			})
		]
	});
}
//#endregion
//#region app/components/person-admin-link.tsx
function cleanPersonId(value) {
	const id = String(value ?? "").trim();
	return /^[A-Za-z0-9_-]+$/.test(id) ? id : "";
}
function PersonAdminLink({ personId, status, children, className = "" }) {
	const id = cleanPersonId(personId);
	if (!id || status === "unknown") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	const href = status === "tutor" ? `https://www.alphaeducation.fr/administration/tutors/${encodeURIComponent(id)}/planning` : `https://www.alphaeducation.fr/administration/candidates/${encodeURIComponent(id)}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		className: `person-admin-link ${className}`.trim(),
		href,
		target: "_blank",
		rel: "noreferrer",
		title: status === "tutor" ? "Voir les séances à venir du tuteur" : "Ouvrir la fiche du candidat",
		onClick: (event) => event.stopPropagation(),
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			children: "↗"
		})]
	});
}
//#endregion
//#region app/components/school-admin-link.tsx
function cleanSchoolId(value) {
	const id = String(value ?? "").trim();
	return /^[A-Za-z0-9_-]+$/.test(id) ? id : "";
}
function SchoolAdminLink({ schoolId, children, className = "" }) {
	const id = cleanSchoolId(schoolId);
	if (!id) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		className: `school-admin-link ${className}`.trim(),
		href: `https://www.alphaeducation.fr/administration/schools/${encodeURIComponent(id)}`,
		target: "_blank",
		rel: "noreferrer",
		title: `Ouvrir la fiche établissement Alpha (ID ${id})`,
		onClick: (event) => event.stopPropagation(),
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			children: "↗"
		})]
	});
}
//#endregion
//#region app/components/tutor-coverage-comparison.tsx
var schoolOwnerLabels$2 = {
	"": "Non attribué",
	kelly: "Kelly",
	pierre: "Pierre",
	julie: "Julie"
};
function normalizedSchoolName$2(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}
function importDate(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "short",
		timeStyle: "short"
	}).format(date);
}
function fullDate$1(value) {
	const date = /* @__PURE__ */ new Date(`${value}T12:00:00`);
	return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}
function parseInterval(value) {
	const match = value.match(/(\d{1,2}):(\d{2})\s*(?:-|=)+>\s*(\d{1,2}):(\d{2})/);
	if (!match) return null;
	return {
		start: Number(match[1]) * 60 + Number(match[2]),
		end: Number(match[3]) * 60 + Number(match[4])
	};
}
function overlaps$1(left, right) {
	return Boolean(left && right && left.start < right.end && left.end > right.start);
}
function uniqueOpportunities(rows) {
	const seen = /* @__PURE__ */ new Set();
	return rows.filter((row) => {
		const key = `${normalizedAssignmentPart(row.timeSlot)}|${normalizedAssignmentPart(row.school)}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
function uniqueAssignments(rows) {
	const seen = /* @__PURE__ */ new Set();
	return rows.filter((row) => {
		const key = `${row.timeSlot}|${row.school}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
function normalizedAssignmentPart(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}
function staffingSessionKey(row) {
	return [
		row.date,
		normalizedAssignmentPart(row.school),
		normalizedAssignmentPart(row.timeSlot),
		normalizedAssignmentPart(row.category)
	].join("|");
}
function staffingSessions(rows, date) {
	const sessions = /* @__PURE__ */ new Map();
	rows.filter((row) => row.date === date && !row.absent).forEach((row) => {
		const key = staffingSessionKey(row);
		const session = sessions.get(key) ?? {
			key,
			school: row.school,
			timeSlot: row.timeSlot,
			category: row.category,
			tutors: /* @__PURE__ */ new Map()
		};
		if (!session.tutors.has(row.tutorId)) session.tutors.set(row.tutorId, row);
		sessions.set(key, session);
	});
	return sessions;
}
function tutorLabel(row, tutorId) {
	if (!row) return `ID ${tutorId}`;
	return `${row.firstName} ${row.lastName}`.trim() || `ID ${tutorId}`;
}
function csvCell$3(value) {
	const text = String(value ?? "");
	return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}
function TutorCoverageComparison({ onOpenFiles }) {
	const [toolView, setToolView] = (0, import_react.useState)("coverage");
	const [availabilityImports, setAvailabilityImports] = (0, import_react.useState)([]);
	const [interestImports, setInterestImports] = (0, import_react.useState)([]);
	const [assignmentImports, setAssignmentImports] = (0, import_react.useState)([]);
	const [availabilityData, setAvailabilityData] = (0, import_react.useState)({});
	const [interestData, setInterestData] = (0, import_react.useState)({});
	const [assignmentData, setAssignmentData] = (0, import_react.useState)({});
	const [upcomingSessionImports, setUpcomingSessionImports] = (0, import_react.useState)([]);
	const [upcomingSessionId, setUpcomingSessionId] = (0, import_react.useState)("");
	const [activeUpcomingSessionImport, setActiveUpcomingSessionImport] = (0, import_react.useState)(null);
	const [loadingUpcomingSessions, setLoadingUpcomingSessions] = (0, import_react.useState)(false);
	const [unstaffedExclusions, setUnstaffedExclusions] = (0, import_react.useState)({
		sessionIds: [],
		sourceKeys: [],
		updatedAt: ""
	});
	const [latestTutorSnapshot, setLatestTutorSnapshot] = (0, import_react.useState)(null);
	const [availabilityId, setAvailabilityId] = (0, import_react.useState)("");
	const [interestId, setInterestId] = (0, import_react.useState)("");
	const [assignmentId, setAssignmentId] = (0, import_react.useState)("");
	const [compareReferenceId, setCompareReferenceId] = (0, import_react.useState)("");
	const [compareRecentId, setCompareRecentId] = (0, import_react.useState)("");
	const [comparisonDate, setComparisonDate] = (0, import_react.useState)("");
	const [comparisonOwnerFilter, setComparisonOwnerFilter] = (0, import_react.useState)("all");
	const [selectedDate, setSelectedDate] = (0, import_react.useState)("");
	const [view, setView] = (0, import_react.useState)("unassigned");
	const [query, setQuery] = (0, import_react.useState)("");
	const [school, setSchool] = (0, import_react.useState)("all");
	const [schoolAssignments, setSchoolAssignments] = (0, import_react.useState)([]);
	const [schoolOwnerFilter, setSchoolOwnerFilter] = (0, import_react.useState)("all");
	const [personStatusFilter, setPersonStatusFilter] = (0, import_react.useState)("all");
	const [opportunitySourceFilter, setOpportunitySourceFilter] = (0, import_react.useState)("both");
	const [showRemovedTutors, setShowRemovedTutors] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const [detailError, setDetailError] = (0, import_react.useState)("");
	const [detailRetry, setDetailRetry] = (0, import_react.useState)(0);
	const [notes, setNotes] = (0, import_react.useState)([]);
	const [noteDrafts, setNoteDrafts] = (0, import_react.useState)({});
	const load = (0, import_react.useCallback)(async (silent = false) => {
		const results = await Promise.allSettled([
			["Disponibilités", "/api/availability-imports?summary=1"],
			["Séances affectées", "/api/tutor-assignment-imports?summary=1"],
			["Annotations", "/api/tutor-coverage-notes"],
			["Établissements", "/api/schools"],
			["Intérêts", "/api/tutor-interest-imports?summary=1"],
			["Liste des tuteurs", "/api/tutor-tracking?latest=1"],
			["Semaines à venir", "/api/upcoming-session-imports?summary=1"],
			["Éléments masqués", "/api/unstaffed-exclusions"]
		].map(async ([label, endpoint]) => {
			const response = await fetch(endpoint, { cache: "no-store" });
			const data = await response.json();
			if (!response.ok) throw new Error(`${label} : ${data.detail || data.error || "chargement impossible"}`);
			return data;
		}));
		const errors = results.flatMap((result) => result.status === "rejected" ? [result.reason instanceof Error ? result.reason.message : "Chargement impossible"] : []);
		if (results[0]?.status === "fulfilled") {
			const next = results[0].value.imports ?? [];
			setAvailabilityImports(next);
			setAvailabilityId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || "");
		}
		if (results[1]?.status === "fulfilled") {
			const next = results[1].value.imports ?? [];
			setAssignmentImports(next);
			setAssignmentId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || "");
			setCompareRecentId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || "");
			setCompareReferenceId((current) => next.some((item) => item.id === current) ? current : next[1]?.id || next[0]?.id || "");
		}
		if (results[2]?.status === "fulfilled") {
			const next = results[2].value.notes ?? [];
			setNotes(next);
			setNoteDrafts((current) => ({
				...Object.fromEntries(next.map((item) => [`${item.date}:${item.tutorId}`, {
					status: item.status,
					note: item.note
				}])),
				...current
			}));
		}
		if (results[3]?.status === "fulfilled") setSchoolAssignments(results[3].value.schools ?? []);
		if (results[4]?.status === "fulfilled") {
			const next = results[4].value.imports ?? [];
			setInterestImports(next);
			setInterestId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || "");
		}
		if (results[5]?.status === "fulfilled") setLatestTutorSnapshot(results[5].value.snapshot ?? null);
		if (results[6]?.status === "fulfilled") {
			const next = results[6].value.imports ?? [];
			setUpcomingSessionImports(next);
			setUpcomingSessionId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || "");
		}
		if (results[7]?.status === "fulfilled") setUnstaffedExclusions(results[7].value.exclusions ?? {
			sessionIds: [],
			sourceKeys: [],
			updatedAt: ""
		});
		setMessage(errors.length ? errors.join(" · ") : silent ? "" : "Fichiers actualisés");
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const timer = window.setTimeout(() => {
			if (!upcomingSessionId) {
				setActiveUpcomingSessionImport(null);
				return;
			}
			setLoadingUpcomingSessions(true);
			setActiveUpcomingSessionImport(null);
			fetch(`/api/upcoming-session-imports?id=${encodeURIComponent(upcomingSessionId)}`, { cache: "no-store" }).then(async (response) => {
				const data = await response.json();
				if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Import Semaines à venir indisponible");
				if (!cancelled) setActiveUpcomingSessionImport(data.import);
			}).catch((error) => {
				if (!cancelled) {
					setActiveUpcomingSessionImport(null);
					setMessage(error instanceof Error ? error.message : "Chargement des séances à venir impossible");
				}
			}).finally(() => {
				if (!cancelled) setLoadingUpcomingSessions(false);
			});
		}, 0);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [upcomingSessionId]);
	(0, import_react.useEffect)(() => {
		const initialTimer = window.setTimeout(() => void load(true), 0);
		const refreshTimer = window.setInterval(() => void load(true), 3e4);
		return () => {
			window.clearTimeout(initialTimer);
			window.clearInterval(refreshTimer);
		};
	}, [load]);
	(0, import_react.useEffect)(() => {
		const assignmentIds = Array.from(new Set([
			assignmentId,
			compareReferenceId,
			compareRecentId
		].filter(Boolean)));
		const requests = [
			availabilityId && !availabilityData[availabilityId] ? [
				"availability",
				availabilityId,
				"/api/availability-imports"
			] : null,
			interestId && !interestData[interestId] ? [
				"interest",
				interestId,
				"/api/tutor-interest-imports"
			] : null,
			...assignmentIds.filter((id) => !assignmentData[id]).map((id) => [
				"assignment",
				id,
				"/api/tutor-assignment-imports"
			])
		].filter(Boolean);
		if (!requests.length) return;
		let cancelled = false;
		Promise.all(requests.map(async ([kind, id, endpoint]) => {
			const response = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { cache: "no-store" });
			const data = await response.json();
			if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Fichier sélectionné indisponible");
			return {
				kind,
				item: data.import
			};
		})).then((items) => {
			if (cancelled) return;
			items.forEach(({ kind, item }) => {
				if (kind === "availability") setAvailabilityData((current) => ({
					...current,
					[item.id]: item
				}));
				else if (kind === "interest") setInterestData((current) => ({
					...current,
					[item.id]: item
				}));
				else setAssignmentData((current) => ({
					...current,
					[item.id]: item
				}));
			});
			setDetailError("");
			setMessage("");
		}).catch((error) => {
			if (!cancelled) {
				const text = error instanceof Error ? error.message : "Chargement impossible";
				setDetailError(text);
				setMessage(text);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [
		assignmentData,
		assignmentId,
		availabilityData,
		availabilityId,
		compareRecentId,
		compareReferenceId,
		detailRetry,
		interestData,
		interestId
	]);
	const availabilityImport = availabilityData[availabilityId] ?? null;
	const interestImport = interestData[interestId] ?? null;
	const assignmentImport = assignmentData[assignmentId] ?? null;
	const compareReferenceImport = assignmentData[compareReferenceId] ?? null;
	const compareRecentImport = assignmentData[compareRecentId] ?? null;
	const loadingDetails = !detailError && Boolean(availabilityId && !availabilityImport || interestId && !interestImport || assignmentId && !assignmentImport || compareReferenceId && !compareReferenceImport || compareRecentId && !compareRecentImport);
	const analysisDates = (0, import_react.useMemo)(() => Array.from(new Set([...(availabilityImport?.rows ?? []).map((row) => row.date), ...(interestImport?.rows ?? []).map((row) => row.date)].filter(Boolean))).sort(), [availabilityImport, interestImport]);
	const activeDate = analysisDates.includes(selectedDate) ? selectedDate : analysisDates.find((date) => date >= (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) || analysisDates.at(-1) || "";
	const comparisonDates = (0, import_react.useMemo)(() => Array.from(new Set([...(compareReferenceImport?.rows ?? []).map((row) => row.date), ...(compareRecentImport?.rows ?? []).map((row) => row.date)])).filter(Boolean).sort(), [compareRecentImport, compareReferenceImport]);
	const activeComparisonDate = comparisonDates.includes(comparisonDate) ? comparisonDate : comparisonDates.find((date) => date >= (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) || comparisonDates.at(-1) || "";
	const staffingComparison = (0, import_react.useMemo)(() => {
		const referenceSessions = staffingSessions(compareReferenceImport?.rows ?? [], activeComparisonDate);
		const recentSessions = staffingSessions(compareRecentImport?.rows ?? [], activeComparisonDate);
		const added = [];
		const removed = [];
		const changed = [];
		new Set([...referenceSessions.keys(), ...recentSessions.keys()]).forEach((key) => {
			const reference = referenceSessions.get(key);
			const recent = recentSessions.get(key);
			const referenceTutors = reference?.tutors ?? /* @__PURE__ */ new Map();
			const recentTutors = recent?.tutors ?? /* @__PURE__ */ new Map();
			const addedIds = Array.from(recentTutors.keys()).filter((id) => !referenceTutors.has(id));
			const removedIds = Array.from(referenceTutors.keys()).filter((id) => !recentTutors.has(id));
			const session = recent ?? reference;
			if (!session) return;
			if (reference && recent && addedIds.length && removedIds.length) changed.push({
				session,
				before: removedIds.map((id) => referenceTutors.get(id)),
				after: addedIds.map((id) => recentTutors.get(id))
			});
			else {
				addedIds.forEach((id) => added.push({
					session,
					tutor: recentTutors.get(id)
				}));
				removedIds.forEach((id) => removed.push({
					session,
					tutor: referenceTutors.get(id)
				}));
			}
		});
		const bySession = (left, right) => `${left.session.timeSlot} ${left.session.school}`.localeCompare(`${right.session.timeSlot} ${right.session.school}`, "fr");
		return {
			referenceSessionCount: referenceSessions.size,
			recentSessionCount: recentSessions.size,
			referenceTutorCount: new Set(Array.from(referenceSessions.values()).flatMap((session) => Array.from(session.tutors.keys()))).size,
			recentTutorCount: new Set(Array.from(recentSessions.values()).flatMap((session) => Array.from(session.tutors.keys()))).size,
			added: added.sort(bySession),
			removed: removed.sort(bySession),
			changed: changed.sort(bySession)
		};
	}, [
		activeComparisonDate,
		compareRecentImport,
		compareReferenceImport
	]);
	const comparison = (0, import_react.useMemo)(() => {
		const assignmentsByTutor = /* @__PURE__ */ new Map();
		(assignmentImport?.rows ?? []).filter((row) => row.date === activeDate && !row.absent && row.tutorId.trim()).forEach((row) => {
			const tutorId = row.tutorId.trim();
			assignmentsByTutor.set(tutorId, uniqueAssignments([...assignmentsByTutor.get(tutorId) ?? [], row]));
		});
		const currentTutorIds = latestTutorSnapshot ? new Set(latestTutorSnapshot.records.map((record) => record.tutorId.trim()).filter(Boolean)) : null;
		const opportunitiesByTutor = /* @__PURE__ */ new Map();
		const addOpportunity = (input, source, validatedInterest = false) => {
			const tutorId = input.personId.trim();
			if (!tutorId) return;
			const opportunityKey = `${normalizedAssignmentPart(input.timeSlot)}|${normalizedAssignmentPart(input.school)}`;
			const tutorOpportunities = opportunitiesByTutor.get(tutorId) ?? /* @__PURE__ */ new Map();
			const existing = tutorOpportunities.get(opportunityKey);
			tutorOpportunities.set(opportunityKey, existing ? {
				...existing,
				firstName: existing.firstName || input.firstName,
				lastName: existing.lastName || input.lastName,
				grade: existing.grade || input.grade,
				phone: existing.phone || input.phone,
				sessionId: existing.sessionId || input.sessionId,
				className: existing.className || input.className,
				group: existing.group || input.group,
				sources: Array.from(new Set([...existing.sources, source])),
				validatedInterest: existing.validatedInterest || validatedInterest
			} : {
				...input,
				personId: tutorId,
				sources: [source],
				validatedInterest
			});
			opportunitiesByTutor.set(tutorId, tutorOpportunities);
		};
		(availabilityImport?.rows ?? []).filter((row) => row.date === activeDate).forEach((row) => addOpportunity({
			personId: row.tutorId,
			firstName: row.firstName,
			lastName: row.lastName,
			grade: row.grade,
			phone: row.phone,
			sessionId: row.sessionId,
			date: row.date,
			school: row.school,
			className: row.className,
			timeSlot: row.timeSlot,
			group: row.group
		}, "availability"));
		(interestImport?.rows ?? []).filter((row) => row.date === activeDate).forEach((row) => addOpportunity({
			personId: row.personId,
			firstName: row.firstName,
			lastName: row.lastName,
			grade: "",
			phone: row.phone,
			sessionId: row.sessionId,
			date: row.date,
			school: row.school,
			className: row.className,
			timeSlot: row.timeSlot,
			group: row.group
		}, "interest", row.validated));
		const buildTutor = (tutorId, opportunities, assignments) => ({
			tutorId,
			firstName: opportunities[0]?.firstName || assignments[0]?.firstName || "",
			lastName: opportunities[0]?.lastName || assignments[0]?.lastName || "",
			grade: opportunities[0]?.grade || assignments[0]?.grade || "",
			phone: opportunities[0]?.phone || assignments[0]?.phone || "",
			opportunities: uniqueOpportunities(opportunities),
			assignments: uniqueAssignments(assignments),
			personStatus: !currentTutorIds ? "unknown" : currentTutorIds.has(tutorId) ? "tutor" : "candidate"
		});
		const mobilizable = Array.from(opportunitiesByTutor.entries()).flatMap(([tutorId, opportunityMap]) => {
			const assignments = assignmentsByTutor.get(tutorId) ?? [];
			const assignmentIntervals = assignments.map((row) => parseInterval(row.timeSlot));
			const nonOverlapping = Array.from(opportunityMap.values()).filter((row) => {
				const interval = parseInterval(row.timeSlot);
				return !interval || !assignmentIntervals.some((assigned) => overlaps$1(interval, assigned));
			});
			return nonOverlapping.length ? [buildTutor(tutorId, nonOverlapping, assignments)] : [];
		});
		const unassigned = mobilizable.filter((person) => !person.assignments.length);
		const extra = mobilizable.filter((person) => person.assignments.length);
		const byName = (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, "fr");
		const allOpportunities = mobilizable.flatMap((person) => person.opportunities);
		return {
			mobilizablePersonCount: mobilizable.length,
			tutorCount: mobilizable.filter((person) => person.personStatus === "tutor").length,
			candidateCount: mobilizable.filter((person) => person.personStatus === "candidate").length,
			unknownCount: mobilizable.filter((person) => person.personStatus === "unknown").length,
			availabilityCount: allOpportunities.filter((row) => row.sources.includes("availability")).length,
			interestCount: allOpportunities.filter((row) => row.sources.includes("interest")).length,
			assignedTutorCount: assignmentsByTutor.size,
			assignedSessionCount: Array.from(assignmentsByTutor.values()).reduce((sum, rows) => sum + rows.length, 0),
			unassigned: unassigned.sort(byName),
			extra: extra.sort(byName)
		};
	}, [
		activeDate,
		assignmentImport,
		availabilityImport,
		interestImport,
		latestTutorSnapshot
	]);
	const schoolOptions = (0, import_react.useMemo)(() => {
		const labels = /* @__PURE__ */ new Set();
		[...comparison.unassigned, ...comparison.extra].forEach((tutor) => tutor.opportunities.forEach((row) => row.school && labels.add(row.school)));
		return Array.from(labels).sort((a, b) => a.localeCompare(b, "fr"));
	}, [comparison]);
	const ownerBySchoolName = (0, import_react.useMemo)(() => new Map(schoolAssignments.map((item) => [normalizedSchoolName$2(item.name), item.portfolioOwner || ""])), [schoolAssignments]);
	const schoolByName = (0, import_react.useMemo)(() => new Map(schoolAssignments.map((item) => [normalizedSchoolName$2(item.name), item])), [schoolAssignments]);
	const schoolById = (0, import_react.useMemo)(() => new Map(schoolAssignments.filter((item) => item.externalId).map((item) => [item.externalId, item])), [schoolAssignments]);
	const ownerForSchool = (0, import_react.useCallback)((schoolName) => ownerBySchoolName.get(normalizedSchoolName$2(schoolName)) || "", [ownerBySchoolName]);
	const schoolRecordForName = (0, import_react.useCallback)((schoolName) => schoolByName.get(normalizedSchoolName$2(schoolName)), [schoolByName]);
	const unstaffedCountsBySchool = (0, import_react.useMemo)(() => {
		const counts = /* @__PURE__ */ new Map();
		const hiddenSessionIds = new Set(unstaffedExclusions.sessionIds);
		(activeUpcomingSessionImport?.rows ?? []).forEach((row) => {
			if (row.date !== activeDate || hiddenSessionIds.has(row.sessionId)) return;
			if (normalizedAssignmentPart(row.category).includes("alpha") && row.studentCount === 1) return;
			const matchedSchool = (row.schoolId ? schoolById.get(row.schoolId) : void 0) ?? schoolByName.get(normalizedSchoolName$2(row.school));
			const key = matchedSchool?.externalId ? `id:${matchedSchool.externalId}` : `name:${normalizedSchoolName$2(row.school)}`;
			const sessions = counts.get(key) ?? /* @__PURE__ */ new Set();
			sessions.add(row.sessionId);
			counts.set(key, sessions);
		});
		return new Map(Array.from(counts.entries()).map(([key, sessions]) => [key, sessions.size]));
	}, [
		activeDate,
		activeUpcomingSessionImport,
		schoolById,
		schoolByName,
		unstaffedExclusions.sessionIds
	]);
	const unstaffedCountForSchool = (0, import_react.useCallback)((schoolName) => {
		const matchedSchool = schoolRecordForName(schoolName);
		const key = matchedSchool?.externalId ? `id:${matchedSchool.externalId}` : `name:${normalizedSchoolName$2(schoolName)}`;
		return unstaffedCountsBySchool.get(key) ?? 0;
	}, [schoolRecordForName, unstaffedCountsBySchool]);
	const unstaffedLinkForSchool = (0, import_react.useCallback)((schoolName) => {
		const params = new URLSearchParams({ onglet: "seances-non-affectees" });
		if (activeDate) params.set("date-seances", activeDate);
		if (upcomingSessionId) params.set("fichier-seances", upcomingSessionId);
		if (schoolName) params.set("recherche-seances", schoolName);
		return `?${params.toString()}`;
	}, [activeDate, upcomingSessionId]);
	const staffingComparisonByOwner = (0, import_react.useMemo)(() => {
		const owners = [
			"kelly",
			"pierre",
			"julie",
			""
		];
		const matchesFilter = (schoolName) => {
			const owner = ownerForSchool(schoolName);
			return comparisonOwnerFilter === "all" || (comparisonOwnerFilter === "unassigned" ? !owner : owner === comparisonOwnerFilter);
		};
		return {
			summary: owners.map((owner) => ({
				owner,
				added: staffingComparison.added.filter((item) => ownerForSchool(item.session.school) === owner).length,
				removed: staffingComparison.removed.filter((item) => ownerForSchool(item.session.school) === owner).length,
				changed: staffingComparison.changed.filter((item) => ownerForSchool(item.session.school) === owner).length
			})),
			added: staffingComparison.added.filter((item) => matchesFilter(item.session.school)),
			removed: staffingComparison.removed.filter((item) => matchesFilter(item.session.school)),
			changed: staffingComparison.changed.filter((item) => matchesFilter(item.session.school))
		};
	}, [
		comparisonOwnerFilter,
		ownerForSchool,
		staffingComparison
	]);
	const removedTutorIds = (0, import_react.useMemo)(() => new Set(notes.filter((item) => item.date === activeDate && item.status === "unavailable").map((item) => item.tutorId)), [activeDate, notes]);
	const removedTutors = (0, import_react.useMemo)(() => {
		const currentPeople = new Map([...comparison.unassigned, ...comparison.extra].map((person) => [person.tutorId, person]));
		return notes.filter((item) => item.date === activeDate && item.status === "unavailable").map((note) => {
			const currentPerson = currentPeople.get(note.tutorId);
			const trackedPerson = latestTutorSnapshot?.records.find((record) => record.tutorId === note.tutorId);
			return {
				note,
				tutorId: note.tutorId,
				firstName: currentPerson?.firstName || trackedPerson?.firstName || "",
				lastName: currentPerson?.lastName || trackedPerson?.lastName || "",
				phone: currentPerson?.phone || trackedPerson?.phone || "",
				personStatus: currentPerson?.personStatus || (!latestTutorSnapshot ? "unknown" : trackedPerson ? "tutor" : "candidate")
			};
		}).sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, "fr"));
	}, [
		activeDate,
		comparison,
		latestTutorSnapshot,
		notes
	]);
	const filteredCoverage = (0, import_react.useMemo)(() => {
		const normalizedQuery = query.trim().toLocaleLowerCase("fr");
		const filterPeople = (people) => people.flatMap((tutor) => {
			if (removedTutorIds.has(tutor.tutorId)) return [];
			if (personStatusFilter !== "all" && tutor.personStatus !== personStatusFilter) return [];
			const opportunities = tutor.opportunities.flatMap((row) => {
				if (opportunitySourceFilter !== "both" && !row.sources.includes(opportunitySourceFilter)) return [];
				const owner = ownerForSchool(row.school);
				if (!(schoolOwnerFilter === "all" || schoolOwnerFilter === "unassigned" && !owner || owner === schoolOwnerFilter)) return [];
				return [{
					...row,
					sources: opportunitySourceFilter === "both" ? row.sources : [opportunitySourceFilter],
					validatedInterest: opportunitySourceFilter === "availability" ? false : row.validatedInterest
				}];
			});
			if (!opportunities.length) return [];
			const narrowedTutor = {
				...tutor,
				opportunities
			};
			const matchesSchool = school === "all" || opportunities.some((row) => row.school === school);
			const haystack = [
				tutor.tutorId,
				tutor.firstName,
				tutor.lastName,
				tutor.grade,
				tutor.personStatus,
				...opportunities.flatMap((row) => [
					row.school,
					row.timeSlot,
					row.className,
					row.group,
					...row.sources
				]),
				...tutor.assignments.flatMap((row) => [row.school, row.timeSlot])
			].join(" ").toLocaleLowerCase("fr");
			return matchesSchool && (!normalizedQuery || haystack.includes(normalizedQuery)) ? [narrowedTutor] : [];
		});
		return {
			unassigned: filterPeople(comparison.unassigned),
			extra: filterPeople(comparison.extra)
		};
	}, [
		comparison,
		opportunitySourceFilter,
		ownerForSchool,
		personStatusFilter,
		query,
		removedTutorIds,
		school,
		schoolOwnerFilter
	]);
	const displayed = view === "unassigned" ? filteredCoverage.unassigned : filteredCoverage.extra;
	async function upload(file, kind) {
		if (!file) return;
		setSaving(true);
		setMessage("Import en cours…");
		try {
			const rawCsv = await file.text();
			const endpoint = kind === "availability" ? "/api/availability-imports" : kind === "interests" ? `/api/tutor-interest-imports?fileName=${encodeURIComponent(file.name)}` : `/api/tutor-assignment-imports?fileName=${encodeURIComponent(file.name)}`;
			const response = await fetch(endpoint, kind === "availability" ? {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fileName: file.name,
					rawCsv
				})
			} : {
				method: "POST",
				headers: { "Content-Type": "text/csv;charset=utf-8" },
				body: rawCsv
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Import impossible");
			if (data.import) if (kind === "availability") setAvailabilityData((current) => ({
				...current,
				[data.import.id]: data.import
			}));
			else if (kind === "interests") setInterestData((current) => ({
				...current,
				[data.import.id]: data.import
			}));
			else setAssignmentData((current) => ({
				...current,
				[data.import.id]: data.import
			}));
			await load(true);
			setMessage(kind === "availability" ? "Fichier de disponibilités sauvegardé" : kind === "interests" ? "Fichier d’intérêts sauvegardé" : "Fichier de séances affectées sauvegardé");
		} catch (error) {
			setMessage(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Import non sauvegardé");
		} finally {
			setSaving(false);
		}
	}
	async function saveNote(tutorId) {
		if (!activeDate) return;
		const draft = noteDrafts[`${activeDate}:${tutorId}`] ?? {
			status: "to-check",
			note: ""
		};
		setSaving(true);
		try {
			const response = await fetch("/api/tutor-coverage-notes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					tutorId,
					date: activeDate,
					status: draft.status,
					note: draft.note
				})
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Sauvegarde impossible");
			setNotes(data.notes ?? []);
			setMessage("Suivi du tuteur sauvegardé");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Sauvegarde impossible");
		} finally {
			setSaving(false);
		}
	}
	async function setTutorRemoved(tutorId, removed) {
		if (!activeDate) return;
		const key = `${activeDate}:${tutorId}`;
		const savedNote = notes.find((item) => item.tutorId === tutorId && item.date === activeDate);
		const draft = noteDrafts[key] ?? {
			status: savedNote?.status || "to-check",
			note: savedNote?.note || ""
		};
		setSaving(true);
		try {
			const response = await fetch("/api/tutor-coverage-notes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					tutorId,
					date: activeDate,
					status: removed ? "unavailable" : "to-check",
					note: draft.note
				})
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Sauvegarde impossible");
			setNotes(data.notes ?? []);
			setNoteDrafts((current) => ({
				...current,
				[key]: {
					...draft,
					status: removed ? "unavailable" : "to-check"
				}
			}));
			setMessage(removed ? "Tuteur retiré pour cette date" : "Tuteur réactivé pour cette date");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Sauvegarde impossible");
		} finally {
			setSaving(false);
		}
	}
	function exportResults() {
		const rows = [[
			"Catégorie",
			"Date",
			"ID personne",
			"Statut personne",
			"Prénom",
			"Nom",
			"Téléphone",
			"Grade",
			"Créneaux mobilisables",
			"Sources",
			"Intérêts validés",
			"Séances affectées",
			"Statut de suivi",
			"Commentaire"
		]];
		displayed.forEach((tutor) => rows.push([
			view === "unassigned" ? "Disponible sans séance" : "Disponible sur un autre horaire",
			activeDate,
			tutor.tutorId,
			tutor.personStatus === "tutor" ? "Tuteur" : tutor.personStatus === "candidate" ? "Candidat" : "Statut inconnu",
			tutor.firstName,
			tutor.lastName,
			tutor.phone,
			tutor.grade,
			tutor.opportunities.map((row) => `${row.timeSlot} — ${row.school}`).join(" | "),
			tutor.opportunities.map((row) => row.sources.map((source) => source === "availability" ? "Disponibilité" : "Intérêt").join(" + ")).join(" | "),
			tutor.opportunities.filter((row) => row.validatedInterest).map((row) => row.sessionId || `${row.timeSlot} — ${row.school}`).join(" | "),
			tutor.assignments.map((row) => `${row.timeSlot} — ${row.school}`).join(" | "),
			notes.find((item) => item.tutorId === tutor.tutorId && item.date === activeDate)?.status || "",
			notes.find((item) => item.tutorId === tutor.tutorId && item.date === activeDate)?.note || ""
		]));
		const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell$3).join(";")).join("\r\n")}`], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `tuteurs-dispo-sans-seance-${activeDate || "date"}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "task-panel coverage-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Croisement staffing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: toolView === "coverage" ? "Tuteurs disponibles sans séance" : "Comparer deux staffings" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: toolView === "coverage" ? "Repérez les tuteurs mobilisables et les établissements qui ont encore des séances à staffer." : "Comparez deux exports Prix des tuteurs pour une date précise." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ghost-button",
					onClick: () => void load(),
					disabled: saving,
					children: "↻ Actualiser"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "coverage-tool-tabs",
				role: "tablist",
				"aria-label": "Outils de disponibilité des tuteurs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: toolView === "coverage" ? "active" : "",
					onClick: () => setToolView("coverage"),
					children: "Disponibilités ↔ staffing"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: toolView === "staffing-comparison" ? "active" : "",
					onClick: () => setToolView("staffing-comparison"),
					children: "Comparer deux staffings"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "coverage-upload-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Fichier de disponibilités" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Réutilise les imports de Comparaison dispos." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "import-button",
						children: ["Importer", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: ".csv,text/csv",
							disabled: saving,
							onChange: (event) => {
								upload(event.target.files?.[0], "availability");
								event.currentTarget.value = "";
							}
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Intérêts tuteurs et candidats" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Personnes intéressées par une séance." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "import-button",
						children: ["Importer", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: ".csv,text/csv",
							disabled: saving,
							onChange: (event) => {
								upload(event.target.files?.[0], "interests");
								event.currentTarget.value = "";
							}
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Séances affectées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Export Prix des tuteurs." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "import-button",
						children: ["Importer", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: ".csv,text/csv",
							disabled: saving,
							onChange: (event) => {
								upload(event.target.files?.[0], "assignments");
								event.currentTarget.value = "";
							}
						})]
					})] })
				]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "enrollment-message",
				children: message
			}) : null,
			toolView === "staffing-comparison" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "staffing-comparison-controls",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Fichier 1 · référence", !assignmentImports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "source-files-link",
							onClick: () => onOpenFiles("assignments"),
							children: "Ouvrir Fichiers"
						}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: compareReferenceId,
							onChange: (event) => {
								setCompareReferenceId(event.target.value);
								setComparisonDate("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Sélectionner"
							}), assignmentImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: item.id,
								children: [
									item.displayName,
									" · ",
									importDate(item.importedAt)
								]
							}, item.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							children: "→"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Fichier 2 · plus récent", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: compareRecentId,
							onChange: (event) => {
								setCompareRecentId(event.target.value);
								setComparisonDate("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Sélectionner"
							}), assignmentImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: item.id,
								children: [
									item.displayName,
									" · ",
									importDate(item.importedAt)
								]
							}, item.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Date à comparer", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: activeComparisonDate,
							onChange: (event) => setComparisonDate(event.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Aucune date disponible"
							}), comparisonDates.map((date) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: date,
								children: fullDate$1(date)
							}, date))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Responsable RH", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: comparisonOwnerFilter,
							onChange: (event) => setComparisonOwnerFilter(event.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "Tous"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "kelly",
									children: "Kelly"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "pierre",
									children: "Pierre"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "julie",
									children: "Julie"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "unassigned",
									children: "Non attribués"
								})
							]
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "staffing-comparison-note",
					children: "Une séance est reconnue par sa date, son établissement, son horaire et sa catégorie. Les doublons de groupes sont regroupés."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "staffing-comparison-summary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Séances fichier 1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: staffingComparison.referenceSessionCount })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Séances fichier 2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: staffingComparison.recentSessionCount })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tuteurs fichier 1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: staffingComparison.referenceTutorCount })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tuteurs fichier 2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: staffingComparison.recentTutorCount })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "added",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tuteurs en plus" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["+", staffingComparison.added.length] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "removed",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tuteurs en moins" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["−", staffingComparison.removed.length] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "changed",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Séances modifiées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: staffingComparison.changed.length })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "staffing-rh-summary",
					"aria-label": `Évolution du staffing par responsable pour ${activeComparisonDate || "la date sélectionnée"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "staffing-rh-summary-title",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Évolution par responsable RH" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: activeComparisonDate ? fullDate$1(activeComparisonDate) : "Choisissez une date" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "staffing-rh-summary-head",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Responsable" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "En plus" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "En moins" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Changements" })
							]
						}),
						staffingComparisonByOwner.summary.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: (comparisonOwnerFilter === "unassigned" ? !row.owner : comparisonOwnerFilter === row.owner) ? "active" : "",
							onClick: () => setComparisonOwnerFilter(row.owner || "unassigned"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: schoolOwnerLabels$2[row.owner] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "positive",
									children: ["+", row.added]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "negative",
									children: ["−", row.removed]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "changed",
									children: row.changed
								})
							]
						}, row.owner || "unassigned")),
						comparisonOwnerFilter !== "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "staffing-rh-show-all",
							onClick: () => setComparisonOwnerFilter("all"),
							children: "Afficher tous les responsables"
						}) : null
					]
				}),
				detailError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state compact",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Fichier sélectionné indisponible" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: detailError }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "button quiet",
							onClick: () => {
								setDetailError("");
								setDetailRetry((value) => value + 1);
							},
							children: "Réessayer"
						})
					]
				}) : loadingDetails ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "empty-state compact",
					children: "Chargement des fichiers sélectionnés…"
				}) : !compareReferenceImport || !compareRecentImport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state compact",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Deux exports de séances affectées sont nécessaires" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "button quiet",
						onClick: () => onOpenFiles("assignments"),
						children: "Ouvrir Fichiers"
					})]
				}) : !activeComparisonDate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "empty-state compact",
					children: "Aucune date n’est disponible dans ces fichiers."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "staffing-comparison-results",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: ["Changements de tuteur ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: staffingComparisonByOwner.changed.length })] }), staffingComparisonByOwner.changed.length ? staffingComparisonByOwner.changed.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-session",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.session.timeSlot }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
										schoolId: schoolRecordForName(item.session.school)?.externalId,
										children: item.session.school
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										item.session.category || "Catégorie non précisée",
										" · RH : ",
										schoolOwnerLabels$2[ownerForSchool(item.session.school)]
									] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-change before",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Avant" }), item.before.map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									tutorLabel(tutor, tutor.tutorId),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										"#",
										tutor.tutorId,
										tutor.phone ? ` · ${tutor.phone}` : ""
									] })
								] }, tutor.tutorId))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-change after",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Après" }), item.after.map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									tutorLabel(tutor, tutor.tutorId),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										"#",
										tutor.tutorId,
										tutor.phone ? ` · ${tutor.phone}` : ""
									] })
								] }, tutor.tutorId))]
							})
						] }, item.session.key)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aucun remplacement détecté pour ce responsable." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: ["Tuteurs ajoutés ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: staffingComparisonByOwner.added.length })] }), staffingComparisonByOwner.added.length ? staffingComparisonByOwner.added.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "staffing-session",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.session.timeSlot }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
									schoolId: schoolRecordForName(item.session.school)?.externalId,
									children: item.session.school
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
									item.session.category || "Catégorie non précisée",
									" · RH : ",
									schoolOwnerLabels$2[ownerForSchool(item.session.school)]
								] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "staffing-change after",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								tutorLabel(item.tutor, item.tutor.tutorId),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
									"#",
									item.tutor.tutorId,
									item.tutor.phone ? ` · ${item.tutor.phone}` : ""
								] })
							] })
						})] }, `${item.session.key}-${item.tutor.tutorId}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aucun tuteur ajouté pour ce responsable." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: ["Tuteurs retirés ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: staffingComparisonByOwner.removed.length })] }), staffingComparisonByOwner.removed.length ? staffingComparisonByOwner.removed.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "staffing-session",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.session.timeSlot }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
									schoolId: schoolRecordForName(item.session.school)?.externalId,
									children: item.session.school
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
									item.session.category || "Catégorie non précisée",
									" · RH : ",
									schoolOwnerLabels$2[ownerForSchool(item.session.school)]
								] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "staffing-change before",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								tutorLabel(item.tutor, item.tutor.tutorId),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
									"#",
									item.tutor.tutorId,
									item.tutor.phone ? ` · ${item.tutor.phone}` : ""
								] })
							] })
						})] }, `${item.session.key}-${item.tutor.tutorId}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aucun tuteur retiré pour ce responsable." })] })
					]
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "coverage-controls",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Disponibilités", !availabilityImports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "source-files-link",
							onClick: () => onOpenFiles("availability"),
							children: "Ouvrir Fichiers"
						}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: availabilityId,
							onChange: (event) => {
								setAvailabilityId(event.target.value);
								setSelectedDate("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Sélectionner"
							}), availabilityImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: item.id,
								children: [
									item.displayName,
									" · ",
									importDate(item.importedAt)
								]
							}, item.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Intérêts", !interestImports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "source-files-link",
							onClick: () => onOpenFiles("interests"),
							children: "Ouvrir Fichiers"
						}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: interestId,
							onChange: (event) => {
								setInterestId(event.target.value);
								setSelectedDate("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Aucun"
							}), interestImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: item.id,
								children: [
									item.displayName,
									" · ",
									importDate(item.importedAt)
								]
							}, item.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Séances affectées", !assignmentImports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "source-files-link",
							onClick: () => onOpenFiles("assignments"),
							children: "Ouvrir Fichiers"
						}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: assignmentId,
							onChange: (event) => {
								setAssignmentId(event.target.value);
								setSelectedDate("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Sélectionner"
							}), assignmentImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: item.id,
								children: [
									item.displayName,
									" · ",
									importDate(item.importedAt)
								]
							}, item.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Semaines à venir", !upcomingSessionImports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "source-files-link",
							onClick: () => onOpenFiles("upcomingSessions"),
							children: "Ouvrir Fichiers"
						}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: upcomingSessionId,
							onChange: (event) => setUpcomingSessionId(event.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Aucun fichier"
							}), upcomingSessionImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: item.id,
								children: [
									item.displayName,
									" · ",
									importDate(item.importedAt)
								]
							}, item.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Date à analyser", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: activeDate,
							onChange: (event) => setSelectedDate(event.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Aucune date disponible"
							}), analysisDates.map((date) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: date,
								children: fullDate$1(date)
							}, date))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Responsable", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: schoolOwnerFilter,
							onChange: (event) => setSchoolOwnerFilter(event.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "unassigned",
									children: "Non attribués"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "kelly",
									children: "Kelly"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "pierre",
									children: "Pierre"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "julie",
									children: "Julie"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "Tous"
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Établissement", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: school,
							onChange: (event) => setSchool(event.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Tous"
							}), schoolOptions.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: name }, name))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Recherche", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Tuteur, ID, établissement…"
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "staffing-comparison-note",
					children: [
						"Les créneaux qui chevauchent une séance affectée sont masqués. ",
						latestTutorSnapshot ? `Statuts déterminés avec la liste des tuteurs du ${fullDate$1(latestTutorSnapshot.date)}.` : "Aucune liste de tuteurs disponible : les statuts restent inconnus.",
						" ",
						loadingUpcomingSessions ? "Calcul des séances non staffées…" : activeUpcomingSessionImport ? `Séances non staffées calculées avec « ${activeUpcomingSessionImport.displayName} ».` : "Choisissez un fichier Semaines à venir pour afficher les séances non staffées."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "availability-tabs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: view === "unassigned" ? "active" : "",
							onClick: () => setView("unassigned"),
							children: [
								"Sans séance (",
								filteredCoverage.unassigned.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: view === "extra" ? "active" : "",
							onClick: () => setView("extra"),
							children: [
								"Autres horaires (",
								filteredCoverage.extra.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "coverage-status-filters",
							role: "group",
							"aria-label": "Filtrer par statut",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: personStatusFilter === "all" ? "active" : "",
									onClick: () => setPersonStatusFilter("all"),
									children: "Tous"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: personStatusFilter === "tutor" ? "active" : "",
									onClick: () => setPersonStatusFilter("tutor"),
									children: "Tuteurs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: personStatusFilter === "candidate" ? "active" : "",
									onClick: () => setPersonStatusFilter("candidate"),
									children: "Candidats"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: personStatusFilter === "unknown" ? "active" : "",
									onClick: () => setPersonStatusFilter("unknown"),
									children: "Inconnus"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "coverage-source-filters",
							role: "group",
							"aria-label": "Filtrer par source",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: opportunitySourceFilter === "both" ? "active" : "",
									onClick: () => setOpportunitySourceFilter("both"),
									children: "Toutes les sources"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: opportunitySourceFilter === "availability" ? "active" : "",
									onClick: () => setOpportunitySourceFilter("availability"),
									children: "Disponibilités"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: opportunitySourceFilter === "interest" ? "active" : "",
									onClick: () => setOpportunitySourceFilter("interest"),
									children: "Intérêts"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: showRemovedTutors ? "active" : "",
							onClick: () => setShowRemovedTutors((current) => !current),
							children: [
								"Tuteurs retirés (",
								removedTutors.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ghost-button",
							onClick: exportResults,
							disabled: !displayed.length,
							children: "Export CSV"
						})
					]
				}),
				showRemovedTutors ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "coverage-removed-list",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "coverage-removed-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["Tuteurs retirés pour le ", activeDate ? fullDate$1(activeDate) : "jour sélectionné"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ils resteront masqués pour cette date lors des prochains imports." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-button",
							onClick: () => setShowRemovedTutors(false),
							children: "Fermer"
						})]
					}), removedTutors.length ? removedTutors.map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "coverage-removed-person",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAdminLink, {
								personId: tutor.tutorId,
								status: tutor.personStatus,
								children: `${tutor.firstName} ${tutor.lastName}`.trim() || `ID ${tutor.tutorId}`
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"ID ",
								tutor.tutorId,
								tutor.phone ? ` · ${tutor.phone}` : ""
							] }),
							tutor.note.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: tutor.note.note }) : null
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "button quiet",
							onClick: () => void setTutorRemoved(tutor.tutorId, false),
							disabled: saving,
							children: "Réactiver"
						})]
					}, tutor.tutorId)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aucun tuteur retiré pour cette date." })]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "coverage-results",
					children: detailError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "empty-state compact",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Fichier sélectionné indisponible" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: detailError }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "button quiet",
								onClick: () => {
									setDetailError("");
									setDetailRetry((value) => value + 1);
								},
								children: "Réessayer"
							})
						]
					}) : loadingDetails ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "empty-state compact",
						children: "Chargement des fichiers sélectionnés…"
					}) : !availabilityImport && !interestImport || !assignmentImport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "empty-state compact",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Sources de comparaison manquantes" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Choisissez au moins un fichier de disponibilités ou d’intérêts, ainsi qu’un fichier de séances affectées." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "button quiet",
								onClick: () => onOpenFiles(!assignmentImports.length ? "assignments" : "availability"),
								children: "Ouvrir Fichiers"
							})
						]
					}) : !activeDate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "empty-state compact",
						children: "Aucune date n’est présente dans les sources sélectionnées."
					}) : displayed.length ? displayed.map((tutor) => {
						const noteKey = `${activeDate}:${tutor.tutorId}`;
						const savedNote = notes.find((item) => item.tutorId === tutor.tutorId && item.date === activeDate);
						const noteDraft = noteDrafts[noteKey] ?? {
							status: savedNote?.status || "to-check",
							note: savedNote?.note || ""
						};
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: `coverage-card ${view}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "coverage-person",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAdminLink, {
											personId: tutor.tutorId,
											status: tutor.personStatus,
											children: `${tutor.firstName} ${tutor.lastName}`.trim() || tutor.tutorId
										}),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `person-status ${tutor.personStatus}`,
											children: tutor.personStatus === "tutor" ? "Tuteur" : tutor.personStatus === "candidate" ? "Candidat" : "Statut inconnu"
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										"ID ",
										tutor.tutorId,
										tutor.phone ? ` · ${tutor.phone}` : "",
										tutor.grade ? ` · ${tutor.grade}` : ""
									] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "coverage-remove-button",
										onClick: () => void setTutorRemoved(tutor.tutorId, true),
										disabled: saving,
										"aria-label": `Retirer ${`${tutor.firstName} ${tutor.lastName}`.trim() || tutor.tutorId} pour cette date`,
										title: "Retirer ce tuteur pour cette date",
										children: "×"
									})]
								}),
								tutor.assignments.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "coverage-slots assigned",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Autre(s) séance(s) ce jour" }), tutor.assignments.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										row.timeSlot,
										" · ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
											schoolId: schoolRecordForName(row.school)?.externalId,
											children: row.school || "Établissement non précisé"
										})
									] }, `${row.timeSlot}-${row.school}-${index}`))]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "coverage-slots assigned empty",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Aucune séance affectée" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "coverage-slots available",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Créneau(x) mobilisable(s) sans chevauchement" }),
										tutor.opportunities.slice(0, 8).map((row, index) => {
											const unstaffedCount = unstaffedCountForSchool(row.school);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "coverage-opportunity",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "coverage-opportunity-school",
													title: `${row.timeSlot || "Horaire non précisé"} · ${row.school || "Établissement non précisé"} · ${schoolOwnerLabels$2[ownerForSchool(row.school)]}`,
													children: [
														row.timeSlot || "Horaire non précisé",
														" · ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
															schoolId: schoolRecordForName(row.school)?.externalId,
															children: row.school || "Établissement non précisé"
														}),
														" · ",
														schoolOwnerLabels$2[ownerForSchool(row.school)]
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "coverage-opportunity-meta",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [row.sources.map((source) => source === "availability" ? "Disponibilité" : "Intérêt").join(" + "), row.validatedInterest ? " · validé" : ""] }), activeUpcomingSessionImport ? unstaffedCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
														className: "coverage-unstaffed-link",
														href: unstaffedLinkForSchool(row.school),
														children: [
															unstaffedCount,
															" séance",
															unstaffedCount > 1 ? "s" : "",
															" non staffée",
															unstaffedCount > 1 ? "s" : ""
														]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "coverage-unstaffed-none",
														children: "Aucune séance non staffée"
													}) : null]
												})]
											}, `${row.sessionId}-${row.timeSlot}-${index}`);
										}),
										tutor.opportunities.length > 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
											"+ ",
											tutor.opportunities.length - 8,
											" autre(s)"
										] }) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "coverage-note-editor",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: noteDraft.status,
											onChange: (event) => setNoteDrafts((current) => ({
												...current,
												[noteKey]: {
													...noteDraft,
													status: event.target.value
												}
											})),
											"aria-label": `Statut de ${tutor.firstName} ${tutor.lastName}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "to-check",
													children: "À vérifier"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "unavailable",
													children: "N’est plus disponible"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "confirmed",
													children: "Disponibilité confirmée"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "contacted",
													children: "Contacté"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: noteDraft.note,
											onChange: (event) => setNoteDrafts((current) => ({
												...current,
												[noteKey]: {
													...noteDraft,
													note: event.target.value
												}
											})),
											placeholder: "Commentaire pour cette personne et cette date…"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "text-button",
											onClick: () => void saveNote(tutor.tutorId),
											disabled: saving,
											children: "Enregistrer"
										})
									]
								})
							]
						}, tutor.tutorId);
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "empty-state compact",
						children: "Aucune personne mobilisable ne correspond aux critères."
					})
				})
			] })
		]
	});
}
//#endregion
//#region app/components/unstaffed-sessions.tsx
function initialDateFilter() {
	if (typeof window === "undefined") return "all";
	const value = new URL(window.location.href).searchParams.get("date-seances") || "";
	return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "all";
}
function initialOwnerFilter() {
	if (typeof window === "undefined") return "all";
	const value = new URL(window.location.href).searchParams.get("responsable");
	return value === "unassigned" || value === "kelly" || value === "pierre" || value === "julie" ? value : "all";
}
function initialImportFilter() {
	if (typeof window === "undefined") return "";
	return new URL(window.location.href).searchParams.get("fichier-seances") || "";
}
function initialSchoolQuery() {
	if (typeof window === "undefined") return "";
	return new URL(window.location.href).searchParams.get("recherche-seances") || "";
}
var schoolOwnerLabels$1 = {
	"": "Non attribué",
	kelly: "Kelly",
	pierre: "Pierre",
	julie: "Julie"
};
var categoryLabels$1 = {
	alpha: "Étude Alpha",
	surveillance: "Surveillance",
	service: "Prestation de service"
};
function sessionCategoryKey(value) {
	const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
	if (normalized.includes("alpha")) return "alpha";
	if (normalized.includes("surveillance")) return "surveillance";
	return "service";
}
function sourceExclusionKey(sessionId, personId, source) {
	return `${sessionId}:${personId.trim()}:${source}`;
}
function normalizedSchoolName$1(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}
function formatDate$3(value, long = false) {
	const date = /* @__PURE__ */ new Date(`${value}T12:00:00`);
	return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", long ? {
		weekday: "long",
		day: "numeric",
		month: "long"
	} : {
		day: "2-digit",
		month: "2-digit"
	}).format(date);
}
function formatImportDate$1(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "short",
		timeStyle: "short"
	}).format(date);
}
function csvCell$2(value) {
	const text = String(value ?? "");
	return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}
function timeRange$1(value, fallbackEnd = "") {
	const parts = `${value} ${fallbackEnd}`.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g) ?? [];
	const toMinutes = (part) => {
		const [hours, minutes] = part.split(":").map(Number);
		return hours * 60 + minutes;
	};
	return parts.length >= 2 ? [toMinutes(parts[0]), toMinutes(parts[1])] : null;
}
function rangesOverlap(session, assignment) {
	const sessionRange = timeRange$1(session.startTime, session.endTime);
	const assignmentRange = timeRange$1(assignment.timeSlot);
	return Boolean(sessionRange && assignmentRange && sessionRange[0] < assignmentRange[1] && assignmentRange[0] < sessionRange[1]);
}
function UnstaffedSessions({ onOpenFiles }) {
	const [imports, setImports] = (0, import_react.useState)([]);
	const [interestImports, setInterestImports] = (0, import_react.useState)([]);
	const [availabilityImports, setAvailabilityImports] = (0, import_react.useState)([]);
	const [assignmentImports, setAssignmentImports] = (0, import_react.useState)([]);
	const [sessionData, setSessionData] = (0, import_react.useState)({});
	const [interestData, setInterestData] = (0, import_react.useState)({});
	const [availabilityData, setAvailabilityData] = (0, import_react.useState)({});
	const [assignmentData, setAssignmentData] = (0, import_react.useState)({});
	const [latestTutorSnapshot, setLatestTutorSnapshot] = (0, import_react.useState)(null);
	const [selectedImportId, setSelectedImportId] = (0, import_react.useState)(initialImportFilter);
	const [interestImportId, setInterestImportId] = (0, import_react.useState)("");
	const [availabilityImportId, setAvailabilityImportId] = (0, import_react.useState)("");
	const [assignmentImportId, setAssignmentImportId] = (0, import_react.useState)("");
	const [selectedDate, setSelectedDate] = (0, import_react.useState)(initialDateFilter);
	const [query, setQuery] = (0, import_react.useState)(initialSchoolQuery);
	const [selectedCategories, setSelectedCategories] = (0, import_react.useState)([
		"alpha",
		"surveillance",
		"service"
	]);
	const [shownSingleStudentAlphaDates, setShownSingleStudentAlphaDates] = (0, import_react.useState)([]);
	const [exclusions, setExclusions] = (0, import_react.useState)({
		sessionIds: [],
		sourceKeys: [],
		updatedAt: ""
	});
	const [schoolAssignments, setSchoolAssignments] = (0, import_react.useState)([]);
	const [deselectedNewSchoolIds, setDeselectedNewSchoolIds] = (0, import_react.useState)([]);
	const [schoolOwnerFilter, setSchoolOwnerFilter] = (0, import_react.useState)(initialOwnerFilter);
	const [showHiddenItems, setShowHiddenItems] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const [detailError, setDetailError] = (0, import_react.useState)("");
	const [detailRetry, setDetailRetry] = (0, import_react.useState)(0);
	const load = (0, import_react.useCallback)(async (silent = false) => {
		const results = await Promise.allSettled([
			["Semaines à venir", "/api/upcoming-session-imports?summary=1"],
			["Intérêts", "/api/tutor-interest-imports?summary=1"],
			["Disponibilités", "/api/availability-imports?summary=1"],
			["Séances affectées", "/api/tutor-assignment-imports?summary=1"],
			["Liste des tuteurs", "/api/tutor-tracking?latest=1"],
			["Éléments masqués", "/api/unstaffed-exclusions"],
			["Établissements", "/api/schools"]
		].map(async ([label, endpoint]) => {
			const response = await fetch(endpoint, { cache: "no-store" });
			const payload = await response.json();
			if (!response.ok) throw new Error(`${label} : ${payload.detail || payload.error || "chargement impossible"}`);
			return payload;
		}));
		const errors = results.flatMap((result) => result.status === "rejected" ? [result.reason instanceof Error ? result.reason.message : "Chargement impossible"] : []);
		if (results[0]?.status === "fulfilled") {
			const next = results[0].value.imports ?? [];
			setImports(next);
			setSelectedImportId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || "");
		}
		if (results[1]?.status === "fulfilled") {
			const next = results[1].value.imports ?? [];
			setInterestImports(next);
			setInterestImportId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || "");
		}
		if (results[2]?.status === "fulfilled") {
			const next = results[2].value.imports ?? [];
			setAvailabilityImports(next);
			setAvailabilityImportId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || "");
		}
		if (results[3]?.status === "fulfilled") {
			const next = results[3].value.imports ?? [];
			setAssignmentImports(next);
			setAssignmentImportId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || "");
		}
		if (results[4]?.status === "fulfilled") setLatestTutorSnapshot(results[4].value.snapshot ?? null);
		if (results[5]?.status === "fulfilled") setExclusions(results[5].value.exclusions ?? {
			sessionIds: [],
			sourceKeys: [],
			updatedAt: ""
		});
		if (results[6]?.status === "fulfilled") setSchoolAssignments(results[6].value.schools ?? []);
		setMessage(errors.length ? errors.join(" · ") : silent ? "" : "Données actualisées");
	}, []);
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(() => void load(true), 0);
		const refresh = window.setInterval(() => void load(true), 3e4);
		return () => {
			window.clearTimeout(timer);
			window.clearInterval(refresh);
		};
	}, [load]);
	(0, import_react.useEffect)(() => {
		const url = new URL(window.location.href);
		if (selectedDate === "all") url.searchParams.delete("date-seances");
		else url.searchParams.set("date-seances", selectedDate);
		if (schoolOwnerFilter === "all") url.searchParams.delete("responsable");
		else url.searchParams.set("responsable", schoolOwnerFilter);
		if (selectedImportId) url.searchParams.set("fichier-seances", selectedImportId);
		else url.searchParams.delete("fichier-seances");
		if (query.trim()) url.searchParams.set("recherche-seances", query.trim());
		else url.searchParams.delete("recherche-seances");
		window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
	}, [
		query,
		schoolOwnerFilter,
		selectedDate,
		selectedImportId
	]);
	(0, import_react.useEffect)(() => {
		const requests = [
			selectedImportId && !sessionData[selectedImportId] ? [
				"sessions",
				selectedImportId,
				"/api/upcoming-session-imports"
			] : null,
			interestImportId && !interestData[interestImportId] ? [
				"interests",
				interestImportId,
				"/api/tutor-interest-imports"
			] : null,
			availabilityImportId && !availabilityData[availabilityImportId] ? [
				"availability",
				availabilityImportId,
				"/api/availability-imports"
			] : null,
			assignmentImportId && !assignmentData[assignmentImportId] ? [
				"assignments",
				assignmentImportId,
				"/api/tutor-assignment-imports"
			] : null
		].filter(Boolean);
		if (!requests.length) return;
		let cancelled = false;
		Promise.all(requests.map(async ([kind, id, endpoint]) => {
			const response = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { cache: "no-store" });
			const data = await response.json();
			if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Fichier sélectionné indisponible");
			return {
				kind,
				item: data.import
			};
		})).then((items) => {
			if (cancelled) return;
			items.forEach(({ kind, item }) => {
				if (kind === "sessions") setSessionData((current) => ({
					...current,
					[item.id]: item
				}));
				else if (kind === "interests") setInterestData((current) => ({
					...current,
					[item.id]: item
				}));
				else if (kind === "availability") setAvailabilityData((current) => ({
					...current,
					[item.id]: item
				}));
				else setAssignmentData((current) => ({
					...current,
					[item.id]: item
				}));
			});
			setDetailError("");
			setMessage("");
		}).catch((error) => {
			if (!cancelled) {
				const text = error instanceof Error ? error.message : "Chargement impossible";
				setDetailError(text);
				setMessage(text);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [
		assignmentData,
		assignmentImportId,
		availabilityData,
		availabilityImportId,
		detailRetry,
		interestData,
		interestImportId,
		selectedImportId,
		sessionData
	]);
	const activeImport = sessionData[selectedImportId] ?? null;
	const activeInterestImport = interestData[interestImportId] ?? null;
	const activeAvailabilityImport = availabilityData[availabilityImportId] ?? null;
	const activeAssignmentImport = assignmentData[assignmentImportId] ?? null;
	const loadingDetails = !detailError && Boolean(selectedImportId && !activeImport || interestImportId && !activeInterestImport || availabilityImportId && !activeAvailabilityImport || assignmentImportId && !activeAssignmentImport);
	const dates = (0, import_react.useMemo)(() => Array.from(new Set((activeImport?.rows ?? []).map((row) => row.date))).sort(), [activeImport]);
	const schoolOwnerIndexes = (0, import_react.useMemo)(() => ({
		byId: new Map(schoolAssignments.filter((school) => school.externalId).map((school) => [school.externalId, school.portfolioOwner])),
		byName: new Map(schoolAssignments.map((school) => [normalizedSchoolName$1(school.name), school.portfolioOwner]))
	}), [schoolAssignments]);
	const ownerForSchool = (0, import_react.useCallback)((schoolId, schoolName) => schoolOwnerIndexes.byId.get(schoolId) ?? schoolOwnerIndexes.byName.get(normalizedSchoolName$1(schoolName)) ?? "", [schoolOwnerIndexes]);
	const ownerForSession = (0, import_react.useCallback)((row) => ownerForSchool(row.schoolId, row.school), [ownerForSchool]);
	const staffedSessionsByOwner = (0, import_react.useMemo)(() => {
		const counts = {
			"": 0,
			kelly: 0,
			pierre: 0,
			julie: 0
		};
		if (activeImport?.schoolStaffing?.length) activeImport.schoolStaffing.forEach((school) => {
			if (selectedDate !== "all" && school.date !== selectedDate) return;
			counts[ownerForSchool(school.schoolId, school.name)] += school.staffedSessions;
		});
		else {
			const seen = /* @__PURE__ */ new Set();
			(activeAssignmentImport?.rows ?? []).forEach((row) => {
				if (row.absent || selectedDate !== "all" && row.date !== selectedDate) return;
				const key = [
					row.date,
					normalizedSchoolName$1(row.school),
					row.timeSlot,
					row.category || ""
				].join("|");
				if (seen.has(key)) return;
				seen.add(key);
				counts[ownerForSchool("", row.school)] += 1;
			});
		}
		return counts;
	}, [
		activeAssignmentImport,
		activeImport,
		ownerForSchool,
		selectedDate
	]);
	const newSchoolCandidates = (0, import_react.useMemo)(() => {
		const existingIds = new Set(schoolAssignments.map((school) => school.externalId).filter(Boolean));
		return (activeImport?.schools ?? []).filter((school) => school.schoolId && !existingIds.has(school.schoolId));
	}, [activeImport, schoolAssignments]);
	const schoolsWithoutId = (0, import_react.useMemo)(() => (activeImport?.schools ?? []).filter((school) => !school.schoolId), [activeImport]);
	const selectedNewSchoolIds = (0, import_react.useMemo)(() => newSchoolCandidates.map((school) => school.schoolId).filter((schoolId) => !deselectedNewSchoolIds.includes(schoolId)), [deselectedNewSchoolIds, newSchoolCandidates]);
	const filteredRowsBeforeDateAndOwner = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLocaleLowerCase("fr");
		return (activeImport?.rows ?? []).filter((row) => {
			if (exclusions.sessionIds.includes(row.sessionId)) return false;
			if (!selectedCategories.includes(sessionCategoryKey(row.category))) return false;
			if (!needle) return true;
			return [
				row.school,
				row.schoolId,
				row.category,
				row.group,
				row.room,
				row.sessionId,
				...row.classes
			].join(" ").toLocaleLowerCase("fr").includes(needle);
		});
	}, [
		activeImport,
		exclusions.sessionIds,
		query,
		selectedCategories
	]);
	const filteredRowsBeforeSingleStudentRule = (0, import_react.useMemo)(() => filteredRowsBeforeDateAndOwner.filter((row) => {
		const owner = ownerForSession(row);
		if (schoolOwnerFilter === "unassigned" ? Boolean(owner) : schoolOwnerFilter !== "all" && owner !== schoolOwnerFilter) return false;
		return selectedDate === "all" || row.date === selectedDate;
	}), [
		filteredRowsBeforeDateAndOwner,
		ownerForSession,
		schoolOwnerFilter,
		selectedDate
	]);
	const visibleRows = (0, import_react.useMemo)(() => filteredRowsBeforeSingleStudentRule.filter((row) => {
		return !(sessionCategoryKey(row.category) === "alpha" && row.studentCount === 1) || shownSingleStudentAlphaDates.includes(row.date);
	}), [filteredRowsBeforeSingleStudentRule, shownSingleStudentAlphaDates]);
	const matrixVisibleRows = (0, import_react.useMemo)(() => filteredRowsBeforeDateAndOwner.filter((row) => {
		return !(sessionCategoryKey(row.category) === "alpha" && row.studentCount === 1) || shownSingleStudentAlphaDates.includes(row.date);
	}), [filteredRowsBeforeDateAndOwner, shownSingleStudentAlphaDates]);
	const unstaffedMatrix = (0, import_react.useMemo)(() => {
		const matrixOwners = [
			"",
			"kelly",
			"pierre",
			"julie"
		];
		const buildCounts = (rows) => {
			const counts = {
				"": 0,
				kelly: 0,
				pierre: 0,
				julie: 0
			};
			rows.forEach((row) => {
				counts[ownerForSession(row)] += 1;
			});
			return counts;
		};
		return {
			owners: matrixOwners,
			totals: buildCounts(matrixVisibleRows),
			total: matrixVisibleRows.length,
			rows: dates.map((date) => {
				const dayRows = matrixVisibleRows.filter((row) => row.date === date);
				return {
					date,
					counts: buildCounts(dayRows),
					total: dayRows.length
				};
			})
		};
	}, [
		dates,
		matrixVisibleRows,
		ownerForSession
	]);
	const sourceIndexes = (0, import_react.useMemo)(() => {
		const interestsBySession = /* @__PURE__ */ new Map();
		const availabilityBySession = /* @__PURE__ */ new Map();
		const assignmentsByTutorDate = /* @__PURE__ */ new Map();
		const currentTutorIds = new Set((latestTutorSnapshot?.records ?? []).map((record) => record.tutorId.trim()).filter(Boolean));
		activeInterestImport?.rows.forEach((row) => interestsBySession.set(row.sessionId, [...interestsBySession.get(row.sessionId) ?? [], row]));
		activeAvailabilityImport?.rows.forEach((row) => row.sessionId && availabilityBySession.set(row.sessionId, [...availabilityBySession.get(row.sessionId) ?? [], row]));
		activeAssignmentImport?.rows.forEach((row) => {
			if (row.absent) return;
			const key = `${row.tutorId}:${row.date}`;
			const existing = assignmentsByTutorDate.get(key) ?? [];
			if (!existing.some((item) => item.school === row.school && item.timeSlot === row.timeSlot)) assignmentsByTutorDate.set(key, [...existing, row]);
		});
		return {
			interestsBySession,
			availabilityBySession,
			assignmentsByTutorDate,
			currentTutorIds
		};
	}, [
		activeAssignmentImport,
		activeAvailabilityImport,
		activeInterestImport,
		latestTutorSnapshot
	]);
	const hiddenItems = (0, import_react.useMemo)(() => {
		const sessionsById = /* @__PURE__ */ new Map();
		imports.forEach((item) => item.rows.forEach((row) => {
			if (!sessionsById.has(row.sessionId)) sessionsById.set(row.sessionId, row);
		}));
		const peopleBySourceKey = /* @__PURE__ */ new Map();
		interestImports.forEach((item) => item.rows.forEach((row) => {
			const key = sourceExclusionKey(row.sessionId, row.personId, "interest");
			if (!peopleBySourceKey.has(key)) peopleBySourceKey.set(key, row);
		}));
		availabilityImports.forEach((item) => item.rows.forEach((row) => {
			const key = sourceExclusionKey(row.sessionId, row.tutorId, "availability");
			if (!peopleBySourceKey.has(key)) peopleBySourceKey.set(key, row);
		}));
		return {
			sessions: exclusions.sessionIds.map((sessionId) => ({
				sessionId,
				session: sessionsById.get(sessionId)
			})),
			sources: exclusions.sourceKeys.map((key) => {
				const [sessionId = "", personId = "", rawSource = ""] = key.split(":");
				return {
					key,
					sessionId,
					personId,
					source: rawSource === "interest" ? "interest" : "availability",
					person: peopleBySourceKey.get(key),
					session: sessionsById.get(sessionId)
				};
			})
		};
	}, [
		availabilityImports,
		exclusions.sessionIds,
		exclusions.sourceKeys,
		imports,
		interestImports
	]);
	const enrichedRows = (0, import_react.useMemo)(() => visibleRows.map((session) => {
		const candidates = /* @__PURE__ */ new Map();
		const addCandidate = (personId, firstName, lastName, phone, source, validatedInterest = false) => {
			if (exclusions.sourceKeys.includes(sourceExclusionKey(session.sessionId, personId, source))) return;
			const existing = candidates.get(personId);
			const assignments = sourceIndexes.assignmentsByTutorDate.get(`${personId}:${session.date}`) ?? [];
			candidates.set(personId, {
				personId,
				firstName: firstName || existing?.firstName || "",
				lastName: lastName || existing?.lastName || "",
				phone: phone || existing?.phone || "",
				sources: Array.from(new Set([...existing?.sources ?? [], source])),
				validatedInterest: validatedInterest || existing?.validatedInterest || false,
				assignments,
				hasConflict: assignments.some((assignment) => rangesOverlap(session, assignment)),
				personStatus: !latestTutorSnapshot || !personId.trim() ? "unknown" : sourceIndexes.currentTutorIds.has(personId.trim()) ? "tutor" : "candidate"
			});
		};
		(sourceIndexes.interestsBySession.get(session.sessionId) ?? []).forEach((row) => addCandidate(row.personId, row.firstName, row.lastName, row.phone, "interest", row.validated));
		(sourceIndexes.availabilityBySession.get(session.sessionId) ?? []).forEach((row) => addCandidate(row.tutorId, row.firstName, row.lastName, row.phone, "availability"));
		return {
			...session,
			candidates: Array.from(candidates.values()).filter((candidate) => !candidate.hasConflict).sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, "fr"))
		};
	}), [
		exclusions.sourceKeys,
		latestTutorSnapshot,
		sourceIndexes,
		visibleRows
	]);
	const groupedRows = (0, import_react.useMemo)(() => {
		const groups = /* @__PURE__ */ new Map();
		filteredRowsBeforeSingleStudentRule.forEach((row) => {
			if (!groups.has(row.date)) groups.set(row.date, []);
		});
		enrichedRows.forEach((row) => groups.set(row.date, [...groups.get(row.date) ?? [], row]));
		return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
	}, [enrichedRows, filteredRowsBeforeSingleStudentRule]);
	const schoolsCount = new Set(visibleRows.map((row) => row.schoolId || row.school)).size;
	const studentsCount = visibleRows.reduce((sum, row) => sum + row.studentCount, 0);
	const sessionsWithCandidates = enrichedRows.filter((row) => row.candidates.length).length;
	const uniqueCandidateCount = new Set(enrichedRows.flatMap((row) => row.candidates.map((candidate) => candidate.personId))).size;
	async function upload(file) {
		if (!file) return;
		setSaving(true);
		setMessage("Import et regroupement des séances…");
		try {
			const rawCsv = await file.text();
			const response = await fetch(`/api/upcoming-session-imports?fileName=${encodeURIComponent(file.name)}`, {
				method: "POST",
				headers: { "Content-Type": "text/csv;charset=utf-8" },
				body: rawCsv
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Import impossible");
			if (data.import) setSessionData((current) => ({
				...current,
				[data.import.id]: data.import
			}));
			await load(true);
			if (data.import?.id) setSelectedImportId(data.import.id);
			setDeselectedNewSchoolIds([]);
			setSelectedDate("all");
			setSchoolOwnerFilter("all");
			setQuery("");
			const detection = data.schoolDetection;
			setMessage(`${data.import?.rows.length ?? 0} séances non affectées sauvegardées${detection ? ` · ${detection.newCount} nouvel${detection.newCount > 1 ? "s" : ""} établissement${detection.newCount > 1 ? "s" : ""} à valider` : ""}. Aucune donnée nominative d’élève n’a été conservée.`);
		} catch (error) {
			setMessage(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Import non sauvegardé");
		} finally {
			setSaving(false);
		}
	}
	async function createSelectedSchools() {
		const selected = newSchoolCandidates.filter((school) => selectedNewSchoolIds.includes(school.schoolId));
		if (!selected.length || saving) return;
		setSaving(true);
		setMessage("Création des établissements sélectionnés…");
		try {
			const response = await fetch("/api/schools", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ schools: selected.map((school) => ({
					externalId: school.schoolId,
					name: school.name,
					categories: school.categories
				})) })
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Création impossible");
			setSchoolAssignments(data.schools ?? schoolAssignments);
			const createdCount = data.created?.length ?? 0;
			setMessage(`${createdCount} établissement${createdCount > 1 ? "s" : ""} créé${createdCount > 1 ? "s" : ""} dans le CRM, sans attribution${data.skippedIds?.length ? ` · ${data.skippedIds.length} déjà existant${data.skippedIds.length > 1 ? "s" : ""}` : ""}`);
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Création impossible");
		} finally {
			setSaving(false);
		}
	}
	async function uploadInterests(file) {
		if (!file) return;
		setSaving(true);
		setMessage("Import des intérêts…");
		try {
			const rawCsv = await file.text();
			const response = await fetch(`/api/tutor-interest-imports?fileName=${encodeURIComponent(file.name)}`, {
				method: "POST",
				headers: { "Content-Type": "text/csv;charset=utf-8" },
				body: rawCsv
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Import impossible");
			if (data.import) setInterestData((current) => ({
				...current,
				[data.import.id]: data.import
			}));
			await load(true);
			if (data.import?.id) setInterestImportId(data.import.id);
			setMessage(`${data.import?.rows.length ?? 0} déclarations d’intérêt sauvegardées`);
		} catch (error) {
			setMessage(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Import non sauvegardé");
		} finally {
			setSaving(false);
		}
	}
	async function saveExclusions(next, successMessage) {
		const previous = exclusions;
		const prepared = {
			...next,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		setExclusions(prepared);
		setSaving(true);
		try {
			const response = await fetch("/api/unstaffed-exclusions", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ exclusions: prepared })
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Sauvegarde impossible");
			setExclusions(data.exclusions ?? prepared);
			setMessage(successMessage);
		} catch (error) {
			setExclusions(previous);
			setMessage(error instanceof Error ? error.message : "Exclusion non sauvegardée");
		} finally {
			setSaving(false);
		}
	}
	function hideSession(sessionId) {
		if (!sessionId || exclusions.sessionIds.includes(sessionId)) return;
		saveExclusions({
			...exclusions,
			sessionIds: [...exclusions.sessionIds, sessionId]
		}, `Séance #${sessionId} masquée, y compris dans les prochains imports`);
	}
	function hideCandidateSource(sessionId, personId, source) {
		const key = sourceExclusionKey(sessionId, personId, source);
		if (exclusions.sourceKeys.includes(key)) return;
		saveExclusions({
			...exclusions,
			sourceKeys: [...exclusions.sourceKeys, key]
		}, `${source === "interest" ? "Intérêt" : "Disponibilité"} masqué${source === "interest" ? "" : "e"} durablement`);
	}
	function restoreAllExclusions() {
		if (!window.confirm("Réafficher toutes les séances, disponibilités et tous les intérêts masqués ?")) return;
		saveExclusions({
			sessionIds: [],
			sourceKeys: [],
			updatedAt: ""
		}, "Tous les éléments masqués sont de nouveau visibles");
	}
	function restoreSession(sessionId) {
		saveExclusions({
			...exclusions,
			sessionIds: exclusions.sessionIds.filter((id) => id !== sessionId)
		}, `Séance #${sessionId} réaffichée`);
	}
	function restoreCandidateSource(key, source) {
		saveExclusions({
			...exclusions,
			sourceKeys: exclusions.sourceKeys.filter((item) => item !== key)
		}, `${source === "interest" ? "Intérêt" : "Disponibilité"} réaffiché${source === "interest" ? "" : "e"}`);
	}
	function toggleCategory(category) {
		setSelectedCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
	}
	function toggleSingleStudentAlphaForDate(date) {
		setShownSingleStudentAlphaDates((current) => current.includes(date) ? current.filter((item) => item !== date) : [...current, date]);
	}
	function exportCsv() {
		const rows = [[
			"Date",
			"Début",
			"Fin",
			"Établissement",
			"Catégorie",
			"Groupe",
			"Classes",
			"Nombre d’élèves",
			"Salle",
			"ID séance",
			"Personnes mobilisables",
			"Statuts",
			"Référence tuteurs",
			"Sources",
			"Autres séances du jour"
		]];
		enrichedRows.forEach((row) => rows.push([
			row.date,
			row.startTime,
			row.endTime,
			row.school,
			row.category,
			row.group,
			row.classes.join(" | "),
			String(row.studentCount),
			row.room,
			row.sessionId,
			row.candidates.map((candidate) => `${candidate.firstName} ${candidate.lastName}`.trim() || candidate.personId).join(" | "),
			row.candidates.map((candidate) => `${candidate.personId}: ${candidate.personStatus === "tutor" ? "Tuteur" : candidate.personStatus === "candidate" ? "Candidat" : "Statut inconnu"}`).join(" | "),
			latestTutorSnapshot?.date || "Aucune liste de référence",
			row.candidates.map((candidate) => `${candidate.personId}: ${candidate.sources.map((source) => source === "interest" ? "Intérêt" : "Disponibilités").join(" + ")}`).join(" | "),
			row.candidates.flatMap((candidate) => candidate.assignments.map((assignment) => `${candidate.personId}: ${assignment.timeSlot} — ${assignment.school}`)).join(" | ")
		]));
		const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell$2).join(";")).join("\r\n")}`], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `seances-non-affectees-${selectedDate === "all" ? "toutes-dates" : selectedDate}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "task-panel unstaffed-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Pilotage des deux semaines"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Séances non affectées" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Une ligne par séance, sans nom d’élève. Les classes sont regroupées automatiquement." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "filters",
					children: [exclusions.sessionIds.length + exclusions.sourceKeys.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `button quiet ${showHiddenItems ? "active" : ""}`,
						onClick: () => setShowHiddenItems((current) => !current),
						disabled: saving,
						children: [
							showHiddenItems ? "Fermer les éléments masqués" : "Voir les éléments masqués",
							" (",
							exclusions.sessionIds.length + exclusions.sourceKeys.length,
							")"
						]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "ghost-button",
						onClick: () => void load(),
						disabled: saving,
						children: "↻ Actualiser"
					})]
				})]
			}),
			showHiddenItems && exclusions.sessionIds.length + exclusions.sourceKeys.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "unstaffed-hidden-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "unstaffed-hidden-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Exclusions durables"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Éléments masqués" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ils restent masqués lors des prochains imports jusqu’à leur réactivation." })
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "button quiet",
						onClick: restoreAllExclusions,
						disabled: saving,
						children: "Tout réafficher"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "unstaffed-hidden-columns",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", { children: ["Séances masquées ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: hiddenItems.sessions.length })] }), hiddenItems.sessions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "unstaffed-hidden-list",
						children: hiddenItems.sessions.map(({ sessionId, session }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
								"#",
								sessionId,
								session?.startTime ? ` · ${session.startTime}–${session.endTime}` : ""
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
								schoolId: session.schoolId,
								children: session.school
							}) : "Séance absente des imports conservés" }),
							session ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
								formatDate$3(session.date, true),
								" · ",
								session.category || "Catégorie non précisée"
							] }) : null
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => restoreSession(sessionId),
							disabled: saving,
							children: "Réafficher"
						})] }, sessionId))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aucune séance masquée." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", { children: ["Disponibilités et intérêts masqués ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: hiddenItems.sources.length })] }), hiddenItems.sources.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "unstaffed-hidden-list",
						children: hiddenItems.sources.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
								item.source === "interest" ? "Intérêt" : "Disponibilité",
								" · ",
								item.person ? `${item.person.firstName} ${item.person.lastName}`.trim() || `ID ${item.personId}` : `ID ${item.personId}`
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Séance #",
								item.sessionId,
								item.session ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
									schoolId: item.session.schoolId,
									children: item.session.school
								})] }) : ""
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: item.person?.phone || "Coordonnées non disponibles dans les imports conservés" })
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => restoreCandidateSource(item.key, item.source),
							disabled: saving,
							children: "Réafficher"
						})] }, item.key))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aucune disponibilité ni aucun intérêt masqué." })] })]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "unstaffed-toolbar",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "import-button",
						children: ["Importer le fichier CSV", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: ".csv,text/csv",
							disabled: saving,
							onChange: (event) => {
								upload(event.target.files?.[0]);
								event.currentTarget.value = "";
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Fichier analysé", !imports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "source-files-link",
						onClick: () => onOpenFiles("upcomingSessions"),
						children: "Ouvrir Fichiers"
					}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: selectedImportId,
						onChange: (event) => {
							setSelectedImportId(event.target.value);
							setSelectedDate("all");
							setSchoolOwnerFilter("all");
							setQuery("");
							setShownSingleStudentAlphaDates([]);
							setDeselectedNewSchoolIds([]);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Aucun fichier"
						}), imports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: item.id,
							children: [
								item.displayName,
								" · ",
								formatImportDate$1(item.importedAt)
							]
						}, item.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "unstaffed-category-filter",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Types de séances" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: Object.keys(categoryLabels$1).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: selectedCategories.includes(item) ? "active" : "",
							onClick: () => toggleCategory(item),
							children: categoryLabels$1[item]
						}, item)) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "unstaffed-owner-filter",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Responsable établissement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: [
							"all",
							"unassigned",
							"kelly",
							"pierre",
							"julie"
						].map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: schoolOwnerFilter === owner ? "active" : "",
							onClick: () => setSchoolOwnerFilter(owner),
							children: owner === "all" ? "Tous" : owner === "unassigned" ? "Non attribués" : schoolOwnerLabels$1[owner]
						}, owner)) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "unstaffed-search",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Recherche" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Établissement, classe, groupe…"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "button quiet",
						onClick: exportCsv,
						disabled: !visibleRows.length,
						children: "Exporter CSV"
					})
				]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "enrollment-message",
				children: message
			}) : null,
			activeImport && (newSchoolCandidates.length > 0 || schoolsWithoutId.length > 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "unstaffed-school-review",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "unstaffed-school-review-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Validation CRM"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Nouveaux établissements détectés" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Comparaison uniquement par ID avec le CRM. Rien n’est créé sans votre validation." })
						] }), newSchoolCandidates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "unstaffed-school-review-actions",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setDeselectedNewSchoolIds([]),
									children: "Tout sélectionner"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setDeselectedNewSchoolIds(newSchoolCandidates.map((school) => school.schoolId)),
									children: "Aucun"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "button primary",
									disabled: saving || !selectedNewSchoolIds.length,
									onClick: () => void createSelectedSchools(),
									children: [
										"Créer les établissements sélectionnés (",
										selectedNewSchoolIds.length,
										")"
									]
								})
							]
						}) : null]
					}),
					newSchoolCandidates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "unstaffed-school-review-list",
						children: newSchoolCandidates.map((school) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: selectedNewSchoolIds.includes(school.schoolId),
							onChange: (event) => setDeselectedNewSchoolIds((current) => event.target.checked ? current.filter((id) => id !== school.schoolId) : Array.from(new Set([...current, school.schoolId])))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: school.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
							"ID ",
							school.schoolId,
							" · ",
							school.categories.join(" · ") || "Catégorie non précisée"
						] })] })] }, school.schoolId))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "unstaffed-school-review-empty",
						children: "Tous les établissements avec un ID sont déjà présents dans le CRM."
					}),
					schoolsWithoutId.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "unstaffed-school-anomalies",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [
							schoolsWithoutId.length,
							" établissement",
							schoolsWithoutId.length > 1 ? "s" : "",
							" sans ID — création impossible"
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: schoolsWithoutId.map((school, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: school.name }, `${school.name}-${index}`)) })]
					}) : null
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "candidate-source-bar",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "candidate-source-title",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Sources des personnes mobilisables" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "L’ID séance relie les intérêts et les disponibilités à chaque séance." }),
							latestTutorSnapshot ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: ["Statuts déterminés avec la liste des tuteurs du ", formatDate$3(latestTutorSnapshot.date)] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Aucune liste de tuteurs : statuts inconnus" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "import-button",
						children: ["Importer des intérêts", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: ".csv,text/csv",
							disabled: saving,
							onChange: (event) => {
								uploadInterests(event.target.files?.[0]);
								event.currentTarget.value = "";
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Intérêts", !interestImports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "source-files-link",
						onClick: () => onOpenFiles("interests"),
						children: "Ouvrir Fichiers"
					}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: interestImportId,
						onChange: (event) => setInterestImportId(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Aucun"
						}), interestImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: item.id,
							children: [
								item.displayName,
								" · ",
								formatImportDate$1(item.importedAt)
							]
						}, item.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Disponibilités", !availabilityImports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "source-files-link",
						onClick: () => onOpenFiles("availability"),
						children: "Ouvrir Fichiers"
					}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: availabilityImportId,
						onChange: (event) => setAvailabilityImportId(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Aucun"
						}), availabilityImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: item.id,
							children: [
								item.displayName,
								" · ",
								formatImportDate$1(item.importedAt)
							]
						}, item.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Séances déjà affectées", !assignmentImports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "source-files-link",
						onClick: () => onOpenFiles("assignments"),
						children: "Ouvrir Fichiers"
					}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: assignmentImportId,
						onChange: (event) => setAssignmentImportId(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Aucun"
						}), assignmentImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: item.id,
							children: [
								item.displayName,
								" · ",
								formatImportDate$1(item.importedAt)
							]
						}, item.id))]
					})] })
				]
			}),
			detailError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "empty-state",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "!" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Fichier sélectionné indisponible" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: detailError }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "button quiet",
						onClick: () => {
							setDetailError("");
							setDetailRetry((value) => value + 1);
						},
						children: "Réessayer"
					})
				]
			}) : loadingDetails ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "empty-state",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⏳" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Chargement du fichier sélectionné…" })]
			}) : activeImport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "unstaffed-summary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "highlight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Séances non affectées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: visibleRows.length })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Jours concernés" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: new Set(visibleRows.map((row) => row.date)).size })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Établissements" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: schoolsCount })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Élèves concernés" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: studentsCount })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "candidate-kpi",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Avec personne mobilisable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: sessionsWithCandidates })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Personnes distinctes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: uniqueCandidateCount })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
							"Source : ",
							activeImport.sourceRowCount,
							" lignes · ",
							activeImport.sourceSessionCount,
							" séances distinctes"
						] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "unstaffed-rh-matrix",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "unstaffed-rh-matrix-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Séances non staffées par jour et par RH" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cliquez sur une date ou un chiffre pour afficher le détail correspondant en dessous." })] }), selectedDate !== "all" || schoolOwnerFilter !== "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setSelectedDate("all");
								setSchoolOwnerFilter("all");
							},
							children: "Réinitialiser la sélection"
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "unstaffed-rh-matrix-scroll",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
							unstaffedMatrix.owners.map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: schoolOwnerLabels$1[owner] }, owner || "unassigned")),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Total" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "total-row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: selectedDate === "all" && schoolOwnerFilter === "all" ? "active" : "",
									onClick: () => {
										setSelectedDate("all");
										setSchoolOwnerFilter("all");
									},
									children: "Toutes les dates"
								}) }),
								unstaffedMatrix.owners.map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: selectedDate === "all" && schoolOwnerFilter === (owner || "unassigned") ? "active" : "",
									onClick: () => {
										setSelectedDate("all");
										setSchoolOwnerFilter(owner || "unassigned");
									},
									children: unstaffedMatrix.totals[owner]
								}) }, owner || "unassigned")),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: selectedDate === "all" && schoolOwnerFilter === "all" ? "active" : "",
									onClick: () => {
										setSelectedDate("all");
										setSchoolOwnerFilter("all");
									},
									children: unstaffedMatrix.total
								}) })
							]
						}), unstaffedMatrix.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: selectedDate === row.date && schoolOwnerFilter === "all" ? "active" : "",
								onClick: () => {
									setSelectedDate(row.date);
									setSchoolOwnerFilter("all");
								},
								children: formatDate$3(row.date, true)
							}) }),
							unstaffedMatrix.owners.map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: selectedDate === row.date && schoolOwnerFilter === (owner || "unassigned") ? "active" : "",
								onClick: () => {
									setSelectedDate(row.date);
									setSchoolOwnerFilter(owner || "unassigned");
								},
								children: row.counts[owner]
							}) }, owner || "unassigned")),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: selectedDate === row.date && schoolOwnerFilter === "all" ? "active" : "",
								onClick: () => {
									setSelectedDate(row.date);
									setSchoolOwnerFilter("all");
								},
								children: row.total
							}) })
						] }, row.date))] })] })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "owner-count-strip unstaffed-owner-counts",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "owner-count-title",
							children: ["Séances déjà staffées par responsable · ", selectedDate === "all" ? "toutes les dates" : formatDate$3(selectedDate, true)]
						}),
						[
							"kelly",
							"pierre",
							"julie",
							""
						].map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: !owner ? "unassigned" : "",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: schoolOwnerLabels$1[owner] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: staffedSessionsByOwner[owner] })]
						}, owner || "unassigned")),
						!activeImport.schoolStaffing?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: activeAssignmentImport ? "Calculé depuis le fichier Prix des tuteurs sélectionné" : "Choisissez un fichier Prix des tuteurs pour compléter ces compteurs" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Calculé depuis l’import Semaines à venir" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "unstaffed-days",
					children: groupedRows.length ? groupedRows.map(([date, rows]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "unstaffed-day",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate$3(date, true) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [new Set(rows.map((row) => row.school)).size, " établissements"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "unstaffed-day-actions",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
								rows.length,
								" séance",
								rows.length > 1 ? "s" : ""
							] }), (() => {
								const hiddenCount = filteredRowsBeforeSingleStudentRule.filter((row) => row.date === date && sessionCategoryKey(row.category) === "alpha" && row.studentCount === 1).length;
								return hiddenCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => toggleSingleStudentAlphaForDate(date),
									children: [
										shownSingleStudentAlphaDates.includes(date) ? "Masquer" : "Afficher",
										" ",
										hiddenCount,
										" groupe",
										hiddenCount > 1 ? "s" : "",
										" Alpha à 1 élève"
									]
								}) : null;
							})()]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "unstaffed-table-wrap",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Horaire" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Établissement" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Type" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Groupe" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Classes" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Élèves" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Salle" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { "aria-label": "Actions" })
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: row.candidates.length ? "has-candidates" : "",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
										row.startTime || "—",
										"–",
										row.endTime || "—"
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["#", row.sessionId] })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
										schoolId: row.schoolId,
										children: row.school
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										className: `school-owner-label ${ownerForSession(row) ? "assigned" : "unassigned"}`,
										children: schoolOwnerLabels$1[ownerForSession(row)]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "session-category",
										children: row.category || "—"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.group || "—" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "class-tags",
										children: row.classes.length ? row.classes.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item }, item)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Non précisée" })
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.studentCount || "—" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.room || "—" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "unstaffed-hide-button",
										onClick: () => hideSession(row.sessionId),
										disabled: saving,
										title: "Masquer durablement cette séance",
										"aria-label": `Masquer la séance ${row.sessionId}`,
										children: "×"
									}) })
								]
							}), (() => {
								const candidates = row.candidates.filter((candidate) => candidate.personStatus === "candidate");
								const freeTutors = row.candidates.filter((candidate) => candidate.personStatus === "tutor" && !candidate.hasConflict);
								const unknownPeople = row.candidates.filter((candidate) => candidate.personStatus === "unknown");
								const freeTutorNames = freeTutors.map((candidate) => `${candidate.firstName} ${candidate.lastName}`.trim() || `ID ${candidate.personId}`);
								const visibleFreeTutorNames = freeTutorNames.slice(0, 2).join(", ");
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
									className: `session-candidates-row ${row.candidates.length ? "has-results" : ""} ${freeTutors.length ? "has-free-tutor" : ""}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										colSpan: 8,
										children: row.candidates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "candidate-summary-content",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "session-link-label",
													children: ["↳ Pour la séance #", row.sessionId]
												}),
												freeTutors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "free-tutor-callout",
													children: [
														"✓ ",
														freeTutors.length,
														" tuteur",
														freeTutors.length > 1 ? "s" : "",
														" sans chevauchement · ",
														visibleFreeTutorNames,
														freeTutorNames.length > 2 ? ` +${freeTutorNames.length - 2}` : ""
													]
												}) : null,
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "candidate-counts",
													children: [
														candidates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "candidate-count candidate",
															children: [
																candidates.length,
																" candidat",
																candidates.length > 1 ? "s" : ""
															]
														}) : null,
														freeTutors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "candidate-count free",
															children: [
																freeTutors.length,
																" tuteur",
																freeTutors.length > 1 ? "s" : "",
																" libre",
																freeTutors.length > 1 ? "s" : ""
															]
														}) : null,
														unknownPeople.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "candidate-count unknown",
															children: [
																unknownPeople.length,
																" statut",
																unknownPeople.length > 1 ? "s" : "",
																" inconnu",
																unknownPeople.length > 1 ? "s" : ""
															]
														}) : null
													]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Voir les coordonnées, sources et autres séances" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "session-candidate-list",
											children: row.candidates.map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "candidate-name",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAdminLink, {
														personId: candidate.personId,
														status: candidate.personStatus,
														children: `${candidate.firstName} ${candidate.lastName}`.trim() || `Personne ${candidate.personId}`
													}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `person-status ${candidate.personStatus}`,
														children: candidate.personStatus === "tutor" ? "Tuteur" : candidate.personStatus === "candidate" ? "Candidat" : "Statut inconnu"
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
														"ID ",
														candidate.personId,
														candidate.phone ? ` · ${candidate.phone}` : ""
													] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "candidate-sources",
													children: [candidate.sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: source,
														children: [source === "interest" ? "Intérêt déclaré" : "Disponible", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															onClick: () => hideCandidateSource(row.sessionId, candidate.personId, source),
															disabled: saving,
															title: `Masquer ${source === "interest" ? "cet intérêt" : "cette disponibilité"}`,
															children: "×"
														})]
													}, source)), candidate.validatedInterest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "validated",
														children: "Intérêt validé"
													}) : null]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "candidate-assignments",
													children: candidate.assignments.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Autre séance ce jour" }), candidate.assignments.map((assignment, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
														assignment.timeSlot,
														" · ",
														assignment.school
													] }, `${assignment.timeSlot}-${assignment.school}-${index}`))] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "candidate-free",
														children: "Aucune autre séance affectée ce jour"
													})
												})
											] }, candidate.personId))
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "no-candidates",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["↳ Pour la séance #", row.sessionId] }), " · aucune personne mobilisable sans chevauchement"]
										})
									})
								});
							})()] }, row.sessionId)), !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 8,
								className: "single-alpha-hidden-note",
								children: "Les groupes Étude Alpha à un élève sont masqués pour cette date. Utilisez le bouton ci-dessus pour les afficher."
							}) }) : null] })] })
						})]
					}, date)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "empty-state",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✓" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucune séance avec les filtres actuels" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: schoolOwnerFilter !== "all" ? `Le filtre responsable « ${schoolOwnerFilter === "unassigned" ? "Non attribués" : schoolOwnerLabels$1[schoolOwnerFilter]} » ne contient aucune séance dans cet import.` : "Modifiez les filtres ou choisissez un autre fichier." }),
							schoolOwnerFilter !== "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "button primary",
								onClick: () => setSchoolOwnerFilter("all"),
								children: "Afficher tous les responsables"
							}) : null
						]
					})
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "empty-state",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📋" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucun fichier Semaines à venir disponible" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ajoutez ou restaurez un fichier depuis la bibliothèque partagée." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "button quiet",
						onClick: () => onOpenFiles("upcomingSessions"),
						children: "Ouvrir Fichiers"
					})
				]
			})
		]
	});
}
//#endregion
//#region app/components/tutor-availability-feed.tsx
var schoolOwnerLabels = {
	"": "Non attribué",
	kelly: "Kelly",
	pierre: "Pierre",
	julie: "Julie"
};
function formatDate$2(value, long = false) {
	const date = /* @__PURE__ */ new Date(`${value}T12:00:00`);
	return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", long ? {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	} : {
		day: "2-digit",
		month: "2-digit"
	}).format(date);
}
function formatImportDate(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "short",
		timeStyle: "short"
	}).format(date);
}
function timeRange(value) {
	const parts = value.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g) ?? [];
	const toMinutes = (part) => {
		const [hours, minutes] = part.split(":").map(Number);
		return hours * 60 + minutes;
	};
	return parts.length >= 2 ? [toMinutes(parts[0]), toMinutes(parts[1])] : null;
}
function firstTime(value) {
	return timeRange(value)?.[0] ?? Number.MAX_SAFE_INTEGER;
}
function overlaps(first, second) {
	const firstRange = timeRange(first);
	const secondRange = timeRange(second);
	return Boolean(firstRange && secondRange && firstRange[0] < secondRange[1] && secondRange[0] < firstRange[1]);
}
function tutorName$1(slot) {
	return `${slot.firstName} ${slot.lastName}`.trim() || `Personne ${slot.personId}`;
}
function freeSlotKey(timeSlot, school) {
	const normalize = (value) => value.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
	return `${normalize(timeSlot)}|${normalize(school)}`;
}
function dedupeAssignments(rows) {
	return rows.filter((row, index) => rows.findIndex((item) => item.timeSlot === row.timeSlot && item.school === row.school) === index);
}
function normalizedSchoolName(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}
function TutorAvailabilityFeed({ onOpenFiles }) {
	const [availabilityImports, setAvailabilityImports] = (0, import_react.useState)([]);
	const [interestImports, setInterestImports] = (0, import_react.useState)([]);
	const [assignmentImports, setAssignmentImports] = (0, import_react.useState)([]);
	const [availabilityData, setAvailabilityData] = (0, import_react.useState)({});
	const [interestData, setInterestData] = (0, import_react.useState)({});
	const [assignmentData, setAssignmentData] = (0, import_react.useState)({});
	const [latestTutorSnapshot, setLatestTutorSnapshot] = (0, import_react.useState)(null);
	const [schoolAssignments, setSchoolAssignments] = (0, import_react.useState)([]);
	const [availabilityImportId, setAvailabilityImportId] = (0, import_react.useState)("");
	const [interestImportId, setInterestImportId] = (0, import_react.useState)("");
	const [assignmentImportId, setAssignmentImportId] = (0, import_react.useState)("");
	const [selectedDate, setSelectedDate] = (0, import_react.useState)("");
	const [query, setQuery] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [scheduleFilter, setScheduleFilter] = (0, import_react.useState)("all");
	const [schoolOwnerFilter, setSchoolOwnerFilter] = (0, import_react.useState)("all");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const [detailError, setDetailError] = (0, import_react.useState)("");
	const [detailRetry, setDetailRetry] = (0, import_react.useState)(0);
	const load = (0, import_react.useCallback)(async (silent = false) => {
		if (!silent) setLoading(true);
		const results = await Promise.allSettled([
			["Disponibilités", "/api/availability-imports?summary=1"],
			["Intérêts", "/api/tutor-interest-imports?summary=1"],
			["Séances affectées", "/api/tutor-assignment-imports?summary=1"],
			["Liste des tuteurs", "/api/tutor-tracking?latest=1"],
			["Établissements", "/api/schools"]
		].map(async ([label, endpoint]) => {
			const response = await fetch(endpoint, { cache: "no-store" });
			const payload = await response.json();
			if (!response.ok) throw new Error(`${label} : ${payload.detail || payload.error || "chargement impossible"}`);
			return payload;
		}));
		const errors = results.flatMap((result) => result.status === "rejected" ? [result.reason instanceof Error ? result.reason.message : "Chargement impossible"] : []);
		if (results[0]?.status === "fulfilled") {
			const availability = results[0].value.imports ?? [];
			setAvailabilityImports(availability);
			setAvailabilityImportId((current) => availability.some((item) => item.id === current) ? current : availability[0]?.id || "");
		}
		if (results[1]?.status === "fulfilled") {
			const interests = results[1].value.imports ?? [];
			setInterestImports(interests);
			setInterestImportId((current) => interests.some((item) => item.id === current) ? current : interests[0]?.id || "");
		}
		if (results[2]?.status === "fulfilled") {
			const assignments = results[2].value.imports ?? [];
			setAssignmentImports(assignments);
			setAssignmentImportId((current) => assignments.some((item) => item.id === current) ? current : assignments[0]?.id || "");
		}
		if (results[3]?.status === "fulfilled") setLatestTutorSnapshot(results[3].value.snapshot ?? null);
		if (results[4]?.status === "fulfilled") setSchoolAssignments(results[4].value.schools ?? []);
		setMessage(errors.length ? errors.join(" · ") : silent ? "" : "Fil actualisé");
		if (!silent) setLoading(false);
	}, []);
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(() => void load(true), 0);
		const refresh = window.setInterval(() => void load(true), 3e4);
		return () => {
			window.clearTimeout(timer);
			window.clearInterval(refresh);
		};
	}, [load]);
	(0, import_react.useEffect)(() => {
		const requests = [
			availabilityImportId && !availabilityData[availabilityImportId] ? [
				"availability",
				availabilityImportId,
				"/api/availability-imports"
			] : null,
			interestImportId && !interestData[interestImportId] ? [
				"interest",
				interestImportId,
				"/api/tutor-interest-imports"
			] : null,
			assignmentImportId && !assignmentData[assignmentImportId] ? [
				"assignment",
				assignmentImportId,
				"/api/tutor-assignment-imports"
			] : null
		].filter(Boolean);
		if (!requests.length) return;
		let cancelled = false;
		Promise.all(requests.map(async ([kind, id, endpoint]) => {
			const response = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { cache: "no-store" });
			const data = await response.json();
			if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Fichier sélectionné indisponible");
			return {
				kind,
				item: data.import
			};
		})).then((items) => {
			if (cancelled) return;
			items.forEach(({ kind, item }) => {
				if (kind === "availability") setAvailabilityData((current) => ({
					...current,
					[item.id]: item
				}));
				else if (kind === "interest") setInterestData((current) => ({
					...current,
					[item.id]: item
				}));
				else setAssignmentData((current) => ({
					...current,
					[item.id]: item
				}));
			});
			setDetailError("");
			setMessage("");
		}).catch((error) => {
			if (!cancelled) {
				const text = error instanceof Error ? error.message : "Chargement impossible";
				setDetailError(text);
				setMessage(text);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [
		assignmentData,
		assignmentImportId,
		availabilityData,
		availabilityImportId,
		detailRetry,
		interestData,
		interestImportId
	]);
	const availabilityImport = availabilityData[availabilityImportId] ?? null;
	const interestImport = interestData[interestImportId] ?? null;
	const assignmentImport = assignmentData[assignmentImportId] ?? null;
	const loadingDetails = !detailError && Boolean(availabilityImportId && !availabilityImport || interestImportId && !interestImport || assignmentImportId && !assignmentImport);
	const dates = (0, import_react.useMemo)(() => Array.from(new Set([...(availabilityImport?.rows ?? []).map((row) => row.date), ...(interestImport?.rows ?? []).map((row) => row.date)].filter(Boolean))).sort(), [availabilityImport, interestImport]);
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const activeDate = dates.includes(selectedDate) ? selectedDate : dates.includes(today) ? today : dates[0] || "";
	const ownerBySchoolName = (0, import_react.useMemo)(() => new Map(schoolAssignments.map((school) => [normalizedSchoolName(school.name), school.portfolioOwner])), [schoolAssignments]);
	const ownerForSlot = (0, import_react.useCallback)((slot) => ownerBySchoolName.get(normalizedSchoolName(slot.school)) ?? "", [ownerBySchoolName]);
	const dayResult = (0, import_react.useMemo)(() => {
		if (!activeDate) return {
			slots: [],
			hiddenOverlapCount: 0
		};
		const currentTutorIds = latestTutorSnapshot ? new Set(latestTutorSnapshot.records.map((record) => record.tutorId.trim()).filter(Boolean)) : null;
		const assignmentsByTutor = /* @__PURE__ */ new Map();
		(assignmentImport?.rows ?? []).filter((row) => !row.absent && row.date === activeDate && row.tutorId.trim()).forEach((row) => {
			const tutorId = row.tutorId.trim();
			assignmentsByTutor.set(tutorId, dedupeAssignments([...assignmentsByTutor.get(tutorId) ?? [], row]));
		});
		const slotMap = /* @__PURE__ */ new Map();
		const addSlot = (input, source, validatedInterest = false) => {
			const key = `${input.personId}|${input.key}`;
			const existing = slotMap.get(key);
			const status = !currentTutorIds || !input.personId ? "unknown" : currentTutorIds.has(input.personId) ? "tutor" : "candidate";
			slotMap.set(key, existing ? {
				...existing,
				firstName: existing.firstName || input.firstName,
				lastName: existing.lastName || input.lastName,
				phone: existing.phone || input.phone,
				sources: Array.from(new Set([...existing.sources, source])),
				validatedInterest: existing.validatedInterest || validatedInterest
			} : {
				...input,
				status,
				sources: [source],
				validatedInterest
			});
		};
		(availabilityImport?.rows ?? []).filter((row) => row.date === activeDate && row.tutorId.trim()).forEach((row) => addSlot({
			key: freeSlotKey(row.timeSlot, row.school),
			personId: row.tutorId.trim(),
			firstName: row.firstName,
			lastName: row.lastName,
			phone: row.phone,
			timeSlot: row.timeSlot,
			school: row.school,
			className: row.className,
			group: row.group
		}, "availability"));
		(interestImport?.rows ?? []).filter((row) => row.date === activeDate && row.personId.trim()).forEach((row) => addSlot({
			key: freeSlotKey(row.timeSlot, row.school),
			personId: row.personId.trim(),
			firstName: row.firstName,
			lastName: row.lastName,
			phone: row.phone,
			timeSlot: row.timeSlot,
			school: row.school,
			className: row.className,
			group: row.group
		}, "interest", row.validated));
		let hiddenOverlapCount = 0;
		return {
			slots: Array.from(slotMap.values()).flatMap((slot) => {
				const dayAssignments = assignmentsByTutor.get(slot.personId) ?? [];
				if (dayAssignments.some((assignment) => overlaps(slot.timeSlot, assignment.timeSlot))) {
					hiddenOverlapCount += 1;
					return [];
				}
				return [{
					...slot,
					otherAssignments: dayAssignments.sort((a, b) => firstTime(a.timeSlot) - firstTime(b.timeSlot))
				}];
			}),
			hiddenOverlapCount
		};
	}, [
		activeDate,
		assignmentImport,
		availabilityImport,
		interestImport,
		latestTutorSnapshot
	]);
	const visibleSlots = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLocaleLowerCase("fr");
		return dayResult.slots.filter((slot) => {
			if (statusFilter !== "all" && slot.status !== statusFilter) return false;
			if (scheduleFilter === "free" && slot.otherAssignments.length) return false;
			if (scheduleFilter === "assigned" && !slot.otherAssignments.length) return false;
			const owner = ownerForSlot(slot);
			if (schoolOwnerFilter === "unassigned" ? Boolean(owner) : schoolOwnerFilter !== "all" && owner !== schoolOwnerFilter) return false;
			if (!needle) return true;
			return [
				slot.personId,
				slot.firstName,
				slot.lastName,
				slot.phone,
				slot.school,
				slot.className,
				slot.group,
				slot.timeSlot,
				...slot.otherAssignments.flatMap((row) => [row.school, row.timeSlot])
			].join(" ").toLocaleLowerCase("fr").includes(needle);
		}).sort((a, b) => firstTime(a.timeSlot) - firstTime(b.timeSlot) || tutorName$1(a).localeCompare(tutorName$1(b), "fr"));
	}, [
		dayResult.slots,
		ownerForSlot,
		query,
		scheduleFilter,
		schoolOwnerFilter,
		statusFilter
	]);
	const peopleCount = new Set(visibleSlots.map((slot) => slot.personId)).size;
	const tutorCount = new Set(visibleSlots.filter((slot) => slot.status === "tutor").map((slot) => slot.personId)).size;
	const candidateCount = new Set(visibleSlots.filter((slot) => slot.status === "candidate").map((slot) => slot.personId)).size;
	const availabilityCount = visibleSlots.filter((slot) => slot.sources.includes("availability")).length;
	const interestCount = visibleSlots.filter((slot) => slot.sources.includes("interest")).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "task-panel tutor-feed-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Vue chronologique quotidienne"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Fil des disponibilités" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Uniquement les créneaux réellement libres, issus des disponibilités et des intérêts." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "ghost-button",
					type: "button",
					onClick: () => void load(),
					disabled: loading,
					children: "↻ Actualiser"
				})]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "enrollment-message",
				children: message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "tutor-feed-sources",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Disponibilités", !availabilityImports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "source-files-link",
						onClick: () => onOpenFiles("availability"),
						children: "Ouvrir Fichiers"
					}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: availabilityImportId,
						onChange: (event) => setAvailabilityImportId(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Aucun fichier"
						}), availabilityImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: item.id,
							children: [
								item.displayName,
								" · ",
								formatImportDate(item.importedAt)
							]
						}, item.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Intérêts", !interestImports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "source-files-link",
						onClick: () => onOpenFiles("interests"),
						children: "Ouvrir Fichiers"
					}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: interestImportId,
						onChange: (event) => setInterestImportId(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Aucun fichier"
						}), interestImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: item.id,
							children: [
								item.displayName,
								" · ",
								formatImportDate(item.importedAt)
							]
						}, item.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Séances affectées", !assignmentImports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "source-files-link",
						onClick: () => onOpenFiles("assignments"),
						children: "Ouvrir Fichiers"
					}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: assignmentImportId,
						onChange: (event) => setAssignmentImportId(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Aucun fichier"
						}), assignmentImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: item.id,
							children: [
								item.displayName,
								" · ",
								formatImportDate(item.importedAt)
							]
						}, item.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: latestTutorSnapshot ? `Statuts issus de la liste des tuteurs du ${formatDate$2(latestTutorSnapshot.date)}` : "Aucune liste de tuteurs disponible" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "tutor-feed-date-tabs",
				children: dates.map((date) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: activeDate === date ? "active" : "",
					onClick: () => setSelectedDate(date),
					children: formatDate$2(date)
				}, date))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "tutor-feed-owner-tabs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Établissements :" }), [
					"unassigned",
					"kelly",
					"pierre",
					"julie",
					"all"
				].map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: schoolOwnerFilter === owner ? "active" : "",
					onClick: () => setSchoolOwnerFilter(owner),
					children: owner === "all" ? "Tous" : owner === "unassigned" ? "Non attribués" : schoolOwnerLabels[owner]
				}, owner))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "tutor-feed-controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeDate ? formatDate$2(activeDate, true) : "Aucune date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						dayResult.hiddenOverlapCount,
						" créneau",
						dayResult.hiddenOverlapCount > 1 ? "x" : "",
						" occupé",
						dayResult.hiddenOverlapCount > 1 ? "s" : "",
						" masqué",
						dayResult.hiddenOverlapCount > 1 ? "s" : ""
					] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Rechercher un tuteur, un établissement…",
						"aria-label": "Rechercher dans le fil"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: statusFilter,
						onChange: (event) => setStatusFilter(event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Tous les statuts"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "tutor",
								children: "Tuteurs"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "candidate",
								children: "Candidats"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: scheduleFilter,
						onChange: (event) => setScheduleFilter(event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Toutes les situations"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "free",
								children: "Sans autre séance ce jour"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "assigned",
								children: "Avec une autre séance ce jour"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "tutor-feed-kpis",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "free",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: visibleSlots.length }), " créneaux libres"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: peopleCount }), " personnes"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: tutorCount }), " tuteurs"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: candidateCount }), " candidats"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: availabilityCount }), " depuis disponibilités"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: interestCount }), " depuis intérêts"] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "tutor-feed-list",
				children: detailError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "!" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Fichier sélectionné indisponible" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: detailError }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "button quiet",
							onClick: () => {
								setDetailError("");
								setDetailRetry((value) => value + 1);
							},
							children: "Réessayer"
						})
					]
				}) : loadingDetails ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⏳" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Chargement des fichiers sélectionnés…" })]
				}) : !availabilityImport && !interestImport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🗂️" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucune source de disponibilités" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Choisissez un fichier existant ou ouvrez la bibliothèque partagée." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "button quiet",
							onClick: () => onOpenFiles("availability"),
							children: "Ouvrir Fichiers"
						})
					]
				}) : visibleSlots.length ? visibleSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: `tutor-feed-card slot-card status-${slot.status} ${slot.otherAssignments.length ? "has-other-assignment" : "no-other-assignment"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tutor-feed-time",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: slot.timeSlot.match(/\b\d{1,2}:\d{2}\b/)?.[0] || "—" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "créneau libre" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tutor-feed-person",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAdminLink, {
								personId: slot.personId,
								status: slot.status,
								children: tutorName$1(slot)
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `person-status ${slot.status}`,
								children: slot.status === "tutor" ? "Tuteur" : slot.status === "candidate" ? "Candidat" : "Statut inconnu"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"ID ",
								slot.personId,
								slot.phone ? ` · ${slot.phone}` : ""
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "tutor-feed-opportunities",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: slot.timeSlot || "Horaire non précisé" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									slot.school || "Établissement non précisé",
									slot.className ? ` · ${slot.className}` : "",
									" · ",
									schoolOwnerLabels[ownerForSlot(slot)]
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [slot.sources.map((source) => source === "availability" ? "Disponibilité" : "Intérêt").join(" + "), slot.validatedInterest ? " · validé" : ""] })
							] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "tutor-feed-assignments",
							children: slot.otherAssignments.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Autres séances ce jour" }), slot.otherAssignments.map((assignment, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								assignment.timeSlot,
								" · ",
								assignment.school
							] }, `${assignment.timeSlot}-${assignment.school}-${index}`))] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Aucune autre séance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Disponible sur ce créneau" })] })
						})
					]
				}, `${slot.personId}-${slot.key}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📆" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucun créneau réellement libre" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Les créneaux qui chevauchent une séance affectée sont automatiquement masqués." })
					]
				})
			})
		]
	});
}
//#endregion
//#region app/components/home-dashboard.tsx
var menuItems = [
	{
		mode: "watchlist",
		icon: "👀",
		title: "À suivre",
		description: "Établissements nécessitant une attention particulière.",
		countKey: "watchlist"
	},
	{
		mode: "staffingAudit",
		icon: "📊",
		title: "Bilan staffing",
		description: "Enregistrer et suivre les séances non staffées par journée."
	},
	{
		mode: "staffingEvolution",
		icon: "🔄",
		title: "Évolution staffing",
		description: "Comparer deux exports Semaines à venir et suivre les changements par RH."
	},
	{
		mode: "tutorReports",
		icon: "🧾",
		title: "Bilans tuteurs",
		description: "Suivre les bilans non réalisés et les commentaires."
	},
	{
		mode: "communications",
		icon: "📣",
		title: "Communications",
		description: "Journal des communications envoyées aux différents publics.",
		countKey: "communications"
	},
	{
		mode: "availability",
		icon: "📆",
		title: "Comparaison dispos",
		description: "Comparer deux exports de disponibilités tuteurs.",
		countKey: "availability"
	},
	{
		mode: "coverage",
		icon: "🧩",
		title: "Tuteurs dispo sans séance",
		description: "Croiser les disponibilités, les intérêts et les séances à staffer."
	},
	{
		mode: "schools",
		icon: "🏫",
		title: "Établissements",
		description: "Consulter le CRM et la répartition des établissements.",
		countKey: "schools"
	},
	{
		mode: "files",
		icon: "🗂️",
		title: "Fichiers",
		description: "Retrouver et gérer les imports partagés."
	},
	{
		mode: "availabilityFeed",
		icon: "🕒",
		title: "Fil des disponibilités",
		description: "Voir les créneaux libres dans l’ordre chronologique."
	},
	{
		mode: "history",
		icon: "📈",
		title: "Historique",
		description: "Comparer l’évolution du nombre d’élèves.",
		countKey: "history"
	},
	{
		mode: "enrollments",
		icon: "🎒",
		title: "Inscriptions",
		description: "Comparer les inscriptions entre deux exports."
	},
	{
		mode: "journal",
		icon: "✍️",
		title: "Journal",
		description: "Relire les nouvelles et décisions de l’Étude Alpha.",
		countKey: "journal"
	},
	{
		mode: "links",
		icon: "🔗",
		title: "Liens",
		description: "Accéder rapidement aux ressources partagées.",
		countKey: "links"
	},
	{
		mode: "objectives",
		icon: "🎯",
		title: "Objectifs",
		description: "Suivre les objectifs collectifs et individuels.",
		countKey: "objectives"
	},
	{
		mode: "unstaffed",
		icon: "📋",
		title: "Séances non affectées",
		description: "Identifier les séances à staffer et les personnes mobilisables."
	},
	{
		mode: "staffing",
		icon: "👥",
		title: "Staffing",
		description: "Suivre les volumes staffés et non staffés au quotidien.",
		countKey: "staffing"
	},
	{
		mode: "tasks",
		icon: "✅",
		title: "Tâches",
		description: "Organiser et suivre les actions de l’équipe.",
		countKey: "tasks"
	},
	{
		mode: "tutors",
		icon: "👨‍🏫",
		title: "Tuteurs",
		description: "Suivre les entrées, sorties et commentaires tuteurs."
	}
];
function HomeDashboard({ onNavigate }) {
	const [data, setData] = (0, import_react.useState)({});
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [message, setMessage] = (0, import_react.useState)("");
	const load = (0, import_react.useCallback)(async (silent = false) => {
		if (!silent) setLoading(true);
		try {
			const response = await fetch("/api/dashboard", { cache: "no-store" });
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.detail || payload.error || "Chargement impossible");
			setData(payload);
			setMessage("");
		} catch (error) {
			if (!silent) setMessage(error instanceof Error ? error.message : "Résumé indisponible");
		} finally {
			if (!silent) setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const initial = window.setTimeout(() => void load(), 0);
		const refresh = window.setInterval(() => void load(true), 3e4);
		return () => {
			window.clearTimeout(initial);
			window.clearInterval(refresh);
		};
	}, [load]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "home-menu-section",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "home-section-heading",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Navigation"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tous les outils Alpha" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Choisissez un espace pour commencer." })
			] }), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Actualisation…" }) : message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: message }) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "home-menu-grid",
			children: menuItems.map((item) => {
				const count = item.countKey ? data.counts?.[item.countKey] : void 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "home-menu-card",
					onClick: () => onNavigate(item.mode),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "home-menu-icon",
							"aria-hidden": "true",
							children: item.icon
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: item.description })] }),
						typeof count === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: count }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
							"aria-hidden": "true",
							children: "→"
						})
					]
				}, item.mode);
			})
		})]
	}) });
}
//#endregion
//#region app/components/staffing-audit.tsx
var ownerLabels$1 = {
	"": "Non attribué",
	kelly: "Kelly",
	pierre: "Pierre",
	julie: "Julie"
};
var owners = [
	"kelly",
	"pierre",
	"julie",
	""
];
var categories = [
	"alpha",
	"surveillance",
	"service"
];
var categoryLabels = {
	alpha: "Étude Alpha",
	surveillance: "Surveillance",
	service: "Prestation de service"
};
function staffingAuditDate(value) {
	const isoMatch = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
	const frenchMatch = value.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[T\s].*)?$/);
	const year = Number(isoMatch?.[1] ?? frenchMatch?.[3]);
	const month = Number(isoMatch?.[2] ?? frenchMatch?.[2]);
	const day = Number(isoMatch?.[3] ?? frenchMatch?.[1]);
	if (!year || !month || !day) return null;
	const date = new Date(year, month - 1, day, 12);
	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
function formatDate$1(value) {
	const date = staffingAuditDate(value);
	return date ? new Intl.DateTimeFormat("fr-FR", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	}).format(date) : value || "Date inconnue";
}
function formatShortDate(value) {
	const date = staffingAuditDate(value);
	return date ? new Intl.DateTimeFormat("fr-FR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	}).format(date) : value || "Date inconnue";
}
function formatChartDate(value) {
	const date = staffingAuditDate(value);
	return date ? new Intl.DateTimeFormat("fr-FR", {
		day: "2-digit",
		month: "2-digit"
	}).format(date) : value;
}
function effectiveStatus(session) {
	return session.resolution || session.detectedStatus;
}
function daySummary(day) {
	return owners.map((owner) => {
		const sessions = day.sessions.filter((session) => session.portfolioOwner === owner);
		return {
			owner,
			staffed: sessions.filter((session) => effectiveStatus(session) === "staffed").length,
			unstaffed: sessions.filter((session) => effectiveStatus(session) === "unstaffed" && !session.treated).length,
			ambiguous: sessions.filter((session) => effectiveStatus(session) === "ambiguous").length,
			total: sessions.length
		};
	});
}
function StaffingAudit() {
	const [sectionTab, setSectionTab] = (0, import_react.useState)("general");
	const [savedDays, setSavedDays] = (0, import_react.useState)([]);
	const [tutorSnapshots, setTutorSnapshots] = (0, import_react.useState)([]);
	const [draftDays, setDraftDays] = (0, import_react.useState)([]);
	const [selectedDate, setSelectedDate] = (0, import_react.useState)("");
	const [view, setView] = (0, import_react.useState)("history");
	const [ownerFilter, setOwnerFilter] = (0, import_react.useState)("all");
	const [categoryFilter, setCategoryFilter] = (0, import_react.useState)("all");
	const [analysisStartDate, setAnalysisStartDate] = (0, import_react.useState)("");
	const [analysisEndDate, setAnalysisEndDate] = (0, import_react.useState)("");
	const [sessionListMode, setSessionListMode] = (0, import_react.useState)("active");
	const [showTreated, setShowTreated] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const load = (0, import_react.useCallback)(async (silent = false) => {
		try {
			const response = await fetch("/api/staffing-audits", { cache: "no-store" });
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Chargement impossible");
			const days = data.days ?? [];
			setSavedDays(days);
			if (!silent && !draftDays.length) {
				setView("history");
				setSelectedDate((current) => days.some((day) => day.date === current) ? current : days[0]?.date || "");
			}
		} catch (error) {
			if (!silent) setMessage(error instanceof Error ? error.message : "Chargement impossible");
		}
	}, [draftDays.length]);
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(() => void load(), 0);
		return () => window.clearTimeout(timer);
	}, [load]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		fetch("/api/tutor-tracking", { cache: "no-store" }).then(async (response) => {
			if (!response.ok) return null;
			return await response.json();
		}).then((data) => {
			if (!cancelled) setTutorSnapshots(data?.tracking?.snapshots ?? []);
		}).catch(() => {
			if (!cancelled) setTutorSnapshots([]);
		});
		return () => {
			cancelled = true;
		};
	}, []);
	const tutorTypeSnapshot = (0, import_react.useMemo)(() => tutorSnapshots.find((snapshot) => snapshot.records.some((record) => record.level.trim())), [tutorSnapshots]);
	const tutorTypeById = (0, import_react.useMemo)(() => {
		const result = /* @__PURE__ */ new Map();
		for (const record of tutorTypeSnapshot?.records ?? []) {
			const tutorId = record.tutorId.trim();
			if (!tutorId || !record.level.trim()) continue;
			result.set(tutorId, record.level.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("fr") === "st");
		}
		return result;
	}, [tutorTypeSnapshot]);
	const activeDay = (view === "draft" ? draftDays : savedDays).find((day) => day.date === selectedDate) ?? null;
	const totalTreatedSessions = (0, import_react.useMemo)(() => (activeDay?.sessions ?? []).filter((session) => session.treated), [activeDay]);
	const categorySessions = (0, import_react.useMemo)(() => (activeDay?.sessions ?? []).filter((session) => categoryFilter === "all" || session.category === categoryFilter), [activeDay, categoryFilter]);
	const summary = (0, import_react.useMemo)(() => activeDay ? daySummary({
		...activeDay,
		sessions: categorySessions
	}) : [], [activeDay, categorySessions]);
	const activeSessions = (0, import_react.useMemo)(() => categorySessions.filter((session) => {
		const status = effectiveStatus(session);
		return !session.treated && (status === "unstaffed" || status === "ambiguous");
	}), [categorySessions]);
	const treatedSessions = (0, import_react.useMemo)(() => categorySessions.filter((session) => session.treated), [categorySessions]);
	const filteredActiveSessions = (0, import_react.useMemo)(() => activeSessions.filter((session) => ownerFilter === "all" || session.portfolioOwner === ownerFilter), [activeSessions, ownerFilter]);
	const staffedSessions = (0, import_react.useMemo)(() => categorySessions.filter((session) => effectiveStatus(session) === "staffed"), [categorySessions]);
	const filteredStaffedSessions = (0, import_react.useMemo)(() => staffedSessions.filter((session) => ownerFilter === "all" || session.portfolioOwner === ownerFilter), [ownerFilter, staffedSessions]);
	const filteredTreatedSessions = (0, import_react.useMemo)(() => treatedSessions.filter((session) => ownerFilter === "all" || session.portfolioOwner === ownerFilter), [ownerFilter, treatedSessions]);
	const historyDateBounds = (0, import_react.useMemo)(() => {
		const dates = savedDays.map((day) => day.date).filter(Boolean).sort();
		return {
			first: dates[0] || "",
			last: dates.at(-1) || ""
		};
	}, [savedDays]);
	const effectiveAnalysisStartDate = analysisStartDate || historyDateBounds.first;
	const effectiveAnalysisEndDate = analysisEndDate || historyDateBounds.last;
	const rangeAnalysis = (0, import_react.useMemo)(() => {
		const start = effectiveAnalysisStartDate <= effectiveAnalysisEndDate ? effectiveAnalysisStartDate : effectiveAnalysisEndDate;
		const end = effectiveAnalysisStartDate <= effectiveAnalysisEndDate ? effectiveAnalysisEndDate : effectiveAnalysisStartDate;
		const filteredDays = savedDays.filter((day) => (!start || day.date >= start) && (!end || day.date <= end)).sort((a, b) => a.date.localeCompare(b.date)).map((day) => ({
			date: day.date,
			sessions: day.sessions.filter((session) => categoryFilter === "all" || session.category === categoryFilter)
		}));
		const sessions = filteredDays.flatMap((day) => day.sessions);
		const isUnstaffed = (session) => effectiveStatus(session) === "unstaffed" && !session.treated;
		const unstaffed = sessions.filter(isUnstaffed);
		const byOwner = [
			"kelly",
			"pierre",
			"julie"
		].map((owner) => {
			const ownerSessions = sessions.filter((session) => session.portfolioOwner === owner);
			const ownerUnstaffed = ownerSessions.filter(isUnstaffed).length;
			return {
				owner,
				total: ownerSessions.length,
				unstaffed: ownerUnstaffed,
				percentage: ownerSessions.length ? ownerUnstaffed / ownerSessions.length * 100 : 0
			};
		});
		const schools = /* @__PURE__ */ new Map();
		unstaffed.forEach((session) => {
			const key = session.school.trim().toLocaleLowerCase("fr") || "établissement non précisé";
			const item = schools.get(key) ?? {
				name: session.school || "Établissement non précisé",
				count: 0
			};
			item.count += 1;
			schools.set(key, item);
		});
		return {
			total: sessions.length,
			unstaffed: unstaffed.length,
			percentage: sessions.length ? unstaffed.length / sessions.length * 100 : 0,
			byOwner,
			daily: filteredDays.map((day) => {
				const dailyUnstaffed = day.sessions.filter(isUnstaffed).length;
				const distinctTutors = new Set(day.sessions.flatMap((session) => session.tutors.map((tutor) => tutor.tutorId.trim())).filter(Boolean));
				const unidentifiedTutors = day.sessions.reduce((count, session) => count + session.tutors.filter((tutor) => !tutor.tutorId.trim()).length, 0);
				const tutorClassifiedSessions = day.sessions.map((session) => {
					const matchedTypes = session.tutors.map((tutor) => tutor.tutorId ? tutorTypeById.get(tutor.tutorId) : void 0);
					return {
						nonSt: matchedTypes.some((isSt) => isSt === false),
						unknown: !matchedTypes.length || matchedTypes.some((isSt) => isSt === void 0)
					};
				});
				return {
					date: day.date,
					total: day.sessions.length,
					unstaffed: dailyUnstaffed,
					tutors: distinctTutors.size,
					unidentifiedTutors,
					nonStSessions: tutorTypeSnapshot ? tutorClassifiedSessions.filter((session) => session.nonSt).length : null,
					unclassifiedTutorSessions: tutorTypeSnapshot ? tutorClassifiedSessions.filter((session) => session.unknown && !session.nonSt).length : null,
					percentage: day.sessions.length ? dailyUnstaffed / day.sessions.length * 100 : 0
				};
			}),
			topSchools: Array.from(schools.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr")).slice(0, 10)
		};
	}, [
		categoryFilter,
		effectiveAnalysisEndDate,
		effectiveAnalysisStartDate,
		savedDays,
		tutorTypeById,
		tutorTypeSnapshot
	]);
	const dailyChart = (0, import_react.useMemo)(() => {
		const width = Math.max(720, rangeAnalysis.daily.length * 74 + 72);
		const plotLeft = 54;
		const plotRight = width - 18;
		const plotTop = 20;
		const plotBottom = 156;
		const highestPercentage = Math.max(0, ...rangeAnalysis.daily.map((day) => day.percentage));
		const maximumPercentage = Math.max(10, Math.ceil(highestPercentage / 5) * 5);
		const points = rangeAnalysis.daily.map((day, index) => {
			const x = rangeAnalysis.daily.length <= 1 ? (plotLeft + plotRight) / 2 : plotLeft + index / (rangeAnalysis.daily.length - 1) * (plotRight - plotLeft);
			const y = plotBottom - day.percentage / maximumPercentage * (plotBottom - plotTop);
			return {
				...day,
				x,
				y
			};
		});
		return {
			width,
			height: 293,
			plotLeft,
			plotRight,
			plotTop,
			plotBottom,
			maximumPercentage,
			points,
			polyline: points.map((point) => `${point.x},${point.y}`).join(" ")
		};
	}, [rangeAnalysis.daily]);
	async function importFile(file) {
		if (!file) return;
		setSaving(true);
		setMessage("Analyse du fichier…");
		try {
			const response = await fetch(`/api/staffing-audits?fileName=${encodeURIComponent(file.name)}`, {
				method: "POST",
				headers: { "Content-Type": "text/csv;charset=utf-8" },
				body: await file.text()
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Analyse impossible");
			const days = data.days ?? [];
			setDraftDays(days);
			setSectionTab("daily");
			setView("draft");
			setSelectedDate(days[0]?.date || "");
			const ignoredDateMessage = data.invalidDateRowCount ? ` · ${data.invalidDateRowCount} ligne${data.invalidDateRowCount > 1 ? "s" : ""} ignorée${data.invalidDateRowCount > 1 ? "s" : ""} car la date est illisible` : "";
			setMessage(`${days.reduce((sum, day) => sum + day.sessions.length, 0)} séances uniques détectées sur ${days.length} date${days.length > 1 ? "s" : ""}${ignoredDateMessage}`);
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Analyse impossible");
		} finally {
			setSaving(false);
		}
	}
	function updateDraftSession(sessionId, changes) {
		setDraftDays((current) => current.map((day) => day.date === selectedDate ? {
			...day,
			sessions: day.sessions.map((session) => session.sessionId === sessionId ? {
				...session,
				...changes
			} : session)
		} : day));
	}
	async function updateSavedSession(session, changes) {
		setSaving(true);
		try {
			const response = await fetch("/api/staffing-audits", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					date: selectedDate,
					sessionId: session.sessionId,
					...changes
				})
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Modification impossible");
			setSavedDays(data.days ?? savedDays);
			setMessage("Bilan mis à jour");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Modification impossible");
		} finally {
			setSaving(false);
		}
	}
	function changeSession(session, changes) {
		if (view === "draft") updateDraftSession(session.sessionId, changes);
		else updateSavedSession(session, changes);
	}
	async function saveDay() {
		if (!activeDay || view !== "draft") return;
		const exists = savedDays.some((day) => day.date === activeDay.date);
		if (exists && !window.confirm(`Un bilan existe déjà pour le ${formatDate$1(activeDay.date)}. Voulez-vous vraiment l’écraser ?`)) return;
		setSaving(true);
		try {
			const response = await fetch("/api/staffing-audits", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					day: activeDay,
					overwrite: exists
				})
			});
			const data = await response.json();
			if (response.status === 409 || data.conflict) throw new Error("Ce bilan vient d’être enregistré ailleurs. Actualisez avant de choisir de l’écraser.");
			if (!response.ok) throw new Error(data.detail || data.error || "Enregistrement impossible");
			setSavedDays(data.days ?? savedDays);
			setView("history");
			setMessage(`Bilan du ${formatDate$1(activeDay.date)} enregistré`);
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Enregistrement impossible");
		} finally {
			setSaving(false);
		}
	}
	function sessionRow(session) {
		const status = effectiveStatus(session);
		const sessionLabel = `#${session.sessionId}`;
		const sourceRowsLabel = session.sourceRowCount === null ? "Nombre de lignes non disponible" : `${session.sourceRowCount} ligne${session.sourceRowCount > 1 ? "s" : ""} dans le fichier`;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: `staffing-audit-session ${status} ${session.treated ? "treated" : ""}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					session.schoolId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "staffing-audit-session-link",
						href: `https://www.alphaeducation.fr/administration/schools/${encodeURIComponent(session.schoolId)}/history`,
						target: "_blank",
						rel: "noreferrer",
						title: `Ouvrir l’historique de l’établissement (ID ${session.schoolId})`,
						children: [sessionLabel, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							children: "↗"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: sessionLabel }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: session.school || "Établissement non précisé" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
						className: `staffing-audit-category ${session.category}`,
						children: categoryLabels[session.category]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [sourceRowsLabel, session.schoolId ? "" : " · ID établissement introuvable"] }),
					session.tutors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["Tuteur(s) trouvé(s) : ", session.tutors.map((tutor) => `${tutor.name || "Tuteur sans nom"}${tutor.tutorId ? ` (ID ${tutor.tutorId})` : " (ID à rapprocher)"}`).join(", ")] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Aucun tuteur renseigné" })
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Responsable RH", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					value: session.portfolioOwner,
					onChange: (event) => changeSession(session, { portfolioOwner: event.target.value }),
					disabled: saving,
					children: owners.map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: owner,
						children: ownerLabels$1[owner]
					}, owner || "unassigned"))
				})] }),
				session.detectedStatus === "ambiguous" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Classement", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: session.resolution,
					onChange: (event) => changeSession(session, { resolution: event.target.value }),
					disabled: saving,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "À vérifier"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "staffed",
							children: "Staffée"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "unstaffed",
							children: "Non staffée"
						})
					]
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `staffing-audit-status ${status}`,
					children: status === "staffed" ? "Staffée" : "Non staffée"
				}),
				status === "unstaffed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ghost-button staffing-audit-ignore",
					onClick: () => changeSession(session, { treated: !session.treated }),
					disabled: saving,
					children: session.treated ? "Reconsidérer comme non staffée" : "Ne pas considérer comme non staffée"
				}) : null
			]
		}, session.sessionId);
	}
	function groupedSessionRows(sessions) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "staffing-audit-grouped-list",
			children: owners.map((owner) => {
				const ownerSessions = sessions.filter((session) => session.portfolioOwner === owner);
				if (!ownerSessions.length) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "staffing-audit-owner-group",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "staffing-audit-owner-group-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ownerLabels$1[owner] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							ownerSessions.length,
							" séance",
							ownerSessions.length > 1 ? "s" : ""
						] })]
					}), categories.map((category) => {
						const categoryRows = ownerSessions.filter((session) => session.category === category).sort((a, b) => a.school.localeCompare(b.school, "fr") || a.sessionId.localeCompare(b.sessionId, "fr"));
						if (!categoryRows.length) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "staffing-audit-category-group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `staffing-audit-category-group-heading ${category}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: categoryLabels[category] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: categoryRows.length })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "staffing-audit-list",
								children: categoryRows.map(sessionRow)
							})]
						}, category);
					})]
				}, owner || "unassigned");
			})
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "task-panel staffing-audit-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Pilotage du staffing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Bilan staffing" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: sectionTab === "general" ? "Analysez l’évolution du staffing sur une période." : "Importez un rapport, vérifiez une date puis enregistrez un bilan autonome." })
				] }), sectionTab === "daily" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "import-button",
					children: ["Importer un rapport CSV", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: ".csv,text/csv",
						disabled: saving,
						onChange: (event) => {
							importFile(event.target.files?.[0]);
							event.currentTarget.value = "";
						}
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "staffing-audit-main-tabs",
				role: "tablist",
				"aria-label": "Choisir la vue du bilan staffing",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": sectionTab === "general",
					className: sectionTab === "general" ? "active" : "",
					onClick: () => {
						setSectionTab("general");
						setView("history");
						setSelectedDate((current) => savedDays.some((day) => day.date === current) ? current : savedDays[0]?.date || "");
					},
					children: "📈 Bilan général"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": sectionTab === "daily",
					className: sectionTab === "daily" ? "active" : "",
					onClick: () => {
						setSectionTab("daily");
						setSelectedDate((current) => (view === "draft" ? draftDays : savedDays).some((day) => day.date === current) ? current : (view === "draft" ? draftDays[0]?.date : savedDays[0]?.date) || "");
					},
					children: "📅 Bilans par date et imports"
				})]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "enrollment-message",
				children: message
			}) : null,
			sectionTab === "daily" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "staffing-audit-source-tabs",
				children: [draftDays.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: view === "draft" ? "active" : "",
					onClick: () => {
						setView("draft");
						setSelectedDate(draftDays[0]?.date || "");
					},
					children: [
						"Import en cours (",
						draftDays.length,
						")"
					]
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: view === "history" ? "active" : "",
					onClick: () => {
						setView("history");
						setSelectedDate(savedDays[0]?.date || "");
					},
					children: [
						"Historique (",
						savedDays.length,
						")"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "staffing-audit-date-tabs",
				children: (view === "draft" ? draftDays : savedDays).map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: selectedDate === day.date ? "active" : "",
					onClick: () => setSelectedDate(day.date),
					children: [formatShortDate(day.date), savedDays.some((saved) => saved.date === day.date) && view === "draft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "déjà enregistré" }) : null]
				}, day.date))
			})] }) : null,
			activeDay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				sectionTab === "daily" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "staffing-audit-day-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatDate$1(activeDay.date) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						activeDay.sessions.length,
						" séances uniques · source : ",
						activeDay.sourceFileName
					] })] }), view === "draft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "button primary",
						onClick: () => void saveDay(),
						disabled: saving,
						children: "Enregistrer cette journée"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Enregistré le ", new Intl.DateTimeFormat("fr-FR", {
						dateStyle: "short",
						timeStyle: "short"
					}).format(new Date(activeDay.updatedAt))] })]
				}) : null,
				sectionTab === "daily" && totalTreatedSessions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "staffing-audit-removed-summary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: totalTreatedSessions.length }),
						" séance",
						totalTreatedSessions.length > 1 ? "s" : "",
						" retirée",
						totalTreatedSessions.length > 1 ? "s" : "",
						" du non-staffing pour cette date",
						categoryFilter !== "all" || ownerFilter !== "all" ? ` · ${filteredTreatedSessions.length} avec les filtres actuels` : ""
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setShowTreated((current) => !current),
						children: showTreated ? "Masquer" : "Voir et réactiver"
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "staffing-audit-category-filter",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Type de séance" }), [
						"all",
						"alpha",
						"surveillance",
						"service"
					].map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: categoryFilter === category ? "active" : "",
						onClick: () => setCategoryFilter(category),
						children: category === "all" ? "Tous les types" : categoryLabels[category]
					}, category))]
				}),
				sectionTab === "general" && savedDays.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "staffing-range-analysis",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "staffing-range-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow",
									children: "Analyse de période"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Évolution du non-staffing" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: categoryFilter === "all" ? "Tous les types de séances" : categoryLabels[categoryFilter] })
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-range-dates",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Du", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									min: historyDateBounds.first,
									max: effectiveAnalysisEndDate || historyDateBounds.last,
									value: effectiveAnalysisStartDate,
									onChange: (event) => setAnalysisStartDate(event.target.value)
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Au", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									min: effectiveAnalysisStartDate || historyDateBounds.first,
									max: historyDateBounds.last,
									value: effectiveAnalysisEndDate,
									onChange: (event) => setAnalysisEndDate(event.target.value)
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "staffing-range-kpis",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Séances totales" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: rangeAnalysis.total })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Séances non staffées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: rangeAnalysis.unstaffed })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "highlight",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Non-staffing global" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(rangeAnalysis.percentage), " %"] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "staffing-daily-chart",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "staffing-daily-chart-heading",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Évolution quotidienne" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Pourcentage de séances non staffées", tutorTypeSnapshot ? ` · Types selon « ${tutorTypeSnapshot.displayName} »` : " · Import de tuteurs avec la colonne Niveau requis pour classer ST"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "staffing-daily-chart-legend",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "percentage",
												children: "% non staffé"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Non staffées" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tuteurs distincts (ID)" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Séances non-ST" })
										]
									})]
								}),
								dailyChart.points.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "staffing-daily-chart-scroll",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
										role: "img",
										"aria-label": "Évolution quotidienne des séances non staffées, des tuteurs distincts et des séances réalisées par des non-ST identifiés",
										viewBox: `0 0 ${dailyChart.width} ${dailyChart.height}`,
										style: { minWidth: `${dailyChart.width}px` },
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
												id: "staffing-daily-line",
												x1: "0",
												y1: "0",
												x2: "1",
												y2: "0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
													offset: "0",
													stopColor: "#f472b6"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
													offset: "1",
													stopColor: "#be185d"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
												id: "staffing-daily-area",
												x1: "0",
												y1: "0",
												x2: "0",
												y2: "1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
													offset: "0",
													stopColor: "#f472b6",
													stopOpacity: ".22"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
													offset: "1",
													stopColor: "#f472b6",
													stopOpacity: ".02"
												})]
											})] }),
											Array.from({ length: 5 }, (_, index) => {
												const percentage = dailyChart.maximumPercentage / 4 * (4 - index);
												const y = dailyChart.plotTop + index / 4 * (dailyChart.plotBottom - dailyChart.plotTop);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
													className: "grid-line",
													x1: dailyChart.plotLeft,
													x2: dailyChart.plotRight,
													y1: y,
													y2: y
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
													className: "axis-label y",
													x: dailyChart.plotLeft - 8,
													y: y + 3,
													children: [new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(percentage), " %"]
												})] }, index);
											}),
											dailyChart.points.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
												className: "daily-area",
												points: `${dailyChart.points[0].x},${dailyChart.plotBottom} ${dailyChart.polyline} ${dailyChart.points[dailyChart.points.length - 1].x},${dailyChart.plotBottom}`
											}) : null,
											dailyChart.points.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
												className: "daily-line",
												points: dailyChart.polyline
											}) : null,
											dailyChart.points.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
												className: "daily-point",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
														className: "day-guide",
														x1: point.x,
														x2: point.x,
														y1: dailyChart.plotBottom,
														y2: dailyChart.plotBottom + 126
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
														cx: point.x,
														cy: point.y,
														r: "5",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `${formatDate$1(point.date)} : ${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(point.percentage)} % · ${point.unstaffed} non staffées sur ${point.total} · ${point.tutors} tuteur${point.tutors > 1 ? "s" : ""} distinct${point.tutors > 1 ? "s" : ""} par ID · ${point.unidentifiedTutors} référence${point.unidentifiedTutors > 1 ? "s" : ""} sans ID${point.nonStSessions === null ? " · classement ST indisponible" : ` · ${point.nonStSessions} séance${point.nonStSessions > 1 ? "s" : ""} avec non-ST identifié · ${point.unclassifiedTutorSessions} sans classement complet`}` })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
														className: "point-value",
														x: point.x,
														y: Math.max(dailyChart.plotTop + 9, point.y - 9),
														children: [new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(point.percentage), " %"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
														className: "axis-label date",
														x: point.x,
														y: dailyChart.plotBottom + 20,
														children: formatChartDate(point.date)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
														className: "daily-total",
														x: point.x,
														y: dailyChart.plotBottom + 43,
														children: point.total
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
														className: "daily-unstaffed",
														x: point.x,
														y: dailyChart.plotBottom + 64,
														children: point.unstaffed
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
														className: "daily-tutors",
														x: point.x,
														y: dailyChart.plotBottom + 85,
														children: point.tutors
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
														className: "daily-non-st",
														x: point.x,
														y: dailyChart.plotBottom + 106,
														children: point.nonStSessions === null ? "—" : point.nonStSessions
													}),
													point.unclassifiedTutorSessions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
														className: "daily-unclassified",
														x: point.x,
														y: dailyChart.plotBottom + 123,
														children: [
															"+",
															point.unclassifiedTutorSessions,
															" ?"
														]
													}) : null
												]
											}, point.date)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
												className: "daily-row-label",
												x: dailyChart.plotLeft - 8,
												y: dailyChart.plotBottom + 43,
												children: "Total"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
												className: "daily-row-label unstaffed",
												x: dailyChart.plotLeft - 8,
												y: dailyChart.plotBottom + 64,
												children: "Non staff."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
												className: "daily-row-label tutors",
												x: dailyChart.plotLeft - 8,
												y: dailyChart.plotBottom + 85,
												children: "Tuteurs"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
												className: "daily-row-label non-st",
												x: dailyChart.plotLeft - 8,
												y: dailyChart.plotBottom + 106,
												children: "Séances non-ST"
											})
										]
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "staffing-daily-chart-empty",
									children: "Aucune journée enregistrée sur cette période."
								}),
								tutorTypeSnapshot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "staffing-daily-chart-note",
									children: "Les séances avec « ? » n’ont pas pu être classées complètement à partir des noms et du Niveau dans la liste importée."
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "staffing-range-layout",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-range-rh",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Pourcentage non staffé par RH" }), rangeAnalysis.byOwner.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ownerLabels$1[row.owner] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										row.unstaffed,
										" non staffée",
										row.unstaffed > 1 ? "s" : "",
										" / ",
										row.total,
										" séance",
										row.total > 1 ? "s" : ""
									] })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "staffing-range-rate",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${Math.min(100, row.percentage)}%` } })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(row.percentage), " %"] })
								] }, row.owner))]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-range-schools",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Établissements les plus concernés" }), rangeAnalysis.topSchools.length ? rangeAnalysis.topSchools.map((school, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: index + 1 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: school.name }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: school.count })
								] }, school.name)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aucune séance non staffée sur cette période." })]
							})]
						})
					]
				}) : null,
				sectionTab === "daily" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "staffing-audit-summary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "head",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Responsable RH" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Staffées" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Non staffées" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "À vérifier" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" })
							]
						}), summary.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ownerLabels$1[row.owner] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.staffed }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "danger",
									children: row.unstaffed
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "warning",
									children: row.ambiguous
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.total })
							]
						}, row.owner || "unassigned"))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "staffing-audit-owner-filter",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Afficher les séances de" }), [
							"all",
							"kelly",
							"pierre",
							"julie",
							""
						].map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: ownerFilter === owner ? "active" : "",
							onClick: () => setOwnerFilter(owner),
							children: owner === "all" ? "Tous" : ownerLabels$1[owner]
						}, owner || "unassigned"))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "staffing-audit-session-mode",
						role: "tablist",
						"aria-label": "Choisir les séances à afficher",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "tab",
							"aria-selected": sessionListMode === "active",
							className: sessionListMode === "active" ? "active" : "",
							onClick: () => setSessionListMode("active"),
							children: ["Séances à traiter ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: activeSessions.length })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "tab",
							"aria-selected": sessionListMode === "staffed",
							className: sessionListMode === "staffed" ? "active" : "",
							onClick: () => setSessionListMode("staffed"),
							children: ["Séances staffées ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: staffedSessions.length })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "staffing-audit-list-heading",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: sessionListMode === "active" ? "Séances non staffées et à vérifier" : "Séances staffées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							sessionListMode === "active" ? filteredActiveSessions.length : filteredStaffedSessions.length,
							" affichée",
							(sessionListMode === "active" ? filteredActiveSessions.length : filteredStaffedSessions.length) > 1 ? "s" : "",
							ownerFilter !== "all" ? ` · ${sessionListMode === "active" ? activeSessions.length : staffedSessions.length} au total` : ""
						] })] })
					}),
					sessionListMode === "active" ? filteredActiveSessions.length ? groupedSessionRows(filteredActiveSessions) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "staffing-audit-list",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "empty-state compact",
							children: "Aucune séance active à traiter pour ce responsable et cette date."
						})
					}) : filteredStaffedSessions.length ? groupedSessionRows(filteredStaffedSessions) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "staffing-audit-list",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "empty-state compact",
							children: "Aucune séance staffée pour ce responsable et cette date."
						})
					}),
					showTreated && totalTreatedSessions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "staffing-audit-treated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "staffing-audit-treated-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Séances retirées du non-staffing" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								filteredTreatedSessions.length,
								" affichée",
								filteredTreatedSessions.length > 1 ? "s" : ""
							] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "staffing-audit-list",
							children: filteredTreatedSessions.length ? filteredTreatedSessions.map(sessionRow) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "empty-state compact",
								children: "Aucune séance retirée avec les filtres actuels."
							})
						})]
					}) : null
				] }) : null
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "empty-state",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📊" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: sectionTab === "general" ? "Aucun bilan enregistré" : "Aucun bilan sélectionné" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: sectionTab === "general" ? "Enregistrez au moins une journée dans l’onglet Bilans par date pour construire l’analyse générale." : "Importez un fichier de rapports ou ouvrez une journée déjà enregistrée." })
				]
			})
		]
	});
}
//#endregion
//#region app/components/staffing-evolution.tsx
var ownerLabels = {
	"": "Non attribué",
	kelly: "Kelly",
	pierre: "Pierre",
	julie: "Julie"
};
var kindLabels = {
	replacements: "Tuteur changé",
	additions: "Nouveau tuteur affecté",
	removals: "Tuteur retiré",
	appeared: "Session apparue",
	disappeared: "Session disparue"
};
function normalize(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}
function timestamp(value) {
	const parsed = new Date(value).getTime();
	return Number.isFinite(parsed) ? parsed : 0;
}
function importLabel(item) {
	const date = new Date(item.importedAt);
	const importedAt = Number.isNaN(date.getTime()) ? item.importedAt : new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "short",
		timeStyle: "short"
	}).format(date);
	return `${item.displayName} · ${importedAt}`;
}
function fullDate(value) {
	const date = /* @__PURE__ */ new Date(`${value}T12:00:00`);
	return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}
function tutorName(row) {
	return `${row.firstName} ${row.lastName}`.trim() || `ID ${row.tutorId}`;
}
function timeSlot(session) {
	return [session.startTime, session.endTime].filter(Boolean).join(" → ") || "Horaire non précisé";
}
function csvCell$1(value) {
	const text = String(value ?? "");
	return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}
function StaffingEvolution() {
	const [imports, setImports] = (0, import_react.useState)([]);
	const [loadedImports, setLoadedImports] = (0, import_react.useState)({});
	const [schools, setSchools] = (0, import_react.useState)([]);
	const [referenceId, setReferenceId] = (0, import_react.useState)("");
	const [recentId, setRecentId] = (0, import_react.useState)("");
	const [startDate, setStartDate] = (0, import_react.useState)("");
	const [endDate, setEndDate] = (0, import_react.useState)("");
	const [ownerFilter, setOwnerFilter] = (0, import_react.useState)("all");
	const [kindFilter, setKindFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const loadSummaries = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const [importsResponse, schoolsResponse] = await Promise.all([fetch("/api/upcoming-session-imports?summary=1", { cache: "no-store" }), fetch("/api/schools", { cache: "no-store" })]);
			const importsData = await importsResponse.json();
			const schoolsData = await schoolsResponse.json();
			if (!importsResponse.ok) throw new Error(importsData.detail || importsData.error || "Imports indisponibles");
			if (!schoolsResponse.ok) throw new Error(schoolsData.detail || schoolsData.error || "Établissements indisponibles");
			const nextImports = (importsData.imports ?? []).sort((a, b) => timestamp(b.importedAt) - timestamp(a.importedAt));
			setImports(nextImports);
			setSchools(schoolsData.schools ?? []);
			setRecentId((current) => nextImports.some((item) => item.id === current) ? current : nextImports[0]?.id || "");
			setReferenceId((current) => nextImports.some((item) => item.id === current) ? current : nextImports[1]?.id || nextImports[0]?.id || "");
			setMessage("");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Chargement impossible");
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(() => void loadSummaries(), 0);
		return () => window.clearTimeout(timer);
	}, [loadSummaries]);
	(0, import_react.useEffect)(() => {
		const ids = Array.from(new Set([referenceId, recentId].filter(Boolean))).filter((id) => !loadedImports[id]);
		if (!ids.length) return;
		let cancelled = false;
		Promise.all(ids.map(async (id) => {
			const response = await fetch(`/api/upcoming-session-imports?id=${encodeURIComponent(id)}`, { cache: "no-store" });
			const data = await response.json();
			if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Import indisponible");
			return data.import;
		})).then((items) => {
			if (!cancelled) setLoadedImports((current) => ({
				...current,
				...Object.fromEntries(items.map((item) => [item.id, item]))
			}));
		}).catch((error) => {
			if (!cancelled) setMessage(error instanceof Error ? error.message : "Chargement des fichiers impossible");
		});
		return () => {
			cancelled = true;
		};
	}, [
		loadedImports,
		recentId,
		referenceId
	]);
	const reference = loadedImports[referenceId] ?? null;
	const recent = loadedImports[recentId] ?? null;
	const dates = (0, import_react.useMemo)(() => Array.from(new Set([...reference?.staffingSessions ?? [], ...recent?.staffingSessions ?? []].map((row) => row.date).filter(Boolean))).sort(), [recent, reference]);
	const activeStartDate = dates.includes(startDate) ? startDate : dates[0] || "";
	const activeEndDate = dates.includes(endDate) ? endDate : dates.at(-1) || activeStartDate;
	const schoolByName = (0, import_react.useMemo)(() => new Map(schools.map((school) => [normalize(school.name), school])), [schools]);
	const schoolFor = (0, import_react.useCallback)((session) => schools.find((school) => session.schoolId && school.externalId === session.schoolId) || schoolByName.get(normalize(session.school)), [schoolByName, schools]);
	const ownerFor = (0, import_react.useCallback)((session) => schoolFor(session)?.portfolioOwner || "", [schoolFor]);
	const hasComparableSnapshots = Boolean(reference?.staffingSessions.length && recent?.staffingSessions.length);
	const changes = (0, import_react.useMemo)(() => {
		if (!reference || !recent) return [];
		const inRange = (date) => (!activeStartDate || date >= activeStartDate) && (!activeEndDate || date <= activeEndDate);
		const beforeSessions = new Map(reference.staffingSessions.filter((item) => inRange(item.date)).map((item) => [item.sessionId, item]));
		const afterSessions = new Map(recent.staffingSessions.filter((item) => inRange(item.date)).map((item) => [item.sessionId, item]));
		const items = [];
		new Set([...beforeSessions.keys(), ...afterSessions.keys()]).forEach((sessionId) => {
			const beforeSession = beforeSessions.get(sessionId);
			const afterSession = afterSessions.get(sessionId);
			if (beforeSession && !afterSession) {
				items.push({
					kind: "disappeared",
					session: beforeSession,
					before: beforeSession.tutors,
					after: [],
					beforeSourceRowCount: beforeSession.sourceRowCount,
					afterSourceRowCount: 0
				});
				return;
			}
			if (!beforeSession && afterSession) {
				items.push({
					kind: "appeared",
					session: afterSession,
					before: [],
					after: afterSession.tutors,
					beforeSourceRowCount: 0,
					afterSourceRowCount: afterSession.sourceRowCount
				});
				return;
			}
			if (!beforeSession || !afterSession) return;
			const beforeIds = new Set(beforeSession.tutors.map((item) => item.tutorId));
			const afterIds = new Set(afterSession.tutors.map((item) => item.tutorId));
			const added = afterSession.tutors.filter((item) => !beforeIds.has(item.tutorId));
			const removed = beforeSession.tutors.filter((item) => !afterIds.has(item.tutorId));
			if (added.length && removed.length) items.push({
				kind: "replacements",
				session: afterSession,
				before: removed,
				after: added,
				beforeSourceRowCount: beforeSession.sourceRowCount,
				afterSourceRowCount: afterSession.sourceRowCount
			});
			else {
				if (added.length) items.push({
					kind: "additions",
					session: afterSession,
					before: [],
					after: added,
					beforeSourceRowCount: beforeSession.sourceRowCount,
					afterSourceRowCount: afterSession.sourceRowCount
				});
				if (removed.length) items.push({
					kind: "removals",
					session: beforeSession,
					before: removed,
					after: [],
					beforeSourceRowCount: beforeSession.sourceRowCount,
					afterSourceRowCount: afterSession.sourceRowCount
				});
			}
		});
		return items.sort((a, b) => `${a.session.date} ${a.session.startTime} ${a.session.school}`.localeCompare(`${b.session.date} ${b.session.startTime} ${b.session.school}`, "fr"));
	}, [
		activeEndDate,
		activeStartDate,
		recent,
		reference
	]);
	const searchFilteredChanges = (0, import_react.useMemo)(() => {
		const normalizedQuery = normalize(query);
		if (!normalizedQuery) return changes;
		return changes.filter((item) => normalize(`${item.session.sessionId} ${item.session.school} ${item.session.category} ${timeSlot(item.session)} ${item.before.map(tutorName).join(" ")} ${item.after.map(tutorName).join(" ")}`).includes(normalizedQuery));
	}, [changes, query]);
	const countsByOwner = (0, import_react.useMemo)(() => [
		"kelly",
		"pierre",
		"julie",
		""
	].map((owner) => ({
		owner,
		replacements: searchFilteredChanges.filter((item) => ownerFor(item.session) === owner && item.kind === "replacements").length,
		additions: searchFilteredChanges.filter((item) => ownerFor(item.session) === owner && item.kind === "additions").length,
		removals: searchFilteredChanges.filter((item) => ownerFor(item.session) === owner && item.kind === "removals").length,
		appeared: searchFilteredChanges.filter((item) => ownerFor(item.session) === owner && item.kind === "appeared").length,
		disappeared: searchFilteredChanges.filter((item) => ownerFor(item.session) === owner && item.kind === "disappeared").length
	})), [ownerFor, searchFilteredChanges]);
	const filtered = (0, import_react.useMemo)(() => {
		return searchFilteredChanges.filter((item) => {
			const owner = ownerFor(item.session);
			const ownerMatches = ownerFilter === "all" || (ownerFilter === "unassigned" ? !owner : owner === ownerFilter);
			const kindMatches = kindFilter === "all" || item.kind === kindFilter;
			return ownerMatches && kindMatches;
		});
	}, [
		kindFilter,
		ownerFilter,
		ownerFor,
		searchFilteredChanges
	]);
	async function upload(file) {
		if (!file) return;
		setSaving(true);
		try {
			const response = await fetch(`/api/upcoming-session-imports?fileName=${encodeURIComponent(file.name)}`, {
				method: "POST",
				headers: { "Content-Type": "text/csv;charset=utf-8" },
				body: await file.text()
			});
			const data = await response.json();
			if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Import impossible");
			setLoadedImports((current) => ({
				...current,
				[data.import.id]: data.import
			}));
			setReferenceId(recentId || data.import.id);
			setRecentId(data.import.id);
			await loadSummaries();
			setMessage("Export Semaines à venir enregistré et prêt à comparer");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Import impossible");
		} finally {
			setSaving(false);
		}
	}
	function exportCsv() {
		const rows = [[
			"Évolution",
			"ID séance",
			"Date",
			"Horaire",
			"Établissement",
			"ID établissement",
			"Responsable RH",
			"Catégorie",
			"Lignes avant",
			"Lignes après",
			"Tuteurs avant",
			"Tuteurs après"
		], ...filtered.map((item) => [
			kindLabels[item.kind],
			item.session.sessionId,
			item.session.date,
			timeSlot(item.session),
			item.session.school,
			item.session.schoolId,
			ownerLabels[ownerFor(item.session)],
			item.session.category,
			item.beforeSourceRowCount,
			item.afterSourceRowCount,
			item.before.map((row) => `${tutorName(row)} (#${row.tutorId})`).join(" | "),
			item.after.map((row) => `${tutorName(row)} (#${row.tutorId})`).join(" | ")
		])];
		const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell$1).join(";")).join("\n")}`], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `evolution-staffing-${activeStartDate || "debut"}-${activeEndDate || "fin"}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}
	const totalScope = ownerFilter === "all" ? searchFilteredChanges : searchFilteredChanges.filter((item) => ownerFilter === "unassigned" ? !ownerFor(item.session) : ownerFor(item.session) === ownerFilter);
	const totals = Object.keys(kindLabels).map((kind) => ({
		kind,
		count: totalScope.filter((item) => item.kind === kind).length
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "task-panel staffing-evolution",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Comparaison des exports Semaines à venir"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Évolution staffing" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Comparez les tuteurs réellement affectés à chaque session entre deux exports successifs." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "filters",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "import-button",
						children: ["Importer Semaines à venir", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: ".csv,text/csv",
							disabled: saving,
							onChange: (event) => {
								upload(event.target.files?.[0]);
								event.currentTarget.value = "";
							}
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "button quiet",
						onClick: () => void loadSummaries(),
						disabled: loading,
						children: "↻ Actualiser"
					})]
				})]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "enrollment-message",
				children: message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "staffing-evolution-controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Export de référence", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: referenceId,
						onChange: (event) => setReferenceId(event.target.value),
						children: imports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.id,
							children: importLabel(item)
						}, item.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						children: "→"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Export récent", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: recentId,
						onChange: (event) => setRecentId(event.target.value),
						children: imports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.id,
							children: importLabel(item)
						}, item.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Du", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: activeStartDate,
						onChange: (event) => {
							const next = event.target.value;
							setStartDate(next);
							if (activeEndDate && next > activeEndDate) setEndDate(next);
						},
						children: dates.map((date) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: date,
							children: fullDate(date)
						}, date))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Au", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: activeEndDate,
						onChange: (event) => {
							const next = event.target.value;
							setEndDate(next);
							if (activeStartDate && next < activeStartDate) setStartDate(next);
						},
						children: dates.map((date) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: date,
							children: fullDate(date)
						}, date))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Recherche", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "ID, établissement ou tuteur…"
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "staffing-comparison-note",
				children: "Les sessions sont rapprochées prioritairement par leur ID séance. Les groupes et élèves présents sur plusieurs lignes ne créent pas de doublons."
			}),
			reference && recent && !hasComparableSnapshots ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "staffing-evolution-legacy-warning",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Ces anciens imports ne contiennent pas le détail des tuteurs staffés." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Réimportez les deux exports « Semaines à venir » dans cet onglet pour obtenir une comparaison complète." })]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "staffing-evolution-totals",
				children: totals.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `${item.kind} ${kindFilter === item.kind ? "active" : ""}`,
					onClick: () => setKindFilter((current) => current === item.kind ? "all" : item.kind),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: kindLabels[item.kind] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.count })]
				}, item.kind))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "staffing-evolution-owner-table",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "head",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Responsable RH" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nouveaux tuteurs" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Changements" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tuteurs retirés" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sessions apparues" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sessions disparues" })
					]
				}), countsByOwner.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: (ownerFilter === "unassigned" ? !row.owner : ownerFilter === row.owner) ? "active" : "",
					onClick: () => setOwnerFilter((current) => current === (row.owner || "unassigned") ? "all" : row.owner || "unassigned"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ownerLabels[row.owner] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.additions }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.replacements }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.removals }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.appeared }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.disappeared })
					]
				}, row.owner || "unassigned"))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "staffing-evolution-list-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
					filtered.length,
					" évolution",
					filtered.length > 1 ? "s" : ""
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [activeStartDate && activeEndDate ? `Du ${fullDate(activeStartDate)} au ${fullDate(activeEndDate)}` : "Toutes les dates des deux exports", ownerFilter !== "all" ? ` · ${ownerFilter === "unassigned" ? ownerLabels[""] : ownerLabels[ownerFilter]}` : ""] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ghost-button",
					onClick: exportCsv,
					disabled: !filtered.length,
					children: "Export CSV"
				})]
			}),
			!reference || !recent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "empty-state compact",
				children: imports.length < 2 ? "Importez au moins deux exports Semaines à venir pour commencer." : "Chargement des deux fichiers…"
			}) : !hasComparableSnapshots ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "empty-state compact",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Réimport nécessaire" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Les anciens imports restent disponibles pour les séances non affectées, mais ne contiennent pas les noms et ID des tuteurs staffés." })]
			}) : filtered.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "staffing-evolution-results",
				children: filtered.map((item, index) => {
					const school = schoolFor(item.session);
					const renderTutors = (rows) => rows.length ? rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAdminLink, {
						personId: row.tutorId,
						status: "tutor",
						children: tutorName(row)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
						"#",
						row.tutorId,
						row.phone ? ` · ${row.phone}` : ""
					] })] }, `${row.tutorId}-${row.phone}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Aucun tuteur" });
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: `staffing-evolution-card ${item.kind}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-evolution-session",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										fullDate(item.session.date),
										" · ",
										timeSlot(item.session),
										" · #",
										item.session.sessionId
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
										schoolId: item.session.schoolId || school?.externalId,
										children: item.session.school || "Établissement non précisé"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										item.session.category || "Catégorie non précisée",
										" · RH : ",
										ownerLabels[ownerFor(item.session)]
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
										className: "staffing-evolution-row-count",
										children: [
											"Lignes : avant ",
											item.beforeSourceRowCount || "—",
											" · après ",
											item.afterSourceRowCount || "—"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "staffing-evolution-kind",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: kindLabels[item.kind] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-evolution-before",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Avant" }), renderTutors(item.before)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-evolution-after",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Après" }), renderTutors(item.after)]
							})
						]
					}, `${item.kind}-${item.session.sessionId}-${index}`);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "empty-state compact",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✓" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucune évolution détectée" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Les deux exports sont identiques pour les filtres sélectionnés." })
				]
			})
		]
	});
}
//#endregion
//#region app/page.tsx
var AUTHOR_KEY = "petit-suivi-auteur-v2";
var DENSITY_KEY = "petit-suivi-densite-v2";
var appModeSlugs = {
	dashboard: "accueil",
	tasks: "taches",
	recurring: "recurrences",
	links: "liens",
	objectives: "objectifs",
	history: "historique",
	journal: "journal",
	schools: "etablissements",
	communications: "communications",
	staffing: "staffing",
	staffingAudit: "bilan-staffing",
	staffingEvolution: "evolution-staffing",
	watchlist: "a-suivre",
	tutorReports: "bilans-tuteurs",
	tutors: "tuteurs",
	availability: "comparaison-dispos",
	availabilityFeed: "fil-disponibilites",
	enrollments: "comparaison-inscriptions",
	coverage: "couverture-tuteurs",
	unstaffed: "seances-non-affectees",
	files: "fichiers"
};
var appModeAliases = {
	accueil: "dashboard",
	home: "dashboard",
	dashboard: "dashboard",
	taches: "tasks",
	tâches: "tasks",
	tasks: "tasks",
	liens: "links",
	links: "links",
	objectifs: "objectives",
	objectives: "objectives",
	historique: "history",
	history: "history",
	journal: "journal",
	etablissements: "schools",
	établissements: "schools",
	schools: "schools",
	communications: "communications",
	staffing: "staffing",
	"bilan-staffing": "staffingAudit",
	"historique-staffing": "staffingAudit",
	"evolution-staffing": "staffingEvolution",
	"comparaison-staffing": "staffingEvolution",
	"bilans-tuteurs": "tutorReports",
	bilans: "tutorReports",
	tuteurs: "tutors",
	"suivi-tuteurs": "tutors",
	tutors: "tutors",
	disponibilites: "availability",
	disponibilités: "availability",
	"comparaison-dispos": "availability",
	"comparaison-disponibilites": "availability",
	"comparaison-disponibilités": "availability",
	availability: "availability",
	"fil-disponibilites": "availabilityFeed",
	"fil-disponibilités": "availabilityFeed",
	"disponibilites-du-jour": "availabilityFeed",
	inscriptions: "enrollments",
	"comparaison-inscriptions": "enrollments",
	parents: "enrollments",
	couverture: "coverage",
	"couverture-tuteurs": "coverage",
	affectations: "coverage",
	"seances-non-affectees": "unstaffed",
	"séances-non-affectées": "unstaffed",
	"a-staffer": "unstaffed",
	unstaffed: "unstaffed",
	fichiers: "files",
	files: "files",
	tutorreports: "tutorReports",
	tutorReports: "tutorReports",
	"tutor-reports": "tutorReports",
	"a-suivre": "watchlist",
	"à-suivre": "watchlist",
	suivis: "watchlist",
	watchlist: "watchlist"
};
function normalizeUrlToken(value) {
	return (value || "").trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function digitsOnly(value) {
	return value.replace(/\D/g, "");
}
function tutorIdentityKey(entry) {
	const explicitId = entry.tutorId.trim();
	if (explicitId) return `id:${explicitId.toLocaleLowerCase("fr")}`;
	return `unresolved-entry:${entry.id}`;
}
function tutorDisplayName(entry) {
	return `${entry.firstName} ${entry.lastName}`.trim() || entry.tutorId || "Tuteur sans nom";
}
function tutorTrackingKey(record) {
	const explicitId = record.tutorId.trim();
	return explicitId ? `id:${explicitId.toLocaleLowerCase("fr")}` : "";
}
function tutorLookupName(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}
function resolveTutorReportEntries(entries, records) {
	const byPhone = /* @__PURE__ */ new Map();
	const byName = /* @__PURE__ */ new Map();
	records.forEach((record) => {
		if (!record.tutorId) return;
		const phone = digitsOnly(record.phone);
		if (phone) byPhone.set(phone, new Set([...byPhone.get(phone) ?? [], record.tutorId]));
		const name = tutorLookupName(`${record.firstName} ${record.lastName}`);
		if (name) byName.set(name, new Set([...byName.get(name) ?? [], record.tutorId]));
	});
	const uniqueId = (set) => set?.size === 1 ? Array.from(set)[0] : "";
	return entries.map((entry) => ({
		...entry,
		tutorId: entry.tutorId || uniqueId(digitsOnly(entry.phone) ? byPhone.get(digitsOnly(entry.phone)) : void 0) || uniqueId(byName.get(tutorLookupName(`${entry.firstName} ${entry.lastName}`)))
	}));
}
function tutorTrackingDisplayName(record) {
	return `${record.firstName} ${record.lastName}`.trim() || record.tutorId || record.email || "Tuteur sans nom";
}
function appModeFromUrl(url) {
	const fromSearch = normalizeUrlToken(url.searchParams.get("onglet") || url.searchParams.get("tab"));
	const fromHash = normalizeUrlToken(url.hash.replace(/^#/, ""));
	return appModeAliases[fromSearch] || appModeAliases[fromHash] || null;
}
var emptyDraft = {
	title: "",
	description: "",
	owner: "",
	assigneeId: null,
	startDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
	endDate: "",
	estimatedHours: null,
	status: "todo",
	priority: "medium",
	verified: false,
	verificationOwner: "",
	verificationComment: ""
};
var emptyPersonDraft = {
	id: null,
	name: "",
	email: "",
	active: true
};
var emptyRecurringDraft = {
	title: "",
	description: "",
	owner: "",
	assigneeId: null,
	estimatedHours: null,
	priority: "medium"
};
var emptyObjectiveDraft = {
	kind: "counter",
	title: "",
	description: "",
	targetLabel: "élèves",
	currentValue: null,
	targetValue: null,
	startDate: "",
	endDate: "",
	status: "progress",
	progressNote: "",
	personIds: []
};
var emptyQualitativeObjectiveDraft = {
	kind: "qualitative",
	title: "",
	description: "",
	targetLabel: "",
	currentValue: null,
	targetValue: null,
	startDate: "",
	endDate: "",
	status: "progress",
	progressNote: "",
	personIds: []
};
var emptyLinkDraft = {
	title: "",
	description: "",
	url: ""
};
var emptyJournalDraft = {
	title: "",
	content: "",
	author: "",
	tags: [],
	personIds: [],
	publishedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
};
var emptyCommunicationDraft = {
	title: "",
	messageSummary: "",
	audiences: [],
	recipients: [],
	channel: "Email",
	status: "sent",
	sentAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
	followUpDate: "",
	author: "",
	notes: "",
	tags: []
};
var emptySchoolWatchDraft = {
	schoolId: "",
	reason: "",
	tags: [],
	status: "active",
	initialComment: "",
	author: ""
};
var emptySchoolDraft = {
	externalId: "",
	name: "",
	category: "",
	schoolType: "alpha",
	portfolioOwner: "",
	zone: "",
	coordinator: "",
	registeredCount: null,
	city: "",
	address: "",
	department: "",
	upcomingWeek: "",
	pastSessions: "",
	typicalWeek: "",
	contractSigned: "",
	actions: "",
	contact: "",
	nextAction: "",
	notes: ""
};
var emptySchoolEventDraft = {
	kind: "action",
	title: "",
	note: "",
	author: "",
	tags: [],
	date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
};
var schoolEventKindLabels = {
	event: "Événement",
	comment: "Commentaire",
	action: "Action réalisée"
};
var schoolTypeLabels = {
	alpha: "Étude Alpha",
	"mise-a-dispo": "Mise à disposition",
	mixed: "Mixte / autre"
};
var schoolPortfolioOwnerLabels = {
	"": "Non attribué",
	kelly: "Kelly",
	pierre: "Pierre",
	julie: "Julie"
};
var schoolPortfolioOwnerEmails = {
	"": "",
	kelly: "kelly@etudealpha.fr",
	pierre: "pierre@etudealpha.fr",
	julie: "julie@etudealpha.fr"
};
var communicationAudienceLabels = {
	tuteurs: "Tuteurs",
	candidats: "Candidats",
	etablissements: "Établissements",
	parents: "Parents",
	coordinateurs: "Coordinateurs"
};
var communicationStatusLabels = {
	draft: "Brouillon",
	sent: "Envoyé",
	"to-follow-up": "À relancer",
	cancelled: "Annulé"
};
var communicationAudiences = [
	"tuteurs",
	"candidats",
	"etablissements",
	"parents",
	"coordinateurs"
];
var communicationStatuses = [
	"all",
	"sent",
	"to-follow-up",
	"draft",
	"cancelled"
];
var communicationChannels = [
	"Email",
	"SMS",
	"WhatsApp",
	"Téléphone",
	"Réunion",
	"Autre"
];
var staffingPeople = [
	{
		key: "pierre",
		label: "Pierre"
	},
	{
		key: "julie",
		label: "Julie"
	},
	{
		key: "kelly",
		label: "Kelly"
	}
];
var schoolWatchTags = [
	"Nouvel établissement",
	"Nouveau besoin",
	"Suivi particulier"
];
var schoolWatchStatusLabels = {
	active: "Actif",
	resolved: "Résolu"
};
var crmTagSuggestions = [
	"Problème à résoudre",
	"Communication envoyée",
	"Mécontentement signalé",
	"Contentement signalé",
	"Relance à faire",
	"Rendez-vous prévu",
	"Décision prise",
	"Information importante",
	"Contrat / administratif",
	"Inscription / élèves",
	"Surveillance / séances",
	"Besoins mis à jour"
];
var statusLabels = {
	todo: "A faire",
	progress: "En cours",
	done: "Terminee"
};
var objectiveStatusLabels = {
	todo: "A preparer",
	progress: "En cours",
	done: "Atteint"
};
var priorityLabels = {
	low: "Basse",
	medium: "Moyenne",
	high: "Haute"
};
var priorityRank = {
	high: 0,
	medium: 1,
	low: 2
};
var matrixPriorities = [
	"high",
	"medium",
	"low"
];
var durationBuckets = [
	{
		value: "short",
		label: "Courte",
		hint: "≤ 1 h"
	},
	{
		value: "medium",
		label: "Moyenne",
		hint: "1 h à 4 h"
	},
	{
		value: "long",
		label: "Longue",
		hint: "> 4 h"
	},
	{
		value: "unset",
		label: "Sans durée",
		hint: "à préciser"
	}
];
function uid(prefix) {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function numberFromText(value) {
	const match = value.replace(",", ".").match(/\d+(?:\.\d+)?/);
	if (!match) return null;
	const parsed = Number(match[0]);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
function normalizePositiveNumber(value, allowZero = false) {
	const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value.replace(",", ".")) : null;
	if (parsed === null || !Number.isFinite(parsed)) return null;
	if (allowZero && parsed === 0) return 0;
	return parsed > 0 ? parsed : null;
}
function formatObjectiveNumber(value) {
	if (value === null) return "";
	return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value);
}
function objectiveProgressPercent(objective) {
	if (!objective?.targetValue || objective.targetValue <= 0) return 0;
	return Math.max(0, Math.min(100, Math.floor((objective.currentValue ?? 0) / objective.targetValue * 100)));
}
function objectiveNextStep(objective) {
	const current = objective.currentValue ?? 0;
	const target = objective.targetValue ?? 0;
	if (!target || target <= 0 || current >= target) return {
		nextPercent: 100,
		missing: 0
	};
	const currentPercent = objectiveProgressPercent(objective);
	const nextPercent = Math.min(100, currentPercent + 1);
	return {
		nextPercent,
		missing: Math.max(0, Math.ceil(target * nextPercent / 100 - current))
	};
}
function normalizeUrl(value) {
	const clean = value.trim();
	if (!clean) return "";
	return clean.startsWith("http://") || clean.startsWith("https://") ? clean : `https://${clean}`;
}
function normalizeSharedLink(raw) {
	return {
		id: raw.id || uid("link"),
		title: raw.title || "",
		description: raw.description || "",
		url: normalizeUrl(raw.url || ""),
		createdAt: raw.createdAt || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function normalizeTags(value) {
	const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
	return Array.from(new Set(source.map((item) => typeof item === "string" ? item.trim() : "").filter(Boolean)));
}
function tagsToText(tags) {
	return tags.join(", ");
}
function excerpt(value, maxLength = 180) {
	const clean = value.replace(/\s+/g, " ").trim();
	if (clean.length <= maxLength) return clean;
	return `${clean.slice(0, maxLength).trim()}…`;
}
function formatJournalDate(value) {
	const date = value.includes("T") ? new Date(value) : /* @__PURE__ */ new Date(`${value}T12:00:00`);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("fr-FR", {
		day: "numeric",
		month: "long",
		year: "numeric"
	}).format(date);
}
function normalizeJournalPost(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: raw.id || uid("journal"),
		title: raw.title || "",
		content: raw.content || "",
		author: raw.author || "Equipe Alpha",
		tags: normalizeTags(raw.tags),
		personIds: Array.isArray(raw.personIds) ? raw.personIds.filter(Boolean) : [],
		likes: Array.isArray(raw.likes) ? raw.likes.map((like) => ({
			id: like.id || uid("like"),
			author: like.author || "Anonyme",
			createdAt: like.createdAt || now
		})) : [],
		comments: Array.isArray(raw.comments) ? raw.comments.map((comment) => ({
			id: comment.id || uid("social-comment"),
			text: comment.text || "",
			author: comment.author || "Anonyme",
			createdAt: comment.createdAt || now
		})).filter((comment) => comment.text.trim()) : [],
		publishedAt: raw.publishedAt || now,
		createdAt: raw.createdAt || now,
		updatedAt: raw.updatedAt || raw.createdAt || now
	};
}
function normalizeMassCommunication(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: raw.id || uid("communication"),
		title: raw.title || "",
		messageSummary: raw.messageSummary || "",
		audiences: Array.isArray(raw.audiences) ? raw.audiences.filter((audience) => communicationAudiences.includes(audience)) : [],
		recipients: Array.isArray(raw.recipients) ? Array.from(new Set(raw.recipients.map((item) => String(item).trim()).filter(Boolean))) : [],
		channel: raw.channel || "Email",
		status: raw.status === "draft" || raw.status === "sent" || raw.status === "to-follow-up" || raw.status === "cancelled" ? raw.status : "sent",
		sentAt: raw.sentAt || "",
		followUpDate: raw.followUpDate || "",
		author: raw.author || "Equipe Alpha",
		notes: raw.notes || "",
		tags: normalizeTags(raw.tags),
		createdAt: raw.createdAt || now,
		updatedAt: raw.updatedAt || raw.createdAt || now
	};
}
function normalizeSessionCount(value) {
	const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : 0;
	return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}
function normalizeStaffingPerson(raw) {
	return {
		staffedSessions: normalizeSessionCount(raw?.staffedSessions),
		unstaffedSessions: normalizeSessionCount(raw?.unstaffedSessions)
	};
}
function staffingPeopleTotals(people) {
	return staffingPeople.reduce((totals, person) => {
		totals.staffed += people[person.key].staffedSessions;
		totals.unstaffed += people[person.key].unstaffedSessions;
		return totals;
	}, {
		staffed: 0,
		unstaffed: 0
	});
}
function staffingDayTotals(day) {
	return {
		staffed: normalizeSessionCount(day.totalStaffedSessions),
		unstaffed: normalizeSessionCount(day.totalUnstaffedSessions)
	};
}
function staffingUnstaffedPercent(staffed, unstaffed) {
	const total = staffed + unstaffed;
	if (total <= 0) return 0;
	return Math.round(unstaffed / total * 100);
}
function normalizeStaffingDay(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const date = raw.date || now.slice(0, 10);
	const people = {
		pierre: normalizeStaffingPerson(raw.people?.pierre),
		julie: normalizeStaffingPerson(raw.people?.julie),
		kelly: normalizeStaffingPerson(raw.people?.kelly)
	};
	const peopleTotals = staffingPeopleTotals(people);
	return {
		id: raw.id || `staffing-${date}`,
		date,
		people,
		totalStaffedSessions: raw.totalStaffedSessions === void 0 || raw.totalStaffedSessions === null ? peopleTotals.staffed : normalizeSessionCount(raw.totalStaffedSessions),
		totalUnstaffedSessions: raw.totalUnstaffedSessions === void 0 || raw.totalUnstaffedSessions === null ? peopleTotals.unstaffed : normalizeSessionCount(raw.totalUnstaffedSessions),
		createdAt: raw.createdAt || now,
		updatedAt: raw.updatedAt || raw.createdAt || now
	};
}
function normalizeTutorReportEntry(raw) {
	return {
		id: raw.id || uid("tutor-report-entry"),
		tutorId: raw.tutorId || "",
		lastName: raw.lastName || "",
		firstName: raw.firstName || "",
		phone: raw.phone || "",
		school: raw.school || "",
		studentCount: normalizeSessionCount(raw.studentCount),
		missingReportCount: normalizeSessionCount(raw.missingReportCount),
		comment: raw.comment || ""
	};
}
function normalizeTutorReportSnapshot(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const date = raw.date || now.slice(0, 10);
	return {
		id: raw.id || `tutor-reports-${date}`,
		date,
		comment: raw.comment || "",
		entries: Array.isArray(raw.entries) ? raw.entries.map(normalizeTutorReportEntry).filter((entry) => entry.tutorId || entry.lastName || entry.firstName || entry.phone || entry.school) : [],
		createdAt: raw.createdAt || now,
		updatedAt: raw.updatedAt || raw.createdAt || now
	};
}
function normalizeTutorReportComment(raw) {
	const legacyKey = raw.tutorKey || "";
	return {
		tutorId: raw.tutorId || (/^id:(.+)$/i.exec(legacyKey)?.[1] ?? ""),
		comment: raw.comment || "",
		updatedAt: raw.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function normalizeTutorTrackingRecord(raw) {
	const record = {
		key: "",
		tutorId: raw.tutorId || "",
		lastName: raw.lastName || "",
		firstName: raw.firstName || "",
		phone: raw.phone || "",
		email: raw.email || "",
		school: raw.school || "",
		wantedCity: raw.wantedCity || "",
		level: raw.level || ""
	};
	return {
		...record,
		key: record.key || tutorTrackingKey(record)
	};
}
function normalizeTutorTrackingSnapshot(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const date = raw.date || now.slice(0, 10);
	return {
		id: raw.id || `tutor-tracking-${date}`,
		date,
		displayName: raw.displayName || raw.fileName || `Liste tuteurs du ${date}`,
		fileName: raw.fileName || "liste-tuteurs.csv",
		sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || (Array.isArray(raw.records) ? raw.records.length : 0))),
		records: Array.isArray(raw.records) ? raw.records.map(normalizeTutorTrackingRecord).filter((record) => record.tutorId) : [],
		createdAt: raw.createdAt || now,
		updatedAt: raw.updatedAt || raw.createdAt || now
	};
}
function normalizeTutorTrackingComment(raw) {
	const legacyKey = raw.tutorKey || "";
	return {
		tutorId: raw.tutorId || (/^id:(.+)$/i.exec(legacyKey)?.[1] ?? ""),
		comment: raw.comment || "",
		updatedAt: raw.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function normalizeTutorTrackingData(raw) {
	return {
		snapshots: Array.isArray(raw.snapshots) ? raw.snapshots.map(normalizeTutorTrackingSnapshot).sort((a, b) => sortDateValue(b.date) - sortDateValue(a.date) || sortDateValue(b.createdAt) - sortDateValue(a.createdAt)) : [],
		comments: Array.isArray(raw.comments) ? raw.comments.map(normalizeTutorTrackingComment).filter((comment) => comment.tutorId) : []
	};
}
function normalizeAvailabilityRow(raw) {
	return {
		tutorId: raw.tutorId || "",
		lastName: raw.lastName || "",
		firstName: raw.firstName || "",
		grade: raw.grade || "",
		phone: raw.phone || "",
		date: raw.date || "",
		school: raw.school || "",
		className: raw.className || "",
		timeSlot: raw.timeSlot || "",
		sessionId: raw.sessionId || "",
		visitCount: raw.visitCount || "",
		group: raw.group || "",
		studentCount: raw.studentCount || "",
		groupScore: raw.groupScore || ""
	};
}
function normalizeAvailabilityImport(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: raw.id || uid("availability"),
		importedAt: raw.importedAt || now,
		displayName: raw.displayName || raw.fileName?.replace(/\.[^.]+$/, "") || "Import de disponibilités",
		fileName: raw.fileName || "disponibilites.csv",
		rows: Array.isArray(raw.rows) ? raw.rows.map(normalizeAvailabilityRow).filter((row) => row.tutorId && row.date) : [],
		rawCsv: raw.rawCsv || "",
		hasRawCsv: raw.hasRawCsv === true || Boolean(raw.rawCsv),
		createdAt: raw.createdAt || now
	};
}
function availabilityTutorName(tutor) {
	return `${tutor.firstName} ${tutor.lastName}`.trim() || tutor.tutorId || "Tuteur sans nom";
}
function availabilitySourceKey(input) {
	if (input.sessionId) return `${input.sessionId}:${input.personId.trim()}:${input.source}`;
	return [
		"comparison",
		input.source,
		input.personId.trim(),
		input.date,
		normalizedSchoolLookupName(input.school),
		input.timeSlot
	].map((part) => encodeURIComponent(part)).join("|");
}
function groupAvailabilityPeople(input) {
	const byTutor = /* @__PURE__ */ new Map();
	const add = (person, row, source, validatedInterest = false) => {
		const personId = person.id.trim();
		if (!personId || row.date !== input.date || !input.sources.includes(source)) return;
		const exclusionKey = availabilitySourceKey({
			sessionId: row.sessionId,
			personId,
			source,
			date: row.date,
			school: row.school,
			timeSlot: row.timeSlot
		});
		if (input.exclusions.has(exclusionKey)) return;
		const existing = byTutor.get(personId) ?? {
			tutorId: personId,
			lastName: person.lastName,
			firstName: person.firstName,
			phone: person.phone,
			grade: person.grade,
			rows: [],
			status: !input.tutorIds ? "unknown" : input.tutorIds.has(personId) ? "tutor" : "candidate"
		};
		existing.lastName ||= person.lastName;
		existing.firstName ||= person.firstName;
		existing.phone ||= person.phone;
		existing.grade ||= person.grade;
		const rowKey = row.sessionId || `${normalizedSchoolLookupName(row.school)}|${row.timeSlot}`;
		const existingRow = existing.rows.find((item) => (item.sessionId || `${normalizedSchoolLookupName(item.school)}|${item.timeSlot}`) === rowKey);
		if (existingRow) {
			existingRow.sources = Array.from(new Set([...existingRow.sources, source]));
			existingRow.validatedInterest ||= validatedInterest;
		} else existing.rows.push({
			...row,
			sources: [source],
			validatedInterest
		});
		byTutor.set(personId, existing);
	};
	input.availabilityRows.forEach((row) => add({
		id: row.tutorId,
		lastName: row.lastName,
		firstName: row.firstName,
		phone: row.phone,
		grade: row.grade
	}, {
		date: row.date,
		school: row.school,
		className: row.className,
		timeSlot: row.timeSlot,
		sessionId: row.sessionId,
		group: row.group
	}, "availability"));
	input.interestRows.forEach((row) => add({
		id: row.personId,
		lastName: row.lastName,
		firstName: row.firstName,
		phone: row.phone,
		grade: ""
	}, {
		date: row.date,
		school: row.school,
		className: row.className,
		timeSlot: row.timeSlot,
		sessionId: row.sessionId,
		group: row.group
	}, "interest", row.validated));
	byTutor.forEach((person) => person.rows.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot, "fr")));
	return byTutor;
}
function bestAvailabilityDate(rows, preferredDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
	const counts = rows.reduce((map, row) => {
		if (!row.date) return map;
		map.set(row.date, (map.get(row.date) || 0) + 1);
		return map;
	}, /* @__PURE__ */ new Map());
	if (counts.has(preferredDate)) return preferredDate;
	return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || sortDateValue(a[0]) - sortDateValue(b[0]))[0]?.[0] || "";
}
function parseCsvLine(line, delimiter) {
	const cells = [];
	let current = "";
	let quoted = false;
	for (let index = 0; index < line.length; index += 1) {
		const char = line[index];
		const next = line[index + 1];
		if (char === "\"" && quoted && next === "\"") {
			current += "\"";
			index += 1;
		} else if (char === "\"") quoted = !quoted;
		else if ((delimiter ? char === delimiter : char === "," || char === ";" || char === "	") && !quoted) {
			cells.push(current.trim());
			current = "";
		} else current += char;
	}
	cells.push(current.trim());
	return cells;
}
function detectCsvDelimiter(value) {
	const firstLine = value.split(/\r?\n/).find((line) => line.trim()) || "";
	return [
		";",
		"	",
		","
	].map((delimiter) => ({
		delimiter,
		count: parseCsvLine(firstLine, delimiter).length
	})).sort((a, b) => b.count - a.count)[0]?.delimiter || ";";
}
function parseCsvRows(value) {
	const delimiter = detectCsvDelimiter(value);
	const rows = [];
	let row = [];
	let current = "";
	let quoted = false;
	for (let index = 0; index < value.length; index += 1) {
		const char = value[index];
		const next = value[index + 1];
		if (char === "\"" && quoted && next === "\"") {
			current += "\"";
			index += 1;
		} else if (char === "\"") quoted = !quoted;
		else if (char === delimiter && !quoted) {
			row.push(current.trim());
			current = "";
		} else if ((char === "\n" || char === "\r") && !quoted) {
			if (char === "\r" && next === "\n") index += 1;
			row.push(current.trim());
			if (row.some(Boolean)) rows.push(row);
			row = [];
			current = "";
		} else current += char;
	}
	row.push(current.trim());
	if (row.some(Boolean)) rows.push(row);
	return rows;
}
function csvCell(value) {
	return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}
function normalizedHeader(value) {
	return value.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");
}
function parseTutorTrackingCsv(value) {
	const rows = parseCsvRows(value).filter((row) => row.some(Boolean));
	if (!rows.length) return [];
	const firstRow = rows[0].map(normalizedHeader);
	const hasHeader = firstRow.some((cell) => [
		"id",
		"nom",
		"nomtuteur",
		"nomdusage",
		"prenom",
		"prenomtuteur",
		"telephone",
		"numerodetelephone",
		"tel",
		"email",
		"etablissement",
		"etablissements",
		"ville",
		"villesouhaitee",
		"villesouhaitees",
		"niveau"
	].includes(cell));
	const headers = hasHeader ? firstRow : [
		"id",
		"nom",
		"prenom",
		"telephone",
		"etablissement",
		"email",
		"villesouhaitee"
	];
	const dataRows = hasHeader ? rows.slice(1) : rows;
	const indexFor = (aliases) => {
		for (const alias of aliases) {
			const index = headers.findIndex((header) => header === alias);
			if (index >= 0) return index;
		}
		return -1;
	};
	const idIndex = indexFor([
		"id",
		"idtuteur",
		"tutorid",
		"identifiant"
	]);
	const lastNameIndex = indexFor([
		"nomtuteur",
		"nomdusage",
		"nom",
		"lastname",
		"name"
	]);
	const firstNameIndex = indexFor([
		"prenom",
		"prenomtuteur",
		"firstname"
	]);
	const phoneIndex = indexFor([
		"telephone",
		"numerodetelephone",
		"tel",
		"phone",
		"mobile"
	]);
	const emailIndex = indexFor([
		"email",
		"mail",
		"courriel"
	]);
	const schoolIndex = indexFor([
		"etablissement",
		"etablissements",
		"school",
		"ecole"
	]);
	const wantedCityIndex = indexFor([
		"villesouhaitees",
		"villesouhaitee",
		"villesouhaites",
		"villesouhaite",
		"ville"
	]);
	const levelIndex = indexFor(["niveau"]);
	const valueAt = (row, index) => index >= 0 ? row[index] || "" : "";
	const byKey = /* @__PURE__ */ new Map();
	dataRows.forEach((row) => {
		const record = normalizeTutorTrackingRecord({
			tutorId: valueAt(row, idIndex),
			lastName: valueAt(row, lastNameIndex),
			firstName: valueAt(row, firstNameIndex),
			phone: valueAt(row, phoneIndex),
			email: valueAt(row, emailIndex),
			school: valueAt(row, schoolIndex),
			wantedCity: valueAt(row, wantedCityIndex),
			level: valueAt(row, levelIndex)
		});
		if (record.tutorId) byKey.set(record.key, record);
	});
	return Array.from(byKey.values()).sort((a, b) => tutorTrackingDisplayName(a).localeCompare(tutorTrackingDisplayName(b), "fr"));
}
function parseTutorReportPaste(value) {
	return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
		return (line.includes("	") ? line.split("	") : line.includes(";") ? line.split(";") : line.split(",")).map((cell) => cell.trim());
	}).filter((cells) => {
		const normalized = cells.join(" ").toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		return !(normalized.includes("nom") && normalized.includes("prenom") && (normalized.includes("bilan") || normalized.includes("eleve")));
	}).map((cells) => normalizeTutorReportEntry({
		tutorId: cells[0] || "",
		lastName: cells[1] || "",
		firstName: cells[2] || "",
		phone: cells[3] || "",
		school: cells[4] || "",
		studentCount: cells[5] || "",
		missingReportCount: cells[6] || "",
		comment: ""
	})).filter((entry) => entry.tutorId || entry.lastName || entry.firstName || entry.phone || entry.school);
}
function aggregateTutorReports(reports) {
	const byTutor = /* @__PURE__ */ new Map();
	reports.forEach((report) => {
		report.entries.forEach((entry) => {
			const key = tutorIdentityKey(entry);
			if (!key) return;
			const existing = byTutor.get(key) ?? {
				key,
				tutorId: entry.tutorId,
				lastName: entry.lastName,
				firstName: entry.firstName,
				phone: entry.phone,
				schools: [],
				dates: [],
				dateCount: 0,
				totalMissing: 0,
				totalStudents: 0
			};
			if (!existing.tutorId && entry.tutorId) existing.tutorId = entry.tutorId;
			if (!existing.lastName && entry.lastName) existing.lastName = entry.lastName;
			if (!existing.firstName && entry.firstName) existing.firstName = entry.firstName;
			if (!existing.phone && entry.phone) existing.phone = entry.phone;
			if (entry.school && !existing.schools.includes(entry.school)) existing.schools.push(entry.school);
			existing.dates.push({
				date: report.date,
				school: entry.school,
				studentCount: entry.studentCount,
				missingReportCount: entry.missingReportCount,
				comment: entry.comment || report.comment
			});
			existing.totalMissing += entry.missingReportCount;
			existing.totalStudents += entry.studentCount;
			byTutor.set(key, existing);
		});
	});
	return Array.from(byTutor.values()).map((item) => ({
		...item,
		dateCount: new Set(item.dates.map((dateItem) => dateItem.date)).size,
		dates: item.dates.sort((a, b) => sortDateValue(b.date) - sortDateValue(a.date)),
		schools: item.schools.sort((a, b) => a.localeCompare(b, "fr"))
	})).sort((a, b) => b.totalMissing - a.totalMissing || b.dateCount - a.dateCount);
}
function normalizeSchoolWatchItem(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: raw.id || uid("watch"),
		schoolId: raw.schoolId || "",
		reason: raw.reason || "",
		tags: Array.isArray(raw.tags) ? Array.from(new Set(raw.tags.filter((tag) => schoolWatchTags.includes(tag)))) : [],
		status: raw.status === "resolved" ? "resolved" : "active",
		comments: Array.isArray(raw.comments) ? raw.comments.map((comment) => ({
			id: comment.id || uid("watch-comment"),
			text: comment.text || "",
			author: comment.author || "Equipe Alpha",
			createdAt: comment.createdAt || now
		})).filter((comment) => comment.text) : [],
		createdAt: raw.createdAt || now,
		updatedAt: raw.updatedAt || raw.createdAt || now,
		resolvedAt: raw.resolvedAt || ""
	};
}
function createEmptyStaffingDay(date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: `staffing-${date}`,
		date,
		people: {
			pierre: {
				staffedSessions: 0,
				unstaffedSessions: 0
			},
			julie: {
				staffedSessions: 0,
				unstaffedSessions: 0
			},
			kelly: {
				staffedSessions: 0,
				unstaffedSessions: 0
			}
		},
		totalStaffedSessions: 0,
		totalUnstaffedSessions: 0,
		createdAt: now,
		updatedAt: now
	};
}
function normalizeSchoolEvent(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: raw.id || uid("school-event"),
		kind: raw.kind === "event" || raw.kind === "comment" || raw.kind === "action" ? raw.kind : "action",
		title: raw.title || "",
		note: raw.note || "",
		author: raw.author || "Equipe Alpha",
		tags: normalizeTags(raw.tags),
		likes: Array.isArray(raw.likes) ? raw.likes.map((like) => ({
			id: like.id || uid("like"),
			author: like.author || "Anonyme",
			createdAt: like.createdAt || now
		})) : [],
		comments: Array.isArray(raw.comments) ? raw.comments.map((comment) => ({
			id: comment.id || uid("social-comment"),
			text: comment.text || "",
			author: comment.author || "Anonyme",
			createdAt: comment.createdAt || now
		})).filter((comment) => comment.text.trim()) : [],
		date: raw.date || raw.createdAt || now,
		createdAt: raw.createdAt || now
	};
}
function normalizeSchool(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const category = raw.category || "";
	return {
		id: raw.id || uid("school"),
		externalId: raw.externalId || "",
		name: raw.name || "",
		category,
		schoolType: raw.schoolType === "alpha" || raw.schoolType === "mise-a-dispo" || raw.schoolType === "mixed" ? raw.schoolType : category.toLocaleLowerCase("fr").includes("prestation") ? "mise-a-dispo" : category.toLocaleLowerCase("fr").includes("alpha") ? "alpha" : "mixed",
		portfolioOwner: raw.portfolioOwner === "kelly" || raw.portfolioOwner === "pierre" || raw.portfolioOwner === "julie" ? raw.portfolioOwner : "",
		zone: raw.zone || "",
		coordinator: raw.coordinator || "",
		registeredCount: normalizePositiveNumber(raw.registeredCount, true),
		city: raw.city || "",
		address: raw.address || "",
		department: raw.department || "",
		upcomingWeek: raw.upcomingWeek || "",
		pastSessions: raw.pastSessions || "",
		typicalWeek: raw.typicalWeek || "",
		contractSigned: raw.contractSigned || "",
		actions: raw.actions || "",
		contact: raw.contact || "",
		nextAction: raw.nextAction || "",
		notes: raw.notes || "",
		events: Array.isArray(raw.events) ? raw.events.map(normalizeSchoolEvent).filter((event) => event.title || event.note).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [],
		createdAt: raw.createdAt || now,
		updatedAt: raw.updatedAt || raw.createdAt || now
	};
}
function normalizedSchoolLookupName(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}
function campaignDates(year) {
	const dates = [];
	const cursor = new Date(Date.UTC(year, 7, 25));
	const end = new Date(Date.UTC(year, 8, 30));
	while (cursor <= end) {
		dates.push(cursor.toISOString().slice(0, 10));
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return dates;
}
function normalizeStudentHistoryYear(raw) {
	const year = typeof raw.year === "number" && Number.isInteger(raw.year) && raw.year >= 2e3 && raw.year <= 2100 ? raw.year : (/* @__PURE__ */ new Date()).getFullYear();
	const valuesByDate = new Map(Array.isArray(raw.entries) ? raw.entries.map((entry) => [entry.date, normalizePositiveNumber(entry.value, true)]) : []);
	return {
		year,
		entries: campaignDates(year).map((date) => ({
			date,
			value: valuesByDate.get(date) ?? null
		})),
		createdAt: raw.createdAt || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function campaignDayLabel(date) {
	return new Intl.DateTimeFormat("fr-FR", {
		day: "numeric",
		month: "short"
	}).format(/* @__PURE__ */ new Date(`${date}T12:00:00`));
}
function campaignDayKey(date) {
	return date.slice(5);
}
function dateValue(date) {
	if (!date) return Number.POSITIVE_INFINITY;
	return (/* @__PURE__ */ new Date(`${date}T12:00:00`)).getTime();
}
function sortDateValue(date) {
	if (!date) return 0;
	const parsed = date.includes("T") ? new Date(date).getTime() : (/* @__PURE__ */ new Date(`${date}T12:00:00`)).getTime();
	return Number.isFinite(parsed) ? parsed : 0;
}
function todayValue() {
	const today = /* @__PURE__ */ new Date();
	today.setHours(12, 0, 0, 0);
	return today.getTime();
}
function daysFromToday(date) {
	return Math.round((dateValue(date) - todayValue()) / (1440 * 60 * 1e3));
}
function isLate(task) {
	return task.status !== "done" && Boolean(task.endDate) && daysFromToday(task.endDate) < 0;
}
function isCommunicationFollowUpLate(communication) {
	return communication.status === "to-follow-up" && Boolean(communication.followUpDate) && daysFromToday(communication.followUpDate) < 0;
}
function formatDate(date) {
	if (!date) return "";
	return new Intl.DateTimeFormat("fr-FR", {
		day: "numeric",
		month: "short"
	}).format(/* @__PURE__ */ new Date(`${date}T12:00:00`));
}
function formatFullDate(date) {
	return new Intl.DateTimeFormat("fr-FR", {
		day: "numeric",
		month: "long",
		year: "numeric"
	}).format(/* @__PURE__ */ new Date(`${date}T12:00:00`));
}
function tutorTrackingImportLabel(snapshot) {
	const importedAt = new Date(snapshot.createdAt);
	const timeLabel = Number.isNaN(importedAt.getTime()) ? "" : new Intl.DateTimeFormat("fr-FR", {
		hour: "2-digit",
		minute: "2-digit"
	}).format(importedAt);
	return `${snapshot.displayName || snapshot.fileName || "Import tuteurs"} · ${formatFullDate(snapshot.date)}${timeLabel ? ` à ${timeLabel}` : ""}`;
}
function naturalDateLabel(task) {
	const target = task.endDate || task.startDate;
	const delta = daysFromToday(target);
	const date = formatDate(target);
	if (task.status === "done") return task.endDate ? `Terminee le ${date}` : "Terminee";
	if (task.endDate && delta < 0) return `En retard de ${Math.abs(delta)} j`;
	if (delta === 0) return "Aujourd'hui";
	if (delta === 1) return "Demain";
	if (delta <= 7) return `Dans ${delta} jours`;
	return date;
}
function formatDuration(hours) {
	if (!hours) return "Non renseignee";
	const totalMinutes = Math.round(hours * 60);
	if (totalMinutes < 60) return `${totalMinutes} min`;
	const wholeHours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return minutes ? `${wholeHours} h ${minutes} min` : `${wholeHours} h`;
}
function durationBucket(hours) {
	if (!hours) return "unset";
	if (hours <= 1) return "short";
	if (hours <= 4) return "medium";
	return "long";
}
function dateLabel(task) {
	if (!task.endDate || task.endDate === task.startDate) return formatDate(task.startDate);
	return `${formatDate(task.startDate)} -> ${formatDate(task.endDate)}`;
}
function ownerInitials(owner) {
	return owner.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
function normalizeTask(raw) {
	return {
		id: raw.id || uid("task"),
		title: raw.title || "",
		description: raw.description || "",
		owner: raw.owner || "",
		assigneeId: raw.assigneeId || null,
		startDate: raw.startDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		endDate: raw.endDate || "",
		estimatedHours: typeof raw.estimatedHours === "number" && Number.isFinite(raw.estimatedHours) && raw.estimatedHours > 0 ? raw.estimatedHours : null,
		status: raw.status === "progress" || raw.status === "done" ? raw.status : "todo",
		priority: raw.priority === "low" || raw.priority === "high" || raw.priority === "medium" ? raw.priority : "medium",
		verified: raw.verified === true,
		verificationOwner: raw.verificationOwner || "",
		verificationComment: raw.verificationComment || "",
		comments: Array.isArray(raw.comments) ? raw.comments.map((comment) => ({
			id: comment.id || uid("comment"),
			text: comment.text || "",
			author: comment.author || "Anonyme",
			createdAt: comment.createdAt || (/* @__PURE__ */ new Date()).toISOString()
		})) : [],
		completionNotifications: Array.isArray(raw.completionNotifications) ? raw.completionNotifications.map((item) => ({
			personId: item.personId,
			sentAt: item.sentAt
		})) : [],
		createdAt: raw.createdAt || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function normalizeRecurringTask(raw) {
	return {
		id: raw.id || uid("recurring"),
		title: raw.title || "",
		description: raw.description || "",
		owner: raw.owner || "",
		assigneeId: raw.assigneeId || null,
		estimatedHours: typeof raw.estimatedHours === "number" && Number.isFinite(raw.estimatedHours) && raw.estimatedHours > 0 ? raw.estimatedHours : null,
		priority: raw.priority === "low" || raw.priority === "high" || raw.priority === "medium" ? raw.priority : "medium",
		createdAt: raw.createdAt || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function normalizeObjective(raw) {
	const targetLabelText = raw.targetLabel || "";
	const fallbackTarget = numberFromText(targetLabelText);
	const label = targetLabelText.replace(/\d+/g, "").trim().replace(/^\/+/, "").trim();
	return {
		id: raw.id || uid("objective"),
		kind: raw.kind === "counter" || raw.kind === "qualitative" ? raw.kind : raw.targetValue ? "counter" : "qualitative",
		title: raw.title || "",
		description: raw.description || "",
		targetLabel: label || "élèves",
		currentValue: normalizePositiveNumber(raw.currentValue, true),
		targetValue: normalizePositiveNumber(raw.targetValue, false) ?? fallbackTarget,
		startDate: raw.startDate || "",
		endDate: raw.endDate || "",
		status: raw.status === "todo" || raw.status === "done" ? raw.status : "progress",
		progressNote: raw.progressNote || "",
		personIds: Array.isArray(raw.personIds) ? raw.personIds.filter(Boolean) : [],
		createdAt: raw.createdAt || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function normalizePerson(raw) {
	return {
		id: raw.id || uid("person"),
		name: raw.name || "",
		active: raw.active !== false,
		hasEmail: Boolean(raw.hasEmail),
		createdAt: raw.createdAt || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function Home() {
	const [tasks, setTasks] = (0, import_react.useState)([]);
	const [recurringTasks, setRecurringTasks] = (0, import_react.useState)([]);
	const [objectives, setObjectives] = (0, import_react.useState)([]);
	const [links, setLinks] = (0, import_react.useState)([]);
	const [journalPosts, setJournalPosts] = (0, import_react.useState)([]);
	const [communications, setCommunications] = (0, import_react.useState)([]);
	const [staffingDays, setStaffingDays] = (0, import_react.useState)([]);
	const [tutorReports, setTutorReports] = (0, import_react.useState)([]);
	const [tutorReportComments, setTutorReportComments] = (0, import_react.useState)([]);
	const [tutorTracking, setTutorTracking] = (0, import_react.useState)({
		snapshots: [],
		comments: []
	});
	const [availabilityImports, setAvailabilityImports] = (0, import_react.useState)([]);
	const [interestImports, setInterestImports] = (0, import_react.useState)([]);
	const [availabilityImportData, setAvailabilityImportData] = (0, import_react.useState)({});
	const [interestImportData, setInterestImportData] = (0, import_react.useState)({});
	const [availabilityExclusions, setAvailabilityExclusions] = (0, import_react.useState)({
		sessionIds: [],
		sourceKeys: [],
		updatedAt: ""
	});
	const [latestAvailabilityStaffingImport, setLatestAvailabilityStaffingImport] = (0, import_react.useState)(null);
	const [schoolWatchlist, setSchoolWatchlist] = (0, import_react.useState)([]);
	const [schools, setSchools] = (0, import_react.useState)([]);
	const [studentHistory, setStudentHistory] = (0, import_react.useState)([]);
	const [people, setPeople] = (0, import_react.useState)([]);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [notifying, setNotifying] = (0, import_react.useState)(false);
	const [syncError, setSyncError] = (0, import_react.useState)("");
	const [query, setQuery] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [priorityFilter, setPriorityFilter] = (0, import_react.useState)("all");
	const [ownerFilter, setOwnerFilter] = (0, import_react.useState)("all");
	const [appMode, setAppModeState] = (0, import_react.useState)(() => typeof window === "undefined" ? "dashboard" : appModeFromUrl(new URL(window.location.href)) || "dashboard");
	const [filesFocusKind, setFilesFocusKind] = (0, import_react.useState)(null);
	const [viewMode, setViewMode] = (0, import_react.useState)("list");
	const [density, setDensity] = (0, import_react.useState)(() => typeof window === "undefined" || localStorage.getItem(DENSITY_KEY) !== "comfortable" ? "compact" : "comfortable");
	const [authorName, setAuthorName] = (0, import_react.useState)(() => typeof window === "undefined" ? "" : localStorage.getItem(AUTHOR_KEY) || "");
	const [editorOpen, setEditorOpen] = (0, import_react.useState)(false);
	const [peopleOpen, setPeopleOpen] = (0, import_react.useState)(false);
	const [recurringOpen, setRecurringOpen] = (0, import_react.useState)(false);
	const [objectiveOpen, setObjectiveOpen] = (0, import_react.useState)(false);
	const [linkOpen, setLinkOpen] = (0, import_react.useState)(false);
	const [journalOpen, setJournalOpen] = (0, import_react.useState)(false);
	const [communicationOpen, setCommunicationOpen] = (0, import_react.useState)(false);
	const [schoolWatchOpen, setSchoolWatchOpen] = (0, import_react.useState)(false);
	const [schoolOpen, setSchoolOpen] = (0, import_react.useState)(false);
	const [schoolEventOpen, setSchoolEventOpen] = (0, import_react.useState)(false);
	const [notifyOpen, setNotifyOpen] = (0, import_react.useState)(false);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [editingRecurringId, setEditingRecurringId] = (0, import_react.useState)(null);
	const [editingLinkId, setEditingLinkId] = (0, import_react.useState)(null);
	const [editingJournalId, setEditingJournalId] = (0, import_react.useState)(null);
	const [editingCommunicationId, setEditingCommunicationId] = (0, import_react.useState)(null);
	const [editingSchoolWatchId, setEditingSchoolWatchId] = (0, import_react.useState)(null);
	const [editingSchoolId, setEditingSchoolId] = (0, import_react.useState)(null);
	const [eventSchoolId, setEventSchoolId] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)(emptyDraft);
	const [recurringDraft, setRecurringDraft] = (0, import_react.useState)(emptyRecurringDraft);
	const [objectiveDraft, setObjectiveDraft] = (0, import_react.useState)(emptyObjectiveDraft);
	const [linkDraft, setLinkDraft] = (0, import_react.useState)(emptyLinkDraft);
	const [journalDraft, setJournalDraft] = (0, import_react.useState)(emptyJournalDraft);
	const [communicationDraft, setCommunicationDraft] = (0, import_react.useState)(emptyCommunicationDraft);
	const [schoolWatchDraft, setSchoolWatchDraft] = (0, import_react.useState)(emptySchoolWatchDraft);
	const [schoolDraft, setSchoolDraft] = (0, import_react.useState)(emptySchoolDraft);
	const [schoolEventDraft, setSchoolEventDraft] = (0, import_react.useState)(emptySchoolEventDraft);
	const [editingObjectiveId, setEditingObjectiveId] = (0, import_react.useState)(null);
	const [activeHistoryYear, setActiveHistoryYear] = (0, import_react.useState)((/* @__PURE__ */ new Date()).getFullYear());
	const [selectedHistoryYears, setSelectedHistoryYears] = (0, import_react.useState)([]);
	const [sendAssignmentEmail, setSendAssignmentEmail] = (0, import_react.useState)(true);
	const [personDraft, setPersonDraft] = (0, import_react.useState)(emptyPersonDraft);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [notifyTaskId, setNotifyTaskId] = (0, import_react.useState)(null);
	const [notifyRecipients, setNotifyRecipients] = (0, import_react.useState)([]);
	const [comment, setComment] = (0, import_react.useState)("");
	const [toast, setToast] = (0, import_react.useState)("");
	const [journalQuery, setJournalQuery] = (0, import_react.useState)("");
	const [journalTagFilter, setJournalTagFilter] = (0, import_react.useState)("all");
	const [journalAuthorFilter, setJournalAuthorFilter] = (0, import_react.useState)("all");
	const [journalPersonFilter, setJournalPersonFilter] = (0, import_react.useState)("all");
	const [communicationQuery, setCommunicationQuery] = (0, import_react.useState)("");
	const [communicationAudienceFilter, setCommunicationAudienceFilter] = (0, import_react.useState)("all");
	const [communicationStatusFilter, setCommunicationStatusFilter] = (0, import_react.useState)("all");
	const [schoolWatchQuery, setSchoolWatchQuery] = (0, import_react.useState)("");
	const [schoolWatchFilter, setSchoolWatchFilter] = (0, import_react.useState)("active");
	const [selectedSchoolWatchId, setSelectedSchoolWatchId] = (0, import_react.useState)(null);
	const [schoolWatchComment, setSchoolWatchComment] = (0, import_react.useState)("");
	const [schoolQuery, setSchoolQuery] = (0, import_react.useState)("");
	const [schoolFilter, setSchoolFilter] = (0, import_react.useState)("all");
	const [schoolAssignmentFilter, setSchoolAssignmentFilter] = (0, import_react.useState)("all");
	const [schoolAssignmentPaste, setSchoolAssignmentPaste] = (0, import_react.useState)("");
	const [schoolAssignmentImportReport, setSchoolAssignmentImportReport] = (0, import_react.useState)(null);
	const [selectedSchoolId, setSelectedSchoolId] = (0, import_react.useState)(null);
	const [tutorReportDate, setTutorReportDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [tutorReportStartDate, setTutorReportStartDate] = (0, import_react.useState)(`${(/* @__PURE__ */ new Date()).getFullYear()}-01-01`);
	const [tutorReportEndDate, setTutorReportEndDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [tutorReportPaste, setTutorReportPaste] = (0, import_react.useState)("");
	const [tutorReportQuery, setTutorReportQuery] = (0, import_react.useState)("");
	const [tutorReportGlobalQuery, setTutorReportGlobalQuery] = (0, import_react.useState)("");
	const [selectedTutorReportKey, setSelectedTutorReportKey] = (0, import_react.useState)(null);
	const [visibleTutorReportCount, setVisibleTutorReportCount] = (0, import_react.useState)(10);
	const [tutorTrackingDate, setTutorTrackingDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [selectedTutorTrackingSnapshotId, setSelectedTutorTrackingSnapshotId] = (0, import_react.useState)("");
	const [tutorTrackingCompareStartId, setTutorTrackingCompareStartId] = (0, import_react.useState)("");
	const [tutorTrackingCompareEndId, setTutorTrackingCompareEndId] = (0, import_react.useState)("");
	const [tutorTrackingCsv, setTutorTrackingCsv] = (0, import_react.useState)("");
	const [tutorTrackingQuery, setTutorTrackingQuery] = (0, import_react.useState)("");
	const [tutorTrackingView, setTutorTrackingView] = (0, import_react.useState)("new");
	const [tutorActivityById, setTutorActivityById] = (0, import_react.useState)({});
	const [tutorActivityLoadingIds, setTutorActivityLoadingIds] = (0, import_react.useState)([]);
	const [tutorActivityError, setTutorActivityError] = (0, import_react.useState)("");
	const [availabilityDate, setAvailabilityDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [availabilityReferenceId, setAvailabilityReferenceId] = (0, import_react.useState)("");
	const [availabilityRecentId, setAvailabilityRecentId] = (0, import_react.useState)("");
	const [interestReferenceId, setInterestReferenceId] = (0, import_react.useState)("");
	const [interestRecentId, setInterestRecentId] = (0, import_react.useState)("");
	const [availabilityView, setAvailabilityView] = (0, import_react.useState)("new");
	const [availabilitySchoolOwnerFilter, setAvailabilitySchoolOwnerFilter] = (0, import_react.useState)("all");
	const [availabilitySources, setAvailabilitySources] = (0, import_react.useState)(["availability", "interest"]);
	const [availabilityStatuses, setAvailabilityStatuses] = (0, import_react.useState)(["tutor", "candidate"]);
	const [showAvailabilityHidden, setShowAvailabilityHidden] = (0, import_react.useState)(false);
	const importRef = (0, import_react.useRef)(null);
	const setAppMode = (0, import_react.useCallback)((mode) => {
		if (mode === "files") setFilesFocusKind(null);
		if (mode === "unstaffed") {
			const url = new URL(window.location.href);
			url.searchParams.delete("date-seances");
			url.searchParams.delete("responsable");
			url.searchParams.delete("fichier-seances");
			url.searchParams.delete("recherche-seances");
			window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
		}
		setAppModeState(mode);
	}, []);
	const openFiles = (0, import_react.useCallback)((kind) => {
		setFilesFocusKind(kind);
		setAppModeState("files");
	}, []);
	const loadTasks = (0, import_react.useCallback)(async (silent = false) => {
		try {
			if (!silent) setSyncError("");
			const response = await fetch("/api/tasks", { cache: "no-store" });
			if (!response.ok) throw new Error("load-failed");
			const data = await response.json();
			setTasks(Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : []);
			setLoaded(true);
			setSyncError("");
		} catch {
			setLoaded(true);
			setSyncError("Synchronisation indisponible pour le moment");
		}
	}, []);
	const loadPeople = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/people", { cache: "no-store" });
			if (!response.ok) throw new Error("load-people-failed");
			const data = await response.json();
			setPeople(Array.isArray(data.people) ? data.people.map(normalizePerson) : []);
		} catch {
			setToast("Liste des personnes indisponible");
		}
	}, []);
	const loadRecurringTasks = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/recurring-tasks", { cache: "no-store" });
			if (!response.ok) throw new Error("load-recurring-failed");
			const data = await response.json();
			setRecurringTasks(Array.isArray(data.recurringTasks) ? data.recurringTasks.map(normalizeRecurringTask) : []);
		} catch {
			setToast("Modeles recurrents indisponibles");
		}
	}, []);
	const loadObjectives = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/objectives", { cache: "no-store" });
			if (!response.ok) throw new Error("load-objectives-failed");
			const data = await response.json();
			setObjectives(Array.isArray(data.objectives) ? data.objectives.map(normalizeObjective) : []);
		} catch {
			setToast("Objectifs indisponibles");
		}
	}, []);
	const loadLinks = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/links", { cache: "no-store" });
			if (!response.ok) throw new Error("load-links-failed");
			const data = await response.json();
			setLinks(Array.isArray(data.links) ? data.links.map(normalizeSharedLink) : []);
		} catch {
			setToast("Liens indisponibles");
		}
	}, []);
	const loadJournalPosts = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/journal-posts", { cache: "no-store" });
			if (!response.ok) throw new Error("load-journal-failed");
			const data = await response.json();
			setJournalPosts(Array.isArray(data.posts) ? data.posts.map(normalizeJournalPost) : []);
		} catch {
			setToast("Journal indisponible");
		}
	}, []);
	const loadCommunications = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/mass-communications", { cache: "no-store" });
			if (!response.ok) throw new Error("load-communications-failed");
			const data = await response.json();
			setCommunications(Array.isArray(data.communications) ? data.communications.map(normalizeMassCommunication) : []);
		} catch {
			setToast("Communications indisponibles");
		}
	}, []);
	const loadStaffingDays = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/staffing-sessions", { cache: "no-store" });
			if (!response.ok) throw new Error("load-staffing-failed");
			const data = await response.json();
			const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			const loadedStaffing = Array.isArray(data.staffing) ? data.staffing.map(normalizeStaffingDay) : [];
			if (loadedStaffing.some((day) => day.date === today)) {
				setStaffingDays(loadedStaffing);
				return;
			}
			const nextStaffing = [createEmptyStaffingDay(today), ...loadedStaffing].sort((a, b) => sortDateValue(b.date) - sortDateValue(a.date));
			setStaffingDays(nextStaffing);
			await fetch("/api/staffing-sessions", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ staffing: nextStaffing })
			});
		} catch {
			setToast("Staffing indisponible");
		}
	}, []);
	const loadTutorReports = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/tutor-reports", { cache: "no-store" });
			if (!response.ok) throw new Error("load-tutor-reports-failed");
			const data = await response.json();
			const reports = Array.isArray(data.reports) ? data.reports.map(normalizeTutorReportSnapshot) : [];
			setTutorReports(reports);
			if (reports.length) setTutorReportDate((current) => reports.some((report) => report.date === current) ? current : reports[0].date);
		} catch {
			setToast("Bilans tuteurs indisponibles");
		}
	}, []);
	const loadTutorReportComments = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/tutor-report-comments", { cache: "no-store" });
			if (!response.ok) throw new Error("load-tutor-report-comments-failed");
			const data = await response.json();
			setTutorReportComments(Array.isArray(data.comments) ? data.comments.map(normalizeTutorReportComment).filter((comment) => comment.tutorId) : []);
		} catch {
			setToast("Commentaires tuteurs indisponibles");
		}
	}, []);
	const loadTutorTracking = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/tutor-tracking", { cache: "no-store" });
			if (!response.ok) throw new Error("load-tutor-tracking-failed");
			const tracking = normalizeTutorTrackingData((await response.json()).tracking || {});
			setTutorTracking(tracking);
			if (tracking.snapshots.length) {
				setSelectedTutorTrackingSnapshotId((current) => tracking.snapshots.some((snapshot) => snapshot.id === current) ? current : tracking.snapshots[0].id);
				setTutorTrackingCompareEndId((current) => tracking.snapshots.some((snapshot) => snapshot.id === current) ? current : tracking.snapshots[0].id);
				setTutorTrackingCompareStartId((current) => tracking.snapshots.some((snapshot) => snapshot.id === current) ? current : tracking.snapshots[1]?.id || tracking.snapshots[0].id);
			}
		} catch {
			setToast("Suivi tuteurs indisponible");
		}
	}, []);
	const loadAvailabilityImports = (0, import_react.useCallback)(async () => {
		try {
			const [availabilityResponse, interestResponse, exclusionsResponse] = await Promise.all([
				fetch("/api/availability-imports?summary=1", { cache: "no-store" }),
				fetch("/api/tutor-interest-imports?summary=1", { cache: "no-store" }),
				fetch("/api/unstaffed-exclusions", { cache: "no-store" })
			]);
			const availabilityData = await availabilityResponse.json();
			const interestData = await interestResponse.json();
			const exclusionsData = await exclusionsResponse.json();
			if (!availabilityResponse.ok) throw new Error(availabilityData.detail || availabilityData.error || "load-availability-imports-failed");
			if (!interestResponse.ok) throw new Error(interestData.detail || interestData.error || "load-interest-imports-failed");
			if (!exclusionsResponse.ok) throw new Error(exclusionsData.detail || exclusionsData.error || "load-exclusions-failed");
			const imports = Array.isArray(availabilityData.imports) ? availabilityData.imports.map(normalizeAvailabilityImport).sort((a, b) => sortDateValue(b.importedAt) - sortDateValue(a.importedAt)) : [];
			const interests = Array.isArray(interestData.imports) ? interestData.imports.slice().sort((a, b) => sortDateValue(b.importedAt) - sortDateValue(a.importedAt)) : [];
			setAvailabilityImports(imports);
			setInterestImports(interests);
			setAvailabilityExclusions(exclusionsData.exclusions ?? {
				sessionIds: [],
				sourceKeys: [],
				updatedAt: ""
			});
			if (imports.length) {
				setAvailabilityRecentId((current) => imports.some((item) => item.id === current) ? current : imports[0].id);
				setAvailabilityReferenceId((current) => imports.some((item) => item.id === current) ? current : imports[1]?.id || imports[0].id);
			}
			if (interests.length) {
				setInterestRecentId((current) => interests.some((item) => item.id === current) ? current : interests[0].id);
				setInterestReferenceId((current) => interests.some((item) => item.id === current) ? current : interests[1]?.id || interests[0].id);
			}
		} catch (error) {
			setToast(error instanceof Error ? `Fichiers de comparaison indisponibles : ${error.message}` : "Imports indisponibles");
		}
	}, []);
	const loadLatestAvailabilityStaffing = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/tutor-assignment-imports?latest=1", { cache: "no-store" });
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "load-latest-staffing-failed");
			setLatestAvailabilityStaffingImport(data.import ?? null);
		} catch {
			setLatestAvailabilityStaffingImport(null);
			setToast("Dernier fichier de staffing indisponible");
		}
	}, []);
	const loadSchoolWatchlist = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/school-watchlist", { cache: "no-store" });
			if (!response.ok) throw new Error("load-school-watchlist-failed");
			const data = await response.json();
			setSchoolWatchlist(Array.isArray(data.watchlist) ? data.watchlist.map(normalizeSchoolWatchItem) : []);
		} catch {
			setToast("Établissements à suivre indisponibles");
		}
	}, []);
	const loadSchools = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/schools", { cache: "no-store" });
			if (!response.ok) throw new Error("load-schools-failed");
			const data = await response.json();
			setSchools(Array.isArray(data.schools) ? data.schools.map(normalizeSchool) : []);
		} catch {
			setToast("Établissements indisponibles");
		}
	}, []);
	const loadStudentHistory = (0, import_react.useCallback)(async () => {
		try {
			const response = await fetch("/api/student-history", { cache: "no-store" });
			if (!response.ok) throw new Error("load-student-history-failed");
			const data = await response.json();
			const history = Array.isArray(data.history) ? data.history.map(normalizeStudentHistoryYear) : [];
			setStudentHistory(history);
			if (history.length) {
				setActiveHistoryYear((current) => history.some((year) => year.year === current) ? current : history[0].year);
				setSelectedHistoryYears((current) => {
					const available = new Set(history.map((year) => year.year));
					const kept = current.filter((year) => available.has(year));
					return kept.length ? kept : [history[0].year];
				});
			}
		} catch {
			setToast("Historique eleves indisponible");
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const syncModeFromUrl = () => {
			setAppModeState(appModeFromUrl(new URL(window.location.href)) || "dashboard");
		};
		window.addEventListener("popstate", syncModeFromUrl);
		window.addEventListener("hashchange", syncModeFromUrl);
		return () => {
			window.removeEventListener("popstate", syncModeFromUrl);
			window.removeEventListener("hashchange", syncModeFromUrl);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const url = new URL(window.location.href);
		const nextSlug = appModeSlugs[appMode];
		if (url.searchParams.get("onglet") === nextSlug) return;
		url.searchParams.set("onglet", nextSlug);
		window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
	}, [appMode]);
	(0, import_react.useEffect)(() => {
		const refreshCurrentPage = () => {
			if (appMode === "dashboard") loadObjectives();
			else if (appMode === "tasks") {
				loadTasks(true);
				loadPeople();
			} else if (appMode === "recurring") {
				loadRecurringTasks();
				loadPeople();
			} else if (appMode === "links") loadLinks();
			else if (appMode === "journal") {
				loadJournalPosts();
				loadPeople();
			} else if (appMode === "communications") loadCommunications();
			else if (appMode === "staffing") loadStaffingDays();
			else if (appMode === "tutorReports") {
				loadTutorReports();
				loadTutorReportComments();
			} else if (appMode === "tutors") loadTutorTracking();
			else if (appMode === "availability") {
				loadAvailabilityImports();
				loadLatestAvailabilityStaffing();
				loadSchools();
				loadTutorTracking();
			} else if (appMode === "watchlist") {
				loadSchoolWatchlist();
				loadSchools();
			} else if (appMode === "schools") loadSchools();
			else if (appMode === "objectives") {
				loadObjectives();
				loadPeople();
			} else if (appMode === "history") loadStudentHistory();
		};
		const initial = window.setTimeout(refreshCurrentPage, 0);
		const refresh = window.setInterval(refreshCurrentPage, 3e4);
		return () => {
			window.clearTimeout(initial);
			window.clearInterval(refresh);
		};
	}, [
		appMode,
		loadTasks,
		loadPeople,
		loadRecurringTasks,
		loadObjectives,
		loadLinks,
		loadJournalPosts,
		loadCommunications,
		loadStaffingDays,
		loadTutorReports,
		loadTutorReportComments,
		loadTutorTracking,
		loadAvailabilityImports,
		loadLatestAvailabilityStaffing,
		loadSchoolWatchlist,
		loadSchools,
		loadStudentHistory
	]);
	(0, import_react.useEffect)(() => {
		if (appMode !== "availability") return;
		let cancelled = false;
		const timer = window.setTimeout(() => {
			const availabilityIds = Array.from(new Set([availabilityReferenceId, availabilityRecentId].filter(Boolean)));
			const selectedInterestIds = Array.from(new Set([interestReferenceId, interestRecentId].filter(Boolean)));
			Promise.all([...availabilityIds.map(async (id) => {
				const response = await fetch(`/api/availability-imports?id=${encodeURIComponent(id)}`, { cache: "no-store" });
				const data = await response.json();
				if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Disponibilités indisponibles");
				return {
					kind: "availability",
					id,
					import: normalizeAvailabilityImport(data.import)
				};
			}), ...selectedInterestIds.map(async (id) => {
				const response = await fetch(`/api/tutor-interest-imports?id=${encodeURIComponent(id)}`, { cache: "no-store" });
				const data = await response.json();
				if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Intérêts indisponibles");
				return {
					kind: "interest",
					id,
					import: data.import
				};
			})]).then((loadedImports) => {
				if (cancelled) return;
				const availabilities = loadedImports.filter((item) => item.kind === "availability");
				const interests = loadedImports.filter((item) => item.kind === "interest");
				setAvailabilityImportData((current) => ({
					...current,
					...Object.fromEntries(availabilities.map((item) => [item.id, item.import]))
				}));
				setInterestImportData((current) => ({
					...current,
					...Object.fromEntries(interests.map((item) => [item.id, item.import]))
				}));
			}).catch((error) => {
				if (!cancelled) setToast(error instanceof Error ? error.message : "Chargement des fichiers impossible");
			});
		}, 0);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [
		appMode,
		availabilityRecentId,
		availabilityReferenceId,
		interestRecentId,
		interestReferenceId
	]);
	(0, import_react.useEffect)(() => {
		if (authorName.trim()) localStorage.setItem(AUTHOR_KEY, authorName.trim());
	}, [authorName]);
	(0, import_react.useEffect)(() => {
		localStorage.setItem(DENSITY_KEY, density);
	}, [density]);
	(0, import_react.useEffect)(() => {
		if (!toast) return;
		const timer = window.setTimeout(() => setToast(""), 2600);
		return () => window.clearTimeout(timer);
	}, [toast]);
	const peopleById = (0, import_react.useMemo)(() => new Map(people.map((person) => [person.id, person])), [people]);
	const activePeople = (0, import_react.useMemo)(() => people.filter((person) => person.active), [people]);
	const owners = (0, import_react.useMemo)(() => Array.from(new Set([
		...tasks.map((task) => task.owner).filter(Boolean),
		...recurringTasks.map((task) => task.owner).filter(Boolean),
		...tasks.map((task) => task.verificationOwner).filter(Boolean),
		...people.map((person) => person.name).filter(Boolean)
	])).sort(), [
		tasks,
		recurringTasks,
		people
	]);
	const stats = (0, import_react.useMemo)(() => ({
		all: tasks.length,
		active: tasks.filter((task) => task.status !== "done").length,
		todo: tasks.filter((task) => task.status === "todo").length,
		progress: tasks.filter((task) => task.status === "progress").length,
		done: tasks.filter((task) => task.status === "done").length,
		late: tasks.filter(isLate).length,
		high: tasks.filter((task) => task.priority === "high" && task.status !== "done").length
	}), [tasks]);
	const filteredTasks = (0, import_react.useMemo)(() => {
		const normalized = query.trim().toLocaleLowerCase("fr");
		return tasks.filter((task) => {
			const latestComment = task.comments[0];
			const assignee = task.assigneeId ? peopleById.get(task.assigneeId)?.name || "" : "";
			const matchesText = !normalized || `${task.title} ${task.description} ${task.owner} ${assignee} ${latestComment?.text || ""}`.toLocaleLowerCase("fr").includes(normalized);
			const matchesStatus = statusFilter === "all" ? task.status !== "done" : statusFilter === "late" ? isLate(task) : task.status === statusFilter;
			const matchesOwner = ownerFilter === "all" || task.owner === ownerFilter || assignee === ownerFilter;
			const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
			return matchesText && matchesStatus && matchesOwner && matchesPriority;
		}).sort((a, b) => {
			if (a.status === "done" && b.status !== "done") return 1;
			if (a.status !== "done" && b.status === "done") return -1;
			if (priorityRank[a.priority] !== priorityRank[b.priority]) return priorityRank[a.priority] - priorityRank[b.priority];
			return dateValue(a.endDate || a.startDate) - dateValue(b.endDate || b.startDate);
		});
	}, [
		tasks,
		query,
		statusFilter,
		ownerFilter,
		priorityFilter,
		peopleById
	]);
	const selectedTask = tasks.find((task) => task.id === selectedId) ?? null;
	const notifyTask = tasks.find((task) => task.id === notifyTaskId) ?? null;
	const defaultStudentObjective = normalizeObjective({
		id: "objective-september-2600",
		kind: "counter",
		title: "Objectif septembre",
		description: "Garder le cap de la rentrée avec une équipe alignée, concentrée et prête à transformer les efforts en inscriptions.",
		targetLabel: "élèves",
		currentValue: 160,
		targetValue: 2600
	});
	const defaultSessionObjective = normalizeObjective({
		id: "objective-weekly-supervision-1300",
		kind: "counter",
		title: "Séances de surveillance par semaine",
		description: "Garder un rythme hebdomadaire visible pour sécuriser l'accompagnement des élèves.",
		targetLabel: "séances",
		currentValue: 130,
		targetValue: 1300
	});
	const studentObjective = objectives.find((objective) => objective.id === defaultStudentObjective.id) ?? defaultStudentObjective;
	const sessionObjective = objectives.find((objective) => objective.id === defaultSessionObjective.id) ?? defaultSessionObjective;
	const qualitativeObjectives = objectives.filter((objective) => objective.kind === "qualitative").slice().sort((a, b) => dateValue(a.endDate || a.startDate) - dateValue(b.endDate || b.startDate));
	const journalTags = (0, import_react.useMemo)(() => Array.from(new Set(journalPosts.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b, "fr")), [journalPosts]);
	const journalAuthors = (0, import_react.useMemo)(() => Array.from(new Set(journalPosts.map((post) => post.author).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fr")), [journalPosts]);
	const filteredJournalPosts = (0, import_react.useMemo)(() => {
		const normalized = journalQuery.trim().toLocaleLowerCase("fr");
		return journalPosts.filter((post) => {
			const taggedPeople = post.personIds.map((personId) => peopleById.get(personId)?.name || "").join(" ");
			const matchesText = !normalized || `${post.title} ${post.content} ${post.author} ${post.tags.join(" ")} ${taggedPeople}`.toLocaleLowerCase("fr").includes(normalized);
			const matchesTag = journalTagFilter === "all" || post.tags.includes(journalTagFilter);
			const matchesAuthor = journalAuthorFilter === "all" || post.author === journalAuthorFilter;
			const matchesPerson = journalPersonFilter === "all" || post.personIds.includes(journalPersonFilter);
			return matchesText && matchesTag && matchesAuthor && matchesPerson;
		}).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
	}, [
		journalPosts,
		journalQuery,
		journalTagFilter,
		journalAuthorFilter,
		journalPersonFilter,
		peopleById
	]);
	const filteredCommunications = (0, import_react.useMemo)(() => {
		const normalized = communicationQuery.trim().toLocaleLowerCase("fr");
		return communications.filter((communication) => {
			const matchesText = !normalized || `${communication.title} ${communication.messageSummary} ${communication.notes} ${communication.author} ${communication.tags.join(" ")} ${communication.audiences.map((audience) => communicationAudienceLabels[audience]).join(" ")} ${communication.recipients.join(" ")} ${communication.channel}`.toLocaleLowerCase("fr").includes(normalized);
			const matchesAudience = communicationAudienceFilter === "all" || communication.audiences.includes(communicationAudienceFilter);
			const matchesStatus = communicationStatusFilter === "all" || communication.status === communicationStatusFilter;
			return matchesText && matchesAudience && matchesStatus;
		}).sort((a, b) => sortDateValue(b.sentAt || b.followUpDate || b.createdAt) - sortDateValue(a.sentAt || a.followUpDate || a.createdAt));
	}, [
		communications,
		communicationQuery,
		communicationAudienceFilter,
		communicationStatusFilter
	]);
	const staffingSummary = (0, import_react.useMemo)(() => {
		const today = /* @__PURE__ */ new Date();
		today.setHours(12, 0, 0, 0);
		const sevenDaysAgo = today.getTime() - 8640 * 60 * 1e3;
		return staffingDays.reduce((summary, day) => {
			const dayValue = sortDateValue(day.date);
			const dayTotals = staffingDayTotals(day);
			summary.totalStaffed += dayTotals.staffed;
			summary.totalUnstaffed += dayTotals.unstaffed;
			if (dayValue >= sevenDaysAgo && dayValue <= today.getTime()) {
				summary.weekStaffed += dayTotals.staffed;
				summary.weekUnstaffed += dayTotals.unstaffed;
			}
			return summary;
		}, {
			totalStaffed: 0,
			totalUnstaffed: 0,
			weekStaffed: 0,
			weekUnstaffed: 0
		});
	}, [staffingDays]);
	const staffingChart = (0, import_react.useMemo)(() => {
		const points = staffingDays.slice().sort((a, b) => sortDateValue(a.date) - sortDateValue(b.date)).slice(-14).map((day) => {
			const totals = staffingDayTotals(day);
			return {
				date: day.date,
				total: totals.staffed + totals.unstaffed,
				unstaffed: totals.unstaffed
			};
		});
		const maxValue = Math.max(1, ...points.flatMap((point) => [point.total, point.unstaffed]));
		const pathFor = (field) => points.map((point, index) => {
			const x = points.length <= 1 ? 0 : index / (points.length - 1) * 100;
			const y = 42 - point[field] / maxValue * 36;
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		}).join(" ");
		return {
			points,
			totalPath: pathFor("total"),
			unstaffedPath: pathFor("unstaffed"),
			unstaffedPercent: staffingUnstaffedPercent(staffingSummary.totalStaffed, staffingSummary.totalUnstaffed)
		};
	}, [
		staffingDays,
		staffingSummary.totalStaffed,
		staffingSummary.totalUnstaffed
	]);
	const activeTutorReport = (0, import_react.useMemo)(() => tutorReports.find((report) => report.date === tutorReportDate) ?? null, [tutorReports, tutorReportDate]);
	const filteredTutorReportsForGlobal = (0, import_react.useMemo)(() => tutorReports.filter((report) => {
		const value = sortDateValue(report.date);
		const start = sortDateValue(tutorReportStartDate);
		const end = sortDateValue(tutorReportEndDate);
		return (!start || value >= start) && (!end || value <= end);
	}), [
		tutorReportEndDate,
		tutorReportStartDate,
		tutorReports
	]);
	const tutorReportAggregates = (0, import_react.useMemo)(() => aggregateTutorReports(filteredTutorReportsForGlobal), [filteredTutorReportsForGlobal]);
	const tutorReportCommentByKey = (0, import_react.useMemo)(() => new Map(tutorReportComments.map((comment) => [`id:${comment.tutorId.toLocaleLowerCase("fr")}`, comment.comment])), [tutorReportComments]);
	const filteredTutorReportAggregates = (0, import_react.useMemo)(() => {
		const query = tutorReportGlobalQuery.trim().toLocaleLowerCase("fr");
		const phoneQuery = digitsOnly(tutorReportGlobalQuery);
		if (!query && !phoneQuery) return tutorReportAggregates;
		return tutorReportAggregates.filter((tutor) => {
			const text = `${tutor.tutorId} ${tutor.lastName} ${tutor.firstName} ${tutor.phone} ${tutor.schools.join(" ")} ${tutorReportCommentByKey.get(tutor.key) || ""}`.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const phone = digitsOnly(tutor.phone);
			return text.includes(query.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) || Boolean(phoneQuery && phone.includes(phoneQuery));
		});
	}, [
		tutorReportAggregates,
		tutorReportCommentByKey,
		tutorReportGlobalQuery
	]);
	const visibleTutorReportAggregates = (0, import_react.useMemo)(() => filteredTutorReportAggregates.slice(0, visibleTutorReportCount), [filteredTutorReportAggregates, visibleTutorReportCount]);
	const selectedTutorReport = (0, import_react.useMemo)(() => tutorReportAggregates.find((item) => item.key === selectedTutorReportKey) ?? null, [tutorReportAggregates, selectedTutorReportKey]);
	const filteredTutorReportEntries = (0, import_react.useMemo)(() => {
		const normalized = tutorReportQuery.trim().toLocaleLowerCase("fr");
		const phoneQuery = digitsOnly(tutorReportQuery);
		return (activeTutorReport?.entries ?? []).filter((entry) => {
			if (!normalized) return true;
			const globalComment = tutorReportCommentByKey.get(tutorIdentityKey(entry)) || "";
			return `${entry.tutorId} ${entry.lastName} ${entry.firstName} ${entry.phone} ${entry.school} ${entry.comment} ${globalComment}`.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) || Boolean(phoneQuery && digitsOnly(entry.phone).includes(phoneQuery));
		}).sort((a, b) => b.missingReportCount - a.missingReportCount || a.lastName.localeCompare(b.lastName, "fr"));
	}, [
		activeTutorReport,
		tutorReportCommentByKey,
		tutorReportQuery
	]);
	const latestTutorTrackingSnapshot = tutorTracking.snapshots[0] ?? null;
	const tutorTrackingCommentByKey = (0, import_react.useMemo)(() => new Map(tutorTracking.comments.map((commentItem) => [`id:${commentItem.tutorId.toLocaleLowerCase("fr")}`, commentItem.comment])), [tutorTracking.comments]);
	const tutorTrackingSummary = (0, import_react.useMemo)(() => {
		const byTutor = /* @__PURE__ */ new Map();
		const currentKeys = new Set(latestTutorTrackingSnapshot?.records.map((record) => record.key) ?? []);
		tutorTracking.snapshots.slice().sort((a, b) => sortDateValue(a.date) - sortDateValue(b.date) || sortDateValue(a.createdAt) - sortDateValue(b.createdAt)).forEach((snapshot) => {
			snapshot.records.forEach((record) => {
				const existing = byTutor.get(record.key);
				if (!existing) byTutor.set(record.key, {
					...record,
					firstSeen: snapshot.date,
					lastSeen: snapshot.date,
					seenCount: 1,
					isCurrent: currentKeys.has(record.key)
				});
				else byTutor.set(record.key, {
					...existing,
					...record,
					firstSeen: sortDateValue(snapshot.date) < sortDateValue(existing.firstSeen) ? snapshot.date : existing.firstSeen,
					lastSeen: sortDateValue(snapshot.date) > sortDateValue(existing.lastSeen) ? snapshot.date : existing.lastSeen,
					seenCount: existing.seenCount + 1,
					isCurrent: currentKeys.has(record.key)
				});
			});
		});
		return Array.from(byTutor.values()).sort((a, b) => tutorTrackingDisplayName(a).localeCompare(tutorTrackingDisplayName(b), "fr"));
	}, [latestTutorTrackingSnapshot, tutorTracking.snapshots]);
	const tutorTrackingSnapshotById = (0, import_react.useMemo)(() => new Map(tutorTracking.snapshots.map((snapshot) => [snapshot.id, snapshot])), [tutorTracking.snapshots]);
	const effectiveTutorTrackingCompareEndId = tutorTrackingSnapshotById.has(tutorTrackingCompareEndId) ? tutorTrackingCompareEndId : tutorTracking.snapshots[0]?.id || "";
	const effectiveTutorTrackingCompareStartId = tutorTrackingSnapshotById.has(tutorTrackingCompareStartId) ? tutorTrackingCompareStartId : tutorTracking.snapshots[1]?.id || tutorTracking.snapshots[0]?.id || "";
	const tutorTrackingComparison = (0, import_react.useMemo)(() => {
		const startSnapshot = tutorTrackingSnapshotById.get(effectiveTutorTrackingCompareStartId) ?? null;
		const endSnapshot = tutorTrackingSnapshotById.get(effectiveTutorTrackingCompareEndId) ?? latestTutorTrackingSnapshot ?? null;
		const knownByKey = new Map(tutorTrackingSummary.map((tutor) => [tutor.key, tutor]));
		const startByKey = new Map(startSnapshot?.records.map((record) => [record.key, record]) ?? []);
		const endByKey = new Map(endSnapshot?.records.map((record) => [record.key, record]) ?? []);
		const toSummary = (record, isCurrent) => {
			return {
				...knownByKey.get(record.key) ?? {
					...record,
					firstSeen: startSnapshot?.date || endSnapshot?.date || "",
					lastSeen: startSnapshot?.date || endSnapshot?.date || "",
					seenCount: 1,
					isCurrent
				},
				...record,
				isCurrent
			};
		};
		return {
			startSnapshot,
			endSnapshot,
			current: Array.from(endByKey.values()).map((record) => toSummary(record, true)),
			added: Array.from(endByKey.values()).filter((record) => !startByKey.has(record.key)).map((record) => toSummary(record, true)),
			exited: Array.from(startByKey.values()).filter((record) => !endByKey.has(record.key)).map((record) => toSummary(record, false))
		};
	}, [
		effectiveTutorTrackingCompareEndId,
		effectiveTutorTrackingCompareStartId,
		latestTutorTrackingSnapshot,
		tutorTrackingSnapshotById,
		tutorTrackingSummary
	]);
	const comparedCurrentTutors = tutorTrackingComparison.current;
	const comparedAddedTutors = tutorTrackingComparison.added;
	const comparedExitedTutors = tutorTrackingComparison.exited;
	const tutorTrackingCounts = {
		current: comparedCurrentTutors.length,
		newSince: comparedAddedTutors.length,
		exitedSince: comparedExitedTutors.length
	};
	const filteredTutorTracking = (0, import_react.useMemo)(() => {
		const normalized = tutorTrackingQuery.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		const phoneQuery = digitsOnly(tutorTrackingQuery);
		return (tutorTrackingView === "current" ? comparedCurrentTutors : tutorTrackingView === "new" ? comparedAddedTutors : comparedExitedTutors).filter((tutor) => {
			if (!normalized) return true;
			return `${tutor.tutorId} ${tutor.lastName} ${tutor.firstName} ${tutor.phone} ${tutor.email} ${tutor.wantedCity} ${tutor.school} ${tutorTrackingCommentByKey.get(tutor.key) || ""}`.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalized) || Boolean(phoneQuery && digitsOnly(tutor.phone).includes(phoneQuery));
		}).sort((a, b) => {
			const dateA = tutorTrackingView === "exited" ? a.lastSeen : a.firstSeen;
			return sortDateValue(tutorTrackingView === "exited" ? b.lastSeen : b.firstSeen) - sortDateValue(dateA);
		});
	}, [
		comparedAddedTutors,
		comparedCurrentTutors,
		comparedExitedTutors,
		tutorTrackingCommentByKey,
		tutorTrackingQuery,
		tutorTrackingView
	]);
	const tutorActivityRequestKey = (0, import_react.useMemo)(() => tutorTrackingQuery.trim() ? Array.from(new Set(filteredTutorTracking.map((tutor) => tutor.tutorId.trim()).filter(Boolean))).slice(0, 30) : [], [filteredTutorTracking, tutorTrackingQuery]).join(",");
	(0, import_react.useEffect)(() => {
		if (appMode !== "tutors" || !tutorActivityRequestKey) return;
		const missingIds = tutorActivityRequestKey.split(",").filter((id) => !tutorActivityById[id]);
		if (!missingIds.length) return;
		let cancelled = false;
		const timer = window.setTimeout(() => {
			setTutorActivityLoadingIds((current) => Array.from(new Set([...current, ...missingIds])));
			setTutorActivityError("");
			fetch(`/api/tutor-activity?ids=${encodeURIComponent(missingIds.join(","))}`, { cache: "no-store" }).then(async (response) => {
				const data = await response.json();
				if (!response.ok) throw new Error(data.detail || data.error || "Activité indisponible");
				if (cancelled) return;
				setTutorActivityById((current) => ({
					...current,
					...data.activities || {}
				}));
			}).catch((error) => {
				if (!cancelled) setTutorActivityError(error instanceof Error ? error.message : "Activité indisponible");
			}).finally(() => {
				if (!cancelled) setTutorActivityLoadingIds((current) => current.filter((id) => !missingIds.includes(id)));
			});
		}, 250);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [
		appMode,
		tutorActivityById,
		tutorActivityRequestKey
	]);
	const selectedAvailabilityReference = (0, import_react.useMemo)(() => availabilityImportData[availabilityReferenceId] ?? null, [availabilityImportData, availabilityReferenceId]);
	const selectedAvailabilityRecent = (0, import_react.useMemo)(() => availabilityImportData[availabilityRecentId] ?? null, [availabilityImportData, availabilityRecentId]);
	const selectedInterestReference = interestImportData[interestReferenceId] ?? null;
	const selectedInterestRecent = interestImportData[interestRecentId] ?? null;
	const availabilityDates = (0, import_react.useMemo)(() => Array.from(new Set([...availabilitySources.includes("availability") ? [...selectedAvailabilityReference?.rows ?? [], ...selectedAvailabilityRecent?.rows ?? []].map((row) => row.date) : [], ...availabilitySources.includes("interest") ? [...selectedInterestReference?.rows ?? [], ...selectedInterestRecent?.rows ?? []].map((row) => row.date) : []].filter(Boolean))).sort((a, b) => sortDateValue(a) - sortDateValue(b)), [
		availabilitySources,
		selectedAvailabilityRecent,
		selectedAvailabilityReference,
		selectedInterestRecent,
		selectedInterestReference
	]);
	const effectiveAvailabilityDate = availabilityDates.includes(availabilityDate) ? availabilityDate : availabilityDates.find((date) => sortDateValue(date) >= sortDateValue((/* @__PURE__ */ new Date()).toISOString().slice(0, 10))) ?? availabilityDates[0] ?? availabilityDate;
	const availabilityTutorIds = (0, import_react.useMemo)(() => latestTutorTrackingSnapshot ? new Set(latestTutorTrackingSnapshot.records.map((record) => record.tutorId.trim()).filter(Boolean)) : null, [latestTutorTrackingSnapshot]);
	const availabilityExcludedSourceKeys = (0, import_react.useMemo)(() => new Set(availabilityExclusions.sourceKeys), [availabilityExclusions.sourceKeys]);
	const availabilitySchoolOwnerByName = (0, import_react.useMemo)(() => new Map(schools.map((school) => [normalizedSchoolLookupName(school.name), school.portfolioOwner || ""])), [schools]);
	const availabilitySchoolByName = (0, import_react.useMemo)(() => new Map(schools.map((school) => [normalizedSchoolLookupName(school.name), school])), [schools]);
	const availabilityPeopleForDate = (0, import_react.useCallback)((side, date) => {
		const people = groupAvailabilityPeople({
			availabilityRows: side === "reference" ? selectedAvailabilityReference?.rows ?? [] : selectedAvailabilityRecent?.rows ?? [],
			interestRows: side === "reference" ? selectedInterestReference?.rows ?? [] : selectedInterestRecent?.rows ?? [],
			date,
			sources: availabilitySources,
			exclusions: availabilityExcludedSourceKeys,
			tutorIds: availabilityTutorIds
		});
		const filtered = /* @__PURE__ */ new Map();
		people.forEach((person, personId) => {
			if (person.status !== "unknown" && !availabilityStatuses.includes(person.status)) return;
			const rows = person.rows.filter((row) => {
				const owner = availabilitySchoolOwnerByName.get(normalizedSchoolLookupName(row.school)) || "";
				return availabilitySchoolOwnerFilter === "all" || (availabilitySchoolOwnerFilter === "unassigned" ? !owner : owner === availabilitySchoolOwnerFilter);
			});
			if (rows.length) filtered.set(personId, {
				...person,
				rows
			});
		});
		return filtered;
	}, [
		availabilityExcludedSourceKeys,
		availabilitySchoolOwnerByName,
		availabilitySchoolOwnerFilter,
		availabilitySources,
		availabilityStatuses,
		availabilityTutorIds,
		selectedAvailabilityRecent,
		selectedAvailabilityReference,
		selectedInterestRecent,
		selectedInterestReference
	]);
	const availabilityComparison = (0, import_react.useMemo)(() => {
		const referenceMap = availabilityPeopleForDate("reference", effectiveAvailabilityDate);
		const recentMap = availabilityPeopleForDate("recent", effectiveAvailabilityDate);
		const newTutors = Array.from(recentMap.values()).filter((tutor) => !referenceMap.has(tutor.tutorId));
		const lostTutors = Array.from(referenceMap.values()).filter((tutor) => !recentMap.has(tutor.tutorId));
		const sameTutors = Array.from(recentMap.values()).filter((tutor) => referenceMap.has(tutor.tutorId));
		const sortTutors = (items) => items.sort((a, b) => availabilityTutorName(a).localeCompare(availabilityTutorName(b), "fr"));
		return {
			referenceCount: referenceMap.size,
			recentCount: recentMap.size,
			referenceRowsCount: Array.from(referenceMap.values()).reduce((sum, person) => sum + person.rows.length, 0),
			recentRowsCount: Array.from(recentMap.values()).reduce((sum, person) => sum + person.rows.length, 0),
			newTutors: sortTutors(newTutors),
			lostTutors: sortTutors(lostTutors),
			sameTutors: sortTutors(sameTutors)
		};
	}, [effectiveAvailabilityDate, availabilityPeopleForDate]);
	const recentAvailabilityDailyCounts = (0, import_react.useMemo)(() => {
		const dates = /* @__PURE__ */ new Set();
		if (availabilitySources.includes("availability")) selectedAvailabilityRecent?.rows.forEach((row) => row.date && dates.add(row.date));
		if (availabilitySources.includes("interest")) selectedInterestRecent?.rows.forEach((row) => row.date && dates.add(row.date));
		return Array.from(dates).map((date) => ({
			date,
			count: availabilityPeopleForDate("recent", date).size
		})).sort((a, b) => sortDateValue(a.date) - sortDateValue(b.date));
	}, [
		availabilityPeopleForDate,
		availabilitySources,
		selectedAvailabilityRecent,
		selectedInterestRecent
	]);
	const availabilityStaffingByTutorId = (0, import_react.useMemo)(() => {
		const byTutor = /* @__PURE__ */ new Map();
		const seenByTutor = /* @__PURE__ */ new Map();
		(latestAvailabilityStaffingImport?.rows ?? []).filter((row) => row.date === effectiveAvailabilityDate && !row.absent && row.tutorId.trim()).forEach((row) => {
			const tutorId = row.tutorId.trim();
			const key = `${row.timeSlot}|${normalizedSchoolLookupName(row.school)}`;
			const seen = seenByTutor.get(tutorId) ?? /* @__PURE__ */ new Set();
			if (seen.has(key)) return;
			seen.add(key);
			seenByTutor.set(tutorId, seen);
			byTutor.set(tutorId, [...byTutor.get(tutorId) ?? [], row]);
		});
		byTutor.forEach((rows) => rows.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot, "fr")));
		return byTutor;
	}, [effectiveAvailabilityDate, latestAvailabilityStaffingImport]);
	const displayedAvailabilityTutors = (0, import_react.useMemo)(() => {
		return availabilityView === "new" ? availabilityComparison.newTutors : availabilityView === "lost" ? availabilityComparison.lostTutors : availabilityComparison.sameTutors;
	}, [availabilityComparison, availabilityView]);
	const availabilityHiddenItems = (0, import_react.useMemo)(() => {
		const details = /* @__PURE__ */ new Map();
		const add = (source, personId, firstName, lastName, row) => {
			const key = availabilitySourceKey({
				sessionId: row.sessionId,
				personId,
				source,
				date: row.date,
				school: row.school,
				timeSlot: row.timeSlot
			});
			if (!availabilityExcludedSourceKeys.has(key) || details.has(key)) return;
			details.set(key, {
				key,
				source,
				personId,
				name: `${firstName} ${lastName}`.trim() || `ID ${personId}`,
				sessionId: row.sessionId,
				school: row.school,
				date: row.date,
				timeSlot: row.timeSlot
			});
		};
		Object.values(availabilityImportData).forEach((item) => item.rows.forEach((row) => add("availability", row.tutorId, row.firstName, row.lastName, row)));
		Object.values(interestImportData).forEach((item) => item.rows.forEach((row) => add("interest", row.personId, row.firstName, row.lastName, row)));
		return availabilityExclusions.sourceKeys.map((key) => details.get(key) ?? {
			key,
			source: key.includes(":interest") || key.includes("interest") ? "interest" : "availability",
			personId: "",
			name: "Élément d’un ancien import",
			sessionId: key.split(":")[0] || "",
			school: "",
			date: "",
			timeSlot: ""
		});
	}, [
		availabilityExcludedSourceKeys,
		availabilityExclusions.sourceKeys,
		availabilityImportData,
		interestImportData
	]);
	const filteredSchools = (0, import_react.useMemo)(() => {
		const normalized = schoolQuery.trim().toLocaleLowerCase("fr");
		return schools.filter((school) => {
			if (!(schoolFilter === "all" || schoolFilter === "with-posts" && school.events.length > 0 || schoolFilter === "without-posts" && school.events.length === 0 || school.schoolType === schoolFilter)) return false;
			if (!normalized) return true;
			const eventsText = school.events.map((event) => `${event.title} ${event.note} ${event.author} ${event.tags.join(" ")}`).join(" ");
			return `${school.name} ${school.city} ${school.contact} ${school.nextAction} ${school.notes} ${school.category} ${schoolTypeLabels[school.schoolType]} ${school.zone} ${school.coordinator} ${school.address} ${school.department} ${school.actions} ${eventsText}`.toLocaleLowerCase("fr").includes(normalized);
		}).sort((a, b) => a.name.localeCompare(b.name, "fr"));
	}, [
		schools,
		schoolQuery,
		schoolFilter
	]);
	const assignmentSchools = (0, import_react.useMemo)(() => {
		const normalized = schoolQuery.trim().toLocaleLowerCase("fr");
		return schools.filter((school) => {
			if (!(schoolAssignmentFilter === "all" || schoolAssignmentFilter === "unassigned" && !school.portfolioOwner || school.portfolioOwner === schoolAssignmentFilter)) return false;
			return !normalized || `${school.name} ${school.city} ${school.externalId}`.toLocaleLowerCase("fr").includes(normalized);
		}).sort((a, b) => Number(Boolean(a.portfolioOwner)) - Number(Boolean(b.portfolioOwner)) || a.name.localeCompare(b.name, "fr"));
	}, [
		schoolAssignmentFilter,
		schoolQuery,
		schools
	]);
	const schoolCountsByOwner = (0, import_react.useMemo)(() => {
		const counts = {
			"": 0,
			kelly: 0,
			pierre: 0,
			julie: 0
		};
		schools.forEach((school) => {
			counts[school.portfolioOwner] += 1;
		});
		return counts;
	}, [schools]);
	const crmFeedItems = (0, import_react.useMemo)(() => filteredSchools.flatMap((school) => school.events.map((event) => ({
		school,
		event
	}))).sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime()), [filteredSchools]);
	const schoolsWithoutEvents = (0, import_react.useMemo)(() => filteredSchools.filter((school) => school.events.length === 0), [filteredSchools]);
	const selectedSchool = selectedSchoolId ? schools.find((school) => school.id === selectedSchoolId) ?? null : null;
	const schoolById = (0, import_react.useMemo)(() => new Map(schools.map((school) => [school.id, school])), [schools]);
	const filteredSchoolWatchlist = (0, import_react.useMemo)(() => {
		const normalized = schoolWatchQuery.trim().toLocaleLowerCase("fr");
		return schoolWatchlist.filter((item) => {
			const school = schoolById.get(item.schoolId);
			if (!(schoolWatchFilter === "all" || item.status === schoolWatchFilter || item.tags.includes(schoolWatchFilter))) return false;
			if (!normalized) return true;
			const commentsText = item.comments.map((comment) => `${comment.text} ${comment.author}`).join(" ");
			return `${school?.name || "Établissement introuvable"} ${school?.city || ""} ${school?.coordinator || ""} ${school?.category || ""} ${school ? schoolTypeLabels[school.schoolType] : ""} ${item.reason} ${item.tags.join(" ")} ${commentsText}`.toLocaleLowerCase("fr").includes(normalized);
		}).sort((a, b) => {
			if (a.status !== b.status) return a.status === "active" ? -1 : 1;
			return sortDateValue(b.updatedAt || b.createdAt) - sortDateValue(a.updatedAt || a.createdAt);
		});
	}, [
		schoolWatchlist,
		schoolById,
		schoolWatchQuery,
		schoolWatchFilter
	]);
	const selectedSchoolWatchItem = selectedSchoolWatchId ? schoolWatchlist.find((item) => item.id === selectedSchoolWatchId) ?? null : null;
	const activeHistory = studentHistory.find((year) => year.year === activeHistoryYear) ?? null;
	const chartYears = studentHistory.filter((year) => selectedHistoryYears.includes(year.year));
	const chartDays = campaignDates(2e3).map(campaignDayKey);
	const maxStudentHistoryValue = Math.max(1, ...chartYears.flatMap((year) => {
		let carried = 0;
		return year.entries.map((entry) => {
			if (entry.value !== null) carried = entry.value;
			return carried;
		});
	}));
	const notifiablePeople = people.filter((person) => person.active);
	const draftAssignee = draft.assigneeId ? peopleById.get(draft.assigneeId) : null;
	const editingTask = editingId ? tasks.find((task) => task.id === editingId) ?? null : null;
	const assignmentChanged = Boolean(draft.assigneeId && draft.assigneeId !== editingTask?.assigneeId);
	async function saveSharedTasks(nextTasks, message, notifyAssignments = true) {
		setSaving(true);
		setSyncError("");
		setTasks(nextTasks);
		try {
			if (!(await fetch("/api/tasks", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					tasks: nextTasks,
					notifyAssignments,
					sendAssignmentEmail: notifyAssignments
				})
			})).ok) throw new Error("save-failed");
			await loadTasks(true);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Sauvegarde impossible");
		} finally {
			setSaving(false);
		}
	}
	async function saveRecurringTasks(nextRecurringTasks, message) {
		setSaving(true);
		setSyncError("");
		setRecurringTasks(nextRecurringTasks);
		try {
			const response = await fetch("/api/recurring-tasks", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ recurringTasks: nextRecurringTasks })
			});
			if (!response.ok) throw new Error("save-recurring-failed");
			const data = await response.json();
			setRecurringTasks(Array.isArray(data.recurringTasks) ? data.recurringTasks.map(normalizeRecurringTask) : []);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Modele non sauvegarde");
		} finally {
			setSaving(false);
		}
	}
	async function saveObjectives(nextObjectives, message) {
		setSaving(true);
		setSyncError("");
		setObjectives(nextObjectives);
		try {
			const response = await fetch("/api/objectives", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ objectives: nextObjectives })
			});
			if (!response.ok) throw new Error("save-objectives-failed");
			const data = await response.json();
			setObjectives(Array.isArray(data.objectives) ? data.objectives.map(normalizeObjective) : []);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Objectif non sauvegarde");
		} finally {
			setSaving(false);
		}
	}
	async function saveLinks(nextLinks, message) {
		setSaving(true);
		setSyncError("");
		setLinks(nextLinks);
		try {
			const response = await fetch("/api/links", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ links: nextLinks })
			});
			if (!response.ok) throw new Error("save-links-failed");
			const data = await response.json();
			setLinks(Array.isArray(data.links) ? data.links.map(normalizeSharedLink) : []);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Lien non sauvegarde");
		} finally {
			setSaving(false);
		}
	}
	async function saveJournalPosts(nextPosts, message) {
		setSaving(true);
		setSyncError("");
		const sortedPosts = nextPosts.map(normalizeJournalPost).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
		setJournalPosts(sortedPosts);
		try {
			const response = await fetch("/api/journal-posts", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ posts: sortedPosts })
			});
			if (!response.ok) throw new Error("save-journal-failed");
			const data = await response.json();
			setJournalPosts(Array.isArray(data.posts) ? data.posts.map(normalizeJournalPost) : []);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Post non sauvegarde");
		} finally {
			setSaving(false);
		}
	}
	async function saveCommunications(nextCommunications, message) {
		setSaving(true);
		setSyncError("");
		const sortedCommunications = nextCommunications.map(normalizeMassCommunication).sort((a, b) => sortDateValue(b.sentAt || b.followUpDate || b.createdAt) - sortDateValue(a.sentAt || a.followUpDate || a.createdAt));
		setCommunications(sortedCommunications);
		try {
			const response = await fetch("/api/mass-communications", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ communications: sortedCommunications })
			});
			if (!response.ok) throw new Error("save-communications-failed");
			const data = await response.json();
			setCommunications(Array.isArray(data.communications) ? data.communications.map(normalizeMassCommunication) : []);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Communication non sauvegardée");
		} finally {
			setSaving(false);
		}
	}
	async function saveStaffingDays(nextStaffing, message) {
		setSaving(true);
		setSyncError("");
		const normalizedStaffing = nextStaffing.map(normalizeStaffingDay).sort((a, b) => sortDateValue(b.date) - sortDateValue(a.date));
		setStaffingDays(normalizedStaffing);
		try {
			const response = await fetch("/api/staffing-sessions", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ staffing: normalizedStaffing })
			});
			if (!response.ok) throw new Error("save-staffing-failed");
			const data = await response.json();
			setStaffingDays(Array.isArray(data.staffing) ? data.staffing.map(normalizeStaffingDay) : []);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Staffing non sauvegardé");
		} finally {
			setSaving(false);
		}
	}
	async function saveTutorReports(nextReports, message) {
		setSaving(true);
		setSyncError("");
		const normalizedReports = nextReports.map((report) => normalizeTutorReportSnapshot({
			...report,
			entries: resolveTutorReportEntries(report.entries, tutorTracking.snapshots.flatMap((snapshot) => snapshot.records))
		})).sort((a, b) => sortDateValue(b.date) - sortDateValue(a.date));
		setTutorReports(normalizedReports);
		try {
			const response = await fetch("/api/tutor-reports", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reports: normalizedReports })
			});
			if (!response.ok) throw new Error("save-tutor-reports-failed");
			const data = await response.json();
			setTutorReports(Array.isArray(data.reports) ? data.reports.map(normalizeTutorReportSnapshot) : []);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Bilans tuteurs non sauvegardés");
		} finally {
			setSaving(false);
		}
	}
	async function saveTutorReportComments(nextComments, message) {
		setSaving(true);
		setSyncError("");
		const normalizedComments = nextComments.map(normalizeTutorReportComment).filter((comment) => comment.tutorId);
		setTutorReportComments(normalizedComments);
		try {
			const response = await fetch("/api/tutor-report-comments", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ comments: normalizedComments })
			});
			if (!response.ok) throw new Error("save-tutor-report-comments-failed");
			const data = await response.json();
			setTutorReportComments(Array.isArray(data.comments) ? data.comments.map(normalizeTutorReportComment).filter((comment) => comment.tutorId) : []);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Commentaire tuteur non sauvegardé");
		} finally {
			setSaving(false);
		}
	}
	async function saveTutorTracking(nextTracking, message) {
		setSaving(true);
		setSyncError("");
		const normalizedTracking = normalizeTutorTrackingData(nextTracking);
		setTutorTracking(normalizedTracking);
		try {
			const response = await fetch("/api/tutor-tracking", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tracking: normalizedTracking })
			});
			if (!response.ok) throw new Error("save-tutor-tracking-failed");
			setTutorTracking(normalizeTutorTrackingData((await response.json()).tracking || {}));
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Suivi tuteurs non sauvegardé");
		} finally {
			setSaving(false);
		}
	}
	async function saveSchoolWatchlist(nextWatchlist, message) {
		setSaving(true);
		setSyncError("");
		const normalizedWatchlist = nextWatchlist.map(normalizeSchoolWatchItem).sort((a, b) => sortDateValue(b.updatedAt || b.createdAt) - sortDateValue(a.updatedAt || a.createdAt));
		setSchoolWatchlist(normalizedWatchlist);
		try {
			const response = await fetch("/api/school-watchlist", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ watchlist: normalizedWatchlist })
			});
			if (!response.ok) throw new Error("save-school-watchlist-failed");
			const data = await response.json();
			setSchoolWatchlist(Array.isArray(data.watchlist) ? data.watchlist.map(normalizeSchoolWatchItem) : []);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Suivi non sauvegardé");
		} finally {
			setSaving(false);
		}
	}
	async function saveSchools(nextSchools, message) {
		setSaving(true);
		setSyncError("");
		const sortedSchools = nextSchools.map(normalizeSchool).sort((a, b) => a.name.localeCompare(b.name, "fr"));
		setSchools(sortedSchools);
		try {
			const response = await fetch("/api/schools", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ schools: sortedSchools })
			});
			if (!response.ok) throw new Error("save-schools-failed");
			const data = await response.json();
			setSchools(Array.isArray(data.schools) ? data.schools.map(normalizeSchool) : []);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Établissement non sauvegardé");
		} finally {
			setSaving(false);
		}
	}
	function assignSchoolPortfolioOwner(schoolId, portfolioOwner) {
		saveSchools(schools.map((school) => school.id === schoolId ? {
			...school,
			portfolioOwner,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		} : school), portfolioOwner ? `Établissement attribué à ${schoolPortfolioOwnerLabels[portfolioOwner]}` : "Attribution retirée");
	}
	function importSchoolAssignments(text) {
		const assignments = /* @__PURE__ */ new Map();
		let duplicates = 0;
		let invalid = 0;
		text.split(/\r?\n/).forEach((line) => {
			const trimmed = line.trim();
			if (!trimmed) return;
			const match = trimmed.match(/^(.*?)\s+((?:pierre|julie|kelly)@etudealpha\.fr|non[- ]attribu[eé])\s*$/i);
			if (!match) {
				invalid += 1;
				return;
			}
			const name = match[1].trim();
			const assignmentValue = match[2].toLocaleLowerCase("fr");
			const owner = assignmentValue.startsWith("non-") || assignmentValue.startsWith("non ") ? "" : assignmentValue.split("@", 1)[0];
			const key = normalizedSchoolLookupName(name);
			if (!key) {
				invalid += 1;
				return;
			}
			if (assignments.has(key)) duplicates += 1;
			assignments.set(key, {
				name,
				owner
			});
		});
		if (!assignments.size) {
			setSchoolAssignmentImportReport({
				matched: 0,
				changed: 0,
				duplicates,
				invalid,
				unmatched: []
			});
			setToast("Aucune attribution reconnue dans le texte");
			return;
		}
		const knownNames = new Set(schools.map((school) => normalizedSchoolLookupName(school.name)));
		const unmatched = Array.from(assignments.entries()).filter(([key]) => !knownNames.has(key)).map(([, item]) => item.name);
		let matched = 0;
		let changed = 0;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const nextSchools = schools.map((school) => {
			const assignment = assignments.get(normalizedSchoolLookupName(school.name));
			if (!assignment) return school;
			matched += 1;
			if (school.portfolioOwner === assignment.owner) return school;
			changed += 1;
			return {
				...school,
				portfolioOwner: assignment.owner,
				updatedAt: now
			};
		});
		setSchoolAssignmentImportReport({
			matched,
			changed,
			duplicates,
			invalid,
			unmatched
		});
		saveSchools(nextSchools, `${changed} attribution${changed > 1 ? "s" : ""} préremplie${changed > 1 ? "s" : ""} · ${matched} établissement${matched > 1 ? "s" : ""} reconnu${matched > 1 ? "s" : ""}`);
	}
	async function importSchoolAssignmentsFile(file) {
		if (!file) return;
		const text = await file.text();
		setSchoolAssignmentPaste(text);
		importSchoolAssignments(text);
	}
	function exportSchoolAssignments() {
		const csv = `\uFEFF${[[
			"ID établissement",
			"Établissement",
			"Ville",
			"Département",
			"Type",
			"Catégorie",
			"Responsable",
			"Email responsable",
			"Statut attribution"
		], ...[...schools].sort((a, b) => Number(Boolean(a.portfolioOwner)) - Number(Boolean(b.portfolioOwner)) || a.name.localeCompare(b.name, "fr")).map((school) => [
			school.externalId,
			school.name,
			school.city,
			school.department,
			schoolTypeLabels[school.schoolType],
			school.category,
			schoolPortfolioOwnerLabels[school.portfolioOwner],
			schoolPortfolioOwnerEmails[school.portfolioOwner],
			school.portfolioOwner ? "Attribué" : "Non attribué"
		])].map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `repartition-etablissements-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		link.click();
		URL.revokeObjectURL(url);
		setToast(`${schools.length} établissements exportés`);
	}
	async function saveStudentHistory(nextHistory, message) {
		setSaving(true);
		setSyncError("");
		const normalizedHistory = nextHistory.map(normalizeStudentHistoryYear).sort((a, b) => b.year - a.year);
		setStudentHistory(normalizedHistory);
		try {
			const response = await fetch("/api/student-history", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ history: normalizedHistory })
			});
			if (!response.ok) throw new Error("save-student-history-failed");
			const data = await response.json();
			setStudentHistory(Array.isArray(data.history) ? data.history.map(normalizeStudentHistoryYear) : []);
			setToast(message);
		} catch {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast("Historique non sauvegarde");
		} finally {
			setSaving(false);
		}
	}
	async function savePeople(nextPeople, message) {
		setSaving(true);
		try {
			const response = await fetch("/api/people", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ people: nextPeople })
			});
			if (!response.ok) throw new Error("save-people-failed");
			const data = await response.json();
			setPeople(Array.isArray(data.people) ? data.people.map(normalizePerson) : []);
			setToast(message);
		} catch {
			setToast("Personnes non sauvegardees");
		} finally {
			setSaving(false);
		}
	}
	function openNewTask() {
		setEditingId(null);
		setDraft({
			...emptyDraft,
			startDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		});
		setSendAssignmentEmail(true);
		setEditorOpen(true);
	}
	function openEditTask(task) {
		setEditingId(task.id);
		setDraft({
			title: task.title,
			description: task.description,
			owner: task.owner,
			assigneeId: task.assigneeId,
			startDate: task.startDate,
			endDate: task.endDate,
			estimatedHours: task.estimatedHours,
			status: task.status,
			priority: task.priority,
			verified: task.verified,
			verificationOwner: task.verificationOwner,
			verificationComment: task.verificationComment
		});
		setSendAssignmentEmail(true);
		setEditorOpen(true);
	}
	function selectAssignee(personId) {
		const person = peopleById.get(personId);
		setDraft({
			...draft,
			assigneeId: person?.id || null,
			owner: person?.name || draft.owner
		});
		setSendAssignmentEmail(Boolean(person?.hasEmail));
	}
	function openNewRecurringTask() {
		setEditingRecurringId(null);
		setRecurringDraft(emptyRecurringDraft);
		setRecurringOpen(true);
	}
	function openEditRecurringTask(task) {
		setEditingRecurringId(task.id);
		setRecurringDraft({
			title: task.title,
			description: task.description,
			owner: task.owner,
			assigneeId: task.assigneeId,
			estimatedHours: task.estimatedHours,
			priority: task.priority
		});
		setRecurringOpen(true);
	}
	function selectRecurringAssignee(personId) {
		const person = peopleById.get(personId);
		setRecurringDraft({
			...recurringDraft,
			assigneeId: person?.id || null,
			owner: person?.name || recurringDraft.owner
		});
	}
	async function saveRecurringTask(event) {
		event.preventDefault();
		if (!recurringDraft.title.trim() || !recurringDraft.owner.trim() || saving) return;
		const cleanDraft = {
			...recurringDraft,
			title: recurringDraft.title.trim(),
			description: recurringDraft.description.trim(),
			owner: recurringDraft.owner.trim(),
			estimatedHours: typeof recurringDraft.estimatedHours === "number" && Number.isFinite(recurringDraft.estimatedHours) && recurringDraft.estimatedHours > 0 ? recurringDraft.estimatedHours : null
		};
		if (editingRecurringId) await saveRecurringTasks(recurringTasks.map((task) => task.id === editingRecurringId ? {
			...task,
			...cleanDraft
		} : task), "Modele recurrent mis a jour");
		else await saveRecurringTasks([{
			...cleanDraft,
			id: uid("recurring"),
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		}, ...recurringTasks], "Modele recurrent ajoute");
		setRecurringOpen(false);
	}
	function createTaskFromRecurring(task) {
		setEditingId(null);
		setDraft({
			title: task.title,
			description: task.description,
			owner: task.owner,
			assigneeId: task.assigneeId,
			startDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			endDate: "",
			estimatedHours: task.estimatedHours,
			status: "todo",
			priority: task.priority,
			verified: false,
			verificationOwner: "",
			verificationComment: ""
		});
		const assignee = task.assigneeId ? peopleById.get(task.assigneeId) : null;
		setSendAssignmentEmail(Boolean(assignee?.hasEmail));
		setEditorOpen(true);
	}
	async function deleteRecurringTask(taskId) {
		if (!window.confirm("Supprimer ce modele recurrent ?")) return;
		await saveRecurringTasks(recurringTasks.filter((task) => task.id !== taskId), "Modele recurrent supprime");
	}
	function openNewLink() {
		setEditingLinkId(null);
		setLinkDraft(emptyLinkDraft);
		setLinkOpen(true);
	}
	function openEditLink(link) {
		setEditingLinkId(link.id);
		setLinkDraft({
			title: link.title,
			description: link.description,
			url: link.url
		});
		setLinkOpen(true);
	}
	async function saveLink(event) {
		event.preventDefault();
		const url = normalizeUrl(linkDraft.url);
		if (!linkDraft.title.trim() || !url || saving) return;
		const cleanDraft = {
			...linkDraft,
			title: linkDraft.title.trim(),
			description: linkDraft.description.trim(),
			url
		};
		if (editingLinkId) await saveLinks(links.map((link) => link.id === editingLinkId ? {
			...link,
			...cleanDraft
		} : link), "Lien mis a jour");
		else await saveLinks([{
			...cleanDraft,
			id: uid("link"),
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		}, ...links], "Lien ajoute");
		setLinkOpen(false);
	}
	async function deleteLink(linkId) {
		if (!window.confirm("Supprimer ce lien ?")) return;
		await saveLinks(links.filter((link) => link.id !== linkId), "Lien supprime");
	}
	function openNewJournalPost() {
		setEditingJournalId(null);
		setJournalDraft({
			...emptyJournalDraft,
			author: authorName.trim() || "",
			publishedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		});
		setJournalOpen(true);
	}
	function openEditJournalPost(post) {
		setEditingJournalId(post.id);
		setJournalDraft({
			title: post.title,
			content: post.content,
			author: post.author,
			tags: post.tags,
			personIds: post.personIds,
			publishedAt: post.publishedAt.slice(0, 10)
		});
		setJournalOpen(true);
	}
	function toggleJournalPerson(personId, checked) {
		setJournalDraft((current) => ({
			...current,
			personIds: checked ? [...current.personIds, personId] : current.personIds.filter((id) => id !== personId)
		}));
	}
	async function saveJournalPost(event) {
		event.preventDefault();
		if (!journalDraft.title.trim() || !journalDraft.content.trim() || saving) return;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const cleanDraft = {
			...journalDraft,
			title: journalDraft.title.trim(),
			content: journalDraft.content.trim(),
			author: journalDraft.author.trim() || authorName.trim() || "Equipe Alpha",
			tags: normalizeTags(journalDraft.tags),
			personIds: Array.from(new Set(journalDraft.personIds)),
			publishedAt: journalDraft.publishedAt ? (/* @__PURE__ */ new Date(`${journalDraft.publishedAt}T12:00:00`)).toISOString() : now,
			updatedAt: now
		};
		if (cleanDraft.author && cleanDraft.author !== "Equipe Alpha") setAuthorName(cleanDraft.author);
		if (editingJournalId) {
			const existingPost = journalPosts.find((post) => post.id === editingJournalId);
			await saveJournalPosts(journalPosts.map((post) => post.id === editingJournalId ? {
				...existingPost ?? post,
				...cleanDraft,
				id: editingJournalId,
				createdAt: existingPost?.createdAt || post.createdAt
			} : post), "Post mis a jour");
		} else await saveJournalPosts([{
			...cleanDraft,
			id: uid("journal"),
			likes: [],
			comments: [],
			createdAt: now
		}, ...journalPosts], "Post ajoute au journal");
		setJournalOpen(false);
	}
	async function deleteJournalPost(postId) {
		if (!window.confirm("Supprimer ce post du journal ?")) return;
		await saveJournalPosts(journalPosts.filter((post) => post.id !== postId), "Post supprime");
	}
	async function likeJournalPost(postId) {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const author = authorName.trim() || "Anonyme";
		await saveJournalPosts(journalPosts.map((post) => post.id === postId ? {
			...post,
			likes: [...post.likes, {
				id: uid("like"),
				author,
				createdAt: now
			}],
			updatedAt: now
		} : post), "Like ajouté");
	}
	async function addJournalComment(postId, event) {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);
		const author = String(data.get("author") || "").trim() || authorName.trim() || "Anonyme";
		const text = String(data.get("comment") || "").trim();
		if (!text) return;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		if (author !== "Anonyme") setAuthorName(author);
		await saveJournalPosts(journalPosts.map((post) => post.id === postId ? {
			...post,
			comments: [...post.comments, {
				id: uid("social-comment"),
				author,
				text,
				createdAt: now
			}],
			updatedAt: now
		} : post), "Commentaire ajouté");
		form.reset();
	}
	function openNewCommunication() {
		setEditingCommunicationId(null);
		setCommunicationDraft({
			...emptyCommunicationDraft,
			author: authorName.trim() || "",
			sentAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		});
		setCommunicationOpen(true);
	}
	function openEditCommunication(communication) {
		setEditingCommunicationId(communication.id);
		setCommunicationDraft({
			title: communication.title,
			messageSummary: communication.messageSummary,
			audiences: communication.audiences,
			recipients: communication.recipients,
			channel: communication.channel,
			status: communication.status,
			sentAt: communication.sentAt ? communication.sentAt.slice(0, 10) : "",
			followUpDate: communication.followUpDate ? communication.followUpDate.slice(0, 10) : "",
			author: communication.author,
			notes: communication.notes,
			tags: communication.tags
		});
		setCommunicationOpen(true);
	}
	function toggleCommunicationAudience(audience, checked) {
		setCommunicationDraft((current) => ({
			...current,
			audiences: checked ? Array.from(new Set([...current.audiences, audience])) : current.audiences.filter((item) => item !== audience)
		}));
	}
	async function saveCommunication(event) {
		event.preventDefault();
		if (!communicationDraft.title.trim() || communicationDraft.audiences.length === 0 && communicationDraft.recipients.every((item) => !item.trim()) || saving) return;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const cleanDraft = {
			...communicationDraft,
			title: communicationDraft.title.trim(),
			messageSummary: communicationDraft.messageSummary.trim(),
			audiences: Array.from(new Set(communicationDraft.audiences)),
			recipients: Array.from(new Set(communicationDraft.recipients.map((item) => item.trim()).filter(Boolean))),
			channel: communicationDraft.channel.trim() || "Email",
			sentAt: communicationDraft.sentAt,
			followUpDate: communicationDraft.followUpDate,
			author: communicationDraft.author.trim() || authorName.trim() || "Equipe Alpha",
			notes: communicationDraft.notes.trim(),
			tags: normalizeTags(communicationDraft.tags),
			updatedAt: now
		};
		if (cleanDraft.author && cleanDraft.author !== "Equipe Alpha") setAuthorName(cleanDraft.author);
		if (editingCommunicationId) {
			const existingCommunication = communications.find((communication) => communication.id === editingCommunicationId);
			await saveCommunications(communications.map((communication) => communication.id === editingCommunicationId ? {
				...existingCommunication ?? communication,
				...cleanDraft,
				id: editingCommunicationId,
				createdAt: existingCommunication?.createdAt || communication.createdAt
			} : communication), "Communication mise à jour");
		} else await saveCommunications([{
			...cleanDraft,
			id: uid("communication"),
			createdAt: now
		}, ...communications], "Communication ajoutée");
		setCommunicationOpen(false);
	}
	async function deleteCommunication(communicationId) {
		if (!window.confirm("Supprimer cette communication ?")) return;
		await saveCommunications(communications.filter((communication) => communication.id !== communicationId), "Communication supprimée");
	}
	async function updateStaffingValue(dayId, personKey, field, value) {
		const count = normalizeSessionCount(value);
		const now = (/* @__PURE__ */ new Date()).toISOString();
		await saveStaffingDays(staffingDays.map((day) => {
			if (day.id !== dayId) return day;
			const people = {
				...day.people,
				[personKey]: {
					...day.people[personKey],
					[field]: count
				}
			};
			const peopleTotals = staffingPeopleTotals(people);
			return {
				...day,
				people,
				totalStaffedSessions: field === "staffedSessions" ? peopleTotals.staffed : day.totalStaffedSessions,
				totalUnstaffedSessions: field === "unstaffedSessions" ? peopleTotals.unstaffed : day.totalUnstaffedSessions,
				updatedAt: now
			};
		}), "Staffing mis à jour");
	}
	async function updateStaffingTotal(dayId, field, value) {
		const count = normalizeSessionCount(value);
		const now = (/* @__PURE__ */ new Date()).toISOString();
		await saveStaffingDays(staffingDays.map((day) => day.id === dayId ? {
			...day,
			[field]: count,
			updatedAt: now
		} : day), "Total staffing mis à jour");
	}
	async function importTutorReportPaste() {
		if (!tutorReportDate || saving) return;
		const entries = resolveTutorReportEntries(parseTutorReportPaste(tutorReportPaste), tutorTracking.snapshots.flatMap((snapshot) => snapshot.records));
		if (!entries.length) {
			setToast("Aucune ligne valide à importer");
			return;
		}
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const existing = tutorReports.find((report) => report.date === tutorReportDate);
		const existingComments = new Map((existing?.entries ?? []).filter((entry) => entry.comment.trim()).map((entry) => [tutorIdentityKey(entry), entry.comment]));
		await saveTutorReports([normalizeTutorReportSnapshot({
			id: existing?.id || `tutor-reports-${tutorReportDate}`,
			date: tutorReportDate,
			entries: entries.map((entry) => ({
				...entry,
				comment: entry.comment || existingComments.get(tutorIdentityKey(entry)) || ""
			})),
			createdAt: existing?.createdAt || now,
			updatedAt: now,
			comment: existing?.comment || ""
		}), ...tutorReports.filter((report) => report.date !== tutorReportDate)], existing ? "Bilans tuteurs remplacés" : "Bilans tuteurs importés");
		setTutorReportPaste("");
	}
	async function importTutorReportFile(file) {
		if (!file) return;
		try {
			setTutorReportPaste(await file.text());
			setToast(`Fichier chargé pour le ${formatFullDate(tutorReportDate)}`);
		} catch {
			setToast("Fichier illisible. Exportez-le en CSV ou TSV puis réessayez.");
		}
	}
	async function deleteTutorReportSnapshot(date) {
		if (!window.confirm(`Supprimer les bilans tuteurs du ${formatFullDate(date)} ?`)) return;
		const nextReports = tutorReports.filter((report) => report.date !== date);
		await saveTutorReports(nextReports, "Bilans tuteurs supprimés");
		setTutorReportDate(nextReports[0]?.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	}
	async function updateTutorReportEntryComment(date, entryId, commentValue) {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		await saveTutorReports(tutorReports.map((report) => report.date === date ? {
			...report,
			entries: report.entries.map((entry) => entry.id === entryId ? {
				...entry,
				comment: commentValue.trim()
			} : entry),
			updatedAt: now
		} : report), "Commentaire tuteur sauvegardé");
	}
	async function updateTutorReportGlobalComment(tutorId, commentValue) {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const trimmedComment = commentValue.trim();
		const withoutTutor = tutorReportComments.filter((commentItem) => commentItem.tutorId !== tutorId);
		await saveTutorReportComments(trimmedComment ? [...withoutTutor, {
			tutorId,
			comment: trimmedComment,
			updatedAt: now
		}] : withoutTutor, "Commentaire global sauvegardé");
	}
	async function deleteTutorReportEntry(date, entryId) {
		const report = tutorReports.find((item) => item.date === date);
		const entry = report?.entries.find((item) => item.id === entryId);
		if (!report || !entry) return;
		if (!window.confirm(`Supprimer la ligne de ${tutorDisplayName(entry)} pour le ${formatFullDate(date)} ?`)) return;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		await saveTutorReports(tutorReports.map((item) => item.date === date ? {
			...item,
			entries: item.entries.filter((line) => line.id !== entryId),
			updatedAt: now
		} : item), "Ligne tuteur supprimée");
	}
	async function deleteTutorReportAggregate(tutor) {
		const periodLabel = `${tutorReportStartDate ? formatFullDate(tutorReportStartDate) : "le début"} → ${tutorReportEndDate ? formatFullDate(tutorReportEndDate) : "aujourd’hui"}`;
		if (!window.confirm(`Supprimer ${tutorDisplayName(tutor)} de la vue globale pour la période ${periodLabel} ?\n\nCela supprimera ses lignes dans les imports de cette période.`)) return;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		await saveTutorReports(tutorReports.map((report) => {
			if (!filteredTutorReportsForGlobal.some((filteredReport) => filteredReport.date === report.date)) return report;
			return {
				...report,
				entries: report.entries.filter((entry) => tutorIdentityKey(entry) !== tutor.key),
				updatedAt: now
			};
		}), "Tuteur supprimé de la vue globale");
	}
	function exportTutorReportAggregatesCsv() {
		const periodLabel = `${tutorReportStartDate || "debut"}-${tutorReportEndDate || "aujourdhui"}`;
		const csv = "﻿" + [[
			"Rang",
			"ID tuteur",
			"Nom",
			"Prénom",
			"Téléphone",
			"Établissements",
			"Nombre de dates",
			"Bilans non faits",
			"Élèves concernés",
			"Dates concernées",
			"Détail par date",
			"Commentaire général"
		], ...tutorReportAggregates.map((tutor, index) => [
			index + 1,
			tutor.tutorId,
			tutor.lastName,
			tutor.firstName,
			tutor.phone,
			tutor.schools.join(" | "),
			tutor.dateCount,
			tutor.totalMissing,
			tutor.totalStudents,
			tutor.dates.map((dateItem) => formatFullDate(dateItem.date)).join(" | "),
			tutor.dates.map((dateItem) => `${formatFullDate(dateItem.date)} : ${dateItem.missingReportCount} bilan(s), ${dateItem.studentCount} élève(s), ${dateItem.school || "établissement non renseigné"}`).join(" | "),
			tutorReportCommentByKey.get(tutor.key) || ""
		])].map((row) => row.map(csvCell).join(";")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `bilans-tuteurs-global-${periodLabel}.csv`;
		link.click();
		URL.revokeObjectURL(url);
		setToast("Export CSV téléchargé");
	}
	async function importTutorTrackingCsv(csvValue = tutorTrackingCsv, fileName = "liste-tuteurs.csv") {
		if (!tutorTrackingDate || saving) return;
		if (!parseTutorTrackingCsv(csvValue).length) {
			setToast("Aucun tuteur valide à importer");
			return;
		}
		setSaving(true);
		setSyncError("");
		try {
			const response = await fetch("/api/tutor-tracking", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					date: tutorTrackingDate,
					fileName,
					rawCsv: csvValue
				})
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Import tuteurs impossible");
			const nextTracking = normalizeTutorTrackingData(data.tracking || {});
			const importedSnapshot = data.snapshot ? normalizeTutorTrackingSnapshot(data.snapshot) : nextTracking.snapshots[0];
			setTutorTracking(nextTracking);
			if (importedSnapshot) {
				setSelectedTutorTrackingSnapshotId(importedSnapshot.id);
				setTutorTrackingCompareEndId(importedSnapshot.id);
				setTutorTrackingCompareStartId(nextTracking.snapshots.find((snapshot) => snapshot.id !== importedSnapshot.id)?.id || importedSnapshot.id);
			}
			setTutorTrackingCsv("");
			setToast("Nouvel import tuteurs sauvegardé dans Fichiers");
		} catch (error) {
			setSyncError("L’import des tuteurs n’a pas été sauvegardé");
			setToast(error instanceof Error ? error.message : "Import tuteurs impossible");
		} finally {
			setSaving(false);
		}
	}
	async function importTutorTrackingFile(file) {
		if (!file) return;
		try {
			const text = await file.text();
			setTutorTrackingCsv(text);
			await importTutorTrackingCsv(text, file.name);
		} catch {
			setToast("Fichier CSV illisible");
		}
	}
	function exportVisibleTutorTrackingCsv() {
		const csv = "﻿" + [[
			"Vue",
			"ID",
			"Nom",
			"Prénom",
			"Téléphone",
			"Email",
			"Ville souhaitée",
			"Arrivé le",
			"Dernière présence",
			"Statut comparaison",
			"Commentaire"
		], ...filteredTutorTracking.map((tutor) => [
			tutorTrackingView === "new" ? "Nouveau" : tutorTrackingView === "exited" ? "Sorti" : "Actuel",
			tutor.tutorId,
			tutor.lastName,
			tutor.firstName,
			tutor.phone,
			tutor.email,
			tutor.wantedCity,
			tutor.firstSeen,
			tutor.lastSeen,
			tutor.isCurrent ? "Présent à la date finale" : "Absent à la date finale",
			tutorTrackingCommentByKey.get(tutor.key) || ""
		])].map((row) => row.map(csvCell).join(";")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `tuteurs-affiches-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		link.click();
		URL.revokeObjectURL(url);
		setToast("Export CSV tuteurs téléchargé");
	}
	async function deleteTutorTrackingSnapshot(snapshotId) {
		const snapshot = tutorTracking.snapshots.find((item) => item.id === snapshotId);
		if (!snapshot || !window.confirm(`Placer « ${tutorTrackingImportLabel(snapshot)} » dans la corbeille ?`)) return;
		try {
			const response = await fetch(`/api/tutor-tracking?id=${encodeURIComponent(snapshotId)}`, { method: "DELETE" });
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Suppression impossible");
			const nextTracking = normalizeTutorTrackingData(data.tracking || {});
			setTutorTracking(nextTracking);
			const nextSnapshots = nextTracking.snapshots;
			setToast("Import tuteurs placé dans la corbeille");
			const nextSelectedId = nextSnapshots[0]?.id || "";
			setSelectedTutorTrackingSnapshotId(nextSelectedId);
			if (tutorTrackingCompareStartId === snapshotId) setTutorTrackingCompareStartId(nextSnapshots[1]?.id || nextSelectedId);
			if (tutorTrackingCompareEndId === snapshotId) setTutorTrackingCompareEndId(nextSelectedId);
		} catch (error) {
			setToast(error instanceof Error ? error.message : "Suppression impossible");
		}
	}
	async function updateTutorTrackingComment(tutorId, commentValue) {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const trimmedComment = commentValue.trim();
		const otherComments = tutorTracking.comments.filter((commentItem) => commentItem.tutorId !== tutorId);
		const nextComments = trimmedComment ? [...otherComments, {
			tutorId,
			comment: trimmedComment,
			updatedAt: now
		}] : otherComments;
		await saveTutorTracking({
			...tutorTracking,
			comments: nextComments
		}, "Commentaire tuteur sauvegardé");
	}
	async function importAvailabilityFile(file) {
		if (!file) return;
		setSaving(true);
		setSyncError("");
		try {
			const text = await file.text();
			const response = await fetch("/api/availability-imports", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fileName: file.name || "disponibilites.csv",
					rawCsv: text
				})
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "import-availability-failed");
			const previousNewestId = availabilityImports[0]?.id || "";
			const importedItem = data.import ? normalizeAvailabilityImport(data.import) : null;
			setAvailabilityImports((Array.isArray(data.imports) ? data.imports.map(normalizeAvailabilityImport).sort((a, b) => sortDateValue(b.importedAt) - sortDateValue(a.importedAt)) : importedItem ? [importedItem, ...availabilityImports] : availabilityImports).map((item) => ({
				...item,
				rows: [],
				rawCsv: ""
			})));
			if (importedItem) {
				setAvailabilityImportData((current) => ({
					...current,
					[importedItem.id]: importedItem
				}));
				setAvailabilityRecentId(importedItem.id);
				setAvailabilityReferenceId(previousNewestId || importedItem.id);
				setAvailabilityDate(bestAvailabilityDate(importedItem.rows) || availabilityDate);
			}
			setAvailabilityView("new");
			setToast("Import de disponibilités ajouté · sauvegardé sur Netlify");
		} catch (error) {
			console.error(error);
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Fichier CSV illisible");
		} finally {
			setSaving(false);
		}
	}
	async function importInterestFile(file) {
		if (!file) return;
		setSaving(true);
		setSyncError("");
		try {
			const rawCsv = await file.text();
			const response = await fetch(`/api/tutor-interest-imports?fileName=${encodeURIComponent(file.name)}`, {
				method: "POST",
				headers: { "Content-Type": "text/csv;charset=utf-8" },
				body: rawCsv
			});
			const data = await response.json();
			if (!response.ok || !data.import) throw new Error(data.detail || data.error || "import-interest-failed");
			const previousNewestId = interestImports[0]?.id || "";
			setInterestImports((current) => [{
				...data.import,
				rows: []
			}, ...current.filter((item) => item.id !== data.import.id)]);
			setInterestImportData((current) => ({
				...current,
				[data.import.id]: data.import
			}));
			setInterestRecentId(data.import.id);
			setInterestReferenceId(previousNewestId || data.import.id);
			setAvailabilityDate(bestAvailabilityDate(data.import.rows) || availabilityDate);
			setAvailabilityView("new");
			setToast("Import d’intérêts ajouté · sauvegardé sur Netlify");
		} catch (error) {
			setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
			setToast(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Fichier CSV illisible");
		} finally {
			setSaving(false);
		}
	}
	function toggleAvailabilitySource(source) {
		setAvailabilitySources((current) => current.includes(source) ? current.length > 1 ? current.filter((item) => item !== source) : current : [...current, source]);
	}
	function toggleAvailabilityStatus(status) {
		setAvailabilityStatuses((current) => current.includes(status) ? current.length > 1 ? current.filter((item) => item !== status) : current : [...current, status]);
	}
	async function saveAvailabilityExclusions(next, successMessage) {
		const previous = availabilityExclusions;
		const prepared = {
			...next,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		setAvailabilityExclusions(prepared);
		setSaving(true);
		try {
			const response = await fetch("/api/unstaffed-exclusions", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ exclusions: prepared })
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.detail || data.error || "Exclusion non sauvegardée");
			setAvailabilityExclusions(data.exclusions ?? prepared);
			setToast(successMessage);
		} catch (error) {
			setAvailabilityExclusions(previous);
			setToast(error instanceof Error ? error.message : "Exclusion non sauvegardée");
		} finally {
			setSaving(false);
		}
	}
	function hideAvailabilityOpportunitySource(tutorId, row, source) {
		const key = availabilitySourceKey({
			sessionId: row.sessionId,
			personId: tutorId,
			source,
			date: row.date,
			school: row.school,
			timeSlot: row.timeSlot
		});
		if (availabilityExclusions.sourceKeys.includes(key)) return;
		saveAvailabilityExclusions({
			...availabilityExclusions,
			sourceKeys: [...availabilityExclusions.sourceKeys, key]
		}, `${source === "interest" ? "Intérêt" : "Disponibilité"} masqué${source === "interest" ? "" : "e"} durablement`);
	}
	function restoreAvailabilityOpportunitySource(key) {
		saveAvailabilityExclusions({
			...availabilityExclusions,
			sourceKeys: availabilityExclusions.sourceKeys.filter((item) => item !== key)
		}, "Élément réaffiché");
	}
	function exportAvailabilityCategoryCsv() {
		const categoryLabel = availabilityView === "new" ? "Nouvelle disponibilité" : availabilityView === "lost" ? "Disponibilité perdue" : "Disponibilité inchangée";
		const csv = "﻿" + [[
			"Catégorie",
			"Date analysée",
			"ID",
			"Nom",
			"Prénom",
			"Téléphone",
			"Statut",
			"Grade",
			"Créneaux",
			"Établissements",
			"Classes",
			"Groupes",
			"IDs séances",
			"Sources",
			"Intérêts validés",
			"Nombre de créneaux"
		], ...displayedAvailabilityTutors.map((tutor) => [
			categoryLabel,
			effectiveAvailabilityDate,
			tutor.tutorId,
			tutor.lastName,
			tutor.firstName,
			tutor.phone,
			tutor.status === "tutor" ? "Tuteur" : tutor.status === "candidate" ? "Candidat" : "Statut inconnu",
			tutor.grade,
			tutor.rows.map((row) => row.timeSlot).filter(Boolean).join(" | "),
			tutor.rows.map((row) => row.school).filter(Boolean).join(" | "),
			tutor.rows.map((row) => row.className).filter(Boolean).join(" | "),
			tutor.rows.map((row) => row.group).filter(Boolean).join(" | "),
			tutor.rows.map((row) => row.sessionId).filter(Boolean).join(" | "),
			tutor.rows.map((row) => row.sources.map((source) => source === "availability" ? "Disponibilité" : "Intérêt").join(" + ")).join(" | "),
			tutor.rows.filter((row) => row.validatedInterest).map((row) => row.sessionId || `${row.timeSlot} — ${row.school}`).join(" | "),
			tutor.rows.length
		])].map((row) => row.map(csvCell).join(";")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `comparaison-disponibilites-${availabilityView}-${effectiveAvailabilityDate || "date"}.csv`;
		link.click();
		URL.revokeObjectURL(url);
		setToast("Export CSV téléchargé");
	}
	function openNewSchoolWatchItem(schoolId = "") {
		setEditingSchoolWatchId(null);
		setSchoolWatchDraft({
			...emptySchoolWatchDraft,
			schoolId,
			author: authorName.trim() || ""
		});
		setSchoolWatchOpen(true);
	}
	function openEditSchoolWatchItem(item) {
		setEditingSchoolWatchId(item.id);
		setSchoolWatchDraft({
			schoolId: item.schoolId,
			reason: item.reason,
			tags: item.tags,
			status: item.status,
			initialComment: "",
			author: authorName.trim() || item.comments[0]?.author || ""
		});
		setSchoolWatchOpen(true);
	}
	function toggleSchoolWatchTag(tag) {
		setSchoolWatchDraft((current) => ({
			...current,
			tags: current.tags.includes(tag) ? current.tags.filter((item) => item !== tag) : [...current.tags, tag]
		}));
	}
	async function saveSchoolWatchItem(event) {
		event.preventDefault();
		if (!schoolWatchDraft.schoolId || !schoolWatchDraft.reason.trim() || saving) return;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const author = schoolWatchDraft.author.trim() || authorName.trim() || "Equipe Alpha";
		if (author && author !== "Equipe Alpha") setAuthorName(author);
		if (editingSchoolWatchId) {
			const existingItem = schoolWatchlist.find((item) => item.id === editingSchoolWatchId);
			await saveSchoolWatchlist(schoolWatchlist.map((item) => item.id === editingSchoolWatchId ? {
				...existingItem ?? item,
				schoolId: schoolWatchDraft.schoolId,
				reason: schoolWatchDraft.reason.trim(),
				tags: schoolWatchDraft.tags,
				status: schoolWatchDraft.status,
				resolvedAt: schoolWatchDraft.status === "resolved" ? existingItem?.resolvedAt || now : "",
				updatedAt: now
			} : item), "Suivi mis à jour");
		} else {
			const initialComment = schoolWatchDraft.initialComment.trim() ? [{
				id: uid("watch-comment"),
				text: schoolWatchDraft.initialComment.trim(),
				author,
				createdAt: now
			}] : [];
			const newItem = {
				id: uid("watch"),
				schoolId: schoolWatchDraft.schoolId,
				reason: schoolWatchDraft.reason.trim(),
				tags: schoolWatchDraft.tags,
				status: "active",
				comments: initialComment,
				createdAt: now,
				updatedAt: now,
				resolvedAt: ""
			};
			await saveSchoolWatchlist([newItem, ...schoolWatchlist], "Établissement ajouté au suivi");
			setSelectedSchoolWatchId(newItem.id);
		}
		setSchoolWatchOpen(false);
	}
	async function addSchoolWatchComment(itemId) {
		const text = schoolWatchComment.trim();
		if (!text || saving) return;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const author = authorName.trim() || "Equipe Alpha";
		await saveSchoolWatchlist(schoolWatchlist.map((item) => item.id === itemId ? {
			...item,
			comments: [{
				id: uid("watch-comment"),
				text,
				author,
				createdAt: now
			}, ...item.comments],
			updatedAt: now
		} : item), "Commentaire ajouté");
		setSchoolWatchComment("");
	}
	async function toggleSchoolWatchStatus(item) {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const nextStatus = item.status === "active" ? "resolved" : "active";
		await saveSchoolWatchlist(schoolWatchlist.map((watchItem) => watchItem.id === item.id ? {
			...watchItem,
			status: nextStatus,
			resolvedAt: nextStatus === "resolved" ? now : "",
			updatedAt: now
		} : watchItem), nextStatus === "resolved" ? "Suivi marqué résolu" : "Suivi réactivé");
	}
	async function deleteSchoolWatchItem(itemId) {
		if (!window.confirm("Supprimer ce suivi d'établissement ?")) return;
		await saveSchoolWatchlist(schoolWatchlist.filter((item) => item.id !== itemId), "Suivi supprimé");
		if (selectedSchoolWatchId === itemId) setSelectedSchoolWatchId(null);
	}
	function openNewSchool() {
		setEditingSchoolId(null);
		setSchoolDraft(emptySchoolDraft);
		setSchoolOpen(true);
	}
	function openEditSchool(school) {
		setEditingSchoolId(school.id);
		setSchoolDraft({
			externalId: school.externalId,
			name: school.name,
			category: school.category,
			schoolType: school.schoolType,
			portfolioOwner: school.portfolioOwner,
			zone: school.zone,
			coordinator: school.coordinator,
			registeredCount: school.registeredCount,
			city: school.city,
			address: school.address,
			department: school.department,
			upcomingWeek: school.upcomingWeek,
			pastSessions: school.pastSessions,
			typicalWeek: school.typicalWeek,
			contractSigned: school.contractSigned,
			actions: school.actions,
			contact: school.contact,
			nextAction: school.nextAction,
			notes: school.notes
		});
		setSchoolOpen(true);
	}
	async function saveSchool(event) {
		event.preventDefault();
		if (!schoolDraft.name.trim() || saving) return;
		const requestedExternalId = schoolDraft.externalId.trim();
		const schoolUsingId = requestedExternalId ? schools.find((school) => school.externalId === requestedExternalId && school.id !== editingSchoolId) : null;
		if (schoolUsingId) {
			setToast(`L’ID établissement ${requestedExternalId} est déjà utilisé par ${schoolUsingId.name}`);
			return;
		}
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const cleanDraft = {
			...schoolDraft,
			externalId: requestedExternalId,
			name: schoolDraft.name.trim(),
			category: schoolDraft.category.trim(),
			zone: schoolDraft.zone.trim(),
			coordinator: schoolDraft.coordinator.trim(),
			registeredCount: normalizePositiveNumber(schoolDraft.registeredCount, true),
			city: schoolDraft.city.trim(),
			address: schoolDraft.address.trim(),
			department: schoolDraft.department.trim(),
			upcomingWeek: schoolDraft.upcomingWeek.trim(),
			pastSessions: schoolDraft.pastSessions.trim(),
			typicalWeek: schoolDraft.typicalWeek.trim(),
			contractSigned: schoolDraft.contractSigned.trim(),
			actions: schoolDraft.actions.trim(),
			contact: schoolDraft.contact.trim(),
			nextAction: schoolDraft.nextAction.trim(),
			notes: schoolDraft.notes.trim(),
			updatedAt: now
		};
		if (editingSchoolId) await saveSchools(schools.map((school) => school.id === editingSchoolId ? {
			...school,
			...cleanDraft,
			id: editingSchoolId,
			createdAt: school.createdAt
		} : school), "Établissement mis à jour");
		else await saveSchools([{
			...cleanDraft,
			id: uid("school"),
			events: [],
			createdAt: now
		}, ...schools], "Établissement ajouté");
		setSchoolOpen(false);
	}
	async function deleteSchool(schoolId) {
		if (!window.confirm("Supprimer cet établissement et tout son historique ?")) return;
		await saveSchools(schools.filter((school) => school.id !== schoolId), "Établissement supprimé");
	}
	function openSchoolEvent(schoolId) {
		setEventSchoolId(schoolId ?? null);
		setSchoolEventDraft({
			...emptySchoolEventDraft,
			author: authorName.trim() || "",
			date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		});
		setSchoolEventOpen(true);
	}
	function toggleSchoolEventTag(tag) {
		setSchoolEventDraft((current) => ({
			...current,
			tags: current.tags.includes(tag) ? current.tags.filter((item) => item !== tag) : [...current.tags, tag]
		}));
	}
	async function saveSchoolEvent(event) {
		event.preventDefault();
		if (!eventSchoolId || !schoolEventDraft.title.trim() && !schoolEventDraft.note.trim() || saving) return;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const cleanEvent = {
			id: uid("school-event"),
			kind: schoolEventDraft.kind,
			title: schoolEventDraft.title.trim(),
			note: schoolEventDraft.note.trim(),
			author: schoolEventDraft.author.trim() || authorName.trim() || "Equipe Alpha",
			tags: normalizeTags(schoolEventDraft.tags),
			likes: [],
			comments: [],
			date: schoolEventDraft.date ? (/* @__PURE__ */ new Date(`${schoolEventDraft.date}T12:00:00`)).toISOString() : now,
			createdAt: now
		};
		if (cleanEvent.author && cleanEvent.author !== "Equipe Alpha") setAuthorName(cleanEvent.author);
		await saveSchools(schools.map((school) => school.id === eventSchoolId ? {
			...school,
			events: [cleanEvent, ...school.events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
			updatedAt: now
		} : school), "Historique établissement mis à jour");
		setSchoolEventOpen(false);
		setEventSchoolId(null);
	}
	async function likeSchoolEvent(schoolId, eventId) {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const author = authorName.trim() || "Anonyme";
		await saveSchools(schools.map((school) => school.id === schoolId ? {
			...school,
			events: school.events.map((event) => event.id === eventId ? {
				...event,
				likes: [...event.likes, {
					id: uid("like"),
					author,
					createdAt: now
				}]
			} : event),
			updatedAt: now
		} : school), "Like CRM ajouté");
	}
	async function addSchoolEventComment(schoolId, eventId, formEvent) {
		formEvent.preventDefault();
		const form = formEvent.currentTarget;
		const data = new FormData(form);
		const author = String(data.get("author") || "").trim() || authorName.trim() || "Anonyme";
		const text = String(data.get("comment") || "").trim();
		if (!text) return;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		if (author !== "Anonyme") setAuthorName(author);
		await saveSchools(schools.map((school) => school.id === schoolId ? {
			...school,
			events: school.events.map((event) => event.id === eventId ? {
				...event,
				comments: [...event.comments, {
					id: uid("social-comment"),
					author,
					text,
					createdAt: now
				}]
			} : event),
			updatedAt: now
		} : school), "Commentaire CRM ajouté");
		form.reset();
	}
	function openNewQualitativeObjective() {
		setEditingObjectiveId(null);
		setObjectiveDraft(emptyQualitativeObjectiveDraft);
		setObjectiveOpen(true);
	}
	function openObjective(objective) {
		setEditingObjectiveId(objective?.id ?? null);
		setObjectiveDraft(objective ? {
			kind: objective.kind,
			title: objective.title,
			description: objective.description,
			targetLabel: objective.targetLabel,
			currentValue: objective.currentValue,
			targetValue: objective.targetValue,
			startDate: objective.startDate,
			endDate: objective.endDate,
			status: objective.status,
			progressNote: objective.progressNote,
			personIds: objective.personIds
		} : emptyObjectiveDraft);
		setObjectiveOpen(true);
	}
	function toggleObjectivePerson(personId, checked) {
		setObjectiveDraft((current) => ({
			...current,
			personIds: checked ? [...current.personIds, personId] : current.personIds.filter((id) => id !== personId)
		}));
	}
	async function saveObjective(event) {
		event.preventDefault();
		const currentValue = normalizePositiveNumber(objectiveDraft.currentValue, true) ?? 0;
		const targetValue = normalizePositiveNumber(objectiveDraft.targetValue, false);
		if (!objectiveDraft.title.trim() || objectiveDraft.kind === "counter" && !targetValue || saving) return;
		const cleanDraft = {
			...objectiveDraft,
			title: objectiveDraft.title.trim(),
			description: objectiveDraft.description.trim(),
			targetLabel: objectiveDraft.kind === "counter" ? objectiveDraft.targetLabel.trim() || "éléments" : "",
			currentValue: objectiveDraft.kind === "counter" ? currentValue : null,
			targetValue: objectiveDraft.kind === "counter" ? targetValue : null,
			startDate: objectiveDraft.startDate,
			endDate: objectiveDraft.endDate && objectiveDraft.startDate && objectiveDraft.endDate < objectiveDraft.startDate ? objectiveDraft.startDate : objectiveDraft.endDate,
			progressNote: objectiveDraft.progressNote.trim(),
			personIds: Array.from(new Set(objectiveDraft.personIds))
		};
		if (editingObjectiveId) {
			const existingObjective = objectives.find((objective) => objective.id === editingObjectiveId);
			const updatedObjective = {
				...existingObjective ?? {
					id: editingObjectiveId,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				},
				...cleanDraft
			};
			await saveObjectives(existingObjective ? objectives.map((objective) => objective.id === editingObjectiveId ? updatedObjective : objective) : [updatedObjective, ...objectives], "Objectif mis a jour");
		} else await saveObjectives([{
			...cleanDraft,
			id: uid("objective"),
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		}, ...objectives], "Objectif ajoute");
		setObjectiveOpen(false);
	}
	async function deleteObjective(objectiveId) {
		if (!window.confirm("Supprimer cet objectif ?")) return;
		await saveObjectives(objectives.filter((objective) => objective.id !== objectiveId), "Objectif supprime");
	}
	async function addStudentHistoryYear() {
		const typedYear = window.prompt("Quelle annee ajouter ?", String((/* @__PURE__ */ new Date()).getFullYear()));
		if (!typedYear) return;
		const year = Number(typedYear.trim());
		if (!Number.isInteger(year) || year < 2e3 || year > 2100) {
			setToast("Annee invalide");
			return;
		}
		if (studentHistory.some((item) => item.year === year)) {
			setActiveHistoryYear(year);
			setSelectedHistoryYears((current) => current.includes(year) ? current : [...current, year]);
			setToast("Cette annee existe deja");
			return;
		}
		const nextYear = normalizeStudentHistoryYear({
			year,
			entries: campaignDates(year).map((date) => ({
				date,
				value: null
			})),
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		});
		setActiveHistoryYear(year);
		setSelectedHistoryYears((current) => [...new Set([...current, year])]);
		await saveStudentHistory([nextYear, ...studentHistory], "Annee ajoutee");
	}
	async function updateStudentHistoryValue(year, date, typedValue) {
		const value = typedValue.trim() === "" ? null : normalizePositiveNumber(typedValue, true);
		if (typedValue.trim() !== "" && value === null) {
			setToast("Nombre d'eleves invalide");
			return;
		}
		await saveStudentHistory(studentHistory.map((historyYear) => historyYear.year === year ? {
			...historyYear,
			entries: historyYear.entries.map((entry) => entry.date === date ? {
				...entry,
				value
			} : entry)
		} : historyYear), "Historique mis a jour");
	}
	function toggleHistoryYear(year, checked) {
		setSelectedHistoryYears((current) => checked ? [...new Set([...current, year])] : current.filter((item) => item !== year));
	}
	async function copyCurrentTabLink() {
		const url = new URL(window.location.href);
		url.searchParams.set("onglet", appModeSlugs[appMode]);
		const link = `${url.origin}${url.pathname}?${url.searchParams.toString()}${url.hash}`;
		try {
			await navigator.clipboard.writeText(link);
			setToast("Lien de l'onglet copié");
		} catch {
			window.prompt("Copiez ce lien", link);
		}
	}
	async function saveTask(event) {
		event.preventDefault();
		if (!draft.title.trim() || !draft.owner.trim() || !draft.startDate || saving) return;
		const cleanDraft = {
			...draft,
			title: draft.title.trim(),
			description: draft.description.trim(),
			owner: draft.owner.trim(),
			verificationOwner: draft.verificationOwner.trim(),
			verificationComment: draft.verificationComment.trim(),
			estimatedHours: typeof draft.estimatedHours === "number" && Number.isFinite(draft.estimatedHours) && draft.estimatedHours > 0 ? draft.estimatedHours : null,
			endDate: draft.endDate && draft.endDate < draft.startDate ? draft.startDate : draft.endDate
		};
		const shouldSendAssignmentEmail = Boolean(sendAssignmentEmail && draftAssignee?.hasEmail && assignmentChanged);
		if (editingId) await saveSharedTasks(tasks.map((task) => task.id === editingId ? {
			...task,
			...cleanDraft
		} : task), "Tache mise a jour", shouldSendAssignmentEmail);
		else await saveSharedTasks([{
			...cleanDraft,
			id: uid("task"),
			comments: [],
			completionNotifications: [],
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		}, ...tasks], "Tache ajoutee", shouldSendAssignmentEmail);
		setEditorOpen(false);
	}
	async function changeStatus(taskId, status) {
		await saveSharedTasks(tasks.map((task) => task.id === taskId ? {
			...task,
			status
		} : task), `Statut : ${statusLabels[status]}`, false);
	}
	async function addComment(event) {
		event.preventDefault();
		const author = authorName.trim();
		if (!selectedId || !comment.trim() || !author || saving) return;
		const newComment = {
			id: uid("comment"),
			text: comment.trim(),
			author,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		await saveSharedTasks(tasks.map((task) => task.id === selectedId ? {
			...task,
			comments: [newComment, ...task.comments]
		} : task), "Commentaire ajoute", false);
		setComment("");
	}
	async function deleteTask(taskId) {
		if (!window.confirm("Supprimer cette tache ?")) return;
		await saveSharedTasks(tasks.filter((task) => task.id !== taskId), "Tache supprimee", false);
		setSelectedId(null);
	}
	function openPerson(person) {
		setPersonDraft(person ? {
			id: person.id,
			name: person.name,
			email: "",
			active: person.active
		} : emptyPersonDraft);
		setPeopleOpen(true);
	}
	async function savePerson(event) {
		event.preventDefault();
		if (!personDraft.name.trim()) return;
		const nextPerson = {
			...personDraft,
			id: personDraft.id || uid("person"),
			name: personDraft.name.trim(),
			email: personDraft.email.trim()
		};
		await savePeople([...people.filter((person) => person.id !== nextPerson.id).map((person) => ({
			...person,
			email: ""
		})), nextPerson], "Personne sauvegardee");
		setPersonDraft(emptyPersonDraft);
	}
	function openCompletionNotice(task) {
		setNotifyTaskId(task.id);
		setNotifyRecipients([]);
		setNotifyOpen(true);
	}
	async function sendCompletionNotice(event) {
		event.preventDefault();
		if (!notifyTask || !notifyRecipients.length) return;
		setNotifying(true);
		try {
			const response = await fetch(`/api/tasks/${notifyTask.id}/notify-completion`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ personIds: notifyRecipients })
			});
			if (!response.ok) throw new Error("notify-failed");
			const data = await response.json();
			if (Array.isArray(data.tasks)) setTasks(data.tasks.map(normalizeTask));
			setToast(`${data.sent || 0} email(s) envoye(s)`);
			setNotifyOpen(false);
			setNotifyRecipients([]);
		} catch {
			setToast("Notification impossible");
		} finally {
			setNotifying(false);
		}
	}
	function exportTasks() {
		const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `taches-partagees-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
		link.click();
		URL.revokeObjectURL(url);
		setToast("Sauvegarde telechargee");
	}
	async function importTasks(file) {
		if (!file) return;
		try {
			const imported = JSON.parse(await file.text());
			if (!Array.isArray(imported)) throw new Error("invalid");
			if (!window.confirm("Remplacer toutes les taches partagees par ce fichier ?")) return;
			await saveSharedTasks(imported.map(normalizeTask), "Taches importees", false);
		} catch {
			setToast("Ce fichier n'est pas valide");
		} finally {
			if (importRef.current) importRef.current.value = "";
		}
	}
	function studentHistoryPath(historyYear) {
		let carried = 0;
		return chartDays.map((dayKey, index) => {
			const entry = historyYear.entries.find((item) => campaignDayKey(item.date) === dayKey);
			if (entry?.value !== null && entry?.value !== void 0) carried = entry.value;
			const x = chartDays.length <= 1 ? 0 : index / (chartDays.length - 1) * 1e3;
			const y = 180 - carried / maxStudentHistoryValue * 150;
			return `${x.toFixed(2)},${y.toFixed(2)}`;
		}).join(" ");
	}
	function miniStudentHistoryPath() {
		const historyYear = activeHistory ?? chartYears[0] ?? studentHistory[0];
		if (!historyYear) return "";
		let carried = 0;
		const maxValue = Math.max(1, ...historyYear.entries.map((entry) => entry.value ?? 0));
		return historyYear.entries.map((entry, index) => {
			if (entry.value !== null) carried = entry.value;
			const x = historyYear.entries.length <= 1 ? 0 : index / (historyYear.entries.length - 1) * 100;
			const y = 42 - carried / maxValue * 34;
			return `${x.toFixed(2)},${y.toFixed(2)}`;
		}).join(" ");
	}
	function latestStudentHistoryValue() {
		const historyYear = activeHistory ?? chartYears[0] ?? studentHistory[0];
		if (!historyYear) return null;
		return historyYear.entries.reduce((latest, entry) => entry.value ?? latest, null);
	}
	function renderAvailabilityComparisonSection() {
		const importLabel = (item) => `${item.displayName} · ${formatJournalDate(item.importedAt)}`;
		const comparisonReady = (!availabilitySources.includes("availability") || Boolean(selectedAvailabilityReference && selectedAvailabilityRecent)) && (!availabilitySources.includes("interest") || Boolean(selectedInterestReference && selectedInterestRecent));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "task-panel availability-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Comparaison des disponibilités et des intérêts"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Repérer les nouvelles personnes mobilisables" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "panel-intro",
							children: "Comparez deux versions par personne et pour une date précise, en réunissant les disponibilités et les demandes d’intérêt sélectionnées."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "ghost-button",
						onClick: () => {
							loadAvailabilityImports();
							loadLatestAvailabilityStaffing();
							loadSchools();
							loadTutorTracking();
						},
						children: "↻ Actualiser"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "availability-import-box availability-dual-import",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Ajouter des données à comparer" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Les fichiers sont conservés et administrables dans l’onglet Fichiers." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "import-button",
							children: ["Importer des disponibilités", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: ".csv,text/csv,.txt",
								onChange: (event) => {
									importAvailabilityFile(event.target.files?.[0]);
									event.currentTarget.value = "";
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "import-button interest",
							children: ["Importer des intérêts", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: ".csv,text/csv,.txt",
								onChange: (event) => {
									importInterestFile(event.target.files?.[0]);
									event.currentTarget.value = "";
								}
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "availability-compare-grid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Date à analyser", availabilityDates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: effectiveAvailabilityDate,
							onChange: (event) => setAvailabilityDate(event.target.value),
							children: availabilityDates.map((date) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: date,
								children: formatFullDate(date)
							}, date))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: availabilityDate,
							onChange: (event) => setAvailabilityDate(event.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: !availabilitySources.includes("availability") ? "disabled" : "",
							children: ["Disponibilités · référence", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: availabilityReferenceId,
								onChange: (event) => setAvailabilityReferenceId(event.target.value),
								disabled: !availabilitySources.includes("availability"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Sélectionner"
								}), availabilityImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.id,
									children: importLabel(item)
								}, item.id))]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: !availabilitySources.includes("interest") ? "disabled" : "",
							children: ["Intérêts · référence", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: interestReferenceId,
								onChange: (event) => setInterestReferenceId(event.target.value),
								disabled: !availabilitySources.includes("interest"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Sélectionner"
								}), interestImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.id,
									children: importLabel(item)
								}, item.id))]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: !availabilitySources.includes("availability") ? "disabled" : "",
							children: ["Disponibilités · récent", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: availabilityRecentId,
								onChange: (event) => setAvailabilityRecentId(event.target.value),
								disabled: !availabilitySources.includes("availability"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Sélectionner"
								}), availabilityImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.id,
									children: importLabel(item)
								}, item.id))]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: !availabilitySources.includes("interest") ? "disabled" : "",
							children: ["Intérêts · récent", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: interestRecentId,
								onChange: (event) => setInterestRecentId(event.target.value),
								disabled: !availabilitySources.includes("interest"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Sélectionner"
								}), interestImports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.id,
									children: importLabel(item)
								}, item.id))]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "availability-filter-bar",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Sources" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: availabilitySources.includes("availability") ? "active" : "",
							onClick: () => toggleAvailabilitySource("availability"),
							children: "Disponibilités"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: availabilitySources.includes("interest") ? "active" : "",
							onClick: () => toggleAvailabilitySource("interest"),
							children: "Intérêts"
						})] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Personnes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: availabilityStatuses.includes("tutor") ? "active" : "",
							onClick: () => toggleAvailabilityStatus("tutor"),
							children: "Tuteurs"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: availabilityStatuses.includes("candidate") ? "active" : "",
							onClick: () => toggleAvailabilityStatus("candidate"),
							children: "Candidats"
						})] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "availability-owner-buttons",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Responsable RH" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: [
								"all",
								"kelly",
								"pierre",
								"julie",
								"unassigned"
							].map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: availabilitySchoolOwnerFilter === owner ? "active" : "",
								onClick: () => setAvailabilitySchoolOwnerFilter(owner),
								children: owner === "all" ? "Tous" : owner === "unassigned" ? "Non attribués" : schoolPortfolioOwnerLabels[owner]
							}, owner)) })]
						}),
						availabilityExclusions.sourceKeys.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: showAvailabilityHidden ? "active hidden-toggle" : "hidden-toggle",
							onClick: () => setShowAvailabilityHidden((current) => !current),
							children: [
								"Éléments masqués (",
								availabilityExclusions.sourceKeys.length,
								")"
							]
						}) : null
					]
				}),
				!latestTutorTrackingSnapshot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "availability-status-warning",
					children: "Aucune liste de tuteurs disponible : le statut tuteur/candidat ne peut pas être déterminé."
				}) : null,
				showAvailabilityHidden && availabilityHiddenItems.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "availability-hidden-list",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Disponibilités et intérêts masqués" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ces exclusions s’appliquent aussi aux séances non affectées et aux prochains imports." })] }), availabilityHiddenItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
						item.source === "interest" ? "Intérêt" : "Disponibilité",
						" · ",
						item.name
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
						item.date ? `${formatFullDate(item.date)} · ` : "",
						item.timeSlot || "Horaire inconnu",
						item.school ? ` · ${item.school}` : "",
						item.sessionId ? ` · séance #${item.sessionId}` : ""
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => restoreAvailabilityOpportunitySource(item.key),
						disabled: saving,
						children: "Réafficher"
					})] }, item.key))]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "availability-daily-summary",
					"aria-label": "Personnes mobilisables par jour dans les fichiers récents",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "availability-daily-summary-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Personnes mobilisables par jour" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: [availabilitySources.includes("availability") ? selectedAvailabilityRecent?.displayName : "", availabilitySources.includes("interest") ? selectedInterestRecent?.displayName : ""].filter(Boolean).join(" + ") || "Aucun fichier récent sélectionné" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "availability-daily-counts",
						children: recentAvailabilityDailyCounts.length ? recentAvailabilityDailyCounts.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: effectiveAvailabilityDate === item.date ? "active" : "",
							onClick: () => setAvailabilityDate(item.date),
							title: `Analyser les personnes mobilisables du ${formatFullDate(item.date)}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(item.date) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.count }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["personne", item.count > 1 ? "s" : ""] })
							]
						}, item.date)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "availability-daily-empty",
							children: "Aucune date disponible dans ce fichier."
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "availability-tabs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: availabilityView === "new" ? "active" : "",
							onClick: () => setAvailabilityView("new"),
							children: [
								"✨ Nouvelles (",
								availabilityComparison.newTutors.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: availabilityView === "lost" ? "active" : "",
							onClick: () => setAvailabilityView("lost"),
							children: [
								"↘ Perdues (",
								availabilityComparison.lostTutors.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: availabilityView === "same" ? "active" : "",
							onClick: () => setAvailabilityView("same"),
							children: [
								"= Inchangées (",
								availabilityComparison.sameTutors.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ghost-button",
							onClick: exportAvailabilityCategoryCsv,
							disabled: !displayedAvailabilityTutors.length,
							children: "Export CSV"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "availability-staffing-source",
					children: latestAvailabilityStaffingImport ? `Séances déjà prévues vérifiées avec « ${latestAvailabilityStaffingImport.displayName} » (${formatJournalDate(latestAvailabilityStaffingImport.importedAt)}).` : "Aucun fichier de staffing disponible pour vérifier les séances déjà prévues."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `availability-results ${availabilityView === "new" ? "is-new" : ""}`,
					children: !comparisonReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "empty-state compact",
						children: "Choisissez un fichier de référence et un fichier récent pour chaque source active."
					}) : displayedAvailabilityTutors.length ? displayedAvailabilityTutors.map((tutor) => {
						const assignedSessions = availabilityStaffingByTutorId.get(tutor.tutorId) ?? [];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "availability-card",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "availability-card-header",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAdminLink, {
										personId: tutor.tutorId,
										status: tutor.status,
										children: availabilityTutorName(tutor)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `person-status ${tutor.status}`,
										children: tutor.status === "tutor" ? "Tuteur" : tutor.status === "candidate" ? "Candidat" : "Statut inconnu"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										"ID ",
										tutor.tutorId,
										" · ",
										tutor.phone || "téléphone non renseigné",
										tutor.grade ? ` · ${tutor.grade}` : ""
									] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										tutor.rows.length,
										" créneau",
										tutor.rows.length > 1 ? "x" : ""
									] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `availability-staffing-status ${assignedSessions.length ? "has-assignment" : "is-free"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: assignedSessions.length ? `${assignedSessions.length} séance${assignedSessions.length > 1 ? "s" : ""} déjà prévue${assignedSessions.length > 1 ? "s" : ""} ce jour` : "Aucune séance prévue ce jour" }), assignedSessions.map((session, index) => {
										const staffingSchool = availabilitySchoolByName.get(normalizedSchoolLookupName(session.school));
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											session.timeSlot || "Horaire non renseigné",
											" · ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
												schoolId: staffingSchool?.externalId,
												children: session.school || "Établissement non renseigné"
											})
										] }, `${session.timeSlot}-${session.school}-${index}`);
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "availability-slots",
									children: tutor.rows.map((row, index) => {
										const availabilitySchool = availabilitySchoolByName.get(normalizedSchoolLookupName(row.school));
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.timeSlot || "Horaire non renseigné" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
													schoolId: availabilitySchool?.externalId,
													children: row.school || "Établissement non renseigné"
												}),
												" · ",
												row.className || "classe n/a",
												" · ",
												row.group || "groupe n/a"
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "availability-row-sources",
												children: [row.sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", {
													className: source,
													children: [
														source === "availability" ? "Disponibilité" : "Intérêt",
														source === "interest" && row.validatedInterest ? " validé" : "",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															onClick: () => hideAvailabilityOpportunitySource(tutor.tutorId, row, source),
															disabled: saving,
															title: `Masquer ${source === "availability" ? "cette disponibilité" : "cet intérêt"}`,
															children: "×"
														})
													]
												}, source)), row.sessionId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["Séance ", row.sessionId] }) : null]
											})
										] }, `${row.sessionId || row.timeSlot}-${index}`);
									})
								})
							]
						}, tutor.tutorId);
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "empty-state compact",
						children: "Aucune personne dans cette catégorie pour la date choisie."
					})
				})
			]
		});
	}
	function renderTutorActivityGroup(title, items, tone) {
		const visibleItems = items.slice(0, 4);
		const remainingItems = items.slice(4);
		const renderItem = (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [formatDate(item.date), item.timeSlot ? ` · ${item.timeSlot}` : ""] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.school || "Établissement non renseigné" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: [
				item.category,
				item.sessionId ? `#${item.sessionId}` : "",
				item.validated === true ? "Intérêt validé" : ""
			].filter(Boolean).join(" · ") })
		] }, item.key);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: `tutor-activity-group ${tone}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", { children: [
				title,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: items.length })
			] }), items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: visibleItems.map(renderItem) }), remainingItems.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [
				"Voir ",
				remainingItems.length,
				" autre",
				remainingItems.length > 1 ? "s" : ""
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: remainingItems.map(renderItem) })] }) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aucune donnée connue" })]
		});
	}
	function renderTutorTrackingSection() {
		const latestLabel = latestTutorTrackingSnapshot ? tutorTrackingImportLabel(latestTutorTrackingSnapshot) : "aucun import";
		const activeSnapshot = tutorTrackingSnapshotById.get(selectedTutorTrackingSnapshotId) ?? tutorTracking.snapshots[0] ?? null;
		const comparisonStartLabel = tutorTrackingComparison.startSnapshot ? tutorTrackingImportLabel(tutorTrackingComparison.startSnapshot) : "import de départ manquant";
		const comparisonEndLabel = tutorTrackingComparison.endSnapshot ? tutorTrackingImportLabel(tutorTrackingComparison.endSnapshot) : "import d’arrivée manquant";
		const viewLabel = tutorTrackingView === "new" ? "Nouveaux tuteurs" : tutorTrackingView === "exited" ? "Tuteurs sortis" : "Tuteurs présents à la date finale";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "task-panel tutor-tracking-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Suivi des tuteurs" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Importez régulièrement un CSV pour voir les nouveaux tuteurs, les sorties et annoter les suivis." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "filters",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button quiet",
							onClick: () => {
								loadTutorTracking();
							},
							disabled: saving,
							children: "↻ Actualiser"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tutor-tracking-hero",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "history-badge",
							children: "Suivi"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: ["Dernière liste : ", latestLabel] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							tutorTracking.snapshots.length,
							" import",
							tutorTracking.snapshots.length > 1 ? "s" : "",
							" enregistré",
							tutorTracking.snapshots.length > 1 ? "s" : "",
							" · comparaison ",
							comparisonStartLabel,
							" → ",
							comparisonEndLabel
						] })
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "tutor-tracking-metrics",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "À la date finale" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: tutorTrackingCounts.current })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nouveaux" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: tutorTrackingCounts.newSince })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sortis" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: tutorTrackingCounts.exitedSince })] })
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tutor-tracking-controls",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Comparer l’import" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: effectiveTutorTrackingCompareStartId,
							onChange: (event) => setTutorTrackingCompareStartId(event.target.value),
							disabled: !tutorTracking.snapshots.length,
							children: [!tutorTracking.snapshots.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Aucun import"
							}), tutorTracking.snapshots.map((snapshot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: snapshot.id,
								children: tutorTrackingImportLabel(snapshot)
							}, snapshot.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Avec l’import" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: effectiveTutorTrackingCompareEndId,
							onChange: (event) => setTutorTrackingCompareEndId(event.target.value),
							disabled: !tutorTracking.snapshots.length,
							children: [!tutorTracking.snapshots.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Aucun import"
							}), tutorTracking.snapshots.map((snapshot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: snapshot.id,
								children: tutorTrackingImportLabel(snapshot)
							}, snapshot.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date liée à l’import" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: tutorTrackingDate,
							onChange: (event) => setTutorTrackingDate(event.target.value)
						})] }),
						tutorTracking.snapshots.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Imports enregistrés" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: activeSnapshot?.id || "",
							onChange: (event) => setSelectedTutorTrackingSnapshotId(event.target.value),
							children: tutorTracking.snapshots.map((snapshot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: snapshot.id,
								children: tutorTrackingImportLabel(snapshot)
							}, snapshot.id))
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tutor-tracking-import",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Importer un CSV de tuteurs" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Choisissez d’abord la date liée à l’import. Le fichier est sauvegardé immédiatement et devient visible dans l’onglet Fichiers." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tutor-tracking-file-row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: ".csv,text/csv,.txt",
									onChange: (event) => {
										importTutorTrackingFile(event.target.files?.[0]);
										event.currentTarget.value = "";
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button primary",
									onClick: () => {
										importTutorTrackingCsv();
									},
									disabled: saving || !tutorTrackingDate || !tutorTrackingCsv.trim(),
									children: "Sauvegarder le contenu collé"
								}),
								activeSnapshot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button quiet danger-text",
									onClick: () => {
										deleteTutorTrackingSnapshot(activeSnapshot.id);
									},
									disabled: saving,
									children: "Supprimer cet import"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: tutorTrackingCsv,
							onChange: (event) => setTutorTrackingCsv(event.target.value),
							placeholder: "Ou collez ici le contenu CSV, puis cliquez sur « Sauvegarder le contenu collé »…",
							"aria-label": "CSV des tuteurs"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tutor-tracking-tabs",
					role: "group",
					"aria-label": "Filtrer le suivi tuteurs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: tutorTrackingView === "new" ? "active" : "",
							onClick: () => setTutorTrackingView("new"),
							children: ["Nouveaux ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tutorTrackingCounts.newSince })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: tutorTrackingView === "exited" ? "active" : "",
							onClick: () => setTutorTrackingView("exited"),
							children: ["Sortis ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tutorTrackingCounts.exitedSince })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: tutorTrackingView === "current" ? "active" : "",
							onClick: () => setTutorTrackingView("current"),
							children: ["Actuels ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tutorTrackingCounts.current })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading tutor-tracking-list-heading",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: viewLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							filteredTutorTracking.length,
							" tuteur",
							filteredTutorTracking.length > 1 ? "s" : "",
							" affiché",
							filteredTutorTracking.length > 1 ? "s" : ""
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "search-box",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								children: "⌕"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: tutorTrackingQuery,
								onChange: (event) => setTutorTrackingQuery(event.target.value),
								placeholder: "Rechercher nom, ID, téléphone, email, ville..."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button quiet",
							onClick: exportVisibleTutorTrackingCsv,
							disabled: !filteredTutorTracking.length,
							type: "button",
							children: "Export CSV"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "tutor-tracking-list",
					children: filteredTutorTracking.length ? filteredTutorTracking.map((tutor) => {
						const activity = tutorActivityById[tutor.tutorId];
						const activityLoading = tutorActivityLoadingIds.includes(tutor.tutorId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: `tutor-tracking-card ${tutor.isCurrent ? "is-current" : "is-exited"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "tutor-tracking-identity",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAdminLink, {
											personId: tutor.tutorId,
											status: "tutor",
											children: tutorTrackingDisplayName(tutor)
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: tutor.wantedCity || "Ville souhaitée non renseignée" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "tutor-tracking-meta",
											children: [
												tutor.tutorId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["ID ", tutor.tutorId] }),
												tutor.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tutor.phone }),
												tutor.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tutor.email }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Arrivé : ", formatDate(tutor.firstSeen)] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tutor.isCurrent ? "Présent à la date finale" : `Absent à la date finale · vu le ${formatDate(tutor.lastSeen)}` })
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									defaultValue: tutorTrackingCommentByKey.get(tutor.key) || "",
									placeholder: "Commentaire de suivi...",
									onBlur: (event) => {
										if (event.target.value.trim() !== (tutorTrackingCommentByKey.get(tutor.key) || "")) updateTutorTrackingComment(tutor.tutorId, event.target.value);
									},
									"aria-label": `Commentaire pour ${tutorTrackingDisplayName(tutor)}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "tutor-activity",
									children: !tutorTrackingQuery.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "tutor-activity-prompt",
										children: "Recherchez un nom, un ID ou une coordonnée pour charger les activités détaillées."
									}) : !tutor.tutorId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "tutor-activity-prompt",
										children: "Activités indisponibles : aucun ID tuteur n’est renseigné."
									}) : activityLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "tutor-activity-prompt",
										children: "Chargement des activités…"
									}) : !activity && tutorActivityError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "tutor-activity-prompt error",
										children: tutorActivityError
									}) : activity ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "tutor-activity-grid",
										children: [
											renderTutorActivityGroup("Séances à venir", activity.upcomingSessions, "upcoming"),
											renderTutorActivityGroup("Disponibilités", activity.availabilities, "availability"),
											renderTutorActivityGroup("Intérêts", activity.interests, "interest"),
											renderTutorActivityGroup("Séances passées", activity.pastSessions, "past")
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "tutor-activity-prompt",
										children: "Aucune activité retrouvée dans les derniers fichiers."
									})
								})
							]
						}, tutor.key);
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "empty-state tutor-tracking-empty",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👨‍🏫" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: tutorTracking.snapshots.length ? "Aucun tuteur ne correspond" : "Aucun CSV tuteurs importé" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: tutorTracking.snapshots.length ? "Essayez une autre date de comparaison ou une autre recherche." : "Importez un premier CSV pour commencer à suivre les entrées et sorties." })
						]
					})
				})
			]
		});
	}
	function renderTutorReportsSection() {
		const totalMissing = (activeTutorReport?.entries ?? []).reduce((total, entry) => total + entry.missingReportCount, 0);
		const totalStudents = (activeTutorReport?.entries ?? []).reduce((total, entry) => total + entry.studentCount, 0);
		const reportLabel = activeTutorReport ? `${activeTutorReport.entries.length} tuteur${activeTutorReport.entries.length > 1 ? "s" : ""} au ${formatFullDate(activeTutorReport.date)}` : "Choisissez une date et collez une liste Excel pour commencer.";
		const allTimeMissing = filteredTutorReportAggregates.reduce((total, tutor) => total + tutor.totalMissing, 0);
		const allTimeDates = new Set(filteredTutorReportsForGlobal.map((report) => report.date)).size;
		const allTimeTutorCount = filteredTutorReportAggregates.length;
		const globalPeriodLabel = `${tutorReportStartDate ? formatFullDate(tutorReportStartDate) : "le début"} → ${tutorReportEndDate ? formatFullDate(tutorReportEndDate) : "aujourd’hui"}`;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "task-panel tutor-report-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Bilans tuteurs non faits" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Historique global en haut, mise à jour par date en bas." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "filters",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button quiet",
							onClick: () => {
								loadTutorReports();
							},
							disabled: saving,
							children: "↻ Actualiser"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tutor-history-hero",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tutor-history-title",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "history-badge",
								children: "Historique"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vue depuis le début de l’année" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Les tuteurs qui reviennent le plus souvent avec des bilans non faits · ", globalPeriodLabel] })] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tutor-history-controls",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Du" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: tutorReportStartDate,
									onChange: (event) => setTutorReportStartDate(event.target.value)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Au" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: tutorReportEndDate,
									onChange: (event) => setTutorReportEndDate(event.target.value)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button quiet",
									onClick: exportTutorReportAggregatesCsv,
									disabled: !tutorReportAggregates.length,
									type: "button",
									children: "Export CSV"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tutor-history-metrics",
							"aria-label": "Résumé historique des bilans tuteurs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tuteurs concernés" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: allTimeTutorCount })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dates importées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: allTimeDates })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bilans non faits" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: allTimeMissing })] })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tutor-report-top tutor-report-all-time",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tutor-report-top-head",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Top 10 de la période" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nombre total de bilans non faits sur la période choisie." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "tutor-report-global-search",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "⌕"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: tutorReportGlobalQuery,
									onChange: (event) => {
										setTutorReportGlobalQuery(event.target.value);
										setVisibleTutorReportCount(10);
									},
									placeholder: "Rechercher nom, téléphone, ID...",
									"aria-label": "Rechercher un tuteur dans le suivi global"
								})]
							})]
						}),
						visibleTutorReportAggregates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "tutor-top-list",
							children: visibleTutorReportAggregates.map((tutor, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "tutor-top-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rank",
										children: ["#", index + 1]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "tutor-card-name",
											onClick: () => setSelectedTutorReportKey(tutor.key),
											type: "button",
											children: tutorDisplayName(tutor)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
											tutor.dateCount,
											" date",
											tutor.dateCount > 1 ? "s" : "",
											" · ",
											tutor.schools.slice(0, 2).join(", ") || "Établissement non renseigné"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "tutor-global-comment",
											defaultValue: tutorReportCommentByKey.get(tutor.key) || "",
											placeholder: "Commentaire général...",
											onBlur: (event) => {
												if (event.target.value.trim() !== (tutorReportCommentByKey.get(tutor.key) || "")) updateTutorReportGlobalComment(tutor.key, event.target.value);
											},
											"aria-label": `Commentaire général pour ${tutorDisplayName(tutor)}`
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "tutor-top-actions",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [
											tutor.totalMissing,
											" bilan",
											tutor.totalMissing > 1 ? "s" : ""
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "icon-button danger-icon",
											onClick: () => {
												deleteTutorReportAggregate(tutor);
											},
											"aria-label": `Supprimer ${tutorDisplayName(tutor)} de la vue globale`,
											children: "×"
										})]
									})
								]
							}, tutor.key))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "compact-empty",
							children: "Aucun historique global pour le moment."
						}),
						visibleTutorReportAggregates.length < filteredTutorReportAggregates.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button quiet tutor-load-more",
							onClick: () => setVisibleTutorReportCount((count) => count + 10),
							type: "button",
							children: "Voir les 10 suivants"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tutor-report-date-workspace",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tutor-date-section-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "history-badge muted",
									children: "Mise à jour"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Données par date" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: reportLabel })
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "filters",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "date-input",
									type: "date",
									value: tutorReportDate,
									onChange: (event) => setTutorReportDate(event.target.value),
									"aria-label": "Date du suivi des bilans tuteurs"
								}), tutorReports.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: tutorReportDate,
									onChange: (event) => setTutorReportDate(event.target.value),
									"aria-label": "Choisir une date importée",
									children: tutorReports.map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: report.date,
										children: formatFullDate(report.date)
									}, report.date))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tutor-report-summary",
							"aria-label": "Résumé des bilans tuteurs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tuteurs listés" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeTutorReport?.entries.length ?? 0 })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bilans non faits" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: totalMissing })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Élèves concernés" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: totalStudents })] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tutor-report-import",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["Importer une liste pour le ", tutorReportDate ? formatFullDate(tutorReportDate) : "jour choisi"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Choisissez d’abord la date au-dessus, même pour une date passée. Formats fichier conseillés : CSV ou TSV. Ordre attendu : ID, Nom, Prénom, Téléphone, Établissement, Nb élèves, Nb bilans non faits." })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "tutor-report-file-picker",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Charger un fichier CSV / TSV" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: ".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain",
										onChange: (event) => {
											importTutorReportFile(event.target.files?.[0]);
											event.currentTarget.value = "";
										}
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: tutorReportPaste,
									onChange: (event) => setTutorReportPaste(event.target.value),
									placeholder: `Collez ici les lignes Excel pour le ${tutorReportDate || "jour choisi"}…`,
									"aria-label": "Liste Excel des tuteurs avec bilans non faits"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "import-actions",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button primary",
										onClick: () => {
											importTutorReportPaste();
										},
										disabled: saving || !tutorReportDate || !tutorReportPaste.trim(),
										children: "Importer / remplacer cette date"
									}), activeTutorReport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button quiet danger-text",
										onClick: () => {
											deleteTutorReportSnapshot(activeTutorReport.date);
										},
										disabled: saving,
										children: "Supprimer cette date"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading tutor-report-table-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Détail de la date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								filteredTutorReportEntries.length,
								" ligne",
								filteredTutorReportEntries.length > 1 ? "s" : "",
								" affichée",
								filteredTutorReportEntries.length > 1 ? "s" : ""
							] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "search-box",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "⌕"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: tutorReportQuery,
									onChange: (event) => setTutorReportQuery(event.target.value),
									placeholder: "Rechercher tuteur, téléphone, établissement...",
									"aria-label": "Rechercher dans les bilans tuteurs"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tutor-report-table-wrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "tutor-report-table tutor-report-head",
								"aria-hidden": "true",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ID" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nom" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Prénom" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Téléphone" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Établissement" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Élèves" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bilans non faits" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Commentaire global" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Commentaire date" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Actions" })
								]
							}), filteredTutorReportEntries.length ? filteredTutorReportEntries.map((entry) => {
								const tutorKey = tutorIdentityKey(entry);
								const globalComment = entry.tutorId ? tutorReportCommentByKey.get(`id:${entry.tutorId.toLocaleLowerCase("fr")}`) || "" : "";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "tutor-report-table tutor-report-row",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entry.tutorId || "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "tutor-name-button",
											onClick: () => setSelectedTutorReportKey(tutorKey),
											type: "button",
											children: entry.lastName || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entry.firstName || "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entry.phone || "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entry.school || "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entry.studentCount }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "missing",
											children: entry.missingReportCount
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "tutor-row-comment global-comment",
											defaultValue: globalComment,
											placeholder: "Commentaire global...",
											disabled: !entry.tutorId,
											title: !entry.tutorId ? "ID tuteur requis pour associer ce commentaire" : void 0,
											onBlur: (event) => {
												if (event.target.value.trim() !== globalComment) {
													if (entry.tutorId) updateTutorReportGlobalComment(entry.tutorId, event.target.value);
												}
											},
											"aria-label": `Commentaire global pour ${tutorDisplayName(entry)}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "tutor-row-comment",
											defaultValue: entry.comment,
											placeholder: "Commentaire date...",
											onBlur: (event) => {
												if (event.target.value.trim() !== entry.comment) updateTutorReportEntryComment(activeTutorReport?.date || tutorReportDate, entry.id, event.target.value);
											},
											"aria-label": `Commentaire de date pour ${tutorDisplayName(entry)}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "icon-button danger-icon inline-delete",
											onClick: () => {
												deleteTutorReportEntry(activeTutorReport?.date || tutorReportDate, entry.id);
											},
											"aria-label": `Supprimer ${tutorDisplayName(entry)}`,
											children: "×"
										})
									]
								}, entry.id);
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "empty-state tutor-report-empty",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🧾" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: activeTutorReport ? "Aucune ligne ne correspond à la recherche" : "Aucune liste importée" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: activeTutorReport ? "Essayez une autre recherche." : "Choisissez une date, copiez les lignes depuis Excel, puis importez-les." })
								]
							})]
						})
					]
				})
			]
		});
	}
	function renderSocialControls(likes, comments, onLike, onComment, label) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "post-social",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "post-social-bar",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "button quiet social-like-button",
						type: "button",
						onClick: onLike,
						disabled: saving,
						children: ["👍 J’aime ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: likes.length })]
					}), likes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
						"Aimé par ",
						likes.slice(-3).map((like) => like.author).join(", "),
						likes.length > 3 ? "…" : ""
					] })]
				}),
				comments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "post-comments",
					children: comments.slice(-3).map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: comment.author }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatJournalDate(comment.createdAt) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: comment.text })
					] }, comment.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "post-comment-form",
					onSubmit: onComment,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "author",
							placeholder: authorName || "Votre nom",
							"aria-label": `Nom pour commenter ${label}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "comment",
							placeholder: "Ajouter un commentaire...",
							"aria-label": `Commentaire pour ${label}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button quiet",
							type: "submit",
							disabled: saving,
							children: "Commenter"
						})
					]
				})
			]
		});
	}
	function renderStudentHistorySection() {
		let carriedValue = null;
		let previousKnownValue = null;
		const chartColors = [
			"#0EA5E9",
			"#10B981",
			"#BE185D",
			"#075985",
			"#F59E0B",
			"#7C3AED"
		];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "student-history-panel",
			"aria-label": "Historique du nombre d'eleves",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Historique élèves"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Trajectoire du 25 août au 30 septembre" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Total cumulé saisi jour par jour, séparé du compteur principal." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "filters",
					children: [studentHistory.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: activeHistoryYear,
						onChange: (event) => setActiveHistoryYear(Number(event.target.value)),
						children: studentHistory.map((year) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: year.year,
							children: year.year
						}, year.year))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "button primary",
						onClick: addStudentHistoryYear,
						disabled: saving,
						children: "＋ Ajouter une année"
					})]
				})]
			}), studentHistory.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "history-compare",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "history-chart-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Grand graphique comparatif" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: chartYears.length ? `${chartYears.length} annee${chartYears.length > 1 ? "s" : ""} affichee${chartYears.length > 1 ? "s" : ""}` : "Cochez au moins une annee" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "history-year-toggles",
							children: studentHistory.map((year) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: selectedHistoryYears.includes(year.year),
								onChange: (event) => toggleHistoryYear(year.year, event.target.checked)
							}), year.year] }, year.year))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "student-chart",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
							viewBox: "0 0 1000 210",
							role: "img",
							"aria-label": "Comparaison du nombre d'eleves par annee",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
									x1: "0",
									y1: "180",
									x2: "1000",
									y2: "180"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
									x1: "0",
									y1: "30",
									x2: "1000",
									y2: "30"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
									x1: "0",
									y1: "105",
									x2: "1000",
									y2: "105"
								}),
								chartYears.map((year, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
									points: studentHistoryPath(year),
									style: { stroke: chartColors[index % chartColors.length] }
								}, year.year))
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "chart-axis",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "25 août" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "15 sept." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "30 sept." })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "chart-legend",
						children: chartYears.map((year, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: chartColors[index % chartColors.length] } }), year.year] }, year.year))
					})
				]
			}), activeHistory && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "history-table-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "history-table table-head",
					"aria-hidden": "true",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total saisi" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total affiche" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ajout" })
					]
				}), activeHistory.entries.map((entry) => {
					const displayedValue = entry.value ?? carriedValue;
					const addedValue = entry.value !== null && previousKnownValue !== null ? entry.value - previousKnownValue : null;
					if (entry.value !== null) {
						carriedValue = entry.value;
						previousKnownValue = entry.value;
					}
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "history-table history-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: campaignDayLabel(entry.date) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: "0",
								step: "1",
								defaultValue: entry.value ?? "",
								placeholder: "—",
								onBlur: (event) => updateStudentHistoryValue(activeHistory.year, entry.date, event.target.value),
								onKeyDown: (event) => {
									if (event.key === "Enter") event.currentTarget.blur();
								},
								"aria-label": `Nombre d'eleves au ${campaignDayLabel(entry.date)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: displayedValue === null ? "—" : formatObjectiveNumber(displayedValue) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: addedValue !== null && addedValue < 0 ? "negative" : "",
								children: addedValue === null ? "—" : `${addedValue >= 0 ? "+" : ""}${formatObjectiveNumber(addedValue)}`
							})
						]
					}, entry.date);
				})]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "empty-state history-empty",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↗" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucun historique élèves" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ajoutez une année pour générer automatiquement toutes les dates du 25 août au 30 septembre." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "button primary",
						onClick: addStudentHistoryYear,
						disabled: saving,
						children: "Ajouter une année"
					})
				]
			})]
		});
	}
	function renderCounterObjective(objective, label) {
		const percent = objectiveProgressPercent(objective);
		const nextStep = objectiveNextStep(objective);
		const isStudentObjective = objective.id === "objective-september-2600";
		const miniPath = miniStudentHistoryPath();
		const latestHistoryValue = latestStudentHistoryValue();
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "objective-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: objective.title }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "objective-progress-summary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
						formatObjectiveNumber(objective.currentValue ?? 0),
						" / ",
						formatObjectiveNumber(objective.targetValue),
						" ",
						objective.targetLabel
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [percent, "%"] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "objective-progress-bar",
					"aria-label": `Progression de l'objectif : ${percent}%`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${percent}%` } })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "objective-progress-caption",
					children: nextStep.missing > 0 ? `Il manque ${formatObjectiveNumber(nextStep.missing)} ${objective.targetLabel} pour atteindre ${nextStep.nextPercent}%.` : "Objectif atteint : cap tenu, on garde l'elan."
				}),
				isStudentObjective && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "mini-history-card",
					onClick: () => setAppMode("history"),
					type: "button",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Historique élèves" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: latestHistoryValue === null ? "Ajouter les donnees" : `Dernier total : ${formatObjectiveNumber(latestHistoryValue)}` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 100 50",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: miniPath || "0,42 100,42" })
					})]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "objective-card-footer",
				children: [objective.personIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "objective-assignees",
					"aria-label": "Personnes rattachees a l'objectif",
					children: objective.personIds.length ? objective.personIds.map((personId) => {
						const person = peopleById.get(personId);
						if (!person) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "objective-person",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "avatar",
								children: ownerInitials(person.name)
							}), person.name]
						}, person.id);
					}) : null
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button quiet",
					onClick: () => openObjective(objective),
					children: "Modifier"
				})]
			})]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: `app-shell density-${density}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "topbar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "brand",
					onClick: () => setAppMode("dashboard"),
					"aria-label": "Retourner à l’accueil",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "brand-mark",
						"aria-hidden": "true",
						children: "α"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Alpha Education" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Pilotage des équipes" })] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "header-actions",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `storage-note ${syncError ? "error" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								children: "●"
							}), saving ? "Sauvegarde..." : syncError || "Synchronise en ligne"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button quiet",
							onClick: () => openPerson(),
							disabled: saving,
							children: "Personnes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "button primary",
							onClick: appMode === "recurring" ? openNewRecurringTask : appMode === "links" ? openNewLink : appMode === "journal" ? openNewJournalPost : appMode === "communications" ? openNewCommunication : appMode === "staffing" ? () => {
								loadStaffingDays();
							} : appMode === "staffingAudit" ? () => setAppMode("staffingAudit") : appMode === "tutors" ? () => {
								loadTutorTracking();
							} : appMode === "availability" ? () => {
								loadAvailabilityImports();
							} : appMode === "availabilityFeed" ? () => setAppMode("availabilityFeed") : appMode === "enrollments" ? () => setAppMode("enrollments") : appMode === "coverage" ? () => setAppMode("coverage") : appMode === "unstaffed" ? () => setAppMode("unstaffed") : appMode === "files" ? () => setAppMode("files") : appMode === "tutorReports" ? () => {
								loadTutorReports();
							} : appMode === "watchlist" ? () => openNewSchoolWatchItem() : appMode === "schools" ? () => openSchoolEvent() : appMode === "objectives" ? openNewQualitativeObjective : appMode === "history" ? addStudentHistoryYear : openNewTask,
							disabled: saving,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "＋"
								}),
								" ",
								appMode === "recurring" ? "Nouveau modele" : appMode === "links" ? "Nouveau lien" : appMode === "journal" ? "Nouveau post" : appMode === "communications" ? "Nouvelle communication" : appMode === "staffing" ? "Ligne du jour" : appMode === "staffingAudit" ? "Voir les bilans" : appMode === "tutors" ? "Actualiser tuteurs" : appMode === "availability" ? "Actualiser dispos" : appMode === "availabilityFeed" ? "Voir le fil" : appMode === "enrollments" ? "Comparer inscriptions" : appMode === "coverage" ? "Voir les tuteurs disponibles" : appMode === "unstaffed" ? "Voir les séances" : appMode === "files" ? "Gérer les fichiers" : appMode === "tutorReports" ? "Actualiser bilans" : appMode === "watchlist" ? "Nouveau suivi" : appMode === "schools" ? "Nouveau post CRM" : appMode === "objectives" ? "Nouvel objectif" : appMode === "history" ? "Ajouter une année" : "Nouvelle tache"
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "content",
				children: [
					appMode === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "home-objectives",
						"aria-label": "Objectifs Alpha Education",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "home-welcome",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mission-badge",
								children: "Alpha Education · rentrée 2026"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Piloter, organiser, avancer." })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "objective-stack",
							children: [renderCounterObjective(studentObjective, "Objectif élèves"), renderCounterObjective(sessionObjective, "Objectif hebdo")]
						})]
					}),
					appMode === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeDashboard, { onNavigate: (mode) => setAppMode(mode) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "tabs-shell",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "main-tabs",
							role: "group",
							"aria-label": "Choisir le type de suivi",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "dashboard" ? "active" : "",
									onClick: () => setAppMode("dashboard"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "🏠"
									}), " Accueil"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "tasks" ? "active" : "",
									onClick: () => setAppMode("tasks"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "✅"
									}), " Tâches"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "links" ? "active" : "",
									onClick: () => setAppMode("links"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "🔗"
									}), " Liens"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "watchlist" ? "active" : "",
									onClick: () => setAppMode("watchlist"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "👀"
									}), " À suivre"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "schools" ? "active" : "",
									onClick: () => setAppMode("schools"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "🏫"
									}), " Établissements"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "communications" ? "active" : "",
									onClick: () => setAppMode("communications"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "📣"
									}), " Communications"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "staffing" ? "active" : "",
									onClick: () => setAppMode("staffing"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "👥"
									}), " Staffing"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "staffingAudit" ? "active" : "",
									onClick: () => setAppMode("staffingAudit"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "📊"
									}), " Bilan staffing"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "staffingEvolution" ? "active" : "",
									onClick: () => setAppMode("staffingEvolution"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "🔄"
									}), " Évolution staffing"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "unstaffed" ? "active" : "",
									onClick: () => setAppMode("unstaffed"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "📋"
									}), " Séances non affectées"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "tutors" ? "active" : "",
									onClick: () => setAppMode("tutors"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "👨‍🏫"
									}), " Tuteurs"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "availability" ? "active" : "",
									onClick: () => setAppMode("availability"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "📆"
									}), " Comparaison dispos"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "availabilityFeed" ? "active" : "",
									onClick: () => setAppMode("availabilityFeed"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "🕒"
									}), " Fil des disponibilités"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "enrollments" ? "active" : "",
									onClick: () => setAppMode("enrollments"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "🎒"
									}), " Inscriptions"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "coverage" ? "active" : "",
									onClick: () => setAppMode("coverage"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "🧩"
									}), " Tuteurs dispo sans séance"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "files" ? "active" : "",
									onClick: () => setAppMode("files"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "🗂️"
									}), " Fichiers"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "tutorReports" ? "active" : "",
									onClick: () => setAppMode("tutorReports"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "🧾"
									}), " Bilans tuteurs"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "objectives" ? "active" : "",
									onClick: () => setAppMode("objectives"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "🎯"
									}), " Objectifs"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "history" ? "active" : "",
									onClick: () => setAppMode("history"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "📈"
									}), " Historique"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: appMode === "journal" ? "active" : "",
									onClick: () => setAppMode("journal"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tab-icon",
										"aria-hidden": "true",
										children: "✍️"
									}), " Journal"]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "copy-tab-link",
							onClick: copyCurrentTabLink,
							type: "button",
							children: "Copier le lien"
						})]
					}),
					appMode === "tasks" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "stats-grid",
						"aria-label": "Resume des taches",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `stat-card neutral ${statusFilter === "all" ? "active" : ""}`,
								onClick: () => setStatusFilter("all"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "stat-icon",
									children: "≡"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stats.active }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Actives" })] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `stat-card red ${statusFilter === "late" ? "active" : ""}`,
								onClick: () => setStatusFilter("late"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "stat-icon",
									children: "!"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stats.late }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "En retard" })] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `stat-card violet ${priorityFilter === "high" ? "active" : ""}`,
								onClick: () => setPriorityFilter(priorityFilter === "high" ? "all" : "high"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "stat-icon",
									children: "↑"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stats.high }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Priorite haute" })] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `stat-card blue ${statusFilter === "progress" ? "active" : ""}`,
								onClick: () => setStatusFilter("progress"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "stat-icon",
									children: "◒"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stats.progress }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "En cours" })] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `stat-card green ${statusFilter === "done" ? "active" : ""}`,
								onClick: () => setStatusFilter("done"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "stat-icon",
									children: "✓"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stats.done }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Terminees" })] })]
							})
						]
					}),
					appMode === "dashboard" ? null : appMode === "tasks" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "task-panel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel-heading",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Liste partagee" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: !loaded ? "Chargement..." : `${filteredTasks.length} tache${filteredTasks.length > 1 ? "s" : ""} affichee${filteredTasks.length > 1 ? "s" : ""}` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "filters",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "search-box",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"aria-hidden": "true",
												children: "⌕"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: query,
												onChange: (event) => setQuery(event.target.value),
												placeholder: "Rechercher...",
												"aria-label": "Rechercher une tache"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: priorityFilter,
											onChange: (event) => setPriorityFilter(event.target.value),
											"aria-label": "Filtrer par priorite",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "all",
													children: "Toutes priorites"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "high",
													children: "Haute"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "medium",
													children: "Moyenne"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "low",
													children: "Basse"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "density-toggle",
											onClick: () => setDensity(density === "compact" ? "comfortable" : "compact"),
											title: "Changer la densite d'affichage",
											children: density === "compact" ? "Compact" : "Confort"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "mini-action",
											onClick: () => {
												loadTasks();
												loadPeople();
											},
											disabled: saving,
											children: "↻"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "mini-action",
											onClick: exportTasks,
											disabled: !tasks.length,
											children: "⇩"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "mini-action",
											onClick: () => importRef.current?.click(),
											disabled: saving,
											children: "⇧"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: importRef,
											className: "sr-only",
											type: "file",
											accept: "application/json",
											onChange: (event) => importTasks(event.target.files?.[0])
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "owner-strip",
								"aria-label": "Filtrer par responsable",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: ownerFilter === "all" ? "active" : "",
									onClick: () => setOwnerFilter("all"),
									children: ["Tous ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tasks.length })]
								}), owners.map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: ownerFilter === owner ? "active" : "",
									onClick: () => setOwnerFilter(owner),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "avatar",
										children: ownerInitials(owner)
									}), owner]
								}, owner))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "status-tabs",
								role: "group",
								"aria-label": "Filtrer par statut",
								children: [
									["all", "Actives"],
									["todo", "A faire"],
									["progress", "En cours"],
									["done", "Terminees"],
									["late", "En retard"]
								].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: statusFilter === value ? "active" : "",
									onClick: () => setStatusFilter(value),
									children: label
								}, value))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "view-tabs",
								role: "group",
								"aria-label": "Changer de vue",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: viewMode === "list" ? "active" : "",
									onClick: () => setViewMode("list"),
									children: "Liste"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: viewMode === "matrix" ? "active" : "",
									onClick: () => setViewMode("matrix"),
									children: "Priorite × duree"
								})]
							}),
							viewMode === "matrix" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "matrix-view",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "matrix-head",
										"aria-hidden": "true",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), durationBuckets.map((bucket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [bucket.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: bucket.hint })] }, bucket.value))]
									}),
									matrixPriorities.map((priority) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
										className: `matrix-row matrix-priority-${priority}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "matrix-priority-label",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `priority-pill priority-${priority}`,
												children: priorityLabels[priority]
											})
										}), durationBuckets.map((bucket) => {
											const bucketTasks = filteredTasks.filter((task) => task.priority === priority && durationBucket(task.estimatedHours) === bucket.value);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "matrix-cell",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "matrix-mobile-label",
													children: [
														bucket.label,
														" · ",
														bucket.hint
													]
												}), bucketTasks.length ? bucketTasks.map((task) => {
													const assignee = task.assigneeId ? peopleById.get(task.assigneeId) : null;
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														className: `matrix-card ${isLate(task) ? "is-late" : ""}`,
														onClick: () => setSelectedId(task.id),
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: task.title }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
																assignee?.name || task.owner,
																" · ",
																formatDuration(task.estimatedHours)
															] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: naturalDateLabel(task) })
														]
													}, task.id);
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "matrix-empty",
													children: "—"
												})]
											}, bucket.value);
										})]
									}, priority)),
									loaded && !filteredTasks.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "empty-state matrix-empty-state",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✓" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucune tache a afficher" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Creez une tache ou changez les filtres pour remplir la matrice." }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "button primary",
												onClick: openNewTask,
												children: "Creer une tache"
											})
										]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "table-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "task-table table-head",
									"aria-hidden": "true",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tache" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Responsable" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Echeance" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Duree" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Priorite" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Statut" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dernier commentaire" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
									]
								}), loaded && filteredTasks.length ? filteredTasks.map((task) => {
									const latestComment = task.comments[0];
									const assignee = task.assigneeId ? peopleById.get(task.assigneeId) : null;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: `task-table task-row priority-${task.priority} ${isLate(task) ? "is-late" : ""} ${task.status === "done" ? "is-done" : ""}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												className: "task-main",
												onClick: () => setSelectedId(task.id),
												"aria-label": `Ouvrir ${task.title}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `completion-box ${task.status === "done" ? "checked" : ""}`,
													"aria-hidden": "true",
													children: task.status === "done" ? "✓" : ""
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: task.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: task.description || "Aucune description" })] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "owner",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "avatar",
													children: ownerInitials(assignee?.name || task.owner)
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: assignee?.name || task.owner })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "date-cell",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: naturalDateLabel(task) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: dateLabel(task) })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "duration-pill",
												children: formatDuration(task.estimatedHours)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `priority-pill priority-${task.priority}`,
												children: priorityLabels[task.priority]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: `status-select status-${task.status}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "status-dot",
													"aria-hidden": "true"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													value: task.status,
													onChange: (event) => changeStatus(task.id, event.target.value),
													"aria-label": `Statut de ${task.title}`,
													disabled: saving,
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "todo",
															children: "A faire"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "progress",
															children: "En cours"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "done",
															children: "Terminee"
														})
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												className: `note-preview ${latestComment ? "has-note" : ""}`,
												onClick: () => setSelectedId(task.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"aria-hidden": "true",
													children: latestComment ? "●" : "+"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: latestComment ? `${latestComment.author} : ${latestComment.text}` : "Ajouter une note" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "icon-button",
												onClick: () => openEditTask(task),
												"aria-label": `Modifier ${task.title}`,
												children: "•••"
											})
										]
									}, task.id);
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "empty-state",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loaded ? "✓" : "…" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: loaded ? "Aucune tache partagee" : "Chargement des taches" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: loaded ? "Creez la premiere tache pour demarrer le suivi collectif." : "Connexion au tableau partage..." }),
										loaded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "button primary",
											onClick: openNewTask,
											children: "Creer la premiere tache"
										})
									]
								})]
							})
						]
					}) : appMode === "recurring" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "task-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Modeles recurrents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: `${recurringTasks.length} modele${recurringTasks.length > 1 ? "s" : ""} disponible${recurringTasks.length > 1 ? "s" : ""}` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "filters",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button quiet",
									onClick: () => {
										loadRecurringTasks();
									},
									disabled: saving,
									children: "↻ Actualiser"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button primary",
									onClick: openNewRecurringTask,
									disabled: saving,
									children: "＋ Nouveau modele"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "table-wrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "recurring-table table-head",
								"aria-hidden": "true",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Modele" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Responsable" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Duree" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Priorite" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Actions" })
								]
							}), recurringTasks.length ? recurringTasks.slice().sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.title.localeCompare(b.title, "fr")).map((task) => {
								const assignee = task.assigneeId ? peopleById.get(task.assigneeId) : null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: `recurring-table task-row recurring-row priority-${task.priority}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											className: "task-main",
											onClick: () => openEditRecurringTask(task),
											"aria-label": `Modifier le modele ${task.title}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "recurring-icon",
												"aria-hidden": "true",
												children: "↻"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: task.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: task.description || "Aucune description" })] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "owner",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "avatar",
												children: ownerInitials(assignee?.name || task.owner)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: assignee?.name || task.owner })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "duration-pill",
											children: formatDuration(task.estimatedHours)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `priority-pill priority-${task.priority}`,
											children: priorityLabels[task.priority]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "row-actions",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "button primary",
													onClick: () => createTaskFromRecurring(task),
													disabled: saving,
													children: "Creer une tache"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "icon-button",
													onClick: () => openEditRecurringTask(task),
													"aria-label": `Modifier ${task.title}`,
													children: "•••"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "icon-button danger-icon",
													onClick: () => deleteRecurringTask(task.id),
													"aria-label": `Supprimer ${task.title}`,
													children: "×"
												})
											]
										})
									]
								}, task.id);
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "empty-state",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↻" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucun modele recurrent" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Creez un modele pour refaire rapidement les taches qui reviennent." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button primary",
										onClick: openNewRecurringTask,
										children: "Creer le premier modele"
									})
								]
							})]
						})]
					}) : appMode === "links" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "task-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Liens utiles" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: `${links.length} lien${links.length > 1 ? "s" : ""} partage${links.length > 1 ? "s" : ""}` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "filters",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button quiet",
									onClick: () => {
										loadLinks();
									},
									disabled: saving,
									children: "↻ Actualiser"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button primary",
									onClick: openNewLink,
									disabled: saving,
									children: "＋ Nouveau lien"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "link-grid",
							children: links.length ? links.slice().sort((a, b) => a.title.localeCompare(b.title, "fr")).map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "link-card",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "link-icon",
									"aria-hidden": "true",
									children: "↗"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: link.title }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: link.description || "Aucune description ajoutee." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: link.url.replace(/^https?:\/\//, "") })
								] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "row-actions",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											className: "button primary",
											href: link.url,
											target: "_blank",
											rel: "noreferrer",
											children: "Ouvrir"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "icon-button",
											onClick: () => openEditLink(link),
											"aria-label": `Modifier ${link.title}`,
											children: "•••"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "icon-button danger-icon",
											onClick: () => deleteLink(link.id),
											"aria-label": `Supprimer ${link.title}`,
											children: "×"
										})
									]
								})]
							}, link.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "empty-state",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↗" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucun lien partage" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ajoutez les pages importantes pour que l'equipe retrouve vite les bons outils." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button primary",
										onClick: openNewLink,
										children: "Ajouter le premier lien"
									})
								]
							})
						})]
					}) : appMode === "journal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "task-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Journal de l’Étude Alpha" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: `${filteredJournalPosts.length} post${filteredJournalPosts.length > 1 ? "s" : ""} affiche${filteredJournalPosts.length > 1 ? "s" : ""}` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "filters",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "search-box",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											children: "⌕"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: journalQuery,
											onChange: (event) => setJournalQuery(event.target.value),
											placeholder: "Rechercher dans le journal...",
											"aria-label": "Rechercher dans le journal"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: journalTagFilter,
										onChange: (event) => setJournalTagFilter(event.target.value),
										"aria-label": "Filtrer par tag",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "Tous les tags"
										}), journalTags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: tag,
											children: tag
										}, tag))]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: journalAuthorFilter,
										onChange: (event) => setJournalAuthorFilter(event.target.value),
										"aria-label": "Filtrer par auteur",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "Tous les auteurs"
										}), journalAuthors.map((author) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: author,
											children: author
										}, author))]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: journalPersonFilter,
										onChange: (event) => setJournalPersonFilter(event.target.value),
										"aria-label": "Filtrer par personne taguee",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "Toutes personnes"
										}), activePeople.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: person.id,
											children: person.name
										}, person.id))]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button quiet",
										onClick: () => {
											loadJournalPosts();
										},
										disabled: saving,
										children: "↻ Actualiser"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button primary",
										onClick: openNewJournalPost,
										disabled: saving,
										children: "＋ Nouveau post"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "journal-list",
							children: filteredJournalPosts.length ? filteredJournalPosts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "journal-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "journal-card-date",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatJournalDate(post.publishedAt).split(" ")[0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: formatJournalDate(post.publishedAt).split(" ").slice(1).join(" ") })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "journal-card-body",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "journal-card-head",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "eyebrow",
													children: "Carnet de bord"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: post.title })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: post.author })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: post.content }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "journal-tags",
												children: [post.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													onClick: () => setJournalTagFilter(tag),
													children: ["#", tag]
												}, tag)), post.personIds.map((personId) => {
													const person = peopleById.get(personId);
													if (!person) return null;
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														onClick: () => setJournalPersonFilter(person.id),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "avatar",
															children: ownerInitials(person.name)
														}), person.name]
													}, person.id);
												})]
											}),
											renderSocialControls(post.likes, post.comments, () => {
												likeJournalPost(post.id);
											}, (event) => {
												addJournalComment(post.id, event);
											}, post.title)
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "row-actions",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "button quiet",
											onClick: () => openEditJournalPost(post),
											children: "Modifier"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "icon-button danger-icon",
											onClick: () => deleteJournalPost(post.id),
											"aria-label": `Supprimer ${post.title}`,
											children: "×"
										})]
									})
								]
							}, post.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "empty-state journal-empty",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✦" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: journalPosts.length ? "Aucun post ne correspond aux filtres" : "Le journal est prêt" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: journalPosts.length ? "Essayez une autre recherche ou retirez un filtre." : "Écrivez la première trace de l’Étude Alpha : une décision, une victoire, un apprentissage." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button primary",
										onClick: openNewJournalPost,
										children: "Créer un post"
									})
								]
							})
						})]
					}) : appMode === "communications" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "task-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Communications de masse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: `${filteredCommunications.length} communication${filteredCommunications.length > 1 ? "s" : ""} affichée${filteredCommunications.length > 1 ? "s" : ""}` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "filters",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "search-box",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											children: "⌕"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: communicationQuery,
											onChange: (event) => setCommunicationQuery(event.target.value),
											placeholder: "Rechercher une communication...",
											"aria-label": "Rechercher une communication"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: communicationAudienceFilter,
										onChange: (event) => setCommunicationAudienceFilter(event.target.value),
										"aria-label": "Filtrer par public",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "Tous les publics"
										}), communicationAudiences.map((audience) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: audience,
											children: communicationAudienceLabels[audience]
										}, audience))]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: communicationStatusFilter,
										onChange: (event) => setCommunicationStatusFilter(event.target.value),
										"aria-label": "Filtrer par statut",
										children: communicationStatuses.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: status,
											children: status === "all" ? "Tous les statuts" : communicationStatusLabels[status]
										}, status))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button quiet",
										onClick: () => {
											loadCommunications();
										},
										disabled: saving,
										children: "↻ Actualiser"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button primary",
										onClick: openNewCommunication,
										disabled: saving,
										children: "＋ Nouvelle communication"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "communication-list",
							children: filteredCommunications.length ? filteredCommunications.map((communication) => {
								const followUpLate = isCommunicationFollowUpLate(communication);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: `communication-card status-${communication.status} ${followUpLate ? "is-late" : ""}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "communication-date",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatJournalDate(communication.sentAt || communication.createdAt).split(" ")[0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: formatJournalDate(communication.sentAt || communication.createdAt).split(" ").slice(1).join(" ") })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "communication-body",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "communication-head",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "eyebrow",
														children: communication.channel
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: communication.title })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `communication-status status-${communication.status}`,
														children: communicationStatusLabels[communication.status]
													})]
												}),
												communication.messageSummary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: communication.messageSummary }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "communication-tags",
													children: [communication.audiences.map((audience) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: () => setCommunicationAudienceFilter(audience),
														children: communicationAudienceLabels[audience]
													}, audience)), communication.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														onClick: () => setCommunicationQuery(tag),
														children: ["#", tag]
													}, tag))]
												}),
												communication.recipients.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "communication-recipients",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Destinataires nominatifs" }), communication.recipients.map((recipient) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: recipient }, recipient))]
												}) : null,
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "communication-meta",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: communication.author }),
														communication.sentAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Envoyé le ", formatDate(communication.sentAt)] }),
														communication.followUpDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: followUpLate ? "late" : "",
															children: [
																followUpLate ? "Relance en retard" : "Relance",
																" · ",
																formatDate(communication.followUpDate)
															]
														})
													]
												}),
												communication.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
													className: "communication-note",
													children: communication.notes
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "row-actions",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "button quiet",
												onClick: () => openEditCommunication(communication),
												children: "Modifier"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "icon-button danger-icon",
												onClick: () => deleteCommunication(communication.id),
												"aria-label": `Supprimer ${communication.title}`,
												children: "×"
											})]
										})
									]
								}, communication.id);
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "empty-state communication-empty",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✉" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: communications.length ? "Aucune communication ne correspond aux filtres" : "Aucune communication enregistrée" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: communications.length ? "Essayez une autre recherche ou retirez un filtre." : "Tracez les messages envoyés aux tuteurs, établissements, parents ou coordinateurs." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button primary",
										onClick: openNewCommunication,
										children: "Créer la première communication"
									})
								]
							})
						})]
					}) : appMode === "staffing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "task-panel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel-heading",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Staffing séances" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: `${staffingDays.length} jour${staffingDays.length > 1 ? "s" : ""} suivi${staffingDays.length > 1 ? "s" : ""} · Pierre, Julie, Kelly` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "filters",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button quiet",
										onClick: () => {
											loadStaffingDays();
										},
										disabled: saving,
										children: "↻ Actualiser"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button primary",
										onClick: () => {
											loadStaffingDays();
										},
										disabled: saving,
										children: "＋ Ligne du jour"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-mini-chart",
								"aria-label": "Évolution globale des séances",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "staffing-chart-copy",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Global" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [staffingSummary.totalStaffed + staffingSummary.totalUnstaffed, " séances"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [staffingChart.unstaffedPercent, "% non staffées"] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
										viewBox: "0 0 100 46",
										role: "img",
										"aria-label": "Courbes total séances et séances non staffées",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
												x1: "0",
												y1: "42",
												x2: "100",
												y2: "42"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
												className: "total-line",
												points: staffingChart.totalPath || "0,42 100,42"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
												className: "unstaffed-line",
												points: staffingChart.unstaffedPath || "0,42 100,42"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "staffing-chart-legend",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "total-dot" }), " Total"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "unstaffed-dot" }), " Non staffées"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: staffingChart.points.length ? `${staffingChart.points.length} dernier${staffingChart.points.length > 1 ? "s" : ""} jour${staffingChart.points.length > 1 ? "s" : ""}` : "Aucune donnée" })
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-summary",
								"aria-label": "Résumé staffing",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "7 jours staffées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: staffingSummary.weekStaffed })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "7 jours non staffées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: staffingSummary.weekUnstaffed })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total staffées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: staffingSummary.totalStaffed })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total non staffées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: staffingSummary.totalUnstaffed })] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "staffing-table-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "staffing-table staffing-head",
									role: "row",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date" }),
										staffingPeople.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: person.label }, person.key)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total staffé" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total non staffé" })
									]
								}), staffingDays.length ? staffingDays.map((day) => {
									const dayTotals = staffingDayTotals(day);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "staffing-table staffing-row",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "staffing-date",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatDate(day.date) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: day.date })]
											}),
											staffingPeople.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "staffing-person-cell",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Staffées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													min: "0",
													step: "1",
													defaultValue: day.people[person.key].staffedSessions,
													onBlur: (event) => {
														const count = normalizeSessionCount(event.target.value);
														event.target.value = String(count);
														updateStaffingValue(day.id, person.key, "staffedSessions", event.target.value);
													},
													"aria-label": `${person.label} séances staffées ${day.date}`
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Non staffées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													min: "0",
													step: "1",
													defaultValue: day.people[person.key].unstaffedSessions,
													onBlur: (event) => {
														const count = normalizeSessionCount(event.target.value);
														event.target.value = String(count);
														updateStaffingValue(day.id, person.key, "unstaffedSessions", event.target.value);
													},
													"aria-label": `${person.label} séances non staffées ${day.date}`
												})] })]
											}, person.key)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "staffing-total-input good",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total staffé" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													min: "0",
													step: "1",
													defaultValue: dayTotals.staffed,
													onBlur: (event) => {
														const count = normalizeSessionCount(event.target.value);
														event.target.value = String(count);
														updateStaffingTotal(day.id, "totalStaffedSessions", event.target.value);
													},
													"aria-label": `Total séances staffées ${day.date}`
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: `staffing-total-input ${dayTotals.unstaffed > 0 ? "alert" : ""}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total non staffé" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													min: "0",
													step: "1",
													defaultValue: dayTotals.unstaffed,
													onBlur: (event) => {
														const count = normalizeSessionCount(event.target.value);
														event.target.value = String(count);
														updateStaffingTotal(day.id, "totalUnstaffedSessions", event.target.value);
													},
													"aria-label": `Total séances non staffées ${day.date}`
												})]
											})
										]
									}, day.id);
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "empty-state staffing-empty",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "≡" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucune journée suivie" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "La ligne du jour sera ajoutée automatiquement pour commencer le suivi des séances staffées et non staffées." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "button primary",
											onClick: () => {
												loadStaffingDays();
											},
											children: "Créer la ligne du jour"
										})
									]
								})]
							})
						]
					}) : appMode === "tutors" ? renderTutorTrackingSection() : appMode === "availability" ? renderAvailabilityComparisonSection() : appMode === "availabilityFeed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorAvailabilityFeed, { onOpenFiles: openFiles }) : appMode === "enrollments" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnrollmentComparison, { onOpenFiles: openFiles }) : appMode === "coverage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorCoverageComparison, { onOpenFiles: openFiles }) : appMode === "unstaffed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnstaffedSessions, { onOpenFiles: openFiles }) : appMode === "staffingAudit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffingAudit, {}) : appMode === "staffingEvolution" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffingEvolution, {}) : appMode === "files" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilesHub, {
						focusKind: filesFocusKind,
						onOpen: (kind) => setAppMode(kind === "availability" ? "availability" : kind === "assignments" ? "coverage" : kind === "interests" || kind === "upcomingSessions" ? "unstaffed" : kind === "tutors" ? "tutors" : "enrollments")
					}) : appMode === "tutorReports" ? renderTutorReportsSection() : appMode === "watchlist" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "task-panel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel-heading",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Établissements à suivre" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: `${filteredSchoolWatchlist.length} suivi${filteredSchoolWatchlist.length > 1 ? "s" : ""} affiché${filteredSchoolWatchlist.length > 1 ? "s" : ""}` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "filters",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "search-box",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"aria-hidden": "true",
												children: "⌕"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: schoolWatchQuery,
												onChange: (event) => setSchoolWatchQuery(event.target.value),
												placeholder: "Rechercher un suivi...",
												"aria-label": "Rechercher un établissement à suivre"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "button quiet",
											onClick: () => {
												loadSchoolWatchlist();
											},
											disabled: saving,
											children: "↻ Actualiser"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "button primary",
											onClick: () => openNewSchoolWatchItem(),
											disabled: saving || !schools.length,
											children: "＋ Nouveau suivi"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "school-filter-tabs",
								role: "group",
								"aria-label": "Filtrer les suivis",
								children: [
									["active", "Actifs"],
									["resolved", "Résolus"],
									["all", "Tous"],
									...schoolWatchTags.map((tag) => [tag, tag])
								].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: schoolWatchFilter === value ? "active" : "",
									onClick: () => setSchoolWatchFilter(value),
									children: label
								}, value))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "watchlist-layout",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "watchlist-table-wrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "watchlist-table watchlist-head",
										"aria-hidden": "true",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Établissement" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Raison" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tags" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dernier commentaire" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Statut" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Actions" })
										]
									}), filteredSchoolWatchlist.length ? filteredSchoolWatchlist.map((item) => {
										const school = schoolById.get(item.schoolId);
										const latestComment = item.comments[0];
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
											className: `watchlist-table watchlist-row ${item.status === "resolved" ? "is-resolved" : ""} school-type-${school?.schoolType || "mixed"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													className: "watchlist-school",
													onClick: () => setSelectedSchoolWatchId(item.id),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: school?.name || "Établissement introuvable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: school ? [
														schoolTypeLabels[school.schoolType],
														school.city,
														school.coordinator
													].filter(Boolean).join(" · ") : "Le suivi est conservé même si l'établissement n'est plus dans la liste." })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "watchlist-reason",
													onClick: () => setSelectedSchoolWatchId(item.id),
													children: item.reason
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "watchlist-tags",
													children: item.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: () => setSchoolWatchFilter(tag),
														children: tag
													}, tag))
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: `watchlist-comment-preview ${latestComment ? "has-note" : ""}`,
													onClick: () => setSelectedSchoolWatchId(item.id),
													children: latestComment ? `${latestComment.author} : ${latestComment.text}` : "Ajouter un commentaire"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `watchlist-status ${item.status}`,
													children: schoolWatchStatusLabels[item.status]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "row-actions",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															className: "button quiet",
															onClick: () => openEditSchoolWatchItem(item),
															children: "Modifier"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															className: "button quiet",
															onClick: () => toggleSchoolWatchStatus(item),
															children: item.status === "active" ? "Résoudre" : "Réactiver"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															className: "icon-button danger-icon",
															onClick: () => deleteSchoolWatchItem(item.id),
															"aria-label": `Supprimer le suivi ${school?.name || item.reason}`,
															children: "×"
														})
													]
												})
											]
										}, item.id);
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "empty-state watchlist-empty",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⌕" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: schoolWatchlist.length ? "Aucun suivi ne correspond aux filtres" : "Aucun établissement à suivre" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: schoolWatchlist.length ? "Essayez une autre recherche ou un autre filtre." : "Ajoutez les nouveaux établissements, nouveaux besoins ou situations particulières à garder à l’œil." }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "button primary",
												onClick: () => openNewSchoolWatchItem(),
												disabled: !schools.length,
												children: "Créer le premier suivi"
											})
										]
									})]
								}), selectedSchoolWatchItem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
									className: `watchlist-detail school-type-${schoolById.get(selectedSchoolWatchItem.schoolId)?.schoolType || "mixed"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "school-detail-head",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "eyebrow",
												children: "Suivi établissement"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
												schoolId: schoolById.get(selectedSchoolWatchItem.schoolId)?.externalId,
												children: schoolById.get(selectedSchoolWatchItem.schoolId)?.name || "Établissement introuvable"
											}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "close-button",
												onClick: () => setSelectedSchoolWatchId(null),
												"aria-label": "Fermer le suivi",
												children: "×"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "school-meta",
											children: [schoolById.get(selectedSchoolWatchItem.schoolId) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `school-type-pill school-type-${schoolById.get(selectedSchoolWatchItem.schoolId)?.schoolType}`,
													children: schoolTypeLabels[schoolById.get(selectedSchoolWatchItem.schoolId).schoolType]
												}),
												schoolById.get(selectedSchoolWatchItem.schoolId)?.city && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: schoolById.get(selectedSchoolWatchItem.schoolId)?.city }),
												schoolById.get(selectedSchoolWatchItem.schoolId)?.coordinator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: schoolById.get(selectedSchoolWatchItem.schoolId)?.coordinator })
											] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Établissement introuvable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `watchlist-status ${selectedSchoolWatchItem.status}`,
												children: schoolWatchStatusLabels[selectedSchoolWatchItem.status]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "watchlist-detail-reason",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Raison du suivi" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedSchoolWatchItem.reason })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "watchlist-tags",
											children: selectedSchoolWatchItem.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tag }, tag))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "school-detail-actions",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "button quiet",
												onClick: () => openEditSchoolWatchItem(selectedSchoolWatchItem),
												children: "Modifier"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "button primary",
												onClick: () => toggleSchoolWatchStatus(selectedSchoolWatchItem),
												children: selectedSchoolWatchItem.status === "active" ? "Marquer résolu" : "Réactiver"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "watchlist-comment-box",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												rows: 3,
												value: schoolWatchComment,
												onChange: (event) => setSchoolWatchComment(event.target.value),
												placeholder: "Ajouter un commentaire au suivi..."
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "button primary",
												onClick: () => addSchoolWatchComment(selectedSchoolWatchItem.id),
												disabled: saving || !schoolWatchComment.trim(),
												children: "Ajouter le commentaire"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "school-detail-posts",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Commentaires" }), selectedSchoolWatchItem.comments.length ? selectedSchoolWatchItem.comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
												formatJournalDate(comment.createdAt),
												" · ",
												comment.author
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: comment.text })] }, comment.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aucun commentaire pour le moment." })]
										})
									]
								})]
							})
						]
					}) : appMode === "schools" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "task-panel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel-heading",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Journal CRM établissements" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: `${crmFeedItems.length} post${crmFeedItems.length > 1 ? "s" : ""} CRM · ${filteredSchools.length} établissement${filteredSchools.length > 1 ? "s" : ""} concerné${filteredSchools.length > 1 ? "s" : ""}` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "filters",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "search-box",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"aria-hidden": "true",
												children: "⌕"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: schoolQuery,
												onChange: (event) => setSchoolQuery(event.target.value),
												placeholder: "Rechercher un établissement...",
												"aria-label": "Rechercher un etablissement"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "button primary",
											onClick: () => openSchoolEvent(),
											disabled: saving || !schools.length,
											children: "＋ Nouveau post CRM"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "button quiet",
											onClick: openNewSchool,
											disabled: saving,
											children: "＋ Nouvel établissement"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "button quiet",
											onClick: () => {
												loadSchools();
											},
											disabled: saving,
											children: "↻ Actualiser"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "school-filter-tabs",
								role: "group",
								"aria-label": "Filtrer les établissements",
								children: [
									["all", "Tous"],
									["alpha", "Étude Alpha"],
									["mise-a-dispo", "Mise à disposition"],
									["with-posts", "Avec posts"],
									["without-posts", "Sans posts"]
								].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: schoolFilter === value ? "active" : "",
									onClick: () => setSchoolFilter(value),
									children: label
								}, value))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "school-assignment-directory",
								open: true,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Répartition des établissements" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										schools.filter((school) => !school.portfolioOwner).length,
										" non attribué",
										schools.filter((school) => !school.portfolioOwner).length > 1 ? "s" : "",
										" · ",
										schools.length,
										" au total"
									] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Attribuer à Kelly, Pierre ou Julie" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "owner-count-strip school-owner-counts",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "owner-count-title",
											children: "Établissements par responsable"
										}), [
											"kelly",
											"pierre",
											"julie",
											""
										].map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: !owner ? "unassigned" : "",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: schoolPortfolioOwnerLabels[owner] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: schoolCountsByOwner[owner] })]
										}, owner || "unassigned"))]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "school-assignment-filters",
										children: [[
											"all",
											"unassigned",
											"kelly",
											"pierre",
											"julie"
										].map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: schoolAssignmentFilter === owner ? "active" : "",
											onClick: () => setSchoolAssignmentFilter(owner),
											children: owner === "all" ? "Tous" : owner === "unassigned" ? "Non attribués" : schoolPortfolioOwnerLabels[owner]
										}, owner)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "school-assignment-export",
											onClick: exportSchoolAssignments,
											disabled: !schools.length,
											children: "↓ Exporter la répartition CSV"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
										className: "school-assignment-importer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "Importer ou coller une répartition" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
												"Format attendu : ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Nom de l’établissement [tabulation] pierre@etudealpha.fr" }),
												". Les établissements non reconnus ne sont pas modifiés."
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												rows: 5,
												value: schoolAssignmentPaste,
												onChange: (event) => setSchoolAssignmentPaste(event.target.value),
												placeholder: "Lyon - Saint Louis Saint Bruno	pierre@etudealpha.fr"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "school-assignment-import-actions",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "button quiet",
													children: ["Choisir un fichier", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "file",
														accept: ".txt,.csv,text/plain,text/csv",
														onChange: (event) => {
															importSchoolAssignmentsFile(event.target.files?.[0]);
															event.currentTarget.value = "";
														}
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "button primary",
													onClick: () => importSchoolAssignments(schoolAssignmentPaste),
													disabled: saving || !schoolAssignmentPaste.trim(),
													children: "Préremplir les attributions"
												})]
											}),
											schoolAssignmentImportReport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "school-assignment-import-report",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
														schoolAssignmentImportReport.matched,
														" reconnu",
														schoolAssignmentImportReport.matched > 1 ? "s" : "",
														" · ",
														schoolAssignmentImportReport.changed,
														" modifié",
														schoolAssignmentImportReport.changed > 1 ? "s" : ""
													] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
														schoolAssignmentImportReport.duplicates,
														" doublon",
														schoolAssignmentImportReport.duplicates > 1 ? "s" : "",
														" ignoré",
														schoolAssignmentImportReport.duplicates > 1 ? "s" : "",
														" · ",
														schoolAssignmentImportReport.invalid,
														" ligne",
														schoolAssignmentImportReport.invalid > 1 ? "s" : "",
														" invalide",
														schoolAssignmentImportReport.invalid > 1 ? "s" : ""
													] }),
													schoolAssignmentImportReport.unmatched.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
														"Non retrouvés (",
														schoolAssignmentImportReport.unmatched.length,
														") : ",
														schoolAssignmentImportReport.unmatched.slice(0, 8).join(" · "),
														schoolAssignmentImportReport.unmatched.length > 8 ? ` · +${schoolAssignmentImportReport.unmatched.length - 8}` : ""
													] }) : null
												]
											}) : null
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "school-assignment-list",
										children: [assignmentSchools.map((school) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: !school.portfolioOwner ? "is-unassigned" : "",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
												schoolId: school.externalId,
												children: school.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: [school.city, school.externalId ? `ID ${school.externalId}` : ""].filter(Boolean).join(" · ") || "Informations non renseignées" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "school-assignment-row-actions",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													value: school.portfolioOwner,
													onChange: (event) => assignSchoolPortfolioOwner(school.id, event.target.value),
													disabled: saving,
													"aria-label": `Responsable de ${school.name}`,
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "",
															children: "Non attribué"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "kelly",
															children: "Kelly"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "pierre",
															children: "Pierre"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "julie",
															children: "Julie"
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => openEditSchool(school),
													children: "Modifier"
												})]
											})]
										}, school.id)), !assignmentSchools.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aucun établissement ne correspond à ce filtre." }) : null]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "school-crm-layout",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "school-feed",
									children: [crmFeedItems.length ? crmFeedItems.map(({ school, event }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: `crm-post-card school-type-${school.schoolType}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "crm-post-date",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatJournalDate(event.date).split(" ")[0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: formatJournalDate(event.date).split(" ").slice(1).join(" ") })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "crm-post-body",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "crm-post-head",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "crm-school-links",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
															schoolId: school.externalId,
															children: school.name
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															onClick: () => setSelectedSchoolId(school.id),
															children: "Fiche CRM"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `school-type-pill school-type-${school.schoolType}`,
														children: schoolTypeLabels[school.schoolType]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: schoolEventKindLabels[event.kind] })] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: event.title || "Trace sans titre" }),
												event.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: event.note }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "school-meta crm-post-meta",
													children: [
														school.city && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: school.city }),
														(school.coordinator || school.contact) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: school.coordinator || school.contact }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: event.author })
													]
												}),
												event.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "school-event-tags",
													children: event.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														onClick: () => setSchoolQuery(tag),
														children: ["#", tag]
													}, tag))
												}),
												renderSocialControls(event.likes, event.comments, () => {
													likeSchoolEvent(school.id, event.id);
												}, (formEvent) => {
													addSchoolEventComment(school.id, event.id, formEvent);
												}, event.title || school.name)
											]
										})]
									}, `${school.id}-${event.id}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "empty-state school-empty",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⌂" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: schools.length ? "Aucun post CRM trouvé" : "Premier établissement à ajouter" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: schools.length ? "Créez un post CRM ou ajustez les filtres." : "Ajoutez un établissement puis consignez chaque appel, rendez-vous, commentaire ou prochaine action." }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "empty-actions",
												children: [schools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "button primary",
													onClick: () => openSchoolEvent(),
													children: "Créer un post CRM"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "button quiet",
													onClick: openNewSchool,
													children: "Ajouter un établissement"
												})]
											})
										]
									}), schoolsWithoutEvents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
										className: "schools-without-posts",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Établissements sans historique" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: schoolsWithoutEvents.slice(0, 24).map((school) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setSelectedSchoolId(school.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `school-type-pill school-type-${school.schoolType}`,
													children: schoolTypeLabels[school.schoolType]
												}), school.name]
											}, school.id)) }),
											schoolsWithoutEvents.length > 24 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
												"+ ",
												schoolsWithoutEvents.length - 24,
												" autre(s) établissement(s), utilisez la recherche pour les retrouver."
											] })
										]
									})]
								}), selectedSchool && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
									className: `school-detail-card school-type-${selectedSchool.schoolType}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "school-detail-head",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "eyebrow",
												children: "Fiche établissement"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolAdminLink, {
												schoolId: selectedSchool.externalId,
												children: selectedSchool.name
											}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "close-button",
												onClick: () => setSelectedSchoolId(null),
												"aria-label": "Fermer la fiche établissement",
												children: "×"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "school-meta",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `school-type-pill school-type-${selectedSchool.schoolType}`,
													children: schoolTypeLabels[selectedSchool.schoolType]
												}),
												selectedSchool.externalId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["ID ", selectedSchool.externalId] }),
												selectedSchool.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedSchool.category }),
												selectedSchool.city && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedSchool.city }),
												selectedSchool.registeredCount !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													selectedSchool.registeredCount,
													" inscrit",
													selectedSchool.registeredCount > 1 ? "s" : ""
												] })
											]
										}),
										(selectedSchool.nextAction || selectedSchool.notes) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "school-summary school-detail-summary",
											children: [selectedSchool.nextAction && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Prochaine action" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedSchool.nextAction })] }), selectedSchool.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Notes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedSchool.notes })] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "school-imported-info",
											children: [
												selectedSchool.coordinator && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Coordinateur : ", selectedSchool.coordinator] }),
												selectedSchool.zone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedSchool.zone }),
												selectedSchool.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedSchool.address }),
												selectedSchool.department && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedSchool.department })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "school-detail-actions",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "button primary",
													onClick: () => openSchoolEvent(selectedSchool.id),
													children: "Ajouter un post"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "button quiet",
													onClick: () => openEditSchool(selectedSchool),
													children: "Modifier"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "button quiet danger-button",
													onClick: () => deleteSchool(selectedSchool.id),
													children: "Supprimer"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "school-detail-posts",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Derniers posts" }),
												selectedSchool.events.slice(0, 5).map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
													formatJournalDate(event.date),
													" · ",
													schoolEventKindLabels[event.kind]
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: event.title || excerpt(event.note, 80) })] }, event.id)),
												!selectedSchool.events.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aucun post CRM pour le moment." })
											]
										})
									]
								})]
							})
						]
					}) : appMode === "history" ? renderStudentHistorySection() : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "task-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Objectifs qualitatifs" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: `${qualitativeObjectives.length} objectif${qualitativeObjectives.length > 1 ? "s" : ""} d'equipe` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "filters",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button quiet",
									onClick: () => {
										loadObjectives();
									},
									disabled: saving,
									children: "↻ Actualiser"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button primary",
									onClick: openNewQualitativeObjective,
									disabled: saving,
									children: "＋ Nouvel objectif"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "objective-list",
							children: qualitativeObjectives.length ? qualitativeObjectives.map((objective) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: `qualitative-objective status-${objective.status}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "objective-row-head",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `status-pill status-${objective.status}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "status-dot" }), objectiveStatusLabels[objective.status]]
										}), (objective.startDate || objective.endDate) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "duration-pill",
											children: [objective.startDate ? formatDate(objective.startDate) : "Date libre", objective.endDate ? ` → ${formatDate(objective.endDate)}` : ""]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: objective.title }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: objective.description || "Aucune description ajoutee." }),
									objective.progressNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
										className: "objective-note",
										children: ["Avancement : ", objective.progressNote]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "objective-tags",
										children: objective.personIds.length ? objective.personIds.map((personId) => {
											const person = peopleById.get(personId);
											if (!person) return null;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "objective-person",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "avatar",
													children: ownerInitials(person.name)
												}), person.name]
											}, person.id);
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Aucune personne taguee." })
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "row-actions",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button quiet",
										onClick: () => openObjective(objective),
										children: "Modifier"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "icon-button danger-icon",
										onClick: () => deleteObjective(objective.id),
										"aria-label": `Supprimer ${objective.title}`,
										children: "×"
									})]
								})]
							}, objective.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "empty-state",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "◎" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucun objectif qualitatif" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ajoutez un cap pour une personne ou un petit groupe, avec une date cible si besoin." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button primary",
										onClick: openNewQualitativeObjective,
										children: "Creer le premier objectif"
									})
								]
							})
						})]
					})
				]
			}),
			editorOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setEditorOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "editor-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: editingId ? "Modification" : "Nouvelle tache"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "editor-title",
							children: editingId ? "Mettre a jour la tache" : "Que faut-il faire ?"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "close-button",
							onClick: () => setEditorOpen(false),
							"aria-label": "Fermer",
							children: "×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: saveTask,
						className: "task-form",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tache *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									autoFocus: true,
									required: true,
									value: draft.title,
									onChange: (event) => setDraft({
										...draft,
										title: event.target.value
									}),
									placeholder: "Ex. Preparer la reunion mensuelle"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 3,
									value: draft.description,
									onChange: (event) => setDraft({
										...draft,
										description: event.target.value
									}),
									placeholder: "Ajoutez les informations utiles..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assigner a une personne" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: draft.assigneeId || "",
									onChange: (event) => selectAssignee(event.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Aucune personne enregistree"
									}), activePeople.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: person.id,
										children: [person.name, person.hasEmail ? " - email enregistre" : " - sans email"]
									}, person.id))]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Responsable *" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										required: true,
										list: "owners",
										value: draft.owner,
										onChange: (event) => setDraft({
											...draft,
											owner: event.target.value,
											assigneeId: null
										}),
										placeholder: "Prenom ou equipe"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
										id: "owners",
										children: owners.map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: owner }, owner))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Priorite" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: draft.priority,
									onChange: (event) => setDraft({
										...draft,
										priority: event.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "low",
											children: "Basse"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "medium",
											children: "Moyenne"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "high",
											children: "Haute"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Statut" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: draft.status,
									onChange: (event) => setDraft({
										...draft,
										status: event.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "todo",
											children: "A faire"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "progress",
											children: "En cours"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "done",
											children: "Terminee"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Duree estimee ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "(heures)" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: "0",
									step: "0.25",
									value: draft.estimatedHours ?? "",
									onChange: (event) => setDraft({
										...draft,
										estimatedHours: event.target.value ? Number(event.target.value) : null
									}),
									placeholder: "Ex. 2.5"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date de debut *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									type: "date",
									value: draft.startDate,
									onChange: (event) => setDraft({
										...draft,
										startDate: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Date de fin ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "(facultative)" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									min: draft.startDate,
									value: draft.endDate,
									onChange: (event) => setDraft({
										...draft,
										endDate: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field checkbox-field verification-toggle-field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: draft.verified,
									onChange: (event) => setDraft({
										...draft,
										verified: event.target.checked
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Tâche vérifiée ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "facultatif" })] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Responsable vérification" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									list: "owners",
									value: draft.verificationOwner,
									onChange: (event) => setDraft({
										...draft,
										verificationOwner: event.target.value
									}),
									placeholder: "Prenom ou equipe"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Commentaire de vérification" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 2,
									value: draft.verificationComment,
									onChange: (event) => setDraft({
										...draft,
										verificationComment: event.target.value
									}),
									placeholder: "Ce qui a été contrôlé, point d'attention, validation..."
								})]
							}),
							draft.assigneeId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field checkbox-field assignment-email-field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: sendAssignmentEmail,
									disabled: !draftAssignee?.hasEmail || !assignmentChanged,
									onChange: (event) => setSendAssignmentEmail(event.target.checked)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Envoyer un email d'assignation", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: !draftAssignee?.hasEmail ? "pas d'email enregistre" : assignmentChanged ? "email enregistre" : "assignation inchangee : aucun nouvel email" })] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setEditorOpen(false),
									children: "Annuler"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "button primary",
									disabled: saving,
									children: saving ? "Sauvegarde..." : editingId ? "Enregistrer" : "Ajouter la tache"
								})]
							})
						]
					})]
				})
			}),
			recurringOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setRecurringOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "recurring-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: editingRecurringId ? "Modele recurrent" : "Nouveau modele"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "recurring-title",
							children: editingRecurringId ? "Modifier le modele" : "Creer un modele recurrent"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "close-button",
							onClick: () => setRecurringOpen(false),
							"aria-label": "Fermer",
							children: "×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: saveRecurringTask,
						className: "task-form",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tache type *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									autoFocus: true,
									required: true,
									value: recurringDraft.title,
									onChange: (event) => setRecurringDraft({
										...recurringDraft,
										title: event.target.value
									}),
									placeholder: "Ex. Envoyer le bilan hebdomadaire"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 3,
									value: recurringDraft.description,
									onChange: (event) => setRecurringDraft({
										...recurringDraft,
										description: event.target.value
									}),
									placeholder: "Informations reprises quand on cree une tache..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assigner a une personne" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: recurringDraft.assigneeId || "",
									onChange: (event) => selectRecurringAssignee(event.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Aucune personne enregistree"
									}), activePeople.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: person.id,
										children: [person.name, person.hasEmail ? " - email enregistre" : " - sans email"]
									}, person.id))]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Responsable *" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										required: true,
										list: "recurring-owners",
										value: recurringDraft.owner,
										onChange: (event) => setRecurringDraft({
											...recurringDraft,
											owner: event.target.value,
											assigneeId: null
										}),
										placeholder: "Prenom ou equipe"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
										id: "recurring-owners",
										children: owners.map((owner) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: owner }, owner))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Priorite" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: recurringDraft.priority,
									onChange: (event) => setRecurringDraft({
										...recurringDraft,
										priority: event.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "low",
											children: "Basse"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "medium",
											children: "Moyenne"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "high",
											children: "Haute"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Duree estimee ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "(heures)" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: "0",
									step: "0.25",
									value: recurringDraft.estimatedHours ?? "",
									onChange: (event) => setRecurringDraft({
										...recurringDraft,
										estimatedHours: event.target.value ? Number(event.target.value) : null
									}),
									placeholder: "Ex. 1.5"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "form-note",
								children: "Les dates ne sont pas stockees dans le modele. Elles seront choisies au moment de creer la vraie tache."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setRecurringOpen(false),
									children: "Annuler"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "button primary",
									disabled: saving,
									children: saving ? "Sauvegarde..." : editingRecurringId ? "Enregistrer" : "Ajouter le modele"
								})]
							})
						]
					})]
				})
			}),
			linkOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setLinkOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "link-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Lien partage"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "link-title",
							children: editingLinkId ? "Modifier le lien" : "Ajouter un lien"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "close-button",
							onClick: () => setLinkOpen(false),
							"aria-label": "Fermer",
							children: "×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: saveLink,
						className: "task-form",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nom du lien *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									autoFocus: true,
									required: true,
									value: linkDraft.title,
									onChange: (event) => setLinkDraft({
										...linkDraft,
										title: event.target.value
									}),
									placeholder: "Ex. Tableau des inscriptions"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 3,
									value: linkDraft.description,
									onChange: (event) => setLinkDraft({
										...linkDraft,
										description: event.target.value
									}),
									placeholder: "A quoi sert ce lien ?"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Lien *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									value: linkDraft.url,
									onChange: (event) => setLinkDraft({
										...linkDraft,
										url: event.target.value
									}),
									placeholder: "https://..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setLinkOpen(false),
									children: "Annuler"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "button primary",
									disabled: saving,
									children: saving ? "Sauvegarde..." : "Enregistrer"
								})]
							})
						]
					})]
				})
			}),
			journalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setJournalOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal notify-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "journal-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Journal de l’Étude Alpha"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "journal-title",
							children: editingJournalId ? "Modifier le post" : "Nouveau post"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "close-button",
							onClick: () => setJournalOpen(false),
							"aria-label": "Fermer",
							children: "×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: saveJournalPost,
						className: "task-form",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Titre *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									autoFocus: true,
									required: true,
									value: journalDraft.title,
									onChange: (event) => setJournalDraft({
										...journalDraft,
										title: event.target.value
									}),
									placeholder: "Ex. Ce qu'on retient de la journée"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Post *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									required: true,
									rows: 6,
									value: journalDraft.content,
									onChange: (event) => setJournalDraft({
										...journalDraft,
										content: event.target.value
									}),
									placeholder: "Décisions, apprentissages, petites victoires, points d'attention..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Auteur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: journalDraft.author,
									onChange: (event) => setJournalDraft({
										...journalDraft,
										author: event.target.value
									}),
									placeholder: authorName || "Equipe Alpha"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: journalDraft.publishedAt.slice(0, 10),
									onChange: (event) => setJournalDraft({
										...journalDraft,
										publishedAt: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tags" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: tagsToText(journalDraft.tags),
									onChange: (event) => setJournalDraft({
										...journalDraft,
										tags: normalizeTags(event.target.value)
									}),
									placeholder: "rentrée, organisation, victoire"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Personnes taguées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "recipient-list objective-recipient-list",
									children: activePeople.length ? activePeople.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "recipient-row",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: journalDraft.personIds.includes(person.id),
												onChange: (event) => toggleJournalPerson(person.id, event.target.checked)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "avatar",
												children: ownerInitials(person.name)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: person.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "personne taguée" })] })
										]
									}, person.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "no-comment",
										children: "Ajoutez d'abord des personnes pour les taguer."
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setJournalOpen(false),
									children: "Annuler"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "button primary",
									disabled: saving,
									children: saving ? "Sauvegarde..." : "Enregistrer"
								})]
							})
						]
					})]
				})
			}),
			communicationOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setCommunicationOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal notify-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "communication-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Communication de masse"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "communication-title",
							children: editingCommunicationId ? "Modifier la communication" : "Nouvelle communication"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "close-button",
							onClick: () => setCommunicationOpen(false),
							"aria-label": "Fermer",
							children: "×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: saveCommunication,
						className: "task-form",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Titre *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									autoFocus: true,
									required: true,
									value: communicationDraft.title,
									onChange: (event) => setCommunicationDraft({
										...communicationDraft,
										title: event.target.value
									}),
									placeholder: "Ex. Relance rentrée aux parents"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Publics concernés" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "recipient-list objective-recipient-list communication-audience-picker",
									children: communicationAudiences.map((audience) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "recipient-row",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: communicationDraft.audiences.includes(audience),
												onChange: (event) => toggleCommunicationAudience(audience, event.target.checked)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "avatar",
												children: communicationAudienceLabels[audience].slice(0, 1)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: communicationAudienceLabels[audience] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "groupe destinataire" })] })
										]
									}, audience))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Canal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: communicationDraft.channel,
									onChange: (event) => setCommunicationDraft({
										...communicationDraft,
										channel: event.target.value
									}),
									children: communicationChannels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: channel,
										children: channel
									}, channel))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Statut" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: communicationDraft.status,
									onChange: (event) => setCommunicationDraft({
										...communicationDraft,
										status: event.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "sent",
											children: "Envoyé"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "to-follow-up",
											children: "À relancer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "draft",
											children: "Brouillon"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "cancelled",
											children: "Annulé"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date d'envoi" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: communicationDraft.sentAt,
									onChange: (event) => setCommunicationDraft({
										...communicationDraft,
										sentAt: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date de relance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: communicationDraft.followUpDate,
									onChange: (event) => setCommunicationDraft({
										...communicationDraft,
										followUpDate: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Résumé du message" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 4,
									value: communicationDraft.messageSummary,
									onChange: (event) => setCommunicationDraft({
										...communicationDraft,
										messageSummary: event.target.value
									}),
									placeholder: "Sujet du message, information transmise, appel à action..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Destinataires nominatifs ", communicationDraft.channel === "SMS" ? "du SMS" : "(facultatif)"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										rows: 4,
										value: communicationDraft.recipients.join("\n"),
										onChange: (event) => setCommunicationDraft({
											...communicationDraft,
											recipients: event.target.value.split(/\r?\n/)
										}),
										placeholder: "Une personne par ligne, par exemple :\nAïcha Martin — 06 12 34 56 78\nLucas Dupont, candidat — 07 12 34 56 78"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Liste libre : tuteurs, candidats ayant postulé ou tout autre contact. Renseignez au moins un public ou un destinataire nominatif." })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Notes internes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 3,
									value: communicationDraft.notes,
									onChange: (event) => setCommunicationDraft({
										...communicationDraft,
										notes: event.target.value
									}),
									placeholder: "Retours observés, éléments à surveiller, prochaine étape..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tags" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: tagsToText(communicationDraft.tags),
									onChange: (event) => setCommunicationDraft({
										...communicationDraft,
										tags: normalizeTags(event.target.value)
									}),
									placeholder: "rentrée, relance, inscription"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Auteur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: communicationDraft.author,
									onChange: (event) => setCommunicationDraft({
										...communicationDraft,
										author: event.target.value
									}),
									placeholder: authorName || "Equipe Alpha"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setCommunicationOpen(false),
									children: "Annuler"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "button primary",
									disabled: saving || !communicationDraft.title.trim() || communicationDraft.audiences.length === 0 && communicationDraft.recipients.every((item) => !item.trim()),
									children: saving ? "Sauvegarde..." : "Enregistrer"
								})]
							})
						]
					})]
				})
			}),
			schoolWatchOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setSchoolWatchOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal notify-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "watch-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Établissement à suivre"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "watch-title",
							children: editingSchoolWatchId ? "Modifier le suivi" : "Nouveau suivi"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "close-button",
							onClick: () => setSchoolWatchOpen(false),
							"aria-label": "Fermer",
							children: "×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: saveSchoolWatchItem,
						className: "task-form",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Établissement *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									autoFocus: true,
									required: true,
									value: schoolWatchDraft.schoolId,
									onChange: (event) => setSchoolWatchDraft({
										...schoolWatchDraft,
										schoolId: event.target.value
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Choisir un établissement"
									}), schools.slice().sort((a, b) => a.name.localeCompare(b.name, "fr")).map((school) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: school.id,
										children: [
											school.name,
											" · ",
											schoolTypeLabels[school.schoolType],
											school.city ? ` · ${school.city}` : ""
										]
									}, school.id))]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Raison du suivi *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									required: true,
									rows: 3,
									value: schoolWatchDraft.reason,
									onChange: (event) => setSchoolWatchDraft({
										...schoolWatchDraft,
										reason: event.target.value
									}),
									placeholder: "Pourquoi cet établissement doit rester visible ?"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tags" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "crm-tag-picker",
									children: schoolWatchTags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: schoolWatchDraft.tags.includes(tag) ? "active" : "",
										onClick: () => toggleSchoolWatchTag(tag),
										children: tag
									}, tag))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Statut" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: schoolWatchDraft.status,
									onChange: (event) => setSchoolWatchDraft({
										...schoolWatchDraft,
										status: event.target.value
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "active",
										children: "Actif"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "resolved",
										children: "Résolu"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Auteur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolWatchDraft.author,
									onChange: (event) => setSchoolWatchDraft({
										...schoolWatchDraft,
										author: event.target.value
									}),
									placeholder: authorName || "Equipe Alpha"
								})]
							}),
							!editingSchoolWatchId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Commentaire initial" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 3,
									value: schoolWatchDraft.initialComment,
									onChange: (event) => setSchoolWatchDraft({
										...schoolWatchDraft,
										initialComment: event.target.value
									}),
									placeholder: "Premier contexte, détail du besoin ou point d'attention..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setSchoolWatchOpen(false),
									children: "Annuler"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "button primary",
									disabled: saving || !schoolWatchDraft.schoolId || !schoolWatchDraft.reason.trim(),
									children: saving ? "Sauvegarde..." : "Enregistrer"
								})]
							})
						]
					})]
				})
			}),
			schoolOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setSchoolOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "school-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Mini-CRM établissements"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "school-title",
							children: editingSchoolId ? "Modifier l&apos;établissement" : "Nouvel établissement"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "close-button",
							onClick: () => setSchoolOpen(false),
							"aria-label": "Fermer",
							children: "×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: saveSchool,
						className: "task-form",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nom de l'établissement *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									autoFocus: true,
									required: true,
									value: schoolDraft.name,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										name: event.target.value
									}),
									placeholder: "Ex. Collège Saint-Exupéry"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ID établissement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.externalId,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										externalId: event.target.value
									}),
									placeholder: "Ex. 123"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Type d'établissement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: schoolDraft.schoolType,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										schoolType: event.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "alpha",
											children: "Étude Alpha"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "mise-a-dispo",
											children: "Mise à disposition"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "mixed",
											children: "Mixte / autre"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Responsable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: schoolDraft.portfolioOwner,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										portfolioOwner: event.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Non attribué"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "kelly",
											children: "Kelly"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "pierre",
											children: "Pierre"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "julie",
											children: "Julie"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Catégorie" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.category,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										category: event.target.value
									}),
									placeholder: "Ex. Étude Alpha"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ville" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.city,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										city: event.target.value
									}),
									placeholder: "Ex. Paris"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Coordinateur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.coordinator,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										coordinator: event.target.value,
										contact: event.target.value
									}),
									placeholder: "Ex. Sophie Martin"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Inscrits" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: "0",
									step: "1",
									value: schoolDraft.registeredCount ?? "",
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										registeredCount: event.target.value ? Number(event.target.value) : null
									}),
									placeholder: "0"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Zone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.zone,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										zone: event.target.value
									}),
									placeholder: "Zone A"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Adresse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.address,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										address: event.target.value
									}),
									placeholder: "Adresse de l'établissement"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Département" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.department,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										department: event.target.value
									}),
									placeholder: "Département / code postal"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Prochaine action à mener" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.nextAction,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										nextAction: event.target.value
									}),
									placeholder: "Ex. Relancer la direction mardi"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Semaine à venir" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.upcomingWeek,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										upcomingWeek: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Séances passées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.pastSessions,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										pastSessions: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Semaine type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.typicalWeek,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										typicalWeek: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contrat signé" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.contractSigned,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										contractSigned: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Actions importées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolDraft.actions,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										actions: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Notes générales" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 3,
									value: schoolDraft.notes,
									onChange: (event) => setSchoolDraft({
										...schoolDraft,
										notes: event.target.value
									}),
									placeholder: "Contexte, relation, préférences, points importants..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setSchoolOpen(false),
									children: "Annuler"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "button primary",
									disabled: saving,
									children: saving ? "Sauvegarde..." : "Enregistrer"
								})]
							})
						]
					})]
				})
			}),
			schoolEventOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setSchoolEventOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "school-event-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Historique établissement"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "school-event-title",
							children: "Ajouter une trace"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "close-button",
							onClick: () => setSchoolEventOpen(false),
							"aria-label": "Fermer",
							children: "×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: saveSchoolEvent,
						className: "task-form",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Établissement *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									autoFocus: true,
									required: true,
									value: eventSchoolId || "",
									onChange: (event) => setEventSchoolId(event.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Choisir un établissement"
									}), schools.slice().sort((a, b) => a.name.localeCompare(b.name, "fr")).map((school) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: school.id,
										children: [
											school.name,
											" · ",
											schoolTypeLabels[school.schoolType],
											school.city ? ` · ${school.city}` : ""
										]
									}, school.id))]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: schoolEventDraft.kind,
									onChange: (event) => setSchoolEventDraft({
										...schoolEventDraft,
										kind: event.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "action",
											children: "Action réalisée"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "comment",
											children: "Commentaire"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "event",
											children: "Événement"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: schoolEventDraft.date.slice(0, 10),
									onChange: (event) => setSchoolEventDraft({
										...schoolEventDraft,
										date: event.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Titre" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolEventDraft.title,
									onChange: (event) => setSchoolEventDraft({
										...schoolEventDraft,
										title: event.target.value
									}),
									placeholder: "Ex. Appel avec la direction"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Commentaire / détail" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 4,
									value: schoolEventDraft.note,
									onChange: (event) => setSchoolEventDraft({
										...schoolEventDraft,
										note: event.target.value
									}),
									placeholder: "Ce qui a été fait, décidé, demandé, ou la prochaine étape..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tags CRM" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "crm-tag-picker",
									children: crmTagSuggestions.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: schoolEventDraft.tags.includes(tag) ? "active" : "",
										onClick: () => toggleSchoolEventTag(tag),
										children: tag
									}, tag))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tags libres" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: tagsToText(schoolEventDraft.tags),
									onChange: (event) => setSchoolEventDraft({
										...schoolEventDraft,
										tags: normalizeTags(event.target.value)
									}),
									placeholder: "Autre tag, besoin urgent..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Auteur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: schoolEventDraft.author,
									onChange: (event) => setSchoolEventDraft({
										...schoolEventDraft,
										author: event.target.value
									}),
									placeholder: authorName || "Equipe Alpha"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setSchoolEventOpen(false),
									children: "Annuler"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "button primary",
									disabled: saving || !schoolEventDraft.title.trim() && !schoolEventDraft.note.trim(),
									children: saving ? "Sauvegarde..." : "Ajouter à l'historique"
								})]
							})
						]
					})]
				})
			}),
			objectiveOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setObjectiveOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal notify-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "objective-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Objectif equipe"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "objective-title",
							children: editingObjectiveId ? "Modifier l'objectif" : "Nouvel objectif"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "close-button",
							onClick: () => setObjectiveOpen(false),
							"aria-label": "Fermer",
							children: "×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: saveObjective,
						className: "task-form",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Titre *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									value: objectiveDraft.title,
									onChange: (event) => setObjectiveDraft({
										...objectiveDraft,
										title: event.target.value
									}),
									placeholder: "Objectif septembre"
								})]
							}),
							objectiveDraft.kind === "counter" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Déjà atteint" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: "0",
										step: "1",
										value: objectiveDraft.currentValue ?? "",
										onChange: (event) => setObjectiveDraft({
											...objectiveDraft,
											currentValue: event.target.value ? Number(event.target.value) : null
										}),
										placeholder: "160"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Objectif total *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										required: true,
										type: "number",
										min: "1",
										step: "1",
										value: objectiveDraft.targetValue ?? "",
										onChange: (event) => setObjectiveDraft({
											...objectiveDraft,
											targetValue: event.target.value ? Number(event.target.value) : null
										}),
										placeholder: "2600"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unité" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: objectiveDraft.targetLabel,
										onChange: (event) => setObjectiveDraft({
											...objectiveDraft,
											targetLabel: event.target.value
										}),
										placeholder: "élèves"
									})]
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Statut" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: objectiveDraft.status,
										onChange: (event) => setObjectiveDraft({
											...objectiveDraft,
											status: event.target.value
										}),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "todo",
												children: "A preparer"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "progress",
												children: "En cours"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "done",
												children: "Atteint"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date de debut" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										value: objectiveDraft.startDate,
										onChange: (event) => setObjectiveDraft({
											...objectiveDraft,
											startDate: event.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date cible" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										min: objectiveDraft.startDate || void 0,
										value: objectiveDraft.endDate,
										onChange: (event) => setObjectiveDraft({
											...objectiveDraft,
											endDate: event.target.value
										})
									})]
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 3,
									value: objectiveDraft.description,
									onChange: (event) => setObjectiveDraft({
										...objectiveDraft,
										description: event.target.value
									}),
									placeholder: "Pourquoi cet objectif compte, ou comment l'equipe doit s'organiser..."
								})]
							}),
							objectiveDraft.kind === "qualitative" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Commentaire d'avancement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 2,
									value: objectiveDraft.progressNote,
									onChange: (event) => setObjectiveDraft({
										...objectiveDraft,
										progressNote: event.target.value
									}),
									placeholder: "Dernier point d'avancement, blocage, prochaine étape..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "field full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Personnes taguees" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "recipient-list objective-recipient-list",
									children: activePeople.length ? activePeople.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "recipient-row",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: objectiveDraft.personIds.includes(person.id),
												onChange: (event) => toggleObjectivePerson(person.id, event.target.checked)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "avatar",
												children: ownerInitials(person.name)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: person.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: person.hasEmail ? "email enregistre" : "email manquant" })] })
										]
									}, person.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "no-comment",
										children: "Ajoutez d'abord des personnes pour les taguer."
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setObjectiveOpen(false),
									children: "Annuler"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "button primary",
									disabled: saving,
									children: saving ? "Sauvegarde..." : "Enregistrer"
								})]
							})
						]
					})]
				})
			}),
			peopleOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setPeopleOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal people-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "people-title",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-header",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Equipe"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "people-title",
								children: "Personnes et notifications"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "close-button",
								onClick: () => setPeopleOpen(false),
								"aria-label": "Fermer",
								children: "×"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: savePerson,
							className: "task-form people-form",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nom *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										required: true,
										value: personDraft.name,
										onChange: (event) => setPersonDraft({
											...personDraft,
											name: event.target.value
										}),
										placeholder: "Ex. Sophie"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Email masque" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "email",
										value: personDraft.email,
										onChange: (event) => setPersonDraft({
											...personDraft,
											email: event.target.value
										}),
										placeholder: personDraft.id ? "Laisser vide pour conserver" : "exemple@domaine.fr"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field checkbox-field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: personDraft.active,
										onChange: (event) => setPersonDraft({
											...personDraft,
											active: event.target.checked
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Personne active" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-actions",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "button quiet",
										onClick: () => setPersonDraft(emptyPersonDraft),
										children: "Nouveau"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										className: "button primary",
										disabled: saving,
										children: "Sauvegarder"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "people-list",
							children: people.length ? people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "person-row",
								onClick: () => openPerson(person),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "avatar",
									children: ownerInitials(person.name)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: person.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
									person.active ? "Active" : "Inactive",
									" · ",
									person.hasEmail ? "email enregistre" : "email manquant"
								] })] })]
							}, person.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "no-comment people-empty",
								children: "Aucune personne enregistree."
							})
						})
					]
				})
			}),
			selectedTask && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "drawer-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setSelectedId(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "drawer",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "detail-title",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "drawer-header",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "drawer-pills",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `status-pill status-${selectedTask.status}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "status-dot" }), statusLabels[selectedTask.status]]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `priority-pill priority-${selectedTask.priority}`,
									children: priorityLabels[selectedTask.priority]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "close-button",
								onClick: () => setSelectedId(null),
								"aria-label": "Fermer",
								children: "×"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "detail-title",
							children: selectedTask.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "detail-description",
							children: selectedTask.description || "Aucune description ajoutee."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "detail-grid",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Responsable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "owner",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "avatar",
										children: ownerInitials(peopleById.get(selectedTask.assigneeId || "")?.name || selectedTask.owner)
									}), peopleById.get(selectedTask.assigneeId || "")?.name || selectedTask.owner]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: selectedTask.endDate ? "Periode" : "Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [formatFullDate(selectedTask.startDate), selectedTask.endDate && selectedTask.endDate !== selectedTask.startDate ? ` -> ${formatFullDate(selectedTask.endDate)}` : ""] })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Duree estimee" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatDuration(selectedTask.estimatedHours) })] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `verification-panel ${selectedTask.verified ? "is-verified" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "verification-badge",
								children: selectedTask.verified ? "✓ Vérifiée" : "À vérifier"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedTask.verificationOwner || "Aucun responsable de vérification" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: selectedTask.verificationComment || "Aucun commentaire de vérification." })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "quick-status",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Avancement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: [
								"todo",
								"progress",
								"done"
							].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => changeStatus(selectedTask.id, status),
								className: selectedTask.status === status ? "active" : "",
								disabled: saving,
								children: statusLabels[status]
							}, status)) })]
						}),
						selectedTask.status === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "completion-box-panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "button primary",
								onClick: () => openCompletionNotice(selectedTask),
								children: "Choisir qui notifier"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: selectedTask.completionNotifications.length ? `${selectedTask.completionNotifications.length} notification(s) deja envoyee(s).` : "Aucune notification de fin envoyee." })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "comments-section",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: ["Commentaires ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedTask.comments.length })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: addComment,
									className: "comment-form",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "author-field",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Votre nom" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: authorName,
												onChange: (event) => setAuthorName(event.target.value),
												placeholder: "Ex. Sophie"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											rows: 3,
											value: comment,
											onChange: (event) => setComment(event.target.value),
											placeholder: "Ou en est cette tache ? Ajoutez une note...",
											"aria-label": "Nouveau commentaire"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "button primary",
											disabled: !comment.trim() || !authorName.trim() || saving,
											type: "submit",
											children: "Ajouter la note"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "comment-list",
									children: selectedTask.comments.length ? selectedTask.comments.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "comment",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "comment-mark",
											children: "●"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item.text }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
											item.author,
											" · ",
											new Intl.DateTimeFormat("fr-FR", {
												dateStyle: "medium",
												timeStyle: "short"
											}).format(new Date(item.createdAt))
										] })] })]
									}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "no-comment",
										children: "Aucun commentaire pour le moment."
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "drawer-actions",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "button quiet",
								onClick: () => openEditTask(selectedTask),
								children: "Modifier"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "button danger",
								onClick: () => deleteTask(selectedTask.id),
								disabled: saving,
								children: "Supprimer"
							})]
						})
					]
				})
			}),
			notifyOpen && notifyTask && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setNotifyOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal notify-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "notify-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Tache terminee"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "notify-title",
							children: "Choisir les destinataires"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "close-button",
							onClick: () => setNotifyOpen(false),
							"aria-label": "Fermer",
							children: "×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: sendCompletionNotice,
						className: "notify-form",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "detail-description",
								children: [
									"Selectionnez les personnes qui doivent recevoir un email indiquant clairement que la tache “",
									notifyTask.title,
									"” est terminee."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "recipient-list",
								children: notifiablePeople.length ? notifiablePeople.map((person) => {
									const alreadyNotified = notifyTask.completionNotifications.some((item) => item.personId === person.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: `recipient-row ${!person.hasEmail ? "disabled" : ""}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												disabled: !person.hasEmail,
												checked: notifyRecipients.includes(person.id),
												onChange: (event) => {
													setNotifyRecipients((current) => event.target.checked ? [...current, person.id] : current.filter((id) => id !== person.id));
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "avatar",
												children: ownerInitials(person.name)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: person.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [person.hasEmail ? "email enregistre" : "email manquant", alreadyNotified ? " · deja notifie" : ""] })] })
										]
									}, person.id);
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "no-comment",
									children: "Ajoutez d'abord des personnes."
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button quiet",
									onClick: () => setNotifyOpen(false),
									children: "Annuler"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "button primary",
									disabled: !notifyRecipients.length || notifying,
									children: notifying ? "Envoi..." : "Envoyer"
								})]
							})
						]
					})]
				})
			}),
			selectedTutorReport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				role: "presentation",
				onMouseDown: (event) => event.target === event.currentTarget && setSelectedTutorReportKey(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "modal notify-modal tutor-detail-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "tutor-detail-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Historique bilans tuteur"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "tutor-detail-title",
							children: tutorDisplayName(selectedTutorReport)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "close-button",
							onClick: () => setSelectedTutorReportKey(null),
							"aria-label": "Fermer",
							children: "×"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "tutor-detail-body",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "tutor-detail-metrics",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bilans non faits" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedTutorReport.totalMissing })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dates concernées" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedTutorReport.dateCount })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Élèves cumulés" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedTutorReport.totalStudents })] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "tutor-detail-info",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["ID : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedTutorReport.tutorId || "—" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Téléphone : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedTutorReport.phone || "—" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Établissements : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedTutorReport.schools.join(", ") || "—" })] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "tutor-detail-global-comment",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Commentaire général" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: tutorReportCommentByKey.get(selectedTutorReport.key) || "Aucun commentaire général pour ce tuteur." })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "tutor-detail-timeline",
								children: selectedTutorReport.dates.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatFullDate(item.date) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.school || "Établissement non renseigné" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [
										item.missingReportCount,
										" bilan",
										item.missingReportCount > 1 ? "s" : ""
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										item.studentCount,
										" élève",
										item.studentCount > 1 ? "s" : ""
									] }),
									item.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item.comment })
								] }, `${selectedTutorReport.key}-${item.date}-${item.school}-${index}`))
							})
						]
					})]
				})
			}),
			toast && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "toast",
				role: "status",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✓" }), toast]
			})
		]
	});
}
//#endregion
export { Home as default };
