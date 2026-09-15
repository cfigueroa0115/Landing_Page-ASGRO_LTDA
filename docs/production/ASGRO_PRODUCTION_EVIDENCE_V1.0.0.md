# ASGRO Web — Production Evidence Matrix (v1.0.0)

> Evidencia consolidada del release productivo `v1.0.0-production`
> (2026-09-15). No contiene secretos.

| Control | Evidence | Result |
|---------|----------|--------|
| GitHub PR | PR #1 (`redesign-seguros-first` → `master`) | PASS |
| master commit | `1d21c6589cd986041a729173cddff43c5e9c48d8` | PASS |
| Release Candidate | `01a208aa22a47f966519c1d9f4561d1ad9275e5f` | PASS |
| RC == production tree | trees idénticos (`a55912f8…`) | PASS |
| Amplify production job | 11 | PASS |
| Build | SUCCESS | PASS |
| Preview QA | Completed | PASS |
| Master QA | Completed | PASS |
| Canonical domain | https://asgroseguros.com.co | PASS |
| HTTPS | Valid | PASS |
| www redirect | 301 → apex | PASS |
| Path preservation | Preserved | PASS |
| Contact | Funcional | PASS |
| Contact receipt + reference | ASGRO-C-XXXXXXXX | PASS |
| Quote | Funcional | PASS |
| Email (contacto/cotización) | Entregado | PASS |
| Reply-To | Email del visitante | PASS |
| Reset formulario + Select | Limpio | PASS |
| AI (Asesora Virtual) | Funcional | PASS |
| KB V2 | 24 filas / 23 elegibles / 1 pending | PASS |
| Diagnostics endpoint | `/api/diagnostics/runtime` → 404 (removed) | PASS |

## Amplify / entornos

| Elemento | Valor |
|----------|-------|
| App | `ASGRO-Web-Prod` |
| App ID | `d2a24og78z38ro` |
| Production branch | `master` (Auto Build OFF) |
| Production technical URL | https://master.d2a24og78z38ro.amplifyapp.com |
| Preview branch | `redesign-seguros-first` |
| Preview URL | https://redesign-seguros-first.d2a24og78z38ro.amplifyapp.com |

## Release

| Elemento | Valor |
|----------|-------|
| Tag | `v1.0.0-production` → `1d21c6589cd986041a729173cddff43c5e9c48d8` |
| GitHub Release | ASGRO Web v1.0.0 — Production (STABLE) |
| Production date | 2026-09-15 |
