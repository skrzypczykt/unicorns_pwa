# Production Deployment Plan - Unicorns PWA

## Przegląd

Kompleksowy plan wdrożenia aplikacji Unicorns PWA na środowisko produkcyjne.

**Cel:** Bezpieczne, stopniowe przejście z development/staging do production z minimum downtime.

---

## Przed Deploymentem

### Checklist Pre-Production

- [ ] **Kod gotowy**
  - Wszystkie feature branches zmergowane do `main`
  - Code review przeprowadzony
  - Brak znanych critical bugs
  - Version bumped (zgodnie z [VERSIONING.md](../guides/VERSIONING.md))
  - CHANGELOG.md zaktualizowany

- [ ] **Testy przeszły**
  - Unit tests: 80%+ coverage, all green
  - Integration tests: all green
  - E2E tests: critical paths green
  - Manual testing checklist wypełniony
  - Performance: Lighthouse > 90

- [ ] **Infrastruktura gotowa**
  - Production Supabase project utworzony
  - Production Netlify site utworzony
  - Custom domain skonfigurowana (opcjonalnie)
  - SSL certificate aktywny
  - CDN włączony

- [ ] **Konfiguracja**
  - Environment variables ustawione (production)
  - Autopay production credentials gotowe
  - SMTP dla emaili skonfigurowany
  - Cloudinary production account gotowy
  - Monitoring/alerting skonfigurowane

- [ ] **Backup plan**
  - Database backup strategy
  - Rollback procedure documented
  - Downtime communication prepared

---

## Faza 1: Przygotowanie Infrastruktury

### 1.1 Supabase Production Setup

**Krok 1: Utwórz Production Project**

```
1. https://supabase.com/dashboard → New Project
2. Nazwa: "Unicorns PWA Production"
3. Database Password: [SECURE - zapisz w password manager]
4. Region: Europe West (Frankfurt) - najbliżej Polsk i
5. Plan: Free (póki nie przekroczymy limitów)
```

**Krok 2: Zapisz Credentials**

```bash
# .env.production
SUPABASE_URL=https://[production-ref].supabase.co
SUPABASE_ANON_KEY=[production-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[production-service-key]
```

⚠️ **Nie commituj .env.production do repo!**

**Krok 3: Apply Database Migrations**

```bash
# Link do production project
npx supabase link --project-ref [production-ref]

# Push wszystkie migracje sekwencyjnie
npx supabase db push

# LUB manual (jeśli CLI nie działa):
# 1. Supabase Dashboard → SQL Editor
# 2. Paste każdą migrację po kolei (001, 002, 003...)
# 3. Run
# 4. Verify w Table Editor
```

**Krok 4: Seed Initial Data (opcjonalnie)**

```bash
# Tylko initial data (sekcje, activity types)
# NIE seed testowych użytkowników
psql [production-url] -f supabase/seed-production.sql
```

**Krok 5: Configure Auth**

```
Supabase Dashboard → Authentication → URL Configuration:
- Site URL: https://unicorns.app (lub twoja domena)
- Redirect URLs: 
  - https://unicorns.app/**
  - https://unicorns.app/auth/callback
  - https://unicorns.app/payment-success

Email Templates → Custom SMTP:
- SMTP Host: smtp.sendgrid.net
- Port: 587
- Username: apikey
- Password: [SendGrid API Key]
```

**Krok 6: Deploy Edge Functions**

```bash
# Deploy wszystkie functions
npx supabase functions deploy payment-initiate
npx supabase functions deploy autopay-webhook
npx supabase functions deploy generate-recurring-activities
npx supabase functions deploy generate-recurring-activities-cron

# Set secrets
npx supabase secrets set AUTOPAY_SERVICE_ID=[production-service-id]
npx supabase secrets set AUTOPAY_SHARED_KEY=[production-shared-key]
npx supabase secrets set FRONTEND_URL=https://unicorns.app
npx supabase secrets set CLOUDINARY_CLOUD_NAME=[cloud-name]
# ... (zobacz SUPABASE_SECRETS.md)
```

### 1.2 Netlify Production Setup

**Krok 1: Utwórz Production Site**

```
1. Netlify Dashboard → Add new site → Import from Git
2. Connect GitHub repo: skrzypczykt/unicorns_pwa
3. Branch: main
4. Build command: cd frontend && npm run build
5. Publish directory: frontend/dist
```

**Krok 2: Environment Variables**

```
Netlify → Site settings → Environment variables:

VITE_SUPABASE_URL=[production supabase url]
VITE_SUPABASE_ANON_KEY=[production anon key]
VITE_AUTOPAY_SERVICE_ID=[production service id]
VITE_CLOUDINARY_CLOUD_NAME=[cloud name]
NODE_VERSION=18
```

**Krok 3: Custom Domain (opcjonalnie)**

```
Netlify → Domain settings → Add custom domain
- Domain: unicorns.app (lub subdomena)
- Configure DNS:
  - Type: A
  - Name: @
  - Value: 75.2.60.5 (Netlify load balancer)
  
  - Type: CNAME
  - Name: www
  - Value: [site-name].netlify.app

- Enable HTTPS (automatic Let's Encrypt)
```

**Krok 4: Deploy Settings**

```
Build settings:
- Build command: cd frontend && npm run build
- Publish directory: frontend/dist
- Node version: 18

Deploy contexts:
- Production branch: main
- Branch deploys: All (dla feature preview)
- Deploy previews: Any pull request
```

### 1.3 Autopay Production Setup

**Krok 1: Przejdź z Sandbox na Production**

```
1. Autopay Panel → Przejdź na środowisko produkcyjne
2. Zapisz nowe credentials:
   - Service ID: [production-id]
   - Shared Key: [production-key]
   - Gateway URL: https://pay.autopay.eu/payment (bez "test")
```

**Krok 2: Configure Webhook ITN URL**

```
Autopay Panel → Ustawienia → ITN URL:
https://[production-ref].supabase.co/functions/v1/autopay-webhook

Test connection: Autopay wyśle test ITN
Verify: Check Supabase Edge Function logs
```

**Krok 3: Payment Methods**

```
Enable:
- BLIK (GatewayID=509)
- PayByLink/PBL (GatewayID=106)

Disable (jeśli nie używane):
- Karty płatnicze
```

---

## Faza 2: Deployment Workflow

### 2.1 Pre-Deployment Steps (48h przed)

1. **Code Freeze**
   ```bash
   # Ostatni merge do main
   git checkout main
   git pull origin main
   
   # Tag release
   git tag v1.0.0-rc1
   git push origin v1.0.0-rc1
   ```

2. **Final Testing on Staging**
   ```bash
   # Deploy to staging
   netlify deploy --site=unicorns-staging --prod
   
   # Manual testing checklist
   # E2E smoke tests
   # Payment integration test (test environment)
   ```

3. **Database Backup (Production)**
   ```bash
   # Supabase Dashboard → Database → Backups
   # Create manual backup przed deployment
   ```

4. **Communication**
   ```
   Email do użytkowników (jeśli breaking changes):
   "W niedzielę 28.04 od 22:00-23:00 będzie krótka przerwa techniczna."
   ```

### 2.2 Deployment Day

**Maintenance Window: Niedziela 22:00-23:00 (minimalne użycie)**

**22:00 - Start**

1. **Enable Maintenance Mode** (opcjonalnie)
   ```typescript
   // frontend/src/App.tsx - dodaj na górze
   const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === 'true'
   
   if (MAINTENANCE_MODE) {
     return <MaintenancePage />
   }
   ```
   
   ```bash
   # Netlify env var
   VITE_MAINTENANCE_MODE=true
   
   # Redeploy
   netlify deploy --prod
   ```

**22:10 - Database Migration**

2. **Apply Migrations**
   ```bash
   # Option A: CLI
   npx supabase db push
   
   # Option B: Manual (jeśli CLI fail)
   # Supabase Dashboard → SQL Editor
   # Run każdą migrację po kolei
   ```

3. **Verify Migrations**
   ```sql
   -- Check tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- Check RLS enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

**22:20 - Deploy Edge Functions**

4. **Deploy Functions**
   ```bash
   npx supabase functions deploy payment-initiate
   npx supabase functions deploy autopay-webhook
   npx supabase functions deploy generate-recurring-activities
   npx supabase functions deploy generate-recurring-activities-cron
   ```

5. **Set Production Secrets**
   ```bash
   # See SUPABASE_SECRETS.md for full list
   npx supabase secrets set AUTOPAY_SERVICE_ID=[prod-id]
   npx supabase secrets set AUTOPAY_SHARED_KEY=[prod-key]
   npx supabase secrets set FRONTEND_URL=https://unicorns.app
   ```

**22:30 - Deploy Frontend**

6. **Build & Deploy**
   ```bash
   # Local build test
   cd frontend
   npm run build
   
   # Deploy to Netlify
   git push origin main
   # Netlify auto-deploy triggered
   
   # Monitor deploy: https://app.netlify.com/sites/[site]/deploys
   ```

7. **Verify Deploy**
   ```bash
   # Check site live
   curl -I https://unicorns.app
   
   # Check version
   curl https://unicorns.app/version.txt
   # Should return: v1.0.0
   ```

**22:40 - Smoke Tests**

8. **Manual Verification**
   - [ ] Homepage loads
   - [ ] Login works
   - [ ] Activities list loads
   - [ ] Registration works
   - [ ] Payment initiation works (create pending transaction)
   - [ ] Admin panel accessible

9. **Payment Test** (realny test z małą kwotą)
   ```
   1. Login jako admin
   2. Utwórz test activity (1 zł)
   3. Zapisz się
   4. Opłać przez BLIK (użyj prawdziwego kodu)
   5. Verify webhook przyszedł
   6. Verify payment_status = 'paid'
   ```

**22:50 - Disable Maintenance Mode**

10. **Production Live**
    ```bash
    # Netlify env var
    VITE_MAINTENANCE_MODE=false
    
    # Redeploy
    netlify deploy --prod
    ```

**22:55 - Monitoring**

11. **Enable Alerts**
    ```
    - Sentry error tracking
    - Supabase logs streaming
    - Netlify analytics
    ```

**23:00 - Done**

12. **Post-Deployment Communication**
    ```
    Email: "Aplikacja Unicorns PWA jest już dostępna!"
    Social media: announce launch
    ```

---

## Faza 3: Post-Deployment

### 3.1 Monitoring (pierwsza tydzień)

**Daily Checks:**

- [ ] **Error Rate** (Sentry/Supabase logs)
  - Target: < 0.1% error rate
  - Alert jeśli > 1%

- [ ] **Performance** (Netlify Analytics)
  - Page load time < 3s
  - Lighthouse score > 90

- [ ] **Database** (Supabase Dashboard)
  - Disk usage < 400 MB (80% free tier)
  - Active connections < 50
  - Query performance (slow queries)

- [ ] **Payments** (Check transactions table)
  - All completed transactions have matching registrations
  - No stuck 'pending' > 24h
  - Webhook success rate > 99%

**Weekly:**

- [ ] Database backup verify
- [ ] Security audit (RLS policies still working)
- [ ] User feedback review

### 3.2 Rollback Procedure (Jeśli Coś Poszło Nie Tak)

**Scenario 1: Frontend Issue**

```bash
# Rollback Netlify deploy
netlify rollback --site=unicorns-pwa

# LUB deploy previous version:
git checkout v0.4.10
cd frontend && npm run build
netlify deploy --prod
```

**Scenario 2: Edge Function Issue**

```bash
# Revert function to previous version
git checkout HEAD~1 supabase/functions/payment-initiate/index.ts
npx supabase functions deploy payment-initiate
```

**Scenario 3: Database Migration Issue**

```bash
# Manual rollback migration
psql [production-url] -f scripts/rollbacks/050_rollback.sql

# Restore from backup (last resort)
# Supabase Dashboard → Database → Backups → Restore
```

**Scenario 4: Complete Rollback**

```bash
# 1. Enable maintenance mode
# 2. Restore DB from backup
# 3. Revert Edge Functions
# 4. Rollback frontend deploy
# 5. Notify users
```

---

## Faza 4: Skalowanie i Optymalizacja

### 4.1 Kiedy Upgrade z Free Tier?

**Supabase Free → Pro ($25/m):**
- Database > 400 MB
- Bandwidth > 4 GB/m
- Projekt pauza after 1 week (production!)

**Netlify Free → Pro ($19/m):**
- Bandwidth > 80 GB/m
- Build minutes > 250/m

**Cloudinary Free → Plus ($89/m):**
- Credits > 23/25 (>92% used)
- Potrzebujesz video transformations

### 4.2 Performance Optimizations

**Database:**
```sql
-- Add indexes for slow queries
CREATE INDEX idx_registrations_user_activity 
  ON registrations(user_id, activity_id);

-- Materialized view for dashboard stats
CREATE MATERIALIZED VIEW dashboard_stats AS
  SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users
  FROM users;
```

**Frontend:**
```typescript
// Code splitting
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

// Image optimization
<img 
  src="/images/hero.webp" 
  loading="lazy"
  decoding="async"
/>
```

**CDN:**
```toml
# netlify.toml
[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 4.3 Monitoring & Alerting Setup

**Sentry (Error Tracking)**

```bash
npm install @sentry/react
```

```typescript
// frontend/src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1
})
```

**Supabase Alerts**

```
Dashboard → Project Settings → Alerts:
- Database CPU > 80%
- Disk usage > 80%
- Edge Function errors > 10/min
```

**Uptime Monitoring**

```
UptimeRobot.com (darmowy):
- Monitor: https://unicorns.app
- Check interval: 5 min
- Alert contacts: email, SMS
```

---

## Checklist Deployment

### Pre-Deployment
- [ ] Code review completed
- [ ] All tests passing
- [ ] Version bumped
- [ ] CHANGELOG updated
- [ ] Staging tested
- [ ] Team notified
- [ ] Backup created

### Deployment
- [ ] Maintenance mode enabled
- [ ] Migrations applied
- [ ] Functions deployed
- [ ] Secrets set
- [ ] Frontend deployed
- [ ] Smoke tests passed
- [ ] Maintenance mode disabled

### Post-Deployment
- [ ] Monitoring enabled
- [ ] Real payment test done
- [ ] Users notified
- [ ] Documentation updated
- [ ] Rollback plan ready
- [ ] Team debriefing scheduled

---

## Environment Comparison

| | Development | Staging | Production |
|---|---|---|---|
| **Frontend** | localhost:5173 | staging.netlify.app | unicorns.app |
| **Supabase** | Local (54321) | Test project | Prod project |
| **Autopay** | Sandbox (testpay) | Sandbox | Production (pay) |
| **Domain** | localhost | *.netlify.app | unicorns.app |
| **SSL** | None | Netlify | Let's Encrypt |
| **Monitoring** | None | Basic | Full (Sentry) |
| **Backups** | None | Manual | Automated |

---

## Koszty Produkcji (Estimate)

**Miesiąc 1-3 (Free Tier):**
- Supabase: $0
- Netlify: $0
- Cloudinary: $0
- **Total: $0/m**

**Miesiąc 4-6 (Rosnący ruch):**
- Supabase Pro: $25/m
- Netlify Free: $0
- Cloudinary Free: $0
- **Total: $25/m**

**Rok 1 (Stabilny):**
- Supabase Pro: $25/m
- Netlify Pro: $19/m
- Cloudinary Plus: $89/m (jeśli dużo obrazów)
- **Total: $133/m**

**Savings:**
- GitHub repo images: oszczędza ~$20/m Cloudinary
- Static assets: oszczędza ~5 GB Netlify bandwidth

---

## Support & Escalation

**Problemy podczas deployment:**

1. **Database nie działa:**
   - Check Supabase status: status.supabase.com
   - Verify connection string
   - Check RLS policies

2. **Frontend 404:**
   - Verify Netlify build success
   - Check environment variables
   - Clear CDN cache

3. **Płatności nie działają:**
   - Verify Autopay credentials (production!)
   - Check webhook URL
   - Test hash generation

**Kontakt:**
- Supabase Support: support@supabase.io
- Netlify Support: support@netlify.com
- Autopay Support: [tel/email z panelu]

---

## Następne Kroki Po Launchie

**Tydzień 1:**
- [ ] Zbierz feedback użytkowników
- [ ] Fix critical bugs
- [ ] Monitor performance

**Miesiąc 1:**
- [ ] Implement analytics (GA4)
- [ ] Setup automated backups
- [ ] Security audit

**Kwartał 1:**
- [ ] Feature roadmap na Q2
- [ ] Optimize costs
- [ ] Scale infrastructure jeśli potrzeba

---

**Related Docs:**
- [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)
- [TESTING_STRATEGY.md](../guides/TESTING_STRATEGY.md)
- [SUPABASE_SECRETS.md](SUPABASE_SECRETS.md)
