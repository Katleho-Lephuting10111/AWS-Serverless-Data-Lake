import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface SettingsState {
  email: string
  fullName: string
  emailNotifications: boolean
  pushNotifications: boolean
  twoFactorAuth: boolean
}

const DEFAULT_SETTINGS: SettingsState = {
  email: '',
  fullName: '',
  emailNotifications: true,
  pushNotifications: false,
  twoFactorAuth: true,
}

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [savedSettings, setSavedSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [errors, setErrors] = useState<{ email?: string; fullName?: string }>({})

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('userSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings(parsed)
        setSavedSettings(parsed)
      } catch (e) {
        console.error('Failed to parse saved settings:', e)
      }
    }
  }, [])

  // Show toast notifications
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: { email?: string; fullName?: string } = {}

    if (settings.email && !validateEmail(settings.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (settings.fullName && settings.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof SettingsState, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleToggle = (key: keyof SettingsState) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof SettingsState]
    }))
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    setShowToast({ message: `Theme changed to ${newTheme} mode`, type: 'success' })
  }

  const handleSave = () => {
    if (!validateForm()) {
      setShowToast({ message: 'Please fix the errors before saving', type: 'error' })
      return
    }

    localStorage.setItem('userSettings', JSON.stringify(settings))
    setSavedSettings(settings)
    setShowToast({ message: 'Settings saved successfully!', type: 'success' })
  }

  const handleCancel = () => {
    setSettings(savedSettings)
    setErrors({})
    setShowToast({ message: 'Changes discarded', type: 'success' })
  }

  const handleDeleteAccount = () => {
    // Clear all data
    localStorage.removeItem('userSettings')
    localStorage.removeItem('theme')
    setSettings(DEFAULT_SETTINGS)
    setSavedSettings(DEFAULT_SETTINGS)
    setShowDeleteDialog(false)
    setShowToast({ message: 'Account data deleted', type: 'success' })
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings)

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          showToast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        } animate-fade-in`}>
          {showToast.message}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Account?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will clear all your settings and data from this browser. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-900 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="user@digihealth.com"
                  className={`w-full px-4 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={settings.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2 border ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                />
                {errors.fullName && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive email updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive push alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add extra security</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
              <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Theme */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
            <div className="space-y-2">
              {['light', 'dark'].map(themeOption => (
                <label key={themeOption} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={themeOption}
                    checked={theme === themeOption}
                    onChange={() => handleThemeChange(themeOption as 'light' | 'dark')}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{themeOption} Mode</span>
                </label>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg">
            <h3 className="font-semibold text-red-900 dark:text-red-400 mb-4">Danger Zone</h3>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors font-medium text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleCancel}
          disabled={!hasChanges}
          className={`px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors font-medium ${
            hasChanges ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white' : 'opacity-50 cursor-not-allowed text-gray-500 dark:text-gray-600'
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`px-6 py-2 bg-primary-600 text-white rounded-lg transition-colors font-medium ${
            hasChanges ? 'hover:bg-primary-700 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
