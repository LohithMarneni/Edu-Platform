import React, { useState, useEffect } from 'react';
import { PencilIcon, CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import apiService from '../services/api';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    language: 'English',
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCurrentUser();
        const user = response.data || response;
        setUserData(user);
        
        // Populate personal info from user data
        setPersonalInfo({
          fullName: user.fullName || user.name || '',
          email: user.email || '',
          phone: user.profile?.phone || '',
          dob: user.profile?.dateOfBirth 
            ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0]
            : '',
        });

        // Populate preferences from user data if available
        if (user.preferences) {
          setPreferences({
            darkMode: user.preferences.darkMode || false,
            emailNotifications: user.preferences.emailNotifications !== false,
            pushNotifications: user.preferences.pushNotifications !== false,
            weeklyReports: user.preferences.weeklyReports !== false,
            language: user.preferences.language || 'English',
          });
        }

        // Try to get from localStorage as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser && !user.email) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser);
            setPersonalInfo({
              fullName: parsedUser.fullName || parsedUser.name || '',
              email: parsedUser.email || '',
              phone: parsedUser.profile?.phone || '',
              dob: parsedUser.profile?.dateOfBirth 
                ? new Date(parsedUser.profile.dateOfBirth).toISOString().split('T')[0]
                : '',
            });
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Try to get from localStorage as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser);
            setPersonalInfo({
              fullName: parsedUser.fullName || parsedUser.name || '',
              email: parsedUser.email || '',
              phone: parsedUser.profile?.phone || '',
              dob: parsedUser.profile?.dateOfBirth 
                ? new Date(parsedUser.profile.dateOfBirth).toISOString().split('T')[0]
                : '',
            });
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        fullName: personalInfo.fullName,
        profile: {
          phone: personalInfo.phone || undefined,
          dateOfBirth: personalInfo.dob || undefined,
        },
      };

      const result = await apiService.updateProfile(payload);
      const updatedUser = result?.data?.user || result?.data || result?.user || result;

      if (updatedUser) {
        setUserData((prev) => ({
          ...(prev || {}),
          ...updatedUser,
          profile: updatedUser.profile || prev?.profile,
          preferences: updatedUser.preferences || prev?.preferences,
        }));

        // Keep localStorage in sync so other parts of the app see updated details
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            const merged = {
              ...parsed,
              fullName: updatedUser.fullName ?? parsed.fullName,
              name: updatedUser.name ?? parsed.name,
              email: updatedUser.email ?? parsed.email,
              profile: {
                ...(parsed.profile || {}),
                ...(updatedUser.profile || {}),
              },
              preferences: {
                ...(parsed.preferences || {}),
                ...(updatedUser.preferences || {}),
              },
            };
            localStorage.setItem('user', JSON.stringify(merged));
          } catch (err) {
            console.error('Failed to update stored user after profile save:', err);
          }
        }
      }

      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        preferences: { ...preferences },
      };

      const result = await apiService.updateProfile(payload);
      const updatedUser = result?.data?.user || result?.data || result?.user || result;

      if (updatedUser) {
        setUserData((prev) => ({
          ...(prev || {}),
          ...updatedUser,
          profile: updatedUser.profile || prev?.profile,
          preferences: updatedUser.preferences || prev?.preferences,
        }));

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            const merged = {
              ...parsed,
              preferences: {
                ...(parsed.preferences || {}),
                ...(updatedUser.preferences || {}),
              },
            };
            localStorage.setItem('user', JSON.stringify(merged));
          } catch (err) {
            console.error('Failed to update stored user after preferences save:', err);
          }
        }
      }

      toast.success('Preferences saved successfully!');
    } catch (err) {
      console.error('Failed to update preferences:', err);
      toast.error(err.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    toast.success('Security settings updated successfully!');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      // Clear all auth-related data used by the student app
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('eduplatform_auth'); // legacy key, if any
      
      toast.success('Logged out successfully!');
      // Reload so App re-checks auth state and shows Login screen
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'activity', label: 'Activity Log' },
    { id: 'security', label: 'Security' },
    { id: 'achievements', label: 'Achievements' },
  ];

  const recentActivity = [
    { action: 'Completed Assessment: Algebra Basics', time: '2 days ago' },
    { action: 'Asked a Doubt: Why is the sky blue?', time: '4 days ago' },
    { action: 'Redeemed 50 points for a certificate', time: '1 week ago' },
  ];

  const achievements = userData?.achievements || [
    { name: 'Top Scorer', description: 'Achieved highest score in Mathematics', points: 100 },
    { name: 'Fast Learner', description: 'Completed 5 courses in a month', points: 50 },
    { name: 'Problem Solver', description: 'Solved 100 doubts', points: 75 },
  ];

  // Get display name and avatar
  const displayName = userData?.fullName || userData?.name || personalInfo.fullName || 'Student';
  const displayEmail = userData?.email || personalInfo.email || '';
  const avatarUrl = userData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=128&background=4f46e5&color=fff`;
  const totalPoints = userData?.stats?.totalPoints || userData?.totalPoints || 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full"
            />
            <button className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white hover:bg-indigo-700">
              <CameraIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <button className="text-indigo-600 hover:text-indigo-700">
                <PencilIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600">{userData?.role === 'student' ? 'Student' : userData?.role || 'Student'}</p>
            {displayEmail && <p className="text-gray-600">{displayEmail}</p>}
            {userData?.profile?.grade && <p className="text-gray-600">Grade: {userData.profile.grade}</p>}
            {userData?.profile?.school && <p className="text-gray-600">School: {userData.profile.school}</p>}
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{totalPoints}</div>
            <div className="text-gray-600">Total Points</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <form onSubmit={handlePersonalInfoSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={personalInfo.dob}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <form onSubmit={handlePreferencesSubmit}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Dark Mode</span>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, darkMode: !preferences.darkMode })}
                    className={`${
                      preferences.darkMode ? 'bg-indigo-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                    />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Notifications</h3>
                  <div className="space-y-4">
                    {Object.entries({
                      emailNotifications: 'Email Notifications',
                      pushNotifications: 'Push Notifications',
                      weeklyReports: 'Weekly Progress Reports',
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences[key]}
                          onChange={(e) =>
                            setPreferences({ ...preferences, [key]: e.target.checked })
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 text-sm text-gray-700">{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== recentActivity.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="text-white text-sm">{index + 1}</span>
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">{activity.action}</p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              <time>{activity.time}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handleSecuritySubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={security.currentPassword}
                    onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={security.newPassword}
                    onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })
                    }
                    className={`${
                      security.twoFactorEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                    />
                  </button>
                </div>
                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Update Security Settings
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 bg-indigo-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">{achievement.points}</span>
                          </div>
                        </div>
                        <div className="ml-5">
                          <h3 className="text-lg font-medium text-gray-900">{achievement.name}</h3>
                          <p className="text-sm text-gray-500">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button className="text-sm text-gray-600 hover:text-gray-900">Help/Support</button>
          <button className="text-sm text-gray-600 hover:text-gray-900">Terms & Conditions</button>
          <button className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</button>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;