interface TimelineEvent {
  year: string
  title: string
  description: string
  imageUrl?: string
  position: 'left' | 'right'
}

const timelineEvents: TimelineEvent[] = [
  {
    year: "2023",
    title: "Założenie Stowarzyszenia 🦄",
    description: "Październik 2023 - grupa pasjonatów sportu, kultury i rozrywki oficjalnie zakłada Stowarzyszenie UNICORNS w Łodzi. Rozpoczynamy działalność z misją tworzenia inkluzywnej przestrzeni dla wszystkich, niezależnie od poziomu zaawansowania sportowego.",
    imageUrl: "https://www.unicorns.org.pl/logo1_final_rainbow_nl1.aa5735ec.png",
    position: "right"
  },
  {
    year: "2024",
    title: "Pierwsze Urodziny - Bal Rogacza 🎉",
    description: "Październik 2024 - obchodzimy pierwsze urodziny! Bal Rogacza to wielkie święto podsumowujące intensywny rok pełen wydarzeń sportowych i kulturalnych. Społeczność Unicorns rośnie w siłę!",
    imageUrl: "https://www.unicorns.org.pl/unicorns_urodziny.815e15a7.jpg",
    position: "left"
  },
  {
    year: "2024",
    title: "Unicorns BadCup 2024 🏸",
    description: "Organizujemy prestiżowy turniej badmintona - Unicorns BadCup. Ponad 40 uczestników w dwóch poziomach zaawansowania. Wydarzenie przyciąga graczy z całej Polski i umacnia pozycję Unicorns w środowisku badmintona.",
    imageUrl: "https://www.unicorns.org.pl/06553c86-8884-432f-8b69-83aad2bcba30.a12e81cd.jpeg",
    position: "right"
  },
  {
    year: "2024",
    title: "Mini Liga Badmintona 2024 🏆",
    description: "Startuje nasza pierwsza Mini Liga Badmintona! Cykliczne rozgrywki, które pozwalają graczom regularnie rywalizować i rozwijać swoje umiejętności w przyjaznej, inkluzywnej atmosferze.",
    imageUrl: "https://www.unicorns.org.pl/52670a15-0eb4-42b5-9540-bfb4f309316b.9ae74eb6.jpeg",
    position: "left"
  },
  {
    year: "2024",
    title: "Mini Liga Siatkówki 2024 🏐",
    description: "Rozszerzamy ofertę! Mini Liga Siatkówki przyciąga miłośników gry zespołowej. Zwycięzcy - UNHOLY TRINITY - zapisują się w historii pierwszych rozgrywek UNICORNS SMASH - TRIPLES COMPETITION.",
    imageUrl: "https://www.unicorns.org.pl/90505925-5436-41a3-85f2-0cb53a7efe8f.7b2d2c97.jpeg",
    position: "right"
  },
  {
    year: "2025",
    title: "UNICORNS BADMIN DOUBLES CHAMPIONSHIP 🏳️‍🌈",
    description: "Listopad 2025 - organizujemy największy w historii tęczowy turniej badmintona w Polsce! 66 zawodników z 10+ miast, 73 mecze, 9 godzin intensywnych rozgrywek w 3 kategoriach. Jedyny taki turniej w kraju!",
    imageUrl: "https://www.unicorns.org.pl/7cda174a-f0e8-4bbd-a8bb-163fe72f0f2a.a3ae51e1.jpeg",
    position: "left"
  },
  {
    year: "2026",
    title: "Era Cyfrowa - Aplikacja PWA 📱",
    description: "Wdrażamy nowoczesną aplikację webową (PWA) do zarządzania zapisami na zajęcia! Użytkownicy mogą teraz łatwo sprawdzić grafik, zapisać się na trening, otrzymać powiadomienia push i zarządzać swoim kontem - wszystko w jednym miejscu.",
    imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=500&fit=crop",
    position: "right"
  }
]

export default function Timeline() {
  return (
    <div className="relative">
      {/* Timeline container */}
      <div className="space-y-8 md:space-y-12">
        {timelineEvents.map((event, index) => (
          <div key={index} className="relative">
            {/* Mobile layout - single column */}
            <div className="block md:hidden">
              <div className="flex gap-4">
                {/* Left side - year marker */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shadow-lg z-10">
                    <span className="text-white font-bold text-xs">{event.year}</span>
                  </div>
                  {index !== timelineEvents.length - 1 && (
                    <div className="w-1 h-full bg-purple-300 mt-2"></div>
                  )}
                </div>

                {/* Right side - content */}
                <div className="flex-1 pb-8">
                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 shadow-md border-2 border-purple-100">
                    <h4 className="text-lg font-bold text-purple-600 mb-2">{event.title}</h4>
                    <p className="text-gray-700 text-sm mb-3">{event.description}</p>
                    {event.imageUrl && (
                      <div className="rounded-lg overflow-hidden shadow-md">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-40 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop layout - two columns with center line */}
            <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
              {event.position === 'left' ? (
                <>
                  {/* Left content */}
                  <div className="text-right">
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 shadow-md border-2 border-purple-100 inline-block max-w-md">
                      <h4 className="text-xl font-bold text-purple-600 mb-2">{event.title}</h4>
                      <p className="text-gray-700 mb-3">{event.description}</p>
                      {event.imageUrl && (
                        <div className="rounded-lg overflow-hidden shadow-md">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-48 object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center line with year marker */}
                  <div className="flex flex-col items-center relative">
                    <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center shadow-lg z-10">
                      <span className="text-white font-bold text-sm">{event.year}</span>
                    </div>
                    {index !== timelineEvents.length - 1 && (
                      <div className="absolute top-16 bottom-0 w-1 bg-purple-300" style={{ height: 'calc(100% + 3rem)' }}></div>
                    )}
                  </div>

                  {/* Right empty */}
                  <div></div>
                </>
              ) : (
                <>
                  {/* Left empty */}
                  <div></div>

                  {/* Center line with year marker */}
                  <div className="flex flex-col items-center relative">
                    <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center shadow-lg z-10">
                      <span className="text-white font-bold text-sm">{event.year}</span>
                    </div>
                    {index !== timelineEvents.length - 1 && (
                      <div className="absolute top-16 bottom-0 w-1 bg-purple-300" style={{ height: 'calc(100% + 3rem)' }}></div>
                    )}
                  </div>

                  {/* Right content */}
                  <div>
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 shadow-md border-2 border-purple-100 inline-block max-w-md">
                      <h4 className="text-xl font-bold text-purple-600 mb-2">{event.title}</h4>
                      <p className="text-gray-700 mb-3">{event.description}</p>
                      {event.imageUrl && (
                        <div className="rounded-lg overflow-hidden shadow-md">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-48 object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
