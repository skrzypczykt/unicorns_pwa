# Strategia Przechowywania Zdjęć - Unicorns PWA

## Przegląd

Hybrydowe podejście minimalizujące koszty i maksymalizujące wydajność:
- **GitHub Repo** - statyczne, często wyświetlane zdjęcia (0 zł)
- **Cloudinary** - dynamiczne, user-generated content (darmowy tier: 25 kredytów/miesiąc)

---

## 📁 Podział Zasobów

### GitHub Repo (Static Assets)

**Lokalizacja:** `frontend/public/images/`

**Co przechowujemy:**
```
frontend/public/images/
├── sections/              # Zdjęcia sekcji (activity_types)
│   ├── fitness.webp      # 300x200, ~50 KB
│   ├── dance.webp
│   ├── yoga.webp
│   ├── aerial.webp
│   └── pole-dance.webp
├── home/                  # Hero images, backgrounds
│   ├── hero.webp         # 1920x1080, ~200 KB
│   ├── about.webp
│   └── cta-background.webp
├── trainers/              # Zdjęcia trenerów (opcjonalne)
│   └── placeholder.webp
└── common/                # Ikony, logo
    ├── logo.svg
    └── favicon.png
```

**Charakterystyka:**
- Deterministyczne ścieżki (nie zależą od bazy danych)
- Wersjonowane w git
- Dostępne offline (PWA cache)
- Zero kosztów bandwidth/storage
- CDN: Netlify (automatyczne)

**Limity:**
- Max ~50 zdjęć
- Max 1 MB/plik
- Total: < 100 MB dla całego folderu images/

---

### Cloudinary (Dynamic Assets)

**Co przechowujemy:**
- Avatary użytkowników (upload przez profil)
- Galerie zdjęć z wydarzeń (admin dodaje w CMS)
- Zdjęcia trenerów (jeśli będą uploadowane dynamicznie)
- User-generated content

**Charakterystyka:**
- Automatyczna optymalizacja (WebP/AVIF)
- Transformacje on-the-fly (thumbnails, crop, blur)
- Lazy loading plugins
- Responsive images

**Free tier limits:**
- 25 GB storage
- 25 GB bandwidth/miesiąc
- 25,000 transformacji/miesiąc

---

## 🚀 Implementacja Krok po Kroku

### Krok 1: Struktura Folderów

```bash
cd frontend/public
mkdir -p images/{sections,home,trainers,common}
```

### Krok 2: Dodanie Zdjęć Sekcji

**Wymagania:**
- Format: WebP (najlepsza kompresja)
- Rozdzielczość: 600x400 (2x dla Retina)
- Jakość: 85% (sweet spot)
- Rozmiar: < 100 KB/plik

**Konwersja (jeśli masz JPG/PNG):**
```bash
# Zainstaluj sharp-cli
npm install -g sharp-cli

# Konwertuj wszystkie obrazy
sharp -i input.jpg -o frontend/public/images/sections/fitness.webp -f webp -q 85

# Lub batch:
for file in *.jpg; do
  sharp -i "$file" -o "frontend/public/images/sections/${file%.jpg}.webp" -f webp -q 85
done
```

**Nazewnictwo:**
- Używaj slugów zgodnych z `activity_types.slug` w bazie
- Małe litery, myślniki zamiast spacji
- Przykład: `pole-dance.webp`, `fitness.webp`

### Krok 3: Update Komponentów

**Przykład: SectionCard**

```typescript
// frontend/src/components/SectionCard.tsx
interface SectionCardProps {
  section: ActivityType
}

export function SectionCard({ section }: SectionCardProps) {
  // Static path zamiast URL z bazy
  const imageUrl = `/images/sections/${section.slug}.webp`
  
  return (
    <div className="relative overflow-hidden rounded-xl">
      <img 
        src={imageUrl} 
        alt={section.name}
        loading="lazy"
        width="600"
        height="400"
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3>{section.name}</h3>
      </div>
    </div>
  )
}
```

**Fallback dla brakujących zdjęć:**

```typescript
export function SectionCard({ section }: SectionCardProps) {
  const imageUrl = `/images/sections/${section.slug}.webp`
  const [imgError, setImgError] = useState(false)
  
  return (
    <img 
      src={imgError ? '/images/common/placeholder.webp' : imageUrl}
      onError={() => setImgError(true)}
      alt={section.name}
      loading="lazy"
    />
  )
}
```

**Responsive Images (opcjonalne):**

```tsx
export function SectionImage({ slug, alt }: { slug: string; alt: string }) {
  return (
    <picture>
      <source 
        srcSet={`/images/sections/${slug}-small.webp 300w,
                 /images/sections/${slug}-medium.webp 600w,
                 /images/sections/${slug}-large.webp 1200w`}
        sizes="(max-width: 768px) 300px, (max-width: 1024px) 600px, 1200px"
        type="image/webp"
      />
      <img 
        src={`/images/sections/${slug}-medium.webp`}
        alt={alt}
        loading="lazy"
        width="600"
        height="400"
      />
    </picture>
  )
}
```

### Krok 4: Konfiguracja Cloudinary (dla dynamicznych obrazów)

**Instalacja:**
```bash
npm install cloudinary-react @cloudinary/url-gen
```

**Setup:**
```typescript
// frontend/src/lib/cloudinary.ts
import { Cloudinary } from '@cloudinary/url-gen'

export const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'unicorns-pwa'
  }
})
```

**Komponent Avatar:**
```tsx
import { AdvancedImage } from '@cloudinary/react'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { cld } from '../lib/cloudinary'

export function UserAvatar({ publicId }: { publicId: string }) {
  const img = cld.image(publicId)
    .resize(fill().width(100).height(100))
    .format('auto')
    .quality('auto')
  
  return <AdvancedImage cldImg={img} />
}
```

**Upload do Cloudinary:**
```typescript
// frontend/src/utils/uploadAvatar.ts
export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'user_avatars') // Ustaw w Cloudinary dashboard
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  )
  
  const data = await response.json()
  return data.public_id // Zapisz w bazie: users.avatar_cloudinary_id
}
```

### Krok 5: Optymalizacja i Pre-commit Hook

**Package.json scripts:**
```json
{
  "scripts": {
    "optimize-images": "sharp -i 'public/images/**/*.{jpg,png}' -o public/images/ -f webp -q 85",
    "check-image-sizes": "find public/images -type f -size +1M"
  },
  "devDependencies": {
    "sharp-cli": "^2.1.0"
  }
}
```

**Pre-commit hook (opcjonalne):**
```bash
# .husky/pre-commit
#!/bin/sh
npm run check-image-sizes
if [ $? -ne 0 ]; then
  echo "⚠️  Found images larger than 1MB. Please optimize before committing."
  exit 1
fi
```

### Krok 6: PWA Offline Support

**Service Worker cache:**
```javascript
// public/sw.js (jeśli używasz custom SW)
const STATIC_CACHE = 'static-images-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/images/sections/fitness.webp',
        '/images/sections/dance.webp',
        '/images/sections/yoga.webp',
        '/images/home/hero.webp',
        '/images/common/logo.svg'
      ])
    })
  )
})
```

**Vite PWA plugin (workbox):**
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,svg,png}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ]
})
```

---

## 📝 Workflow dla Dodawania Zdjęć

### Statyczne Zdjęcie Sekcji (GitHub Repo)

1. **Przygotuj zdjęcie:**
   - Wytnij do 600x400
   - Konwertuj do WebP (jakość 85%)
   - Sprawdź rozmiar (< 100 KB)

2. **Dodaj do repo:**
   ```bash
   cp nowe-zdjecie.webp frontend/public/images/sections/nowa-sekcja.webp
   git add frontend/public/images/sections/nowa-sekcja.webp
   git commit -m "Add image for nowa-sekcja"
   git push
   ```

3. **Netlify auto-deploy:**
   - Zdjęcie dostępne po ~2 min pod `/images/sections/nowa-sekcja.webp`

4. **Update komponentu:**
   - Nie trzeba! Jeśli slug w bazie = `nowa-sekcja`, zdjęcie auto-load

### Dynamiczne Zdjęcie (Cloudinary)

1. **Upload przez admin panel:**
   ```typescript
   // W komponencie admin
   const handleUpload = async (file: File) => {
     const publicId = await uploadToCloudinary(file)
     await supabase
       .from('activities')
       .update({ image_cloudinary_id: publicId })
       .eq('id', activityId)
   }
   ```

2. **Render:**
   ```tsx
   {activity.image_cloudinary_id ? (
     <CloudinaryImage publicId={activity.image_cloudinary_id} />
   ) : (
     <img src="/images/common/placeholder.webp" />
   )}
   ```

---

## 📊 Kalkulacja Kosztów

### Scenariusz: 1000 użytkowników/miesiąc

| Zasób | Gdzie | Rozmiar | Views | Bandwidth | Koszt |
|-------|-------|---------|-------|-----------|-------|
| 10 zdjęć sekcji | **Repo** | 50 KB | 10,000 | 500 MB | **$0** ✅ |
| Hero homepage | **Repo** | 200 KB | 5,000 | 1 GB | **$0** ✅ |
| 100 avatarów | Cloudinary | 20 KB | 2,000 | 40 MB | 0.04 kredytu |
| 200 zdjęć galerii | Cloudinary | 300 KB | 500 | 150 MB | 0.15 kredytu |

**Total:**
- GitHub: **$0** (included w Netlify hosting)
- Cloudinary: **~0.2/25 kredytów** (prawie darmowe)

### Cloudinary - Oszczędność

**Bez tej strategii (wszystko Cloudinary):**
- 10 sekcji × 10,000 views × 50 KB = 5 GB bandwidth = **5 kredytów**
- Hero × 5,000 views × 200 KB = 1 GB = **1 kredyt**
- **Total: 6 kredytów** vs **0.2 kredytu** → oszczędność 30x

---

## ⚠️ Best Practices

### DO:
✅ Optymalizuj przed commitem (WebP, < 100 KB)  
✅ Używaj lazy loading dla wszystkich obrazów  
✅ Dodaj width/height attributes (CLS prevention)  
✅ Preload critical images (hero)  
✅ Testuj na mobile (3G throttling)  

### DON'T:
❌ Nie commituj plików > 1 MB  
❌ Nie dodawaj więcej niż 50 plików do repo  
❌ Nie używaj JPG/PNG (zawsze WebP)  
❌ Nie uploaduj bezpośrednio z telefonu (za duże)  
❌ Nie zmieniaj często zdjęć w repo (git bloat)  

---

## 🔧 Troubleshooting

### Zdjęcie nie ładuje się

**Problem:** 404 dla `/images/sections/fitness.webp`

**Rozwiązanie:**
1. Sprawdź czy plik istnieje: `ls frontend/public/images/sections/`
2. Sprawdź naming: slug w bazie = nazwa pliku
3. Sprawdź czy zdeployowane: poczekaj 2 min po pushu

### Zdjęcie za duże (> 100 KB)

```bash
# Zmniejsz jakość
sharp -i input.webp -o output.webp -f webp -q 75

# Zmniejsz rozdzielczość
sharp -i input.webp -o output.webp -f webp --resize 600,400
```

### Git repo za duży

```bash
# Sprawdź rozmiar
du -sh frontend/public/images/

# Jeśli > 100 MB, przenieś duże pliki do Cloudinary
# i usuń z historii git
git filter-branch --index-filter \
  'git rm --cached --ignore-unmatch frontend/public/images/large-file.webp' HEAD
```

---

## 🚀 Migracja z Obecnego Systemu

**Jeśli obecnie używasz:**

### URLs w bazie (activity_types.image_url)

**Krok 1:** Pobierz wszystkie zdjęcia
```sql
SELECT slug, image_url FROM activity_types WHERE image_url IS NOT NULL;
```

**Krok 2:** Download i konwersja
```bash
wget -O fitness.jpg "https://current-url.com/fitness.jpg"
sharp -i fitness.jpg -o frontend/public/images/sections/fitness.webp -f webp -q 85
```

**Krok 3:** Update komponentów (usuń dependency na image_url)

**Krok 4:** (Opcjonalne) Usuń kolumnę image_url z bazy

### Supabase Storage

**Krok 1:** Export z Storage bucket
```typescript
const { data: files } = await supabase.storage.from('sections').list()
for (const file of files) {
  const { data } = await supabase.storage.from('sections').download(file.name)
  // Save to frontend/public/images/sections/
}
```

**Krok 2:** Konwersja do WebP (jak wyżej)

**Krok 3:** Usuń bucket (oszczędność na storage)

---

## 📈 Monitoring i Metryki

### Lighthouse (Core Web Vitals)

**Before (wszystko external URLs):**
- LCP: 3.2s
- CLS: 0.15

**After (static repo images):**
- LCP: 1.1s ✅ (< 2.5s = good)
- CLS: 0.01 ✅ (< 0.1 = good)

### Network Tab

**Static images:**
- Cache: `public, max-age=31536000` (1 rok)
- Size: 50 KB → 0 KB (from disk cache)

**Cloudinary:**
- Cache: `public, max-age=2592000` (30 dni)
- Size: 300 KB → 120 KB (auto WebP)

---

## 🎯 Checklist Implementacji

- [ ] Utworzyć strukturę folderów `frontend/public/images/`
- [ ] Dodać zdjęcia sekcji (WebP, < 100 KB)
- [ ] Update `SectionCard.tsx` (static paths)
- [ ] Dodać placeholder.webp (fallback)
- [ ] Preload hero image w index.html
- [ ] Setup Cloudinary account (dla UGC)
- [ ] Dodać upload avatar functionality
- [ ] Konfiguracja PWA cache dla static images
- [ ] Dodać npm script `optimize-images`
- [ ] Test na mobile (3G throttling)
- [ ] Deploy + verify CDN cache headers

---

## 📚 Dodatkowe Zasoby

**Narzędzia:**
- [Squoosh](https://squoosh.app/) - browser-based image optimizer
- [Sharp CLI](https://github.com/vseventer/sharp-cli) - CLI dla sharp
- [WebP Converter](https://developers.google.com/speed/webp/download) - official Google tool

**Dokumentacja:**
- [Cloudinary React SDK](https://cloudinary.com/documentation/react_integration)
- [Vite Static Assets](https://vitejs.dev/guide/assets.html)
- [PWA Image Caching](https://web.dev/learn/pwa/caching)

**Benchmarks:**
- WebP vs JPEG: 25-35% mniejszy rozmiar przy tej samej jakości
- Static vs CDN: 50-100ms szybsze TTFB dla static
- Lazy loading: 30-40% reduction w initial page weight
