'use client'

import { useState, useEffect } from 'react'
import { Plus, Eye } from 'lucide-react'
import { ClientServiceCard } from '@/components/ServiceCard'

interface Product {
  id: string
  title: string
  description: string | null
  price: number
  category: string
  processingTime: string | null
}

interface Order {
  id: string
  status: string
  paymentMethod: string | null
  invoiceUrl: string | null
  createdAt: string
  product: {
    id: string
    title: string
    price: number
    category: string
  }
}

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    fetchOrders()
    fetchProducts()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

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

  const handleCreateOrder = async () => {
    if (!selectedProduct) return

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          paymentMethod: paymentMethod || 'pending'
        }),
      })

      if (response.ok) {
        fetchOrders()
        setShowOrderModal(false)
        setSelectedProduct(null)
        setPaymentMethod('')
        alert('Order created successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('An error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">View your order history and place new orders</p>
        </div>
        <button
          onClick={() => setShowOrderModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Order
        </button>
      </div>

      {/* Available Services Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Available Services</h2>
          <p className="text-gray-600 mt-1">Browse our legal services and place orders</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No services available</h3>
              <p className="text-gray-500">Services will be available soon. Please check back later.</p>
            </div>
          ) : (
            products.map((product) => (
              <ClientServiceCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                subtitle="All-inclusive package"
                description={product.description || "Professional legal service"}
                whatsIncluded={["Legal consultation", "Document review", "Expert guidance"]}
                processingTime={product.processingTime || '2-4 weeks'}
                status="Active"
                createdDate="23/10/2025"
                iconType={product.category === 'Contracts' ? 'document' :
                         product.category === 'Corporate Law' ? 'building' : 'briefcase'}
                onOrder={(id) => {
                  const selected = products.find(p => p.id === id)
                  if (selected) {
                    setSelectedProduct(selected)
                    setShowOrderModal(true)
                  }
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Order History Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Order History</h2>
          <p className="text-gray-600 mt-1">Your recent legal service orders</p>
        </div>

        {/* Orders Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
              <p className="text-gray-500">You haven't placed any orders yet.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowOrderModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Place Your First Order
                </button>
              </div>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 hover:border-red-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{order.product.title}</h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.product.category === 'Contracts' ? 'bg-blue-100 text-blue-800' :
                        order.product.category === 'Legal Documents' ? 'bg-green-100 text-green-800' :
                        order.product.category === 'Corporate Law' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.product.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                      {order.paymentMethod && (
                        <p>Payment: {order.paymentMethod.replace('_', ' ')}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">Rp {order.product.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {order.invoiceUrl && (
                    <a
                      href={order.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Invoice
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowTrackingModal(true)
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-red-200 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Track Order
                  </button>
                  <button className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium">
                    Checkout
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Creation Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Place New Order</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Select Service</label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value)
                    setSelectedProduct(product || null)
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                >
                  <option value="">Choose a service...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title} - Rp {product.price.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>
              {selectedProduct && (
                <div className="bg-gray-50 p-3 rounded">
                  <h3 className="font-medium">{selectedProduct.title}</h3>
                  <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                  <p className="text-sm font-medium text-red-600">Rp {selectedProduct.price.toLocaleString('id-ID')}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                >
                  <option value="">Select payment method...</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="pending">Will pay later</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowOrderModal(false)
                    setSelectedProduct(null)
                    setPaymentMethod('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={!selectedProduct}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Order Tracking</h2>
              <button
                onClick={() => {
                  setShowTrackingModal(false)
                  setSelectedOrder(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedOrder.product.title}</h3>
                  <p className="text-sm text-gray-600">Order #{selectedOrder.id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">Ordered: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">Rp {selectedOrder.product.price.toLocaleString('id-ID')}</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-4">Order Progress</h4>

              {/* Step 1: Order Placed */}
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  ['pending', 'in_progress', 'completed'].includes(selectedOrder.status)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">Order Placed</h5>
                  <p className="text-sm text-gray-600">Your order has been successfully placed and is being processed.</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Step 2: Payment Processing */}
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  ['in_progress', 'completed'].includes(selectedOrder.status) && selectedOrder.paymentMethod !== 'pending'
                    ? 'bg-green-500 text-white'
                    : selectedOrder.paymentMethod === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {selectedOrder.paymentMethod === 'pending' ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">Payment Processing</h5>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.paymentMethod === 'pending'
                      ? 'Waiting for payment confirmation.'
                      : selectedOrder.paymentMethod
                      ? `Payment received via ${selectedOrder.paymentMethod.replace('_', ' ')}.`
                      : 'Payment processing in progress.'
                    }
                  </p>
                  {selectedOrder.paymentMethod && selectedOrder.paymentMethod !== 'pending' && (
                    <p className="text-xs text-gray-500 mt-1">Payment confirmed</p>
                  )}
                </div>
              </div>

              {/* Step 3: Document Review */}
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedOrder.status === 'in_progress' || selectedOrder.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">Document Review</h5>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.status === 'in_progress' || selectedOrder.status === 'completed'
                      ? 'Your documents are being reviewed by our legal experts.'
                      : 'Document review will begin once payment is confirmed.'
                    }
                  </p>
                  {(selectedOrder.status === 'in_progress' || selectedOrder.status === 'completed') && (
                    <p className="text-xs text-gray-500 mt-1">In progress</p>
                  )}
                </div>
              </div>

              {/* Step 4: Legal Processing */}
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedOrder.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : selectedOrder.status === 'in_progress'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">Legal Processing</h5>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.status === 'completed'
                      ? 'Legal processing has been completed successfully.'
                      : selectedOrder.status === 'in_progress'
                      ? 'Your case is being processed by our legal team.'
                      : 'Legal processing will begin after document review.'
                    }
                  </p>
                  {selectedOrder.status === 'completed' && (
                    <p className="text-xs text-green-600 mt-1 font-medium">✓ Completed</p>
                  )}
                  {selectedOrder.status === 'in_progress' && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">In Progress</p>
                  )}
                </div>
              </div>

              {/* Step 5: Completion */}
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedOrder.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">Completion</h5>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.status === 'completed'
                      ? 'Your order has been completed successfully. You will receive all deliverables soon.'
                      : 'Order completion pending.'
                    }
                  </p>
                  {selectedOrder.status === 'completed' && (
                    <p className="text-xs text-green-600 mt-1 font-medium">✓ Order Completed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowTrackingModal(false)
                  setSelectedOrder(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
              {selectedOrder.invoiceUrl && (
                <a
                  href={selectedOrder.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Invoice
                </a>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
