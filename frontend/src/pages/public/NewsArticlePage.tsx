import { useParams } from 'react-router-dom'
import { APP_VERSION } from '../../version'
import PublicHamburgerMenu from '../../components/PublicHamburgerMenu'

interface ArticleContentItem {
  type: 'paragraph' | 'image' | 'section' | 'heading'
  text?: string
  src?: string
  alt?: string
  heading?: string
  results?: string[]
}

interface Article {
  id: string
  title: string
  date: string
  emoji: string
  content: ArticleContentItem[]
}

interface NewsArticlePageProps {
  user?: any
  profile?: any
}

const NewsArticlePage = ({ user, profile }: NewsArticlePageProps) => {
  const { articleId } = useParams<{ articleId: string }>()
  const isLoggedIn = !!user && !!profile

  // Baza artykułów
  const articles: Record<string, Article> = {
    'turniej-badmintona-2025': {
      id: 'turniej-badmintona-2025',
      title: 'Turniej badmintona za nami!',
      date: '19 stycznia 2026',
      emoji: '🏸',
      content: [
        {
          type: 'image',
          src: 'https://www.unicorns.org.pl/7cda174a-f0e8-4bbd-a8bb-163fe72f0f2a.a3ae51e1.jpeg',
          alt: 'UNICORNS BADMIN DOUBLES CHAMPIONSHIP 2025'
        },
        {
          type: 'paragraph',
          text: 'Jedyny tęczowy turniej badmintona w Polsce w 2025 przeszedł do historii. 🏳️‍🌈🦄💪🏳️‍🌈'
        },
        {
          type: 'paragraph',
          text: 'Na starcie UNICORNS BADMIN DOUBLES CHAMPIONSHIP 2025 stawiło się 66 zawodników i zawodniczek, z ponad 10 miast, w tym najsilniej reprezentujące swoje miasta 🫡UNICORNS ŁÓDŹ 🫡VOLUP WARSZAWA 🫡NEON WROCŁAW 🫡ORION POZNAŃ 🫡LESBINTON POZNAŃ'
        },
        {
          type: 'paragraph',
          text: 'Przez 9 godzin, zawodnicy zacięcie walczyli na 7 kortach, w 3 kategoriach (D/C/B), rozgrywając w sumie 73 mecze grupowe oraz w fazach play-off. 🤯🔥'
        },
        {
          type: 'paragraph',
          text: 'Poniżej medaliści na poszczególnych poziomach:'
        },
        {
          type: 'image',
          src: 'https://www.unicorns.org.pl/90505925-5436-41a3-85f2-0cb53a7efe8f.7b2d2c97.jpeg',
          alt: 'Medaliści poziomu D'
        },
        {
          type: 'section',
          heading: 'POZIOM D',
          results: [
            '🥇 1 miejsce - R. Gryczewski / Y. Kirianov',
            '🥈 2 miejsce - M. Tobiasz / B. Zabora',
            '🥉 3 miejsce - A. Kisiel / D. Imiołek'
          ]
        },
        {
          type: 'image',
          src: 'https://www.unicorns.org.pl/52670a15-0eb4-42b5-9540-bfb4f309316b.9ae74eb6.jpeg',
          alt: 'Medaliści poziomu C'
        },
        {
          type: 'section',
          heading: 'POZIOM C',
          results: [
            '🥇 1 miejsce - Ł. Pasternak / A. Składowski',
            '🥈 2 miejsce - M. Jura / M. Ciesielski',
            '🥉 3 miejsce - J. Ignatowski / J. Sikorski'
          ]
        },
        {
          type: 'image',
          src: 'https://www.unicorns.org.pl/06553c86-8884-432f-8b69-83aad2bcba30.a12e81cd.jpeg',
          alt: 'Medaliści poziomu B'
        },
        {
          type: 'section',
          heading: 'POZIOM B',
          results: [
            '🥇 1 miejsce - M. Jadczyk / A. Ciesielski',
            '🥈 2 miejsce - P. Gajewski / P. Sledzinski',
            '🥉 3 miejsce - M. Zasowski / D. Doan'
          ]
        },
        {
          type: 'paragraph',
          text: 'Gratulujemy medalistom i wszystkim zawodnikom osiągniętych rezultatów! 🤝🏼🔥'
        },
        {
          type: 'paragraph',
          text: 'Zadanie "UNICORNS BADMIN DOUBLES CHAMPIONSHIP 2025" zostało zrealizowane dzięki dofinansowaniu z budżetu Miasta Łodzi.'
        }
      ]
    }
  }

  const article = articleId ? articles[articleId] : null

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-600 mb-4">Artykuł nie znaleziony</h1>
          <p className="text-gray-600 mb-6">Przepraszamy, ten artykuł nie istnieje lub został usunięty.</p>
          <button
            onClick={() => window.location.href = '/news'}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold rounded-lg"
          >
            ← Powrót do aktualności
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={isLoggedIn ? '' : 'min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200'}>
      {/* Header tylko dla niezalogowanych */}
      {!isLoggedIn && (
        <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 backdrop-blur-sm shadow-lg border-b-4 border-purple-500 relative z-[10000]">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <img
                  src="/unicorns-logo.png"
                  alt="Unicorns Łódź"
                  className="h-10 sm:h-12 md:h-16 w-auto flex-shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent truncate">
                    Unicorns Łódź
                  </h1>
                  <p className="hidden sm:block text-xs text-gray-300 uppercase tracking-wide">Sport | Kultura | Rozrywka</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                <PublicHamburgerMenu />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/news'}
            className="text-sm text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 hover:underline"
          >
            ← Powrót do aktualności
          </button>
        </div>

        {/* Article Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{article.emoji}</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">{article.title}</h1>
              <p className="text-sm text-gray-500">📅 {article.date}</p>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 md:p-8">
          <div className="prose prose-lg max-w-none">
            {article.content.map((item, index) => {
              if (item.type === 'paragraph') {
                return (
                  <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                    {item.text}
                  </p>
                )
              }

              if (item.type === 'image') {
                return (
                  <div key={index} className="my-6">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full rounded-lg shadow-lg"
                      loading="lazy"
                    />
                  </div>
                )
              }

              if (item.type === 'section') {
                return (
                  <div key={index} className="my-6 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-purple-600 mb-3">{item.heading}</h3>
                    <ul className="space-y-2">
                      {item.results?.map((result, rIndex) => (
                        <li key={rIndex} className="text-gray-700 font-semibold">
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              }

              if (item.type === 'heading') {
                return (
                  <h2 key={index} className="text-2xl font-bold text-purple-600 mt-8 mb-4">
                    {item.text}
                  </h2>
                )
              }

              return null
            })}
          </div>
        </div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/news'}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            ← Powrót do wszystkich aktualności
          </button>
        </div>
      </div>

      {/* Footer */}
      {!isLoggedIn && (
        <footer className="mt-12 py-8 bg-white/80 backdrop-blur-sm border-t-2 border-purple-200">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs text-gray-500">© 2026 Stowarzyszenie Unicorns. Wszystkie prawa zastrzeżone.</p>
            <p className="text-xs text-gray-500 mt-1">Aplikacja stworzona z magią jednorożców 🦄🌈✨</p>
            <p className="text-xs text-gray-400 mt-2">Wersja {APP_VERSION}</p>
          </div>
        </footer>
      )}
    </div>
  )
}

export default NewsArticlePage
