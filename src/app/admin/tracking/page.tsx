'use client'

import { useState, useEffect } from 'react'
import { Search, Clock, CheckCircle, XCircle, AlertCircle, User, FileText, Calendar, CreditCard } from 'lucide-react'
import { formatRupiah } from '@/utils/currency'

interface Order {
  id: string
  status: string
  paymentMethod: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  product: {
    id: string
    title: string
    price: number
  }
}

export default function TrackingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchOrders()
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
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-gray-600" />
      default:
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending':
        return 25
      case 'in_progress':
        return 75
      case 'completed':
        return 100
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
        <p className="text-gray-600">Monitor and track the progress of all client orders</p>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Orders Tracking Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Clear Search
                </button>
                <button
                  onClick={() => setStatusFilter('')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Show All
                </button>
              </div>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Order #{order.id.slice(-8)}</h3>
                    <p className="text-indigo-100 text-sm">{order.product.title}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'completed' ? 'bg-green-500 text-white' :
                      order.status === 'in_progress' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-indigo-600">{getProgressPercentage(order.status)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      order.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      order.status === 'in_progress' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}
                    style={{ width: `${getProgressPercentage(order.status)}%` }}
                  ></div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Client Info */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{order.user.name}</h4>
                    <p className="text-sm text-gray-600">{order.user.email}</p>
                  </div>
                </div>

                {/* Service Info */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{order.product.title}</h4>
                    <p className="text-lg font-bold text-indigo-600">{formatRupiah(order.product.price)}</p>
                  </div>
                </div>

                {/* Timeline Info */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Timeline</h4>
                    <p className="text-sm text-gray-600">
                      Ordered: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.paymentMethod && (
                      <div className="flex items-center space-x-2 mt-1">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-600 capitalize">
                          {order.paymentMethod.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Status Timeline */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Order Timeline</h4>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    <div className="space-y-6">
                      {/* Ordered */}
                      <div className="relative flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          order.status === 'pending' || order.status === 'in_progress' || order.status === 'completed'
                            ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
                        }`}>
                          <CheckCircle className={`h-4 w-4 ${
                            order.status === 'pending' || order.status === 'in_progress' || order.status === 'completed'
                              ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h5 className={`font-medium ${
                            order.status === 'pending' || order.status === 'in_progress' || order.status === 'completed'
                              ? 'text-green-700' : 'text-gray-500'
                          }`}>Order Placed</h5>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* In Progress */}
                      <div className="relative flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          order.status === 'in_progress' || order.status === 'completed'
                            ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 bg-white'
                        }`}>
                          <Clock className={`h-4 w-4 ${
                            order.status === 'in_progress' || order.status === 'completed'
                              ? 'text-yellow-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h5 className={`font-medium ${
                            order.status === 'in_progress' || order.status === 'completed'
                              ? 'text-yellow-700' : 'text-gray-500'
                          }`}>In Progress</h5>
                          <p className="text-sm text-gray-600">
                            {order.status === 'in_progress' || order.status === 'completed'
                              ? 'Work has begun on your order'
                              : 'Waiting to start work'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Completed */}
                      <div className="relative flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          order.status === 'completed'
                            ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
                        }`}>
                          <CheckCircle className={`h-4 w-4 ${
                            order.status === 'completed'
                              ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h5 className={`font-medium ${
                            order.status === 'completed'
                              ? 'text-green-700' : 'text-gray-500'
                          }`}>Completed</h5>
                          <p className="text-sm text-gray-600">
                            {order.status === 'completed'
                              ? 'Order has been completed successfully'
                              : 'Order completion pending'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
