interface ActivityTypeSelectorProps {
  onSelect: (mode: 'single' | 'recurring' | 'special') => void
}

const ActivityTypeSelector = ({ onSelect }: ActivityTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-purple-600 mb-2">
          Wybierz typ wydarzenia
        </h3>
        <p className="text-gray-600">
          Kliknij jedną z opcji poniżej, aby rozpocząć
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Zajęcia jednostkowe */}
        <button
          type="button"
          onClick={() => onSelect('single')}
          className="bg-white border-2 border-purple-200 rounded-xl p-6 hover:border-purple-500 hover:shadow-xl transition-all group"
        >
          <div className="text-center">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
              📅
            </div>
            <h4 className="text-xl font-bold text-purple-600 mb-2">
              Zajęcia jednostkowe
            </h4>
            <p className="text-sm text-gray-600">
              Jednorazowe zajęcia sekcji (badminton, siatkówka, taniec...)
            </p>
          </div>
        </button>

        {/* Zajęcia cykliczne */}
        <button
          type="button"
          onClick={() => onSelect('recurring')}
          className="bg-white border-2 border-purple-200 rounded-xl p-6 hover:border-purple-500 hover:shadow-xl transition-all group"
        >
          <div className="text-center">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
              🔁
            </div>
            <h4 className="text-xl font-bold text-purple-600 mb-2">
              Zajęcia cykliczne
            </h4>
            <p className="text-sm text-gray-600">
              Powtarzające się zajęcia (co tydzień, co miesiąc)
            </p>
          </div>
        </button>

        {/* Wydarzenie specjalne */}
        <button
          type="button"
          onClick={() => onSelect('special')}
          className="bg-white border-2 border-purple-200 rounded-xl p-6 hover:border-purple-500 hover:shadow-xl transition-all group"
        >
          <div className="text-center">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
              🎉
            </div>
            <h4 className="text-xl font-bold text-purple-600 mb-2">
              Wydarzenie specjalne
            </h4>
            <p className="text-sm text-gray-600">
              Zawody, wyjazdy, turnieje - nie związane z sekcją
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}

export default ActivityTypeSelector
