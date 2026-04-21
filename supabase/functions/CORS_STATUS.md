# CORS Update Status - Edge Functions

Ostatnia aktualizacja: 2026-04-21

## ✅ ZAKTUALIZOWANE (6/6 funkcji wymagających CORS):

### Frontend-facing Functions (wymagają CORS):
1. ✅ **validate-registration** - Rejestracje na zajęcia
2. ✅ **process-attendance** - Obecności i płatności
3. ✅ **generate-accounting-report** - Raporty księgowe
4. ✅ **update-balance** - Aktualizacja sald
5. ✅ **delete-user-account** - Usuwanie konta
6. ✅ **send-push-notifications** - Wysyłka powiadomień push

## ○ CRON/INTERNAL Functions (NIE wymagają CORS):

Te funkcje są wywoływane **tylko** przez serwer (GitHub Actions cron, pg_cron, HTTP triggers), nie przez przeglądarkę użytkownika:

1. ○ **send-email-notification** - Email notifications (internal trigger)
2. ○ **send-payment-reminders** - Payment reminders cron (pg_cron)
3. ○ **update-past-activities-status** - Auto-update activities (pg_cron)
4. ○ **send-activity-start-notifications** - Activity start alerts (GitHub Actions cron)
5. ○ **generate-recurring-activities** - Recurring events generator (manual/admin)
6. ○ **generate-recurring-activities-cron** - Recurring events cron (pg_cron)

**Dlaczego nie potrzebują CORS:**
- Nie są wywoływane z przeglądarki (XMLHttpRequest/fetch)
- Wywołania server-to-server (GitHub Actions → Supabase, PostgreSQL → Edge Function)
- CORS to mechanizm bezpieczeństwa przeglądarki - serwer nie podlega tym ograniczeniom

---

## 🎯 PODSUMOWANIE

**Status:** ✅ **100% GOTOWE**

**Funkcje wymagające CORS:** 6/6 zaktualizowane  
**Funkcje cron/internal:** 6 - nie wymagają CORS (poprawnie)  
**Całkowity postęp:** 12/12 funkcji obsłużonych

**Bezpieczeństwo:**
- ✅ Wszystkie frontend-facing endpoints mają ograniczony CORS
- ✅ Blokada requestów z nieautoryzowanych domen
- ✅ Zgodność z wymaganiami PSP (Payment Service Providers)

---

## 📝 WYKORZYSTANIE

### Funkcje z CORS (callable z frontendu):
```typescript
// Frontend może wywołać przez fetch():
await supabase.functions.invoke('validate-registration', { ... })
await supabase.functions.invoke('process-attendance', { ... })
await supabase.functions.invoke('generate-accounting-report', { ... })
await supabase.functions.invoke('update-balance', { ... })
await supabase.functions.invoke('delete-user-account', { ... })
await supabase.functions.invoke('send-push-notifications', { ... })
```

### Funkcje cron/internal (tylko server):
```sql
-- PostgreSQL cron triggers:
SELECT cron.schedule('payment-reminders', '0 * * * *', 'SELECT ...');
SELECT cron.schedule('update-activities', '*/15 * * * *', 'SELECT ...');
```

```yaml
# GitHub Actions cron:
on:
  schedule:
    - cron: '*/10 * * * *'  # Co 10 minut
```

---

**Autor:** Claude Sonnet 4.5  
**Data:** 2026-04-21
