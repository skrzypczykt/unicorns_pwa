# Procedura Dodawania Aktualności - Unicorns PWA

## Przegląd

Dwa workflow w zależności od umiejętności technicznych osoby tworzącej treść:
- **Workflow A** - Dla osoby nietechnicznej (Admin Panel + AI asystent)
- **Workflow B** - Dla content managera z dostępem do AI (GitHub + Claude Code)

---

## 📋 Workflow A: Panel Admina (Osoba Nietechniczna)

**Dla kogo:** Trenerzy, content managerzy bez wiedzy technicznej  
**Wymagania:** Dostęp do panelu admina w PWA, obrazy w formacie JPG/PNG  
**Czas:** ~10 minut na artykuł

### Krok 1: Przygotowanie Materiałów

**Treść artykułu:**
- Tytuł (max 100 znaków)
- Streszczenie/Lead (2-3 zdania, max 200 znaków)
- Treść główna (formatowanie: pogrubienie, lista, linki)
- Data publikacji
- Kategoria (np. "Aktualności", "Wydarzenia", "Osiągnięcia")

**Zdjęcia:**
- 1 zdjęcie główne (cover) - poziome, min. 1200x630px
- 0-5 zdjęć w treści artykułu
- Format: JPG lub PNG (nie musisz konwertować)

### Krok 2: Logowanie do Panelu Admina

```
1. Wejdź na https://unicorns.app/admin/login
2. Zaloguj się kontem admin/trainer
3. Z menu wybierz "Aktualności" → "Dodaj nowy artykuł"
```

### Krok 3: Wypełnienie Formularza

**Ekran będzie zawierał:**

```
┌─────────────────────────────────────────┐
│ Tytuł artykułu                          │
│ [_________________________________]     │
│                                         │
│ Streszczenie (lead)                     │
│ [_________________________________]     │
│ [_________________________________]     │
│                                         │
│ Zdjęcie główne (cover)                  │
│ [Wybierz plik] lub [Przeciągnij tutaj] │
│                                         │
│ Kategoria                               │
│ [▼ Wybierz kategorię]                  │
│                                         │
│ Data publikacji                         │
│ [📅 2026-04-26] [⏰ 10:00]             │
│                                         │
│ Treść artykułu (Rich Text Editor)      │
│ ┌───────────────────────────────────┐ │
│ │ B I U [🔗] [📷] [•••]             │ │
│ │                                   │ │
│ │ [Tutaj piszesz treść artykułu...] │ │
│ │                                   │ │
│ │                                   │ │
│ └───────────────────────────────────┘ │
│                                         │
│ Status                                  │
│ ○ Szkic  ● Opublikowany  ○ Archiwum   │
│                                         │
│ [Zapisz szkic] [Podgląd] [Opublikuj]   │
└─────────────────────────────────────────┘
```

### Krok 4: Upload Zdjęcia Głównego

**Opcja 1: Przeciągnij i upuść**
```
1. Znajdź zdjęcie na komputerze (plik JPG/PNG)
2. Przeciągnij myszką na pole "Zdjęcie główne"
3. Poczekaj na pasek postępu (zdjęcie uploaduje się do Cloudinary)
4. Zobaczysz miniaturkę - gotowe!
```

**Opcja 2: Kliknij "Wybierz plik"**
```
1. Kliknij przycisk "Wybierz plik"
2. Wybierz zdjęcie z dysku
3. Upload automatyczny
```

**Co się dzieje w tle:**
- Zdjęcie uploaduje się do Cloudinary
- Automatyczna optymalizacja (WebP, kompresja)
- Generowanie thumbnails (300x200, 600x400)
- URL zapisuje się w bazie

### Krok 5: Pisanie Treści (Rich Text Editor)

**Dostępne opcje formatowania:**

| Przycisk | Funkcja | Przykład |
|----------|---------|----------|
| **B** | Pogrubienie | **ważny tekst** |
| *I* | Kursywa | *podkreślenie* |
| 🔗 | Link | [kliknij tutaj](url) |
| 📷 | Zdjęcie w treści | Wstaw zdjęcie |
| • | Lista punktowana | • Punkt 1 |
| H2 | Nagłówek | ## Tytuł sekcji |

**Dodawanie zdjęcia w treści:**
```
1. Kliknij ikonę 📷 w edytorze
2. Wybierz plik lub przeciągnij
3. Zdjęcie wstawi się w miejscu kursora
4. Możesz dodać podpis (opcjonalnie)
```

### Krok 6: Podgląd i Publikacja

**Przed publikacją:**
```
1. Kliknij "Podgląd"
2. Sprawdź jak wygląda artykuł (otworzy się w nowej karcie)
3. Wróć i popraw jeśli coś nie gra
```

**Publikacja:**
```
1. Ustaw status "Opublikowany"
2. Sprawdź datę publikacji (domyślnie: teraz)
3. Kliknij "Opublikuj"
4. Artykuł pojawi się na stronie głównej w sekcji "Aktualności"
```

### Krok 7: Edycja Już Opublikowanego Artykułu

```
1. Panel Admin → Aktualności → Lista artykułów
2. Znajdź artykuł do edycji (szukaj po tytule)
3. Kliknij "Edytuj" ✏️
4. Wprowadź zmiany
5. Kliknij "Zapisz zmiany"
```

---

## 🤖 Workflow A+: Z Pomocą AI (ChatGPT/Claude)

**Jeśli nie jesteś pewna/pewny jak napisać artykuł:**

### Prompt dla AI:

```
Napisz artykuł o wydarzeniu:
- Temat: [opisz wydarzenie]
- Styl: przyjazny, entuzjastyczny, dla rodziców dzieci 6-12 lat
- Długość: 300-500 słów
- Struktura: intro (2 zdania) + główna treść + zakończenie z CTA

Format: Markdown

Przykład:
Temat: Udany pokaz taneczny naszych Unicorns 20.04.2026
```

**AI wygeneruje:**
```markdown
# Niezapomniany Pokaz Taneczny Unicorns!

W miniony weekend nasze Unicorns rozkręciły scenę! 20 kwietnia 
odbyło się długo wyczekiwane przedstawienie taneczne...

## Magiczne momenty

Nasze młode tancerki zaprezentowały...

## Co dalej?

Już dziś zapisz się na zajęcia танца! [Harmonogram](/schedule)
```

**Skopiuj do panelu admina:**
```
1. Skopiuj tytuł (bez #) → pole "Tytuł artykułu"
2. Pierwszy akapit → pole "Streszczenie"
3. Reszta → edytor treści (formatowanie zachowa się)
```

---

## 🔧 Workflow B: GitHub + AI (Content Manager)

**Dla kogo:** Osoba z dostępem do Claude Code/GitHub lub chętna do nauki  
**Wymagania:** Konto GitHub, Claude Code (lub instrukcje dla AI)  
**Zalety:** Pełna kontrola, wersjonowanie, nie trzeba logować się do panelu  
**Czas:** ~5 minut (z AI), ~15 minut (ręcznie)

### Model Danych - News Table

**Nowa tabela w bazie: `news`**

```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,              -- np. "pokaz-taneczny-kwiecien-2026"
  title TEXT NOT NULL,                     -- Tytuł artykułu
  lead TEXT,                               -- Streszczenie (2-3 zdania)
  content TEXT NOT NULL,                   -- Treść (Markdown lub HTML)
  cover_image_cloudinary_id TEXT,          -- Cloudinary public_id
  category TEXT DEFAULT 'news',            -- 'news', 'events', 'achievements'
  status TEXT DEFAULT 'draft',             -- 'draft', 'published', 'archived'
  published_at TIMESTAMPTZ,                -- Data publikacji
  author_id UUID REFERENCES users(id),     -- Kto dodał
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_published ON news(published_at DESC) 
  WHERE status = 'published';
CREATE INDEX idx_news_category ON news(category);
```

### Opcja B1: Z Claude Code (Najprostsza)

**Krok 1: Przygotuj materiały w folderze**

```
/Users/you/news-draft/
├── article.md              # Treść artykułu
├── cover.jpg              # Zdjęcie główne
└── photos/                # Dodatkowe zdjęcia
    ├── photo1.jpg
    └── photo2.jpg
```

**Krok 2: Otwórz Claude Code i napisz:**

```
Dodaj nowy artykuł do sekcji aktualności:

Plik: /Users/you/news-draft/article.md
Zdjęcie: /Users/you/news-draft/cover.jpg
Kategoria: wydarzenia
Data publikacji: 2026-04-26

Zrób:
1. Upload cover.jpg do Cloudinary
2. Dodaj rekord do tabeli news
3. Konwertuj markdown na HTML
4. Ustaw status: published
5. Wygeneruj slug z tytułu
```

**Claude Code zrobi:**
```
✅ Upload zdjęcia do Cloudinary → public_id
✅ Wstawi rekord do tabeli news
✅ Wygeneruje slug (unicodeToAscii + lowercase)
✅ Konwertuje Markdown → HTML
✅ Odpowie: "Artykuł opublikowany: /aktualnosci/pokaz-taneczny-kwiecien-2026"
```

### Opcja B2: Ręczna (dla power users)

**Krok 1: Upload zdjęcia do Cloudinary**

```bash
# CLI upload (jeśli masz cloudinary-cli)
cloudinary upload cover.jpg --folder news --public-id pokaz-taneczny-cover

# Response:
# public_id: news/pokaz-taneczny-cover
# url: https://res.cloudinary.com/unicorns/image/upload/v123/news/pokaz-taneczny-cover.jpg
```

**Krok 2: Przygotuj SQL insert**

```sql
INSERT INTO news (
  slug,
  title,
  lead,
  content,
  cover_image_cloudinary_id,
  category,
  status,
  published_at,
  author_id
) VALUES (
  'pokaz-taneczny-kwiecien-2026',
  'Niezapomniany Pokaz Taneczny Unicorns!',
  'W miniony weekend nasze Unicorns rozkręciły scenę! Zobacz relację z wydarzenia.',
  '<p>W miniony weekend nasze Unicorns rozkręciły scenę...</p>',
  'news/pokaz-taneczny-cover',
  'events',
  'published',
  '2026-04-26 10:00:00+00',
  '00000000-0000-0000-0000-000000000000' -- zastąp swoim user_id
);
```

**Krok 3: Execute w Supabase Dashboard**

```
1. Supabase Dashboard → SQL Editor
2. Paste SQL
3. Run
4. Sprawdź: Table Editor → news → verify row
```

### Opcja B3: Script + AI (Automatyzacja)

**Utwórz helper script:**

```typescript
// scripts/add-news-article.ts
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import { marked } from 'marked'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function addNewsArticle({
  markdownPath,
  coverImagePath,
  category = 'news',
  publishedAt = new Date()
}: {
  markdownPath: string
  coverImagePath: string
  category?: string
  publishedAt?: Date
}) {
  // 1. Read markdown
  const markdown = fs.readFileSync(markdownPath, 'utf-8')
  const lines = markdown.split('\n')
  const title = lines[0].replace(/^#\s*/, '')
  const lead = lines[2] // First paragraph after title
  const content = marked(markdown)

  // 2. Generate slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // 3. Upload cover to Cloudinary
  const uploadResult = await cloudinary.uploader.upload(coverImagePath, {
    folder: 'news',
    public_id: slug + '-cover'
  })

  // 4. Insert to database
  const { data, error } = await supabase.from('news').insert({
    slug,
    title,
    lead,
    content,
    cover_image_cloudinary_id: uploadResult.public_id,
    category,
    status: 'published',
    published_at: publishedAt.toISOString()
  }).select().single()

  if (error) throw error

  console.log('✅ Article published:', data.slug)
  console.log('🔗 URL: /aktualnosci/' + data.slug)
  
  return data
}

// Usage
addNewsArticle({
  markdownPath: './news-draft/article.md',
  coverImagePath: './news-draft/cover.jpg',
  category: 'events',
  publishedAt: new Date('2026-04-26T10:00:00Z')
})
```

**Uruchom:**
```bash
npx tsx scripts/add-news-article.ts
```

**Lub poproś AI:**
```
Claude, uruchom skrypt add-news-article.ts z parametrami:
- markdown: /Users/me/draft.md
- cover: /Users/me/cover.jpg
- kategoria: events
```

---

## 📱 Frontend - Wyświetlanie Aktualności

### Strona Lista Aktualności (`/aktualnosci`)

```tsx
// frontend/src/pages/NewsPage.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

interface NewsArticle {
  id: string
  slug: string
  title: string
  lead: string
  cover_image_cloudinary_id: string
  category: string
  published_at: string
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchNews()
  }, [filter])

  const fetchNews = async () => {
    let query = supabase
      .from('news')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('category', filter)
    }

    const { data } = await query
    setArticles(data || [])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Aktualności</h1>

      {/* Filter */}
      <div className="flex gap-4 mb-8">
        <button onClick={() => setFilter('all')}>Wszystkie</button>
        <button onClick={() => setFilter('news')}>Aktualności</button>
        <button onClick={() => setFilter('events')}>Wydarzenia</button>
        <button onClick={() => setFilter('achievements')}>Osiągnięcia</button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}

function NewsCard({ article }: { article: NewsArticle }) {
  const imageUrl = `https://res.cloudinary.com/unicorns/image/upload/w_600,h_400,c_fill/${article.cover_image_cloudinary_id}.webp`

  return (
    <a href={`/aktualnosci/${article.slug}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
        <img 
          src={imageUrl} 
          alt={article.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition"
        />
        <div className="p-6">
          <span className="text-sm text-purple-600 font-semibold">
            {article.category === 'events' ? '📅 Wydarzenie' : '📰 Aktualność'}
          </span>
          <h2 className="text-xl font-bold mt-2 mb-2 group-hover:text-purple-600 transition">
            {article.title}
          </h2>
          <p className="text-gray-600 mb-4">{article.lead}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{new Date(article.published_at).toLocaleDateString('pl-PL')}</span>
            <span className="text-purple-600 font-semibold">Czytaj więcej →</span>
          </div>
        </div>
      </div>
    </a>
  )
}
```

### Strona Pojedynczego Artykułu (`/aktualnosci/:slug`)

```tsx
// frontend/src/pages/NewsArticlePage.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase/client'

export default function NewsArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState<any>(null)

  useEffect(() => {
    fetchArticle()
  }, [slug])

  const fetchArticle = async () => {
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    setArticle(data)
  }

  if (!article) return <div>Ładowanie...</div>

  const coverUrl = `https://res.cloudinary.com/unicorns/image/upload/w_1200,h_630,c_fill/${article.cover_image_cloudinary_id}.webp`

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Cover Image */}
      <img 
        src={coverUrl} 
        alt={article.title}
        className="w-full h-96 object-cover rounded-2xl mb-8"
      />

      {/* Metadata */}
      <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
        <span>{new Date(article.published_at).toLocaleDateString('pl-PL')}</span>
        <span>•</span>
        <span className="text-purple-600 font-semibold">
          {article.category === 'events' ? 'Wydarzenie' : 'Aktualność'}
        </span>
      </div>

      {/* Title & Lead */}
      <h1 className="text-5xl font-bold mb-6">{article.title}</h1>
      <p className="text-xl text-gray-600 mb-8 leading-relaxed">{article.lead}</p>

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* CTA */}
      <div className="mt-12 p-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl text-center">
        <h3 className="text-2xl font-bold mb-4">Chcesz dołączyć do naszych zajęć?</h3>
        <a 
          href="/activities"
          className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
        >
          Zobacz harmonogram
        </a>
      </div>
    </article>
  )
}
```

---

## 🎨 Panel Admina - Implementacja

### Strona Lista Artykułów

```tsx
// frontend/src/pages/AdminNewsPage.tsx
export default function AdminNewsPage() {
  const [articles, setArticles] = useState([])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Aktualności - Zarządzanie</h1>
        <a 
          href="/admin/news/new"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          + Dodaj artykuł
        </a>
      </div>

      <table className="w-full bg-white rounded-xl shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-4 text-left">Tytuł</th>
            <th className="p-4 text-left">Kategoria</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Data pub.</th>
            <th className="p-4 text-left">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {articles.map(article => (
            <tr key={article.id} className="border-b">
              <td className="p-4">{article.title}</td>
              <td className="p-4">{article.category}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-sm ${
                  article.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {article.status}
                </span>
              </td>
              <td className="p-4">
                {new Date(article.published_at).toLocaleDateString('pl-PL')}
              </td>
              <td className="p-4">
                <button>✏️ Edytuj</button>
                <button>👁️ Podgląd</button>
                <button>🗑️ Usuń</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### Formularz Dodawania/Edycji

```tsx
// frontend/src/pages/AdminNewsEditPage.tsx
import { useState } from 'react'
import { uploadToCloudinary } from '../utils/cloudinary'
import ReactQuill from 'react-quill' // Rich text editor
import 'react-quill/dist/quill.snow.css'

export default function AdminNewsEditPage() {
  const [formData, setFormData] = useState({
    title: '',
    lead: '',
    content: '',
    category: 'news',
    status: 'draft',
    published_at: new Date().toISOString().slice(0, 16)
  })
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverImage(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      // 1. Upload cover image
      let coverCloudinaryId = null
      if (coverImage) {
        const formData = new FormData()
        formData.append('file', coverImage)
        formData.append('upload_preset', 'news_covers')
        
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        )
        const data = await res.json()
        coverCloudinaryId = data.public_id
      }

      // 2. Generate slug
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')

      // 3. Insert to database
      const { data: article, error } = await supabase
        .from('news')
        .insert({
          ...formData,
          slug,
          cover_image_cloudinary_id: coverCloudinaryId
        })
        .select()
        .single()

      if (error) throw error

      alert('✅ Artykuł zapisany!')
      window.location.href = '/admin/news'
    } catch (err) {
      alert('❌ Błąd: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Dodaj nowy artykuł</h1>

      {/* Title */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Tytuł artykułu</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>

      {/* Lead */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Streszczenie (lead)</label>
        <textarea
          value={formData.lead}
          onChange={e => setFormData({ ...formData, lead: e.target.value })}
          className="w-full p-3 border rounded-lg"
          rows={3}
        />
      </div>

      {/* Cover Image */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Zdjęcie główne (cover)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          className="w-full p-3 border rounded-lg"
        />
        {coverImage && (
          <img 
            src={URL.createObjectURL(coverImage)} 
            alt="Preview"
            className="mt-4 max-w-md rounded-lg"
          />
        )}
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Kategoria</label>
        <select
          value={formData.category}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
          className="w-full p-3 border rounded-lg"
        >
          <option value="news">Aktualności</option>
          <option value="events">Wydarzenia</option>
          <option value="achievements">Osiągnięcia</option>
        </select>
      </div>

      {/* Published Date */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Data publikacji</label>
        <input
          type="datetime-local"
          value={formData.published_at}
          onChange={e => setFormData({ ...formData, published_at: e.target.value })}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      {/* Content (Rich Text Editor) */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Treść artykułu</label>
        <ReactQuill
          theme="snow"
          value={formData.content}
          onChange={content => setFormData({ ...formData, content })}
          modules={{
            toolbar: [
              [{ header: [2, 3, false] }],
              ['bold', 'italic', 'underline'],
              ['link', 'image'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['clean']
            ]
          }}
        />
      </div>

      {/* Status */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Status</label>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              value="draft"
              checked={formData.status === 'draft'}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            /> Szkic
          </label>
          <label>
            <input
              type="radio"
              value="published"
              checked={formData.status === 'published'}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            /> Opublikowany
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={uploading}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
        >
          {uploading ? 'Zapisywanie...' : 'Opublikuj'}
        </button>
        <a
          href="/admin/news"
          className="px-8 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Anuluj
        </a>
      </div>
    </form>
  )
}
```

---

## 🗄️ Migracja SQL

```sql
-- supabase/migrations/050_create_news_table.sql

-- Create news table
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  lead TEXT,
  content TEXT NOT NULL,
  cover_image_cloudinary_id TEXT,
  category TEXT DEFAULT 'news' CHECK (category IN ('news', 'events', 'achievements')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_news_published ON news(published_at DESC) 
  WHERE status = 'published';
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_slug ON news(slug);

-- RLS Policies
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Public can read published news"
  ON news FOR SELECT
  USING (status = 'published');

-- Admins/trainers can manage all
CREATE POLICY "Admins can manage news"
  ON news FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'trainer')
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 📋 Checklist Implementacji

### Backend:
- [ ] Utworzyć migrację `050_create_news_table.sql`
- [ ] Apply migration w Supabase Dashboard
- [ ] Setup Cloudinary upload preset `news_covers`
- [ ] Test RLS policies (public read, admin write)

### Frontend:
- [ ] Zainstalować `react-quill` i `@types/react-quill`
- [ ] Utworzyć `NewsPage.tsx` (lista artykułów)
- [ ] Utworzyć `NewsArticlePage.tsx` (pojedynczy artykuł)
- [ ] Utworzyć `AdminNewsPage.tsx` (zarządzanie)
- [ ] Utworzyć `AdminNewsEditPage.tsx` (formularz)
- [ ] Dodać routes w `App.tsx`
- [ ] Dodać link w menu: "Aktualności"

### Optional (dla Workflow B):
- [ ] Utworzyć `scripts/add-news-article.ts`
- [ ] Dodać `.env` variables dla Cloudinary
- [ ] Dodać npm script `npm run add-news`

---

## 🎯 Przykładowy Artykuł (Test)

**Tytuł:**  
Udany pokaz taneczny Unicorns - kwiecień 2026

**Lead:**  
W miniony weekend nasze Unicorns rozkręciły scenę! 20 kwietnia odbyło się długo wyczekiwane przedstawienie taneczne, które zachwyciło publiczność.

**Treść:**

```html
<h2>Magiczne momenty na scenie</h2>
<p>Nasze młode tancerki zaprezentowały efekty kilku miesięcy intensywnych treningów. 
Program obejmował choreografie z różnych stylów - od klasycznego baletu, przez jazz, 
po energiczny hip-hop.</p>

<h2>Dziękujemy za wsparcie</h2>
<p>Ogromne podziękowania dla rodziców za wsparcie i trenerów za ciężką pracę. 
To był niezapomniany wieczór!</p>

<h2>Zobacz nas w akcji</h2>
<p>Już dziś zapisz swoje dziecko na zajęcia taneczne! 
<a href="/activities">Zobacz harmonogram</a></p>
```

**Kategoria:** wydarzenia  
**Data publikacji:** 2026-04-26 10:00

---

## 💡 Tips dla Content Creators

### Dla osób nietechnicznych:
1. Pisz w Google Docs, potem kopiuj do panelu admina
2. Użyj AI (ChatGPT/Claude) do generowania draftu
3. Zawsze dodawaj zdjęcie (artykuły ze zdjęciami = 3x więcej kliknięć)
4. Lead powinien zachęcać do czytania dalej (pytanie, ciekawostka)
5. Kończ CTA (Call To Action) - link do harmonogramu/zapisu

### Dla osób technicznych:
1. Używaj Markdown dla czystości
2. Kompresuj zdjęcia przed uploadem (< 500 KB)
3. Używaj Git dla większych edycji (wersjonowanie)
4. Automatyzuj z skryptami dla bulk operations
5. Monitor Cloudinary quota (25 GB/miesiąc na free tier)

### SEO Best Practices:
- Tytuł: 50-60 znaków
- Lead/meta description: 150-160 znaków
- Używaj nagłówków H2, H3 (struktura)
- Alt text dla zdjęć
- Internal linking (linki do innych stron PWA)
- Publikuj regularnie (1-2 artykuły/miesiąc minimum)

---

## 🚀 Next Steps

Po implementacji podstawowego systemu aktualności:

1. **Newsletter integration** - wysyłaj email gdy nowy artykuł
2. **Social sharing** - przyciski share na FB/Instagram
3. **Comments** - sekcja komentarzy (Disqus/własna)
4. **Related articles** - "Zobacz także" na końcu artykułu
5. **Search** - wyszukiwarka artykułów
6. **Tags** - tagowanie artykułów dla lepszego filtru
7. **Analytics** - ile osób przeczytało (view count)

---

Gotowe! Masz kompletny system do zarządzania aktualnościami dostosowany zarówno dla osób nietechnicznych (panel admina), jak i tech-savvy (GitHub + AI).
