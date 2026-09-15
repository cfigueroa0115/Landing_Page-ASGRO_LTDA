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

## 0. Contención inmediata

1. **STOP releases.** Detener cualquier promoción/deploy en curso.
2. **No cambiar DNS** salvo prueba objetiva de que el DNS es la causa raíz.
   (Un rollback de código estable no requiere tocar DNS.)
3. **Identificar el último release aprobado** (tag/commit; por defecto
   `v1.0.0-production` = `1d21c658…`).

## 1. Verificación de compatibilidad de base de datos (ANTES del rollback de app)

Antes de restaurar cualquier código de aplicación:

1. **Verificar compatibilidad** entre el código estable a restaurar y el schema
   productivo **actual**.
2. Si el release fallido incluyó **migraciones / cambios de schema / cambios de
   forma de datos**, **NO** desplegar automáticamente el código antiguo (podría
   ser incompatible con el schema vigente).
3. Evaluar la estrategia adecuada: **expand/contract** o **forward-fix** en lugar
   de un rollback ciego.
4. **Crear/verificar un backup o branch de Neon** antes de cualquier
   intervención de base de datos.
5. Cualquier rollback o migración de DB requiere **autorización explícita**.
6. **Evitar rollback destructivo** salvo un plan validado y aprobado.

## 2. Rollback de código compatible con gobernanza

El rollback NO se hace con checkout local ni revert directo sobre `master`, ni
con push directo a `master`. Sigue el mismo flujo gobernado que cualquier cambio:

1. Identificar el último release aprobado (tag/commit estable).
2. **Crear una rama de rollback** a partir de ese release aprobado.
3. Aplicar el revert / la restauración **en esa rama** (no en `master`).
4. Promover el contenido a **`redesign-seguros-first`**.
5. Desplegar **Preview** y verificar que despliega correctamente.
6. **Pruebas** funcionales y/o técnicas del rollback.
7. **Autorización humana** explícita (1ª).
8. Abrir **PR `redesign-seguros-first` → `master`**.
9. **Revisión / checks** del PR.
10. **Merge** (Auto Build de `master` permanece **OFF**; el merge no despliega).
11. **Segunda autorización humana** explícita.
12. **Amplify RELEASE manual** sobre `master`.
13. **Smoke test** de la master technical URL:
    https://master.d2a24og78z38ro.amplifyapp.com
14. **Smoke test** del dominio canónico: https://asgroseguros.com.co

> **Prohibido:** push directo a `master`, checkout local de `master` como
> mecanismo de rollback remoto, revert directo sobre `master`, o cualquier
> bypass del flujo Preview → PR → master.

## 3. Cierre

- **Registrar el incidente y la evidencia** (causa raíz, acciones, resultado,
  horarios, responsables).

---

## Notas

- Un merge a `master` **no** implica deploy: el deploy requiere Amplify RELEASE
  manual + segunda autorización humana (ver `ASGRO_PRODUCTION_CHANGE_CONTROL.md`).
- No eliminar el CNAME de validación ACM ni la rama `redesign-seguros-first`.
- Preferir siempre el rollback de **código** (reversible, vía flujo gobernado)
  antes que tocar DNS, IAM, SSM o base de datos.
