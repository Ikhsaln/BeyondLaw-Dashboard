'use client'

import { useState, useEffect } from 'react'
import { formatRupiah } from '@/utils/currency'

interface Order {
  id: string
  status: string
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

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    {
      title: 'Total Products',
      value: '0',
      description: 'Legal services available'
    },
    {
      title: 'Active Orders',
      value: '0',
      description: 'Currently in progress'
    },
    {
      title: 'Total Clients',
      value: '0',
      description: 'Registered users'
    },
    {
      title: 'Revenue',
      value: formatRupiah(0),
      description: 'Total revenue'
    }
  ])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch data from all APIs
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/auth/me') // This might not work for admin, but we'll handle it
      ])

      let products = []
      let orders = []
      let users = []

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        products = productsData.products || []
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        orders = ordersData.orders || []
      }

      // For users, we'll use a simple approach - count from orders (unique users)
      const uniqueUserIds = new Set(orders.map((order: Order) => order.user.id))
      const clientCount = uniqueUserIds.size

      // Calculate stats
      const totalProducts = products.length
      const activeOrders = orders.filter((order: Order) => order.status === 'in_progress').length
      const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.product.price, 0)

      setStats([
        {
          title: 'Total Products',
          value: totalProducts.toString(),
          description: 'Legal services available'
        },
        {
          title: 'Active Orders',
          value: activeOrders.toString(),
          description: 'Currently in progress'
        },
        {
          title: 'Total Clients',
          value: clientCount.toString(),
          description: 'Active clients'
        },
        {
          title: 'Revenue',
          value: formatRupiah(totalRevenue),
          description: 'Total revenue'
        }
      ])

      // Get recent orders (last 5)
      const sortedOrders = orders
        .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      setRecentOrders(sortedOrders)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Keep default values on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          // Map stat titles to appropriate neutral colors
          const getGradientColor = (title: string) => {
            switch (title) {
              case 'Total Products':
                return 'from-slate-600 to-slate-700'
              case 'Active Orders':
                return 'from-gray-600 to-gray-700'
              case 'Total Clients':
                return 'from-neutral-600 to-neutral-700'
              case 'Revenue':
                return 'from-stone-600 to-stone-700'
              default:
                return 'from-slate-600 to-slate-700'
            }
          }

          const getTextColor = (title: string) => {
            switch (title) {
              case 'Total Products':
                return 'text-slate-200'
              case 'Active Orders':
                return 'text-gray-200'
              case 'Total Clients':
                return 'text-neutral-200'
              case 'Revenue':
                return 'text-stone-200'
              default:
                return 'text-slate-200'
            }
          }

          return (
            <div key={index} className={`bg-gradient-to-r ${getGradientColor(stat.title)} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${getTextColor(stat.title)}`}>
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 bg-opacity-30 rounded-lg ${
                  stat.title === 'Total Products' ? 'bg-slate-500' :
                  stat.title === 'Active Orders' ? 'bg-gray-500' :
                  stat.title === 'Total Clients' ? 'bg-neutral-500' :
                  'bg-stone-500'
                }`}>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stat.title === 'Total Products' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    )}
                    {stat.title === 'Active Orders' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                    {stat.title === 'Total Clients' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    )}
                    {stat.title === 'Revenue' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    )}
                  </svg>
                </div>
              </div>
              <p className={`text-xs mt-2 ${getTextColor(stat.title)}`}>
                {stat.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-600">
            Latest client orders and their status
          </p>
        </div>
        <div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.user.name}</p>
                    <p className="text-sm text-gray-600">{order.product.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatRupiah(order.product.price)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
