'use client'

import { useState, useEffect } from 'react'

export default function ClientDashboard() {
  const [stats, setStats] = useState([
    {
      title: 'Active Orders',
      value: '0',
      description: 'Currently in progress'
    },
    {
      title: 'Completed Orders',
      value: '0',
      description: 'Successfully finished'
    },
    {
      title: 'Total Spent',
      value: '$0',
      description: 'All time'
    },
    {
      title: 'Documents',
      value: '0',
      description: 'Uploaded files'
    }
  ])

  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch orders for stats
      const ordersResponse = await fetch('/api/orders')
      let orders = []
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        orders = ordersData.orders || []
      }

      // Update stats based on real data
      const activeOrders = orders.filter((order: any) => order.status === 'in_progress' || order.status === 'pending').length
      const completedOrders = orders.filter((order: any) => order.status === 'completed').length
      const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.product?.price || 0), 0)

      setStats([
        {
          title: 'Active Orders',
          value: activeOrders.toString(),
          description: 'Currently in progress'
        },
        {
          title: 'Completed Orders',
          value: completedOrders.toString(),
          description: 'Successfully finished'
        },
        {
          title: 'Total Spent',
          value: `Rp ${totalSpent.toLocaleString('id-ID')}`,
          description: 'All time'
        },
        {
          title: 'Documents',
          value: '0', // This would come from documents API
          description: 'Uploaded files'
        }
      ])

      // Set recent orders (last 3)
      setRecentOrders(orders.slice(0, 3).map((order: any) => ({
        id: order.id,
        service: order.product?.title || 'Unknown Service',
        status: order.status === 'in_progress' ? 'In Progress' :
                order.status === 'completed' ? 'Completed' : 'Pending',
        amount: `Rp ${(order.product?.price || 0).toLocaleString('id-ID')}`,
        date: new Date(order.createdAt).toLocaleDateString()
      })))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your client portal</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-900">
                {stat.title}
              </h3>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-600">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">My Orders</h3>
          <p className="text-sm text-gray-600">
            Your recent legal service orders
          </p>
        </div>
        <div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{order.service}</p>
                  <p className="text-sm text-gray-600">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{order.amount}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'In Progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="font-medium mb-2 text-gray-900">New Order</h3>
          <p className="text-sm text-gray-600 mb-4">Request legal services from our catalog</p>
          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 font-medium">
            Browse Services
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="font-medium mb-2 text-gray-900">Upload Documents</h3>
          <p className="text-sm text-gray-600 mb-4">Share files securely with your legal team</p>
          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 font-medium">
            Upload Files
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="font-medium mb-2 text-gray-900">Contact Support</h3>
          <p className="text-sm text-gray-600 mb-4">Get help or ask questions about your cases</p>
          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 font-medium">
            Get Support
          </button>
        </div>
      </div>
    </div>
  )
}
