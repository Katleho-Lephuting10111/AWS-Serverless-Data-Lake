import { ReactNode } from 'react'

interface WellnessCardProps {
  title: string
  icon: ReactNode
  gradient: string
  children: ReactNode
  className?: string
}

export default function WellnessCard({ title, icon, gradient, children, className = '' }: WellnessCardProps) {
  return (
    <div className={`rounded-2xl shadow-lg p-6 ${gradient} transition-all duration-300 hover:shadow-xl ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}
