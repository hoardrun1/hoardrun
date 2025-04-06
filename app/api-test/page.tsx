import ApiTest from '@/components/api-test'

export default function ApiTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            API Testing Page
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Use this page to test API endpoints
          </p>
        </div>
        
        <div className="mt-10">
          <ApiTest />
        </div>
      </div>
    </div>
  )
}
