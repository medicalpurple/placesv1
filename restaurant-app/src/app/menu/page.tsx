'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
}

const CATEGORIES = ['All', 'Appetizers', 'Mains', 'Desserts', 'Drinks']

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true)
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('name')

      if (error) {
        console.error('Error fetching menu:', error)
      } else {
        setItems(data || [])
      }
      setLoading(false)
    }

    fetchMenu()
  }, [])

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase())

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
      <header className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">Our Menu</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">Freshly prepared, locally sourced ingredients.</p>
      </header>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black shadow-lg'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-8 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold tracking-tight leading-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                      {item.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-700">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed mb-6 flex-grow">
                    {item.description}
                  </p>
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-24">
            <p className="text-zinc-500 text-lg italic">No items available in this category at the moment.</p>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-zinc-500 text-sm italic">Menu items and prices are subject to change based on seasonality and availability.</p>
      </footer>
    </div>
  )
}
