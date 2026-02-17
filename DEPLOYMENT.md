# Guía de Despliegue a Producción - LegacyMark

## 📋 Resumen Ultra-Profesional

Este documento describe el proceso completo para desplegar y actualizar el sistema en producción **sin perder datos**.

---

## 🚀 Quick Start (Primera vez)

### 1. Preparar Base de Datos en Producción

**Opción A: Usar Vercel con Supabase/Neon**
```bash
# 1. Crear DB en Supabase/Neon (PostgreSQL)
# 2. Obtener DATABASE_URL
# 3. Agregar a Vercel Dashboard → Settings → Environment Variables
```

**Opción B: Railway (DB incluido)**
```bash
# Railway crea PostgreSQL automáticamente
# Solo conectar GitHub repo
```

### 2. Configurar Variables de Entorno

En tu plataforma de hosting (Vercel/Railway), agrega:

```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET="genera-con-openssl-rand-base64-32"
NEXTAUTH_URL="https://tudominio.com"
# ... resto de .env.example
```

### 3. Primer Deploy

```bash
# Conectar GitHub/GitLab repo a Vercel
# Vercel detecta Next.js automáticamente
# Click "Deploy"

# O manualmente:
vercel --prod
```

**Importante:** La primera vez, las migraciones se ejecutan automáticamente via `vercel-build` script.

---

## 🔄 Actualizaciones Continuas (Sin Perder Datos)

### Flujo Normal de Trabajo

```bash
# 1. Desarrollo Local
git checkout -b feature/nueva-funcionalidad

# 2. Si modificas schema.prisma
npm run db:migrate:dev --name descripcion_cambio
# Esto crea migration file en prisma/migrations/

# 3. Testear localmente
npm run dev

# 4. Commit y Push
git add .
git commit -m "feat: descripción"
git push origin feature/nueva-funcionalidad

# 5. Merge a main
# → Trigger automático de CI/CD
# → Migrations se aplican PRIMERO
# → Luego se despliega código nuevo
```

### ¿Qué Pasa en Producción?

```yaml
1. GitHub Actions detecta push
2. Run: npx prisma migrate deploy  # ✅ Aplica solo migraciones nuevas
3. Run: next build                 # Build nueva versión
4. Deploy a Vercel                 # Deploy zero-downtime
```

**Resultado:** Datos preservados, app actualizada ✅

---

## 🗄️ Migraciones de Base de Datos (Best Practices)

### ✅ Migraciones Seguras

```prisma
// Agregar campo nullable (siempre seguro)
model User {
  id    String
  phone String?  // ← Nuevo campo opcional
}
```

```bash
npm run db:migrate:dev --name add_user_phone
```

### ⚠️ Migraciones que Requieren Cuidado

**Cambiar tipo de campo:**
```prisma
// ❌ NO HACER: Cambio directo
model Product {
  price Int  // era Float
}

// ✅ HACER: En 2 pasos
model Product {
  price_old Float?  // Step 1
  price     Int     // Step 2
}

// Deploy 1: código soporta ambos
// Script: migrar datos price_old → price
// Deploy 2: eliminar price_old
```

**Renombrar campo:**
```sql
-- No usar Prisma, crear SQL manual
-- prisma/migrations/XXXXX_rename_field/migration.sql
ALTER TABLE users RENAME COLUMN old_name TO new_name;
```

### 🛡️ Rollback de Migración

```bash
# Si una migración falla en producción:
# 1. Revertir código
git revert HEAD
git push

# 2. Restaurar DB (si es necesario)
# Usar backup automático de Vercel/Railway
```

---

## 📊 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Start dev server
npm run db:studio        # Abrir Prisma Studio (UI de DB)
npm run db:migrate:dev   # Crear nueva migración

# Production Build (local)
npm run build            # Build para producción
npm start                # Start production server

# Database Management
npm run db:migrate:deploy  # Aplicar migraciones (producción)
npm run db:push            # Sync schema sin migrar (dev only)
npm run db:seed            # Seed datos iniciales

# Quality Checks
npm run type-check       # TypeScript check
npm run lint             # ESLint check
```

---

## 🔐 Seguridad

### Variables Críticas

```bash
# NUNCA commit estos valores:
AUTH_SECRET              # Secreto para JWT
DATABASE_URL             # Connection string con password
*_API_KEY                # API keys de servicios
*_SECRET                 # Cualquier secret
```

### .gitignore Verification

```bash
# Verificar que estés ignorando:
.env
.env.local
.env.production
*.log
```

---

## 📈 Monitoreo Post-Deploy

### Vercel Dashboard
1. Ir a proyecto en Vercel
2. Ver "Deployments" → Latest
3. Check "Functions" logs para errores
4. Ver "Analytics" para tráfico

### Health Checks

```bash
# Test producción después de deploy
curl https://tudominio.com/api/health

# Ver logs en tiempo real
vercel logs --follow
```

---

## 🆘 Troubleshooting

### "Migration failed in production"

```bash
# 1. Ver logs en Vercel
vercel logs

# 2. Verificar migraciones pendientes
npx prisma migrate status --schema=./prisma/schema.prisma

# 3. Aplicar manualmente si es necesario
# (con DATABASE_URL de producción en .env.local)
npx prisma migrate deploy
```

### "Build failing on Vercel"

```bash
# 1. Check local build
npm run build

# 2. Verificar que Prisma genera
npm run prisma:generate

# 3. Clear Vercel cache
# Vercel Dashboard → Deployments → ... → Redeploy
```

### "Database connection error"

```bash
# Verificar DATABASE_URL en Vercel
# Settings → Environment Variables

# Debe tener formato:
postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

---

## 📝 Checklist Pre-Deploy

- [ ] Todas las migraciones testeadas localmente
- [ ] `npm run build` exitoso
- [ ] `npm run type-check` sin errores críticos
- [ ] Variables de entorno configuradas en Vercel
- [ ] DATABASE_URL apunta a DB de producción
- [ ] NEXTAUTH_URL es el dominio de producción
- [ ] Backup de DB configurado (automático en plataformas)

---

## 🎯 Resultado Final

✅ **Deploy automático** en cada push a `main`
✅ **Migraciones aplicadas** automáticamente
✅ **Datos preservados** en todas las actualizaciones  
✅ **Zero-downtime** deploys
✅ **Rollback instantáneo** si es necesario

**Tu equipo puede seguir mejorando el sistema sin miedo a perder datos en producción.**
