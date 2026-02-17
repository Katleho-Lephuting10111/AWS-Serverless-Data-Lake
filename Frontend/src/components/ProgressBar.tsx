interface ProgressBarProps {
  value: number
  max: number
  color: string
  label?: string
  target?: string
  showPercentage?: boolean
}

export default function ProgressBar({
  value,
  max,
  color,
  label,
  target,
  showPercentage = false
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="space-y-2">
      {/* Progress track */}
      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>

      {/* Labels */}
      {(label || target || showPercentage) && (
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>{label}</span>
          {target && (
            <span className="font-medium">{target}</span>
          )}
          {showPercentage && (
            <span className="font-medium">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
    </div>
  )
}
