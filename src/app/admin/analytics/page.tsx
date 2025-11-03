'use client'

import { useState, useEffect } from 'react'
import { formatRupiah } from '@/utils/currency'

interface AnalyticsData {
  totalProducts: number
  totalOrders: number
  totalClients: number
  totalRevenue: number
  monthlyStats: {
    month: string
    orders: number
    revenue: number
  }[]
  statusBreakdown: {
    pending: number
    in_progress: number
    completed: number
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // In a real app, this would be a dedicated analytics API
      // For now, we'll aggregate data from existing APIs
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ])

      if (productsRes.ok && ordersRes.ok) {
        const productsData = await productsRes.json()
        const ordersData = await ordersRes.json()

        const products = productsData.products
        const orders = ordersData.orders

        // Calculate analytics
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.product.price, 0)
        const uniqueClients = new Set(orders.map((order: any) => order.user.id)).size

        // Status breakdown
        const statusBreakdown = orders.reduce((acc: any, order: any) => {
          acc[order.status] = (acc[order.status] || 0) + 1
          return acc
        }, { pending: 0, in_progress: 0, completed: 0 })

        // Monthly stats (mock data for demo)
        const monthlyStats = [
          { month: 'Jan', orders: 12, revenue: 2400 },
          { month: 'Feb', orders: 19, revenue: 3800 },
          { month: 'Mar', orders: 15, revenue: 3200 },
          { month: 'Apr', orders: 22, revenue: 4100 },
          { month: 'May', orders: 18, revenue: 3600 },
          { month: 'Jun', orders: 25, revenue: 4800 },
        ]

        setAnalytics({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalClients: uniqueClients,
          totalRevenue,
          monthlyStats,
          statusBreakdown
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Business insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalClients}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">{formatRupiah(analytics.totalRevenue)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
          <div className="space-y-3">
            {analytics.monthlyStats.map((stat) => (
              <div key={stat.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{stat.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${(stat.revenue / Math.max(...analytics.monthlyStats.map(s => s.revenue))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatRupiah(stat.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span className="text-sm font-medium text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.statusBreakdown.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span className="text-sm font-medium text-gray-600">In Progress</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.statusBreakdown.in_progress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span className="text-sm font-medium text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.statusBreakdown.completed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Orders Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Orders</h3>
        <div className="flex items-end space-x-4 h-64">
          {analytics.monthlyStats.map((stat) => (
            <div key={stat.month} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-indigo-600 rounded-t"
                style={{
                  height: `${(stat.orders / Math.max(...analytics.monthlyStats.map(s => s.orders))) * 200}px`,
                  minHeight: '20px'
                }}
              ></div>
              <span className="text-xs font-medium text-gray-600 mt-2">{stat.month}</span>
              <span className="text-xs font-bold text-gray-900">{stat.orders}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
