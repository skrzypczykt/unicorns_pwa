interface TimelineEvent {
  year: string
  title: string
  description: string
  imageUrl?: string
  position: 'left' | 'right'
}

const timelineEvents: TimelineEvent[] = [
  {
    year: "2020",
    title: "Powstanie Unicorns Łódź",
    description: "Grupa pasjonatów sportu i aktywności towarzyskich zakłada stowarzyszenie Unicorns Łódź. Pierwszy trening badmintona gromadzi 12 osób, które dzielą wspólną wizję - tworzenie przestrzeni dla ludzi aktywnych, niezależnie od poziomu zaawansowania.",
    imageUrl: "https://images.unsplash.com/photo-1533071115214-8b8ddfa44bf2?w=800&h=500&fit=crop",
    position: "right"
  },
  {
    year: "2021",
    title: "Pierwszy Turniej Badmintona",
    description: "Organizujemy nasz pierwszy oficjalny turniej badmintona! 50 uczestników, wielkie emocje, wspaniała atmosfera. To wydarzenie pokazało, jak bardzo potrzebne są takie inicjatywy w naszym mieście.",
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=500&fit=crop",
    position: "left"
  },
  {
    year: "2022",
    title: "Rozszerzenie Działalności",
    description: "Dodajemy nowe sekcje: siatkówkę, taniec i gry planszowe. Nasza społeczność rośnie do ponad 200 aktywnych członków. Rozpoczynamy regularną współpracę z halami sportowymi w Łodzi.",
    imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=500&fit=crop",
    position: "right"
  },
  {
    year: "2023",
    title: "Pierwsze Wyjazdy Integracyjne",
    description: "Organizujemy weekendowe wyjazdy na kajaki i rowery. Odkrywamy, że nasze stowarzyszenie to nie tylko sport - to przede wszystkim wspaniała społeczność ludzi, którzy lubią się wspólnie bawić.",
    imageUrl: "https://images.unsplash.com/photo-1578972474928-34aafffea0e3?w=800&h=500&fit=crop",
    position: "left"
  },
  {
    year: "2024",
    title: "Era Cyfrowa - Aplikacja PWA",
    description: "Wdrażamy nowoczesną aplikację webową do zarządzania zapisami na zajęcia. Teraz każdy może łatwo sprawdzić grafik, zapisać się na trening i otrzymać powiadomienia push o nowych wydarzeniach.",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=500&fit=crop",
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
