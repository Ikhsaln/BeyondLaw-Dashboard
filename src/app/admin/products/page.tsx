'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Package, Tag, Calendar, MoreVertical } from 'lucide-react'
import { formatRupiah } from '@/utils/currency'
import ServiceCard from '@/components/ServiceCard'
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog'

interface Product {
  id: string
  title: string
  description: string | null
  price: number
  category: string
  processingTime: string | null
  whatsIncluded: string | null
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    processingTime: '',
    whatsIncluded: [] as string[]
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          processingTime: formData.processingTime,
          whatsIncluded: formData.whatsIncluded
        }),
      })

      if (response.ok) {
        fetchProducts()
        setShowForm(false)
        setEditingProduct(null)
        setFormData({ title: '', description: '', price: '', category: '', processingTime: '', whatsIncluded: [] })
      } else {
        const error = await response.json()
        alert(error.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('An error occurred')
    }
  }

  const addWhatsIncludedItem = () => {
    setFormData(prev => ({
      ...prev,
      whatsIncluded: [...prev.whatsIncluded, '']
    }))
  }

  const updateWhatsIncludedItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      whatsIncluded: prev.whatsIncluded.map((item, i) => i === index ? value : item)
    }))
  }

  const removeWhatsIncludedItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whatsIncluded: prev.whatsIncluded.filter((_, i) => i !== index)
    }))
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    // Parse whatsIncluded from database
    let whatsIncludedArray: string[] = []
    if (product.whatsIncluded) {
      try {
        const parsed = JSON.parse(product.whatsIncluded)
        whatsIncludedArray = Array.isArray(parsed) ? parsed : []
      } catch {
        whatsIncludedArray = []
      }
    }

    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      processingTime: product.processingTime || '',
      whatsIncluded: whatsIncludedArray
    })
    setShowForm(true)
  }

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProducts()
        setShowDeleteDialog(false)
        setDeletingProduct(null)
      } else {
        const error = await response.json()
        alert(error.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setDeletingProduct(null)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(products.map(p => p.category))]
  const stats = {
    total: products.length,
    totalValue: products.reduce((sum, p) => sum + p.price, 0),
    categories: categories.length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your legal services catalog</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-200 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="p-3 bg-slate-500 bg-opacity-30 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-neutral-600 to-neutral-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-200 text-sm font-medium">Total Value</p>
              <p className="text-3xl font-bold">{formatRupiah(stats.totalValue)}</p>
            </div>
            <div className="p-3 bg-neutral-500 bg-opacity-30 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-stone-600 to-stone-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-200 text-sm font-medium">Categories</p>
              <p className="text-3xl font-bold">{stats.categories}</p>
            </div>
            <div className="p-3 bg-stone-500 bg-opacity-30 rounded-lg">
              <Tag className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 min-w-48 text-gray-900"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProducts.map((product) => {
          // Map category to icon type
          const getIconType = (category: string) => {
            switch (category.toLowerCase()) {
              case 'contract law':
                return 'document' as const
              case 'business law':
                return 'building' as const
              case 'intellectual property':
                return 'briefcase' as const
              default:
                return 'document' as const
            }
          }

          return (
            <ServiceCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              subtitle={product.category}
              description={product.description || 'No description available'}
              whatsIncluded={product.whatsIncluded || []}
              processingTime={product.processingTime || '2–4 weeks'}
              status="Active"
              createdDate={new Date(product.createdAt).toLocaleDateString('id-ID')}
              iconType={getIconType(product.category)}
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDeleteClick(product)}
            />
          )
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            {products.length === 0
              ? "Get started by adding your first legal service."
              : "Try adjusting your search or filter criteria."
            }
          </p>
          {products.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2 inline" />
              Add Your First Product
            </button>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter product title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none text-gray-900 placeholder-gray-500"
                    placeholder="Describe the legal service..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (IDR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900"
                    >
                      <option value="" className="text-gray-500">Select category</option>
                      <option value="Contract Law" className="text-gray-900">Contract Law</option>
                      <option value="Business Law" className="text-gray-900">Business Law</option>
                      <option value="Intellectual Property" className="text-gray-900">Intellectual Property</option>
                      <option value="Employment Law" className="text-gray-900">Employment Law</option>
                      <option value="General Legal" className="text-gray-900">General Legal</option>
                      <option value="Document Services" className="text-gray-900">Document Services</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processing Time
                  </label>
                  <select
                    value={formData.processingTime}
                    onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900"
                  >
                    <option value="" className="text-gray-500">Select processing time</option>
                    <option value="1-7 hari" className="text-gray-900">1-7 hari</option>
                    <option value="1-2 minggu" className="text-gray-900">1-2 minggu</option>
                    <option value="2-3 minggu" className="text-gray-900">2-3 minggu</option>
                    <option value="3-4 minggu" className="text-gray-900">3-4 minggu</option>
                  </select>
                </div>

                {/* What's Included Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      What's Included
                    </label>
                    <button
                      type="button"
                      onClick={addWhatsIncludedItem}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.whatsIncluded.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateWhatsIncludedItem(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                          placeholder="Enter feature or service..."
                        />
                        <button
                          type="button"
                          onClick={() => removeWhatsIncludedItem(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {formData.whatsIncluded.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No items added yet. Click "Add Item" to include features or services.
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingProduct(null)
                      setFormData({ title: '', description: '', price: '', category: '', processingTime: '', whatsIncluded: [] })
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone and will also remove all associated orders."
        itemName={deletingProduct?.title || ''}
        isLoading={isDeleting}
      />
    </div>
  )
}
