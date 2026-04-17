import { useState, useEffect } from 'react'

interface InstagramPost {
  id: string
  imageUrl: string
  caption?: string
  permalink: string
  timestamp: string
}

// Fallback data (Unsplash placeholders - sport/activities themed)
const FALLBACK_POSTS: InstagramPost[] = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop",
    caption: "Badminton training",
    permalink: "https://www.instagram.com/unicorns_lodz/",
    timestamp: new Date().toISOString()
  },
  {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=400&fit=crop",
    caption: "Volleyball match",
    permalink: "https://www.instagram.com/unicorns_lodz/",
    timestamp: new Date().toISOString()
  },
  {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop",
    caption: "Dance class",
    permalink: "https://www.instagram.com/unicorns_lodz/",
    timestamp: new Date().toISOString()
  },
  {
    id: "4",
    imageUrl: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=400&h=400&fit=crop",
    caption: "Board games night",
    permalink: "https://www.instagram.com/unicorns_lodz/",
    timestamp: new Date().toISOString()
  },
  {
    id: "5",
    imageUrl: "https://images.unsplash.com/photo-1533071115214-8b8ddfa44bf2?w=400&h=400&fit=crop",
    caption: "Squash training",
    permalink: "https://www.instagram.com/unicorns_lodz/",
    timestamp: new Date().toISOString()
  },
  {
    id: "6",
    imageUrl: "https://images.unsplash.com/photo-1578972474928-34aafffea0e3?w=400&h=400&fit=crop",
    caption: "Kayaking trip",
    permalink: "https://www.instagram.com/unicorns_lodz/",
    timestamp: new Date().toISOString()
  },
  {
    id: "7",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    caption: "Cycling group",
    permalink: "https://www.instagram.com/unicorns_lodz/",
    timestamp: new Date().toISOString()
  },
  {
    id: "8",
    imageUrl: "https://images.unsplash.com/photo-1593766787879-e8c78e09cec1?w=400&h=400&fit=crop",
    caption: "Tournament day",
    permalink: "https://www.instagram.com/unicorns_lodz/",
    timestamp: new Date().toISOString()
  }
]

export default function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInstagramPosts()
  }, [])

  const fetchInstagramPosts = async () => {
    // Try API first (if configured)
    // TODO: Uncomment when Instagram Edge Function is deployed
    /*
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-instagram-feed`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data?.posts && data.posts.length > 0) {
          setPosts(data.posts)
          setLoading(false)
          return
        }
      }
    } catch (err) {
      console.warn('Instagram API failed, using fallback:', err)
    }
    */

    // Fallback: hardcoded URLs (Unsplash placeholders)
    setPosts(FALLBACK_POSTS)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {posts.slice(0, 8).map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all"
        >
          <img
            src={post.imageUrl}
            alt={post.caption || 'Instagram post'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 text-4xl">📷</span>
          </div>
        </a>
      ))}
    </div>
  )
}
