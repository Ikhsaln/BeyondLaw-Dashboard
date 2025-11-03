'use client'

import { useState } from 'react'
import { Building, Briefcase, FileText, Edit, Trash2, CheckCircle, Clock, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'

interface ServiceCardProps {
  id: string
  title: string
  price: number
  subtitle: string
  description: string
  whatsIncluded: string[] | string // Can be array or JSON string from database
  processingTime: string
  status: 'Active' | 'Draft' | 'Inactive'
  createdDate: string
  iconType?: 'building' | 'briefcase' | 'document'
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function ServiceCard({
  id,
  title,
  price,
  subtitle,
  description,
  whatsIncluded,
  processingTime,
  status,
  createdDate,
  iconType = 'document',
  onEdit,
  onDelete
}: ServiceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

  const getIcon = () => {
    switch (iconType) {
      case 'building':
        return <Building className="h-6 w-6 text-blue-600" />
      case 'briefcase':
        return <Briefcase className="h-6 w-6 text-green-600" />
      case 'document':
      default:
        return <FileText className="h-6 w-6 text-purple-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Parse whatsIncluded data - handle both arrays and JSON strings
  const getWhatsIncludedList = (): string[] => {
    if (Array.isArray(whatsIncluded)) {
      return whatsIncluded
    }
    if (typeof whatsIncluded === 'string') {
      try {
        const parsed = JSON.parse(whatsIncluded)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  const whatsIncludedList = getWhatsIncludedList()

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="pb-4">
        {/* Top Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              {getIcon()}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(id)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Edit service"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete service"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title and Price */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">
              {formatRupiah(price)}
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            {subtitle}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed">
          {description}
        </p>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* What's Included */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            What's Included
          </h4>
          <ul className="space-y-2">
            {whatsIncludedList.length > 0 ? (
              whatsIncludedList.map((item: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">No features specified</span>
              </li>
            )}
          </ul>
        </div>

        {/* Processing Time */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              Processing time: {processingTime}
            </span>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between w-full text-xs text-gray-500">
          <span>Created {createdDate}</span>
          <span className="capitalize">{status.toLowerCase()}</span>
        </div>
      </CardFooter>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        itemName={title}
        isLoading={isDeleting}
      />
    </Card>
  )
}

// Client version without CRUD features - only checkout
interface ClientServiceCardProps {
  id: string
  title: string
  price: number
  subtitle: string
  description: string
  whatsIncluded: string[] | string
  processingTime: string
  status: 'Active' | 'Draft' | 'Inactive'
  createdDate: string
  iconType?: 'building' | 'briefcase' | 'document'
  onOrder?: (id: string) => void
}

export function ClientServiceCard({
  id,
  title,
  price,
  subtitle,
  description,
  whatsIncluded,
  processingTime,
  status,
  createdDate,
  iconType = 'document',
  onOrder
}: ClientServiceCardProps) {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getIcon = () => {
    switch (iconType) {
      case 'building':
        return <Building className="h-6 w-6 text-blue-600" />
      case 'briefcase':
        return <Briefcase className="h-6 w-6 text-green-600" />
      case 'document':
      default:
        return <FileText className="h-6 w-6 text-purple-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Parse whatsIncluded data - handle both arrays and JSON strings
  const getWhatsIncludedList = (): string[] => {
    if (Array.isArray(whatsIncluded)) {
      return whatsIncluded
    }
    if (typeof whatsIncluded === 'string') {
      try {
        const parsed = JSON.parse(whatsIncluded)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  const whatsIncludedList = getWhatsIncludedList()

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="pb-4">
        {/* Top Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              {getIcon()}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Title and Price */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">
              {formatRupiah(price)}
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            {subtitle}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed">
          {description}
        </p>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* What's Included */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            What's Included
          </h4>
          <ul className="space-y-2">
            {whatsIncludedList.length > 0 ? (
              whatsIncludedList.map((item: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">No features specified</span>
              </li>
            )}
          </ul>
        </div>

        {/* Processing Time */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              Processing time: {processingTime}
            </span>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-gray-500">
            Created {createdDate}
          </div>
          {onOrder && (
            <button
              onClick={() => onOrder(id)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Order Now
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
