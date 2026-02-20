import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Globe, Save, Camera, Mail, Phone } from 'lucide-react';
import apiService from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    bio: ''
  });
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCurrentUser();
        const user = response.data || response;
        setUserData(user);
        
        // Extract first and last name from full name
        const fullName = user.name || user.fullName || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Populate profile data from user data
        setProfileData({
          firstName,
          lastName,
          email: user.email || '',
          phone: user.profile?.phone || '',
          subject: user.profile?.subject || '',
          bio: user.profile?.bio || user.bio || ''
        });

        // Try to get from localStorage as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser && !user.email) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser);
            const storedFullName = parsedUser.name || parsedUser.fullName || '';
            const storedNameParts = storedFullName.split(' ');
            setProfileData({
              firstName: storedNameParts[0] || '',
              lastName: storedNameParts.slice(1).join(' ') || '',
              email: parsedUser.email || '',
              phone: parsedUser.profile?.phone || '',
              subject: parsedUser.profile?.subject || '',
              bio: parsedUser.profile?.bio || parsedUser.bio || ''
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
            const storedFullName = parsedUser.name || parsedUser.fullName || '';
            const storedNameParts = storedFullName.split(' ');
            setProfileData({
              firstName: storedNameParts[0] || '',
              lastName: storedNameParts.slice(1).join(' ') || '',
              email: parsedUser.email || '',
              phone: parsedUser.profile?.phone || '',
              subject: parsedUser.profile?.subject || '',
              bio: parsedUser.profile?.bio || parsedUser.bio || ''
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Build payload for backend
      const name = `${profileData.firstName} ${profileData.lastName}`.trim();
      const payload = {
        name: name || undefined,
        firstName: profileData.firstName || undefined,
        lastName: profileData.lastName || undefined,
        phone: profileData.phone || undefined,
        subject: profileData.subject || undefined,
        bio: profileData.bio || undefined,
      };

      const response = await apiService.updateProfile(payload);
      const updatedUser = response.data || response.user || response;

      // Update local state
      if (updatedUser) {
        setUserData(updatedUser);
      }

      // Update cached user in localStorage so other screens (layout, dashboard) see changes
      const storedUser = localStorage.getItem('user');
      if (storedUser && updatedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const merged = {
            ...parsed,
            name: updatedUser.name ?? parsed.name,
            email: updatedUser.email ?? parsed.email,
            profile: {
              ...(parsed.profile || {}),
              ...(updatedUser.profile || {}),
            },
          };
          localStorage.setItem('user', JSON.stringify(merged));
        } catch (err) {
          console.error('Failed to update stored user after profile save:', err);
        }
      }

      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'preferences', name: 'Preferences', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                
                {/* Profile Picture */}
                <div className="flex items-center space-x-6 mb-6">
                  <div className="relative">
                    {userData?.avatar ? (
                      <img
                        src={userData.avatar}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-medium text-gray-700">
                          {(profileData.firstName?.[0] || '') + (profileData.lastName?.[0] || '') || 'T'}
                        </span>
                      </div>
                    )}
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {profileData.firstName && profileData.lastName 
                        ? `${profileData.firstName} ${profileData.lastName}`
                        : userData?.name || userData?.fullName || 'Teacher'}
                    </h3>
                    <p className="text-gray-600">{profileData.subject || 'Teacher'}</p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1">
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={profileData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button 
                    onClick={handleSaveProfile}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>

                {showSaveMessage && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">Profile updated successfully!</p>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Student Activity</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'New doubt submissions', defaultChecked: true },
                        { label: 'Assignment submissions', defaultChecked: true },
                        { label: 'Late submissions', defaultChecked: false },
                        { label: 'Student login activity', defaultChecked: false },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={item.defaultChecked}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-3 text-sm text-gray-700">{item.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">System Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'AI suggestions available', defaultChecked: true },
                        { label: 'System updates', defaultChecked: true },
                        { label: 'Maintenance notifications', defaultChecked: false },
                        { label: 'Feature announcements', defaultChecked: true },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={item.defaultChecked}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-3 text-sm text-gray-700">{item.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Daily Summary
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>Never</option>
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Enable 2FA</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Login Sessions</h3>
                    <div className="space-y-3">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Current Session</p>
                            <p className="text-sm text-gray-600">Chrome on Windows • Active now</p>
                          </div>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Update Security</span>
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Appearance</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Theme</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { name: 'Light', value: 'light', description: 'Default light theme' },
                        { name: 'Dark', value: 'dark', description: 'Dark theme for low light' },
                        { name: 'System', value: 'system', description: 'Match system preference' },
                      ].map((theme) => (
                        <div key={theme.value} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="theme"
                              value={theme.value}
                              defaultChecked={theme.value === 'light'}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{theme.name}</p>
                              <p className="text-xs text-gray-600">{theme.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Sidebar</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 text-sm text-gray-700">Collapsed by default</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 text-sm text-gray-700">Show tooltips on hover</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Appearance</span>
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Language & Region</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>English (US)</option>
                          <option>English (UK)</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>Eastern Time (US & Canada)</option>
                          <option>Pacific Time (US & Canada)</option>
                          <option>Central Time (US & Canada)</option>
                          <option>Mountain Time (US & Canada)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">AI Features</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 text-sm text-gray-700">Enable AI suggestions</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 text-sm text-gray-700">Auto-generate quiz questions</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 text-sm text-gray-700">AI-powered grading assistance</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Default Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Assignment Type</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>Quiz</option>
                          <option>Assignment</option>
                          <option>Homework</option>
                          <option>Project</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Due Date</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>1 day</option>
                          <option>3 days</option>
                          <option>1 week</option>
                          <option>2 weeks</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;