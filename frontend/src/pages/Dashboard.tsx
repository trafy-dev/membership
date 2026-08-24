import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getProfile, updateProfile, updateProfilePicture, downloadIdCard, changePassword, logout } from '../lib/api'
import logo from '../assets/logo.jpg'

interface MemberProfile {
  id: number
  member_id: string
  name: string
  father_name: string
  email: string
  address: string
  district: string
  state: string
  contact_number: string
  blood_group: string
  profession: string
  is_student: boolean | number
  course: string
  year: string
  institution_name: string
  city: string
  profile_picture: string
  created_at: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'info' | 'picture' | 'events' | 'settings'>('info')
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [downloading, setDownloading] = useState(false)

  // Edit profile state
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isStudent, setIsStudent] = useState(false)

  // Picture update preview
  const [picPreview, setPicPreview] = useState<string | null>(null)
  const [picFile, setPicFile] = useState<File | null>(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const res = await getProfile()
      if (res.success && res.data?.profile) {
        setProfile(res.data.profile)
        setIsStudent(Boolean(res.data.profile.is_student))
        setFormData({
          name: res.data.profile.name || '',
          father_name: res.data.profile.father_name || '',
          address: res.data.profile.address || '',
          district: res.data.profile.district || '',
          state: res.data.profile.state || '',
          contact_number: res.data.profile.contact_number || '',
          blood_group: res.data.profile.blood_group || '',
          profession: res.data.profile.profession || '',
          course: res.data.profile.course || '',
          year: res.data.profile.year || '',
          institution_name: res.data.profile.institution_name || '',
          city: res.data.profile.city || ''
        })
      } else {
        navigate('/login')
      }
    } catch {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleDownloadId = async () => {
    try {
      setDownloading(true)
      setError('')
      await downloadIdCard()
    } catch (err: any) {
      setError(err.message || 'Failed to download ID card.')
    } finally {
      setDownloading(false)
    }
  }

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await updateProfile({
        ...formData,
        is_student: isStudent ? '1' : '0'
      })
      if (res.success) {
        setSuccess('Profile updated successfully!')
        fetchProfileData()
      } else {
        setError(res.message || 'Failed to update profile.')
      }
    } catch {
      setError('Network error while updating profile.')
    }
  }

  const handlePicSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPicFile(file)
      setPicPreview(URL.createObjectURL(file))
    }
  }

  const handlePicUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!picFile) return
    setError('')
    setSuccess('')
    const fd = new FormData()
    fd.append('profile_picture', picFile)
    try {
      const res = await updateProfilePicture(fd)
      if (res.success) {
        setSuccess('Profile picture updated successfully!')
        setPicFile(null)
        setPicPreview(null)
        fetchProfileData()
      } else {
        setError(res.message || 'Failed to upload photo.')
      }
    } catch {
      setError('Network error while uploading photo.')
    }
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await changePassword(currentPassword, newPassword)
      if (res.success) {
        setSuccess('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
      } else {
        setError(res.message || 'Failed to change password.')
      }
    } catch {
      setError('Network error while changing password.')
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container text-center py-12">
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="dashboard-page">
      {/* Top Bar */}
      <header className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="DMP" className="logo-badge" />
            <span className="font-display tracking-wider text-white font-bold text-lg hidden sm:inline">
              திராவிட மாணவர் பேரவை
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={handleDownloadId} disabled={downloading} className="btn-primary btn-sm">
              {downloading ? 'Generating PDF...' : '🪪 Download ID Card'}
            </button>
            <button onClick={handleLogout} className="btn-ghost btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout wrap">
        {/* Sidebar Profile Card */}
        <aside className="dashboard-sidebar">
          <div className="member-card-preview">
            <div className="member-avatar-wrapper">
              <img
                src={profile.profile_picture || '/placeholder.png'}
                alt={profile.name}
                className="member-avatar"
              />
            </div>
            <h2 className="member-name">{profile.name}</h2>
            <div className="member-badge-id">{profile.member_id}</div>
            <p className="member-meta-item">
              <span className="meta-label">Blood Group:</span>{' '}
              <span className="meta-val text-red-500 font-bold">{profile.blood_group || 'N/A'}</span>
            </p>
            <p className="member-meta-item">
              <span className="meta-label">Contact:</span>{' '}
              <span className="meta-val">{profile.contact_number || 'N/A'}</span>
            </p>
            <p className="member-meta-item">
              <span className="meta-label">City:</span>{' '}
              <span className="meta-val">{profile.city || 'N/A'}</span>
            </p>
          </div>

          <nav className="dashboard-tabs">
            <button
              className={`dashboard-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => { setActiveTab('info'); setError(''); setSuccess('') }}
            >
              📋 Profile Information
            </button>
            <button
              className={`dashboard-tab-btn ${activeTab === 'picture' ? 'active' : ''}`}
              onClick={() => { setActiveTab('picture'); setError(''); setSuccess('') }}
            >
              🖼️ Profile Picture
            </button>
            <button
              className={`dashboard-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => { setActiveTab('events'); setError(''); setSuccess('') }}
            >
              🎟️ Event Registration
            </button>
            <button
              className={`dashboard-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('settings'); setError(''); setSuccess('') }}
            >
              ⚙️ Settings
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-content">
          {error && <div className="auth-error mb-4">{error}</div>}
          {success && <div className="auth-success mb-4">{success}</div>}

          {/* TAB 1: Profile Information */}
          {activeTab === 'info' && (
            <div className="dashboard-panel">
              <h3 className="panel-title">Member Profile Information</h3>
              <p className="panel-desc">View and update your personal & student details.</p>

              <form onSubmit={handleProfileUpdate} className="auth-form mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Father Name</label>
                    <input
                      type="text"
                      value={formData.father_name || ''}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    rows={2}
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>District</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      value={formData.contact_number || ''}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Blood Group</label>
                    <select
                      value={formData.blood_group || ''}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Profession</label>
                    <input
                      type="text"
                      value={formData.profession || ''}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group form-group-toggle mt-2">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={isStudent}
                      onChange={(e) => setIsStudent(e.target.checked)}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-slider" />
                    <span>Student Profile</span>
                  </label>
                </div>

                {isStudent && (
                  <div className="student-fields mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label>Course</label>
                        <input
                          type="text"
                          value={formData.course || ''}
                          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Year</label>
                        <input
                          type="text"
                          value={formData.year || ''}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Institution Name</label>
                      <input
                        type="text"
                        value={formData.institution_name || ''}
                        onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-primary mt-4">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Profile Picture */}
          {activeTab === 'picture' && (
            <div className="dashboard-panel">
              <h3 className="panel-title">Update Profile Picture</h3>
              <p className="panel-desc">Upload a high-resolution photo for your Membership ID Card.</p>

              <form onSubmit={handlePicUpload} className="auth-form mt-6">
                <div className="file-upload-area max-w-sm">
                  {picPreview ? (
                    <img src={picPreview} alt="Preview" className="image-preview" />
                  ) : profile.profile_picture ? (
                    <img src={profile.profile_picture} alt="Current" className="image-preview" />
                  ) : (
                    <div className="file-upload-placeholder">
                      <span className="file-upload-icon">📷</span>
                      <span>Click to select new photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePicSelect}
                    className="file-input-hidden"
                  />
                </div>
                {picFile && (
                  <button type="submit" className="btn-primary mt-4">
                    Upload & Save Photo
                  </button>
                )}
              </form>
            </div>
          )}

          {/* TAB 3: Event Registration */}
          {activeTab === 'events' && (
            <div className="dashboard-panel">
              <h3 className="panel-title">Event Registration Information</h3>
              <p className="panel-desc">Upcoming rallies, student forums, and community gatherings.</p>

              <div className="empty-events-state mt-6">
                <div className="empty-events-icon">🚩</div>
                <h4 className="text-white font-display text-lg mb-2">No Active Registrations</h4>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  You are not currently registered for any upcoming events. Stay tuned to announcements for new forums and symposiums.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Settings */}
          {activeTab === 'settings' && (
            <div className="dashboard-panel">
              <h3 className="panel-title">Account Settings</h3>
              <p className="panel-desc">Change password and manage your account security.</p>

              <form onSubmit={handlePasswordChange} className="auth-form mt-6 max-w-md">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label>New Password (min 6 characters)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter new password"
                  />
                </div>
                <button type="submit" className="btn-primary mt-4">
                  Update Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
