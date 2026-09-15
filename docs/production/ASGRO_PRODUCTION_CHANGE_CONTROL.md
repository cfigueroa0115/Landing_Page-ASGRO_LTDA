# ASGRO Web — Production Change Control

> Flujo obligatorio para cualquier cambio que aspire a llegar a producción.
> Ningún paso es automático hacia producción; hay **dos** autorizaciones humanas
> explícitas (una para el PR/merge y otra para el deploy).

## Flujo

```
feature/change
    ↓
redesign-seguros-first
    ↓
Amplify Preview
    ↓
Automated tests
    ↓
Manual functional QA
    ↓
Human approval                      ← 1ª autorización humana explícita
    ↓
PR to master
    ↓
Review / checks
    ↓
Merge
    ↓
Auto Build remains OFF              ← el merge NO despliega
    ↓
Second human authorization          ← 2ª autorización humana explícita
    ↓
Manual Amplify RELEASE
    ↓
Technical master smoke test         ← https://master.d2a24og78z38ro.amplifyapp.com
    ↓
Canonical domain smoke test         ← https://asgroseguros.com.co
    ↓
Production accepted
```

## Reglas clave

1. Ningún cambio funcional se desarrolla directamente en `master`.
2. Todo cambio entra por `redesign-seguros-first` y despliega en Preview.
3. El PR `redesign-seguros-first → master` solo se abre tras QA + autorización.
4. `master` conserva **Auto Build = OFF**; el merge no autoriza deploy.
5. El deploy productivo requiere **segunda** autorización + Amplify RELEASE
   manual.
6. Se valida primero la URL técnica de master y luego el dominio canónico.
7. Cambios de **DNS, IAM, SSM, migración de DB, seed o asociación de dominio**
   requieren aprobación específica adicional.
