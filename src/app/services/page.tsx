'use client'

import ServiceCard from '@/components/ServiceCard'

export default function ServicesPage() {
  const services = [
    {
      id: '1',
      title: 'PENDIRIAN PT',
      price: 4500000,
      subtitle: 'All-inclusive package',
      description: 'Complete PT establishment service including legal documents, notary services, and government registration. Perfect for new businesses looking to establish their legal entity quickly and efficiently.',
      whatsIncluded: [
        'Company name search and reservation',
        'Drafting of company articles of association',
        'Notary legalization services',
        'Tax ID (NPWP) registration',
        'Company registration with Ministry of Law and Human Rights',
        'Business license (NIB) application',
        'Bank account opening assistance'
      ],
      processingTime: '2–4 weeks',
      status: 'Active' as const,
      createdDate: '23/10/2025',
      iconType: 'building' as const
    },
    {
      id: '2',
      title: 'LEGAL CONSULTATION',
      price: 2250000,
      subtitle: 'Expert legal advice',
      description: 'Professional legal consultation services covering various areas of law including corporate, contract, employment, and intellectual property law.',
      whatsIncluded: [
        'Initial consultation (2 hours)',
        'Legal opinion and recommendations',
        'Document review (up to 5 pages)',
        'Follow-up consultation (1 hour)',
        'Written summary of advice',
        'Applicable law references'
      ],
      processingTime: '1–2 weeks',
      status: 'Active' as const,
      createdDate: '20/10/2025',
      iconType: 'briefcase' as const
    },
    {
      id: '3',
      title: 'CONTRACT DRAFTING',
      price: 3750000,
      subtitle: 'Professional contract services',
      description: 'Comprehensive contract drafting and review services for business agreements, employment contracts, and commercial transactions.',
      whatsIncluded: [
        'Contract drafting from scratch',
        'Review of existing contracts',
        'Legal compliance check',
        'Negotiation support',
        'Final contract execution',
        'Digital contract storage'
      ],
      processingTime: '3–5 weeks',
      status: 'Active' as const,
      createdDate: '18/10/2025',
      iconType: 'document' as const
    },
    {
      id: '4',
      title: 'INTELLECTUAL PROPERTY',
      price: 5500000,
      subtitle: 'IP protection services',
      description: 'Complete intellectual property protection including trademark registration, copyright filing, and patent consultation services.',
      whatsIncluded: [
        'Trademark search and availability check',
        'Trademark registration filing',
        'Copyright registration',
        'Patent consultation',
        'IP portfolio management',
        'Infringement monitoring'
      ],
      processingTime: '4–6 weeks',
      status: 'Draft' as const,
      createdDate: '15/10/2025',
      iconType: 'document' as const
    }
  ]

  const handleEdit = (id: string) => {
    console.log('Edit service:', id)
    // Handle edit logic here
  }

  const handleDelete = (id: string) => {
    console.log('Delete service:', id)
    // Handle delete logic here
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Legal Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional legal services tailored for Indonesian businesses and individuals.
            All services include comprehensive support and expert legal advice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              {...service}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Need Custom Legal Services?
            </h2>
            <p className="text-gray-600 mb-6">
              Contact our legal experts for personalized consultation and custom service packages
              tailored to your specific needs.
            </p>
            <button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
