'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface MenuItem {
  id?: string // Made optional for new items
  name: string
  description: string
  price: number
  category: string
  available: boolean
}

// Default state for a fresh item
const INITIAL_ITEM: MenuItem = {
  name: '',
  description: '',
  price: 0,
  category: 'Main',
  available: true,
}

export default function AdminDashboard() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching items:', error)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  // New function to handle both Create and Update
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingItem) return

    const isNew = !editingItem.id

    if (isNew) {
      // INSERT LOGIC
      const { data, error } = await supabase
        .from('menu_items')
        .insert([editingItem])
        .select()

      if (error) {
        alert('Error adding item: ' + error.message)
      } else {
        setItems([...items, ...data])
        closeModal()
      }
    } else {
      // UPDATE LOGIC
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          category: editingItem.category
        })
        .eq('id', editingItem.id)

      if (error) {
        alert('Error updating item: ' + error.message)
      } else {
        setItems(items.map(item => item.id === editingItem.id ? editingItem : item))
        closeModal()
      }
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  async function toggleAvailability(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('menu_items')
      .update({ available: !currentStatus })
      .eq('id', id)

    if (!error) {
      setItems(items.map(item => 
        item.id === id ? { ...item, available: !currentStatus } : item
      ))
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-zinc-500">Manage your restaurant menu items</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => fetchItems()}
              className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              Refresh
            </button>
            {/* ADD NEW ITEM BUTTON */}
            <button 
              onClick={() => {
                setEditingItem(INITIAL_ITEM)
                setIsModalOpen(true)
              }}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + Add New Item
            </button>
          </div>
        </header>

        {/* ... (Table code remains exactly same as yours) ... */}
        {/* Note: In your table mapping, make sure to use item.id as key */}

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               {/* ... (Your existing Table Thead and Tbody) ... */}
               <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">Loading...</td></tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</div>
                      <div className="text-xs text-zinc-500 truncate max-w-xs">{item.description}</div>
                    </td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                       <button
                          onClick={() => toggleAvailability(item.id!, item.available)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            item.available ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-800'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${item.available ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setEditingItem(item)
                          setIsModalOpen(true)
                        }}
                        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
              {editingItem.id ? 'Edit Item' : 'Add New Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none"
                  >
                    <option value="Main">Main</option>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Drink">Drink</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-medium hover:opacity-90 transition-opacity"
                >
                  {editingItem.id ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}