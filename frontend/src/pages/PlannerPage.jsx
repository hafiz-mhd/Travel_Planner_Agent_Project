import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { generateItinerary } from '../api/client'
import ItineraryDisplay from '../components/ItineraryDisplay'
import dayjs from 'dayjs'

const POPULAR_DESTINATIONS = [
  'Bali',
  'Tokyo',
  'Paris',
  'New York',
  'Santorini',
  'Dubai'
]

const DESTINATIONS_4D = [
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    tag: 'Tropical Paradise',
    temp: '28°C',
    weather: 'Sunny & Warm',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85',
    video: 'https://cdn.coverr.co/videos/coverr-tropical-beach-waves-5232/1080p.mp4',
    badge: '4D Spatial Audio',
    desc: 'Lush green jungle waterfalls, volcanic beaches, and ancient cliffside temples.',
    highlights: ['Ubud Waterfall', 'Tegallalang Rice Terraces', 'Uluwatu Sunset Temple']
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    tag: 'Cyber Neon City',
    temp: '19°C',
    weather: 'Clear Skies',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=85',
    video: 'https://cdn.coverr.co/videos/coverr-tokyo-night-traffic-4581/1080p.mp4',
    badge: '4D Neon Depth',
    desc: 'Futuristic neon skyscrapers, historic Shinto shrines, and world-class culinary experiences.',
    highlights: ['Shibuya Crossing', 'Sensō-ji Temple', 'Akihabara Tech District']
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    tag: 'Golden Hour Romance',
    temp: '22°C',
    weather: 'Pleasant Breeze',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85',
    video: 'https://cdn.coverr.co/videos/coverr-eiffel-tower-sunset-4120/1080p.mp4',
    badge: '4D Sunset View',
    desc: 'Timeless art, iconic Eiffel Tower views, cozy street cafes, and haute couture.',
    highlights: ['Eiffel Tower Sunset', 'Louvre Museum', 'Seine River Cruise']
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    tag: 'Aegean Cliffside',
    temp: '25°C',
    weather: 'Sunny Coast',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=85',
    video: 'https://cdn.coverr.co/videos/coverr-santorini-coastline-5412/1080p.mp4',
    badge: '4D Cliff Parallax',
    desc: 'Stunning whitewashed cliffside villages overlooking the deep blue Aegean Sea.',
    highlights: ['Oia Sunset Point', 'Red Beach Volcanic Sand', 'Fira Cliff Path']
  }
]

const INTERESTS = [
  { label: 'Adventure', value: 'Adventure' },
  { label: 'Culture', value: 'Culture' },
  { label: 'Food', value: 'Food' },
  { label: 'Relaxation', value: 'Relaxation' },
  { label: 'Nature', value: 'Nature' },
  { label: 'Art', value: 'Art' },
  { label: 'Nightlife', value: 'Nightlife' },
  { label: 'Beach', value: 'Beach' },
  { label: 'History', value: 'History' },
  { label: 'Shopping', value: 'Shopping' },
  { label: 'Wildlife', value: 'Wildlife' },
  { label: 'Architecture', value: 'Architecture' },
]

const DEFAULT_FORM = {
  destination: '',
  start_date: dayjs().add(14, 'day').format('YYYY-MM-DD'),
  end_date: dayjs().add(18, 'day').format('YYYY-MM-DD'),
  budget_min: '',
  budget_max: '',
  num_travelers: 1,
  interests: [],
  save: true,
}

export default function PlannerPage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [numDays, setNumDays] = useState(5)
  const [showPreferences, setShowPreferences] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [active4DModal, setActive4DModal] = useState(null)

  const handleStartDateChange = (dateStr) => {
    const newEnd = dayjs(dateStr).add(numDays - 1, 'day').format('YYYY-MM-DD')
    setForm(p => ({ ...p, start_date: dateStr, end_date: newEnd }))
  }

  const handleNumDaysChange = (days) => {
    setNumDays(days)
    const newEnd = dayjs(form.start_date).add(days - 1, 'day').format('YYYY-MM-DD')
    setForm(p => ({ ...p, end_date: newEnd }))
  }

  const handleDestinationClick = (dest) => {
    setForm(p => ({ ...p, destination: dest }))
  }

  const handleQuickPlan4D = (destName) => {
    setForm(p => ({ ...p, destination: destName }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleInterest = (v) =>
    setForm(p => ({ ...p, interests: p.interests.includes(v) ? p.interests.filter(x => x !== v) : [...p.interests, v] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.destination.trim()) return

    setError('')
    setResult(null)
    setLoading(true)

    try {
      const res = await generateItinerary({
        ...form,
        user_id: user?.id || 1,
        budget_min: form.budget_min ? parseFloat(form.budget_min) : null,
        budget_max: form.budget_max ? parseFloat(form.budget_max) : null,
        num_travelers: parseInt(form.num_travelers) || 1,
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate itinerary. Is backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      {/* Main Glass Hero Card */}
      <div className="hero-glass-card">
        {/* Header Titles */}
        <div className="hero-header">
          <div className="hero-subtitle">4D IMMERSIVE TRAVEL ENGINE</div>
          <h1 className="hero-title">Plan Your Perfect Trip</h1>
          <p className="hero-desc">
            Explore world destinations in 4D visual depth. Tell us where you want to go and we'll craft an instant AI itinerary.
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSubmit}>
          <div className="hero-search-wrapper">
            <div className="hero-search-grid">
              {/* Where do you want to go */}
              <div className="search-field-cell">
                <div className="search-field-content">
                  <span className="search-field-label">Where do you want to go?</span>
                  <input
                    type="text"
                    className="search-field-input"
                    value={form.destination}
                    onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
                    placeholder="e.g. Bali, Japan, Switzerland..."
                    required
                  />
                </div>
              </div>

              {/* When are you going */}
              <div className="search-field-cell">
                <div className="search-field-content">
                  <span className="search-field-label">Start Date</span>
                  <input
                    type="date"
                    className="search-field-input"
                    value={form.start_date}
                    onChange={e => handleStartDateChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Number of Days */}
              <div className="search-field-cell">
                <div className="search-field-content">
                  <span className="search-field-label">Duration</span>
                  <select
                    className="search-field-input"
                    value={numDays}
                    onChange={e => handleNumDaysChange(parseInt(e.target.value))}
                    style={{ background: 'transparent' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 21, 30].map(n => (
                      <option key={n} value={n} style={{ background: '#0B1D2D', color: '#FFF' }}>
                        {n} {n === 1 ? 'Day' : 'Days'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Travelers */}
              <div className="search-field-cell">
                <div className="search-field-content">
                  <span className="search-field-label">Travelers</span>
                  <select
                    className="search-field-input"
                    value={form.num_travelers}
                    onChange={e => setForm(p => ({ ...p, num_travelers: e.target.value }))}
                    style={{ background: 'transparent' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10].map(n => (
                      <option key={n} value={n} style={{ background: '#0B1D2D', color: '#FFF' }}>
                        {n} {n === 1 ? 'person' : 'people'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <button type="submit" className="btn-plan-trip" disabled={loading}>
                {loading ? 'Planning…' : 'Plan My Trip'}
              </button>
            </div>
          </div>

          {/* Popular Destinations Chips */}
          <div className="popular-dest-row">
            <span className="popular-dest-label">Popular Destinations:</span>
            {POPULAR_DESTINATIONS.map(dest => (
              <button
                key={dest}
                type="button"
                className={`popular-chip ${form.destination === dest ? 'active' : ''}`}
                onClick={() => handleDestinationClick(dest)}
              >
                {dest}
              </button>
            ))}
          </div>

          {/* Expandable Preferences & Customization */}
          <div style={{ marginTop: '1.4rem', display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className={`highlighted-pref-btn ${showPreferences ? 'active' : ''}`}
              onClick={() => setShowPreferences(p => !p)}
            >
              <span>{showPreferences ? 'Hide Custom Preferences' : 'Customize Interests & Budget Range'}</span>
            </button>
          </div>

            {showPreferences && (
              <div className="preferences-drawer">
                <div style={{ marginBottom: '1rem' }}>
                  <span className="search-field-label">Select Your Interests</span>
                  <div className="tags-group">
                    {INTERESTS.map(({ label, value }) => (
                      <button
                        key={value}
                        type="button"
                        className={`tag-btn ${form.interests.includes(value) ? 'selected' : ''}`}
                        onClick={() => toggleInterest(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.8rem' }}>
                  <div>
                    <span className="search-field-label">Min Budget (₹)</span>
                    <input
                      type="number"
                      className="search-field-input"
                      style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.8rem', borderRadius: 8 }}
                      placeholder="e.g. 20000"
                      value={form.budget_min}
                      onChange={e => setForm(p => ({ ...p, budget_min: e.target.value }))}
                    />
                  </div>
                  <div>
                    <span className="search-field-label">Max Budget (₹)</span>
                    <input
                      type="number"
                      className="search-field-input"
                      style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.8rem', borderRadius: 8 }}
                      placeholder="e.g. 80000"
                      value={form.budget_max}
                      onChange={e => setForm(p => ({ ...p, budget_max: e.target.value }))}
                    />
                  </div>
                </div>

                <label className="save-toggle">
                  <input
                    type="checkbox"
                    checked={form.save}
                    onChange={e => setForm(p => ({ ...p, save: e.target.checked }))}
                  />
                  <span className="save-toggle-track">
                    <span className="save-toggle-thumb" />
                  </span>
                  <span className="save-toggle-label">Save this trip to My Trips</span>
                </label>
              </div>
            )}
        </form>

        {error && <div className="alert alert-error" style={{ marginTop: '1.2rem' }}>{error}</div>}

        {/* ── 4D IMMERSIVE DESTINATIONS SHOWCASE SECTION ── */}
        <div className="fourd-section">
          <div className="fourd-section-header">
            <div>
              <span className="fourd-section-badge">4D VISUAL EXPERIENCE</span>
              <h2 className="fourd-section-title">Explore Top Destinations in 4D</h2>
            </div>
            <span className="fourd-section-subtitle">Click to view 4D cinematic video previews</span>
          </div>

          <div className="fourd-grid">
            {DESTINATIONS_4D.map(dest => (
              <div key={dest.id} className="fourd-card">
                {/* 4D Image Container */}
                <div className="fourd-card-media">
                  <img src={dest.image} alt={dest.name} className="fourd-card-img" />
                  <div className="fourd-card-overlay" />
                  <span className="fourd-tag">{dest.tag}</span>
                  <div className="fourd-weather-chip">
                    <span>{dest.temp}</span> · <span>{dest.weather}</span>
                  </div>
                  <button
                    type="button"
                    className="fourd-play-btn"
                    onClick={() => setActive4DModal(dest)}
                    title="Watch 4D Video Preview"
                  >
                    4D Preview
                  </button>
                </div>

                {/* Card Content */}
                <div className="fourd-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.3rem' }}>
                    <h3 className="fourd-card-name">{dest.name}, <span className="fourd-card-country">{dest.country}</span></h3>
                    <span className="fourd-badge-pill">{dest.badge}</span>
                  </div>
                  <p className="fourd-card-desc">{dest.desc}</p>
                  
                  <div className="fourd-card-actions">
                    <button
                      type="button"
                      className="btn-fourd-plan"
                      onClick={() => handleQuickPlan4D(dest.name)}
                    >
                      Plan {dest.name}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid (4 Top Tiles) */}
        <div className="features-grid">
          <div className="feature-glass-card">
            <div className="feature-card-title">Personalized Itineraries</div>
          </div>
          <div className="feature-glass-card">
            <div className="feature-card-title">AI-Powered Recommendations</div>
          </div>
          <div className="feature-glass-card">
            <div className="feature-card-title">Budget Friendly Options</div>
          </div>
          <div className="feature-glass-card">
            <div className="feature-card-title">Travel Safe & Smart</div>
          </div>
        </div>

        {/* Why Choose Our Travel Planner? Grid (4 Bottom Tiles) */}
        <div className="why-choose-section">
          <h2 className="why-choose-title">Why Choose Our Travel Planner?</h2>
          <div className="why-grid">
            <div className="why-card">
              <h4>Save Time</h4>
              <p>Get complete itineraries in seconds</p>
            </div>
            <div className="why-card">
              <h4>Discover More</h4>
              <p>Find hidden gems and local favorites</p>
            </div>
            <div className="why-card">
              <h4>Travel Smarter</h4>
              <p>Based on your interests, budget and style</p>
            </div>
            <div className="why-card">
              <h4>Make Memories</h4>
              <p>Focus on the journey, not the planning</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4D VIDEO PREVIEW GLASS MODAL ── */}
      {active4DModal && (
        <div className="fourd-modal-overlay" onClick={() => setActive4DModal(null)}>
          <div className="fourd-modal-card" onClick={e => e.stopPropagation()}>
            <button className="fourd-modal-close" onClick={() => setActive4DModal(null)}>✕</button>

            <div className="fourd-modal-video-wrapper">
              <video
                className="fourd-modal-video"
                autoPlay
                loop
                muted
                playsInline
                poster={active4DModal.image}
              >
                <source src={active4DModal.video} type="video/mp4" />
              </video>
              <div className="fourd-modal-video-overlay" />
              <div className="fourd-modal-video-header">
                <span className="fourd-badge-pill">{active4DModal.badge}</span>
                <h2>{active4DModal.name}, {active4DModal.country}</h2>
              </div>
            </div>

            <div className="fourd-modal-body">
              <div className="fourd-modal-meta-row">
                <div><strong>Weather:</strong> {active4DModal.temp} · {active4DModal.weather}</div>
                <div><strong>Tag:</strong> {active4DModal.tag}</div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {active4DModal.desc}
              </p>

              <div style={{ marginBottom: '1.2rem' }}>
                <span className="search-field-label" style={{ display: 'block', marginBottom: '.4rem' }}>Top Highlights:</span>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  {active4DModal.highlights.map(h => (
                    <span key={h} className="fourd-highlight-chip">{h}</span>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={() => {
                  handleQuickPlan4D(active4DModal.name)
                  setActive4DModal(null)
                }}
              >
                Auto-Fill & Plan {active4DModal.name} Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="generating-card">
          <div className="spinner" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
            Crafting Your Personalized Itinerary…
          </h3>
          <p style={{ marginTop: '0.4rem', color: '#94A3B8', fontSize: '0.88rem' }}>
            Analyzing destination data · Designing day-by-day schedules · Finding hidden gems
          </p>
        </div>
      )}

      {/* Generated Result */}
      {result && !loading && (
        <div className="itinerary-container">
          <ItineraryDisplay
            result={result}
            onViewTrip={() => result.trip_id && navigate(`/trips/${result.trip_id}`)}
          />
        </div>
      )}
    </div>
  )
}
