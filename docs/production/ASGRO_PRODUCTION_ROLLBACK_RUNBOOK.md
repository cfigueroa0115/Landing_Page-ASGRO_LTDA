# ASGRO Web — Production Rollback Runbook

> Procedimiento a seguir si una **futura** versión falla en producción. Este
> documento es guía operativa; no ejecuta ni autoriza acciones por sí mismo.
> Toda acción destructiva requiere autorización humana explícita.

Contexto de referencia:
- Release estable actual: `v1.0.0-production` → commit
  `1d21c6589cd986041a729173cddff43c5e9c48d8`.
- Amplify App: `ASGRO-Web-Prod` (`d2a24og78z38ro`), branch `master`,
  Auto Build **OFF**.
- Technical URL: https://master.d2a24og78z38ro.amplifyapp.com
- Canonical: https://asgroseguros.com.co

---

## Procedimiento

1. **STOP releases.** Detener cualquier promoción/deploy en curso.
2. **No cambiar DNS** salvo prueba objetiva de que el DNS es la causa raíz.
   (El sitio productivo estable no requiere cambios de DNS para un rollback de
   código.)
3. **Identificar el último release bueno** (tag/commit aprobado; por defecto
   `v1.0.0-production` = `1d21c658…`).
4. **Restaurar código** desde el commit/release aprobado (revert o checkout del
   commit estable en `master`, siguiendo el flujo de PR y autorización).
5. **Ejecutar Amplify RELEASE manual** sobre `master` (Auto Build permanece OFF;
   el deploy nunca es automático).
6. **Validar la master technical URL:** https://master.d2a24og78z38ro.amplifyapp.com
7. **Validar el canonical domain:** https://asgroseguros.com.co
8. **Base de datos:** **NO** realizar rollback destructivo sin autorización
   explícita.
9. **Antes de cualquier migración destructiva:** crear/validar un backup (Neon
   branch) y obtener aprobación específica.
10. **Registrar el incidente y la evidencia** (causa, acciones, resultado,
    horarios, responsables).

---

## Notas

- Un merge a `master` **no** implica deploy: el deploy requiere Amplify RELEASE
  manual + segunda autorización humana (ver `ASGRO_PRODUCTION_CHANGE_CONTROL.md`).
- No eliminar el CNAME de validación ACM ni la rama `redesign-seguros-first`.
- Preferir siempre el rollback de **código** (reversible) antes que tocar DNS,
  IAM, SSM o base de datos.
