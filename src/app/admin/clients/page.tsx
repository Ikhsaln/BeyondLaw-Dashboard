'use client'

import { useState, useEffect } from 'react'
import { Search, User, Mail, Calendar, Shield } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count?: {
    orders: number
  }
}

export default function ClientsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Fetch real users from the database via the users API
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        // Add order count for each user by fetching their orders
        const usersWithOrderCount = await Promise.all(
          data.users.map(async (user: User) => {
            try {
              const ordersResponse = await fetch('/api/orders')
              if (ordersResponse.ok) {
                const ordersData = await ordersResponse.json()
                const userOrders = ordersData.orders.filter((order: any) => order.user.id === user.id)
                return {
                  ...user,
                  _count: { orders: userOrders.length }
                }
              }
            } catch (error) {
              console.error('Error fetching orders for user:', error)
            }
            return {
              ...user,
              _count: { orders: 0 }
            }
          })
        )
        setUsers(usersWithOrderCount)
      } else {
        console.error('Failed to fetch users')
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = !roleFilter || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'client':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetails = async (user: User) => {
    setSelectedUser(user)
    setLoadingDetails(true)
    setShowUserDetails(true)

    try {
      // Fetch user's orders
      const ordersResponse = await fetch('/api/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        const userOrders = ordersData.orders.filter((order: any) => order.user.id === user.id)
        setUserOrders(userOrders)
      } else {
        setUserOrders([])
      }
    } catch (error) {
      console.error('Error fetching user orders:', error)
      setUserOrders([])
    } finally {
      setLoadingDetails(false)
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clients</h1>
            <p className="text-gray-600 mt-1">Manage user accounts and client information</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Admin Users</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Client Users</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {users.filter(u => u.role === 'client').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white transition-colors duration-200"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white transition-colors duration-200 min-w-[140px]"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="client">Client</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {filteredUsers.map((user) => (
            <li key={user.id} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} shadow-sm`}>
                        <Shield className="mr-1.5 h-3 w-3" />
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 mt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="mr-2 h-4 w-4 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">{user._count?.orders || 0}</span>
                        <span className="ml-1">orders</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleViewDetails(user)}
                    className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                    title="View Details"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">User Details</h2>
                  <p className="text-gray-600 mt-1">Complete information and order history</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserDetails(false)
                    setSelectedUser(null)
                    setUserOrders([])
                  }}
                  className="text-gray-400 hover:text-gray-600 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* User Profile Section */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-10 w-10 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(selectedUser.role)}`}>
                            <Shield className="mr-2 h-4 w-4" />
                            {selectedUser.role}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-gray-600">
                          <div className="flex items-center">
                            <Mail className="mr-2 h-5 w-5" />
                            {selectedUser.email}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
                            Joined {new Date(selectedUser.createdAt).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Total Orders</h4>
                      <p className="text-3xl font-bold text-indigo-600">{userOrders.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Completed Orders</h4>
                      <p className="text-3xl font-bold text-green-600">
                        {userOrders.filter(order => order.status === 'completed').length}
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Total Spent</h4>
                      <p className="text-3xl font-bold text-purple-600">
                        ${userOrders.reduce((sum, order) => sum + order.product.price, 0)}
                      </p>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h4>
                    {userOrders.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">No orders found for this user</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userOrders.slice(0, 5).map((order: any) => (
                          <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">{order.product.title}</h5>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-sm text-gray-600">${order.product.price}</span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {order.status.replace('_', ' ')}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {userOrders.length > 5 && (
                          <p className="text-center text-gray-500 text-sm">
                            And {userOrders.length - 5} more orders...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
