# Konfiguracja Secrets dla Supabase Edge Functions

## Dodawanie secrets przez CLI

```bash
# 1. AUTOPAY_SERVICE_ID (ID usługi z panelu Autopay)
npx supabase secrets set AUTOPAY_SERVICE_ID=<twoje_service_id>

# 2. AUTOPAY_SHARED_KEY (Klucz współdzielony z panelu Autopay)
npx supabase secrets set AUTOPAY_SHARED_KEY=<twoj_shared_key>

# 3. AUTOPAY_GATEWAY_URL (dla testów: https://pay-accept.bm.pl)
npx supabase secrets set AUTOPAY_GATEWAY_URL=https://pay-accept.bm.pl

# 4. Weryfikacja czy zostały dodane
npx supabase secrets list
```

## Dodawanie secrets przez Dashboard

1. Przejdź do: https://supabase.com/dashboard/project/<PROJECT_ID>/settings/functions
2. Sekcja: **Edge Function Secrets**
3. Dodaj każdy secret osobno:
   - Name: `AUTOPAY_SERVICE_ID`, Value: ID z panelu Autopay
   - Name: `AUTOPAY_SHARED_KEY`, Value: Klucz współdzielony
   - Name: `AUTOPAY_GATEWAY_URL`, Value: `https://pay-accept.bm.pl`

## Secrets testowe Autopay

Dla środowiska testowego (pay-accept.bm.pl):

```bash
# ServiceID testowy Autopay
npx supabase secrets set AUTOPAY_SERVICE_ID=<podane_przez_autopay>

# SharedKey testowy
npx supabase secrets set AUTOPAY_SHARED_KEY=<podany_przez_autopay>

# Gateway URL
npx supabase secrets set AUTOPAY_GATEWAY_URL=https://pay-accept.bm.pl
```

## Weryfikacja w Edge Function

Edge Functions odczytują secrets przez:
```typescript
const serviceId = Deno.env.get('AUTOPAY_SERVICE_ID')
const sharedKey = Deno.env.get('AUTOPAY_SHARED_KEY')
const gatewayUrl = Deno.env.get('AUTOPAY_GATEWAY_URL')
```

## Ważne!

- Secrets są wspólne dla wszystkich Edge Functions w projekcie
- Po dodaniu secretu NIE TRZEBA redeploy'ować funkcji
- Secrets są dostępne natychmiast po zapisaniu
- Nie commituj secrets do git - tylko do Dashboard lub CLI
