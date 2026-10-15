import { a as require_react, o as __toESM, t as require_jsx_runtime } from "../index.js";
//#region app/access/page.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function AccessPage() {
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function submitAccess(event) {
		event.preventDefault();
		setLoading(true);
		setError("");
		try {
			if (!(await fetch("/api/access", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code })
			})).ok) throw new Error("bad-code");
			const next = new URLSearchParams(window.location.search).get("next") || "/";
			window.location.href = next.startsWith("/") ? next : "/";
		} catch {
			setError("Code incorrect. Vérifiez les majuscules, minuscules et underscores.");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "access-page",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "access-card",
			"aria-labelledby": "access-title",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "access-mark",
					"aria-hidden": "true",
					children: "α"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Alpha Education"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					id: "access-title",
					children: "Accès à l’application"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Entrez le code partagé avec l’équipe pour ouvrir le cockpit Alpha." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submitAccess,
					className: "access-form",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Code d’accès" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							value: code,
							onChange: (event) => setCode(event.target.value),
							placeholder: "Entrez le code d’accès",
							type: "password",
							autoComplete: "current-password"
						})] }),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "access-error",
							role: "alert",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button primary",
							type: "submit",
							disabled: loading || !code.trim(),
							children: loading ? "Vérification..." : "Entrer"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { AccessPage as default };
