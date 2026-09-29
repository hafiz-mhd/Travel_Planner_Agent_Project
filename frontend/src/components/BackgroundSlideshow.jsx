import React, { useState, useEffect } from 'react'

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=2000&q=85', // Lush Forest Sunlight Canopy
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2000&q=85', // Bali Tropical Jungle Waterfall
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=85', // Mist Emerald Redwood Forest
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=85', // Alpine Green Valley & River
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=2000&q=85', // Swiss Alps Green Meadow
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=85', // Foggy Mountain Forest Sunset
]

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length)
    }, 6500) // Change image every 6.5 seconds
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-slideshow-container">
      {BACKGROUND_IMAGES.map((imgUrl, i) => (
        <div
          key={imgUrl}
          className={`bg-slideshow-slide ${i === index ? 'active' : ''}`}
          style={{ backgroundImage: `url(${imgUrl})` }}
        />
      ))}
      <div className="bg-slideshow-overlay" />
    </div>
  )
}
