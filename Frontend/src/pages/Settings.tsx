import { useState } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: true,
    theme: 'light',
  })

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleThemeChange = (theme: string) => {
    setSettings(prev => ({
      ...prev,
      theme
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="user@digihealth.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive push alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                  className="w-5 h-5"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add extra security</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                  className="w-5 h-5"
                />
              </div>
              <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Theme */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Appearance</h3>
            <div className="space-y-2">
              {['light', 'dark'].map(theme => (
                <label key={theme} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={settings.theme === theme}
                    onChange={() => handleThemeChange(theme)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 capitalize">{theme} Mode</span>
                </label>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-4">Danger Zone</h3>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          Cancel
        </button>
        <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
          Save Changes
        </button>
      </div>
    </div>
  )
}
