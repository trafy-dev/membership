import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../lib/api'
import logo from '../assets/logo.jpg'

export default function Signup() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isStudent, setIsStudent] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    // Set is_student based on checkbox
    formData.set('is_student', isStudent ? 'true' : 'false')

    // Check disclaimer
    const disclaimer = form.querySelector<HTMLInputElement>('[name="disclaimer_accepted"]')
    if (!disclaimer?.checked) {
      setError('You must accept the disclaimer to register.')
      setLoading(false)
      return
    }
    formData.set('disclaimer_accepted', 'true')

    try {
      const result = await signup(formData)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.message || 'Registration failed.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container signup-container">
        {/* Header */}
        <div className="auth-header">
          <Link to="/">
            <img src={logo} alt="DMP" className="auth-logo" />
          </Link>
          <h1 className="auth-title">Join the Movement</h1>
          <p className="auth-subtitle">Become a member of திராவிட மாணவர் பேரவை</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" encType="multipart/form-data">
          {/* 1. Name */}
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input type="text" id="name" name="name" required placeholder="Enter your full name" />
          </div>

          {/* 2. Father Name */}
          <div className="form-group">
            <label htmlFor="father_name">Father Name *</label>
            <input type="text" id="father_name" name="father_name" required placeholder="Enter your father's name" />
          </div>

          {/* 3. Address */}
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" rows={3} placeholder="Enter your full address" />
          </div>

          {/* 4. District */}
          <div className="form-group">
            <label htmlFor="district">District</label>
            <input type="text" id="district" name="district" placeholder="Enter your district" />
          </div>

          {/* 5. State */}
          <div className="form-group">
            <label htmlFor="state">State</label>
            <input type="text" id="state" name="state" defaultValue="Tamil Nadu" placeholder="Enter your state" />
          </div>

          {/* 6. Contact Number */}
          <div className="form-group">
            <label htmlFor="contact_number">Contact Number</label>
            <input type="tel" id="contact_number" name="contact_number" placeholder="Enter your mobile number" />
          </div>

          {/* 7. Blood Group */}
          <div className="form-group">
            <label htmlFor="blood_group">Blood Group</label>
            <select id="blood_group" name="blood_group">
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

          {/* 8. Profession */}
          <div className="form-group">
            <label htmlFor="profession">Profession</label>
            <input type="text" id="profession" name="profession" placeholder="Enter your profession" />
          </div>

          {/* Student Toggle */}
          <div className="form-group form-group-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isStudent}
                onChange={(e) => setIsStudent(e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-slider" />
              <span>I am a Student</span>
            </label>
          </div>

          {/* Student Fields (9-11) */}
          {isStudent && (
            <div className="student-fields">
              <div className="form-group">
                <label htmlFor="course">Course</label>
                <input type="text" id="course" name="course" placeholder="e.g. B.Tech, B.A., B.Sc." />
              </div>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input type="text" id="year" name="year" placeholder="e.g. 1st Year, 2nd Year" />
              </div>
              <div className="form-group">
                <label htmlFor="institution_name">Institution Name</label>
                <input type="text" id="institution_name" name="institution_name" placeholder="Enter your college/university" />
              </div>
            </div>
          )}

          {/* 12. City */}
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input type="text" id="city" name="city" placeholder="Enter your city" />
          </div>

          <div className="form-divider" />

          {/* Email (for login) */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input type="email" id="email" name="email" required placeholder="Enter your email address" />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input type="password" id="password" name="password" required minLength={6} placeholder="Create a password (min 6 characters)" />
          </div>

          <div className="form-divider" />

          {/* Profile Picture */}
          <div className="form-group">
            <label htmlFor="profile_picture">Member Profile Picture *</label>
            <div className="file-upload-area">
              {preview ? (
                <img src={preview} alt="Preview" className="image-preview" />
              ) : (
                <div className="file-upload-placeholder">
                  <span className="file-upload-icon">📷</span>
                  <span>Click to upload your photo</span>
                </div>
              )}
              <input
                type="file"
                id="profile_picture"
                name="profile_picture"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={handleImageChange}
                className="file-input-hidden"
              />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="form-group form-group-disclaimer">
            <label className="disclaimer-label">
              <input type="checkbox" name="disclaimer_accepted" />
              <span>
                I hereby declare that the information provided is true and correct.
                I agree to abide by the rules and regulations of திராவிட மாணவர் பேரவை.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Registering...' : 'Join the Movement'}
          </button>
        </form>

        <p className="auth-switch">
          Already a member? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}
