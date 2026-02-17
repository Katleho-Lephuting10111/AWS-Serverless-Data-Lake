import { X } from 'lucide-react'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 md:p-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            About DigiHealth
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
          <p>
            DigiHealth is a data‑driven platform designed to help students understand the impact of their digital habits on health and academic performance. By turning everyday usage patterns into clear, interactive insights, DigiHealth empowers users to make mindful choices, balance screen time, and unlock their full potential.
          </p>
          <p>
            Our mission is simple: transform data into wellness, and give every student the tools to thrive in both study and life.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
