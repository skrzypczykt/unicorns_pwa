interface ActivityCreationBreadcrumbsProps {
  currentStep: number
  activityMode: 'single' | 'recurring' | 'special' | null
}

const ActivityCreationBreadcrumbs = ({ currentStep, activityMode }: ActivityCreationBreadcrumbsProps) => {
  const getStep3Label = () => {
    if (activityMode === 'recurring') return 'Reguła powtarzania'
    return 'Podsumowanie'
  }

  return (
    <div className="mb-6 flex items-center gap-2 flex-wrap">
      <span className={`text-sm ${currentStep >= 1 ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
        1. Typ wydarzenia
      </span>
      <span className="text-gray-400">→</span>
      <span className={`text-sm ${currentStep >= 2 ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
        2. Szczegóły
      </span>
      <span className="text-gray-400">→</span>
      <span className={`text-sm ${currentStep >= 3 ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
        3. {getStep3Label()}
      </span>
    </div>
  )
}

export default ActivityCreationBreadcrumbs
