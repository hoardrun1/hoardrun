'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Building2, Upload, AlertTriangle, FileText,
  DollarSign, Target, Globe, Link2,
  Shield, Info, Lock, CheckCircle, Scan,
  BarChart3, FileCheck, Clock
} from 'lucide-react'
import { 
  Card, CardContent, CardHeader, 
  CardTitle, CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, SelectContent, 
  SelectItem, SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"

import { z } from "zod"
import { useSession } from 'next-auth/react'

const businessTypes = [
  { value: 'tech', label: 'Technology', icon: '💻' },
  { value: 'retail', label: 'Retail & E-commerce', icon: '🛍️' },
  { value: 'healthcare', label: 'Healthcare & Biotech', icon: '🏥' },
  { value: 'fintech', label: 'Financial Technology', icon: '💳' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'real-estate', label: 'Real Estate', icon: '🏢' },
  { value: 'education', label: 'Education & EdTech', icon: '📚' },
  { value: 'energy', label: 'Energy & Sustainability', icon: '⚡' },
  { value: 'transportation', label: 'Transportation & Logistics', icon: '🚚' },
  { value: 'other', label: 'Other', icon: '🔧' }
]

const shareTypes = [
  { value: 'preference', label: 'Preference Shares', description: 'Priority in dividends and liquidation' },
  { value: 'ordinary', label: 'Ordinary Shares', description: 'Standard equity with voting rights' },
  { value: 'real-estate', label: 'Real Estate Investment', description: 'Property-backed investment shares' }
]

const apiIntegrations = [
  { value: 'shopify', label: 'Shopify', icon: '🛒', type: 'sales' },
  { value: 'google-analytics', label: 'Google Analytics', icon: '📊', type: 'traffic' },
  { value: 'stripe', label: 'Stripe', icon: '💳', type: 'payments' },
  { value: 'linkedin', label: 'LinkedIn Company', icon: '💼', type: 'social' }
]

const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  businessType: z.string().min(1, "Please select a business type"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  missionStatement: z.string().min(20, "Mission statement must be at least 20 characters"),
  registrationNumber: z.string().min(5, "Please enter a valid registration number"),
  incorporationDate: z.string().min(1, "Please select incorporation date"),
  jurisdiction: z.string().min(2, "Please enter a valid jurisdiction"),
  valuation: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter a valid valuation"),
  annualRevenue: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Please enter a valid revenue"),
  shareType: z.string().min(1, "Please select a share type"),
  sharesOffered: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter valid shares offered"),
  pricePerShare: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 10, "Minimum price per share is $10"),
  fundraisingGoal: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter a valid fundraising goal"),
  risks: z.string().min(50, "Please provide detailed risk information"),
  legalDisclaimer: z.string().min(100, "Please provide comprehensive legal disclaimers"),
})

export default function StartupRegistration() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  // Always set security checks to true when auth bypass is enabled
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'
  const [securityChecks, setSecurityChecks] = useState({
    isEmailVerified: bypassAuth,
    isIdentityVerified: bypassAuth,
    isCompanyVerified: bypassAuth,
  })
  
  const [apiConnections, setApiConnections] = useState<{ [key: string]: boolean }>({})
  const [verifiedMetrics, setVerifiedMetrics] = useState<{ [key: string]: any }>({})
  const [isVerifyingApi, setIsVerifyingApi] = useState<{ [key: string]: boolean }>({})
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({})
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    if (bypassAuth) {
      console.log('Auth bypass enabled globally for startup registration');
      return;
    }
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  useEffect(() => {
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    if (bypassAuth) {
      setSecurityChecks({
        isEmailVerified: true,
        isIdentityVerified: true,
        isCompanyVerified: true,
      });
      return;
    }
    if (session?.user) {
      setTimeout(() => {
        setSecurityChecks({
          isEmailVerified: true,
          isIdentityVerified: true,
          isCompanyVerified: false,
        })
      }, 1000)
    }
  }, [session])

  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    description: '',
    missionStatement: '',
    website: '',
    registrationNumber: '',
    incorporationDate: '',
    jurisdiction: '',
    valuation: '',
    annualRevenue: '',
    profitMargin: '',
    shareType: '',
    sharesOffered: '',
    pricePerShare: '10',
    fundraisingGoal: '',
    linkedinUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    monthlyActiveUsers: '',
    monthlyRevenue: '',
    customerGrowthRate: '',
    targetMarket: '',
    competitiveAdvantage: '',
    growthStrategy: '',
    fundUse: '',
    risks: '',
    legalDisclaimer: '',
    gdprCompliance: false,
    termsAccepted: false,
  })

  const verifyApiConnection = useCallback(async (apiType: string) => {
    setIsVerifyingApi(prev => ({ ...prev, [apiType]: true }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      let mockMetrics = {}
      switch (apiType) {
        case 'shopify':
          mockMetrics = { totalSales: 125000, monthlyOrders: 450, customerCount: 1250 }
          break
        case 'google-analytics':
          mockMetrics = { monthlyVisitors: 15000, pageViews: 45000, conversionRate: 2.8 }
          break
        case 'stripe':
          mockMetrics = { monthlyRevenue: 98000, transactionCount: 1200 }
          break
        default:
          mockMetrics = { verified: true }
      }
      
      setVerifiedMetrics(prev => ({ ...prev, [apiType]: mockMetrics }))
      setApiConnections(prev => ({ ...prev, [apiType]: true }))
      
      toast({
        title: "API Connected",
        description: `Successfully connected to ${apiType}`,
      })
      
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${apiType}`,
        variant: "destructive",
      })
    } finally {
      setIsVerifyingApi(prev => ({ ...prev, [apiType]: false }))
    }
  }, [toast])

  const handleFileUpload = useCallback(async (file: File, fileType: string) => {
    setUploadedFiles(prev => ({ ...prev, [fileType]: file }))
    setUploadProgress(prev => ({ ...prev, [fileType]: 0 }))
    
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        const currentProgress = prev[fileType] || 0
        if (currentProgress >= 100) {
          clearInterval(uploadInterval)
          return prev
        }
        return { ...prev, [fileType]: currentProgress + 10 }
      })
    }, 200)
    
    if (fileType === 'businessRegistration') {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        const mockOcrResult = {
          companyName: 'TechStart Inc.',
          registrationNumber: 'REG123456789',
          incorporationDate: '2023-01-15',
          jurisdiction: 'Delaware, USA'
        }
        
        setFormData(prev => ({
          ...prev,
          companyName: mockOcrResult.companyName,
          registrationNumber: mockOcrResult.registrationNumber,
          incorporationDate: mockOcrResult.incorporationDate,
          jurisdiction: mockOcrResult.jurisdiction
        }))
        
        toast({
          title: "OCR Processing Complete",
          description: "Document information has been extracted and auto-filled",
        })
        
      } catch (error) {
        toast({
          title: "OCR Processing Failed",
          description: "Could not extract information from document",
          variant: "destructive",
        })
      }
    }
  }, [toast])

  const validateStep = (step: number) => {
    const stepFields = {
      1: ['companyName', 'businessType', 'description', 'missionStatement'],
      2: ['registrationNumber', 'incorporationDate', 'jurisdiction'],
      3: ['valuation', 'annualRevenue'],
      4: ['shareType', 'sharesOffered', 'pricePerShare', 'fundraisingGoal'],
      5: ['risks', 'legalDisclaimer']
    }[step] || []

    const stepData = Object.fromEntries(
      stepFields.map(field => [field, formData[field]])
    )

    try {
      formSchema.pick(stepFields as any).parse(stepData)
      setFormErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {}
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message
        })
        setFormErrors(newErrors)
      }
      return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    } else {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      })
    }
  }

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)

    try {
      if (!securityChecks.isEmailVerified || !securityChecks.isIdentityVerified) {
        throw new Error("Please complete security verification first")
      }

      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitData.append(key, value)
        } else {
          submitData.append(key, String(value))
        }
      })

      submitData.append('userId', session?.user?.id || '')
      submitData.append('timestamp', new Date().toISOString())

      toast({
        title: "Registration Successful",
        description: "Your startup has been registered successfully. We'll review your submission.",
      })

      router.push('/investment')
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error registering your startup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show security verification first (unless auth bypass is enabled)
  if (!bypassAuth && (!securityChecks.isEmailVerified || !securityChecks.isIdentityVerified)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Security Verification Required
              </CardTitle>
              <CardDescription>
                Please complete the verification process to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                {securityChecks.isEmailVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <span>Email Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                {securityChecks.isIdentityVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <span>Identity Verification</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Register Your Startup
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join our investment platform and connect with investors worldwide.
              Secure funding with fractional shares starting from $10.
            </p>
          </div>

          {/* Enhanced Progress Steps */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                {[
                  { step: 1, title: 'Company Info', icon: Building2, description: 'Basic details & business type' },
                  { step: 2, title: 'Verification', icon: Shield, description: 'Documents & API connections' },
                  { step: 3, title: 'Financials', icon: DollarSign, description: 'Revenue & valuation' },
                  { step: 4, title: 'Investment', icon: Target, description: 'Shares & funding goals' },
                  { step: 5, title: 'Legal', icon: FileCheck, description: 'Contracts & compliance' }
                ].map((item, index) => (
                  <div key={item.step} className="flex-1 flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      item.step <= currentStep
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        item.step <= currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                      }`}>
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Progress value={(currentStep / 5) * 100} className="h-2" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-xl">
                      <Building2 className="w-6 h-6 mr-3" />
                      Company Information
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Tell us about your company and what makes it unique
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    {/* Company Name */}
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-sm font-medium flex items-center">
                        Company Name <span className="text-red-500 ml-1">*</span>
                        {formData.companyName && (
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                        )}
                      </Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Enter your company name"
                        className="h-12 text-lg border-2 focus:border-blue-500 transition-colors"
                        required
                      />
                      {formErrors.companyName && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {formErrors.companyName}
                        </p>
                      )}
                    </div>

                    {/* Business Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center">
                        Business Type <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {businessTypes.map((type) => (
                          <div
                            key={type.value}
                            onClick={() => setFormData(prev => ({ ...prev, businessType: type.value }))}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                              formData.businessType === type.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-2">{type.icon}</div>
                              <div className="text-sm font-medium">{type.label}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {formErrors.businessType && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {formErrors.businessType}
                        </p>
                      )}
                    </div>

                    {/* Company Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium flex items-center">
                        Company Description <span className="text-red-500 ml-1">*</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({formData.description.length}/1000 characters)
                        </span>
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your company, products/services, and target market..."
                        className="min-h-[120px] border-2 focus:border-blue-500 transition-colors"
                        maxLength={1000}
                        required
                      />
                      {formErrors.description && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {formErrors.description}
                        </p>
                      )}
                    </div>

                    {/* Mission Statement */}
                    <div className="space-y-2">
                      <Label htmlFor="missionStatement" className="text-sm font-medium flex items-center">
                        Mission Statement <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Textarea
                        id="missionStatement"
                        value={formData.missionStatement}
                        onChange={(e) => setFormData(prev => ({ ...prev, missionStatement: e.target.value }))}
                        placeholder="What is your company's mission and vision?"
                        className="min-h-[80px] border-2 focus:border-blue-500 transition-colors"
                        maxLength={500}
                        required
                      />
                      {formErrors.missionStatement && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {formErrors.missionStatement}
                        </p>
                      )}
                    </div>

                    {/* Website URL */}
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-sm font-medium flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Company Website
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://yourcompany.com"
                        className="h-12 border-2 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Simplified Steps 2-5 for demo */}
            {currentStep > 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-xl">
                      {currentStep === 2 && <><Shield className="w-6 h-6 mr-3" />Verification & Documents</>}
                      {currentStep === 3 && <><DollarSign className="w-6 h-6 mr-3" />Financial Information</>}
                      {currentStep === 4 && <><Target className="w-6 h-6 mr-3" />Investment Configuration</>}
                      {currentStep === 5 && <><FileCheck className="w-6 h-6 mr-3" />Legal & Compliance</>}
                    </CardTitle>
                    <CardDescription className="text-green-100">
                      {currentStep === 2 && "Upload documents and connect your business platforms"}
                      {currentStep === 3 && "Provide your company's financial details"}
                      {currentStep === 4 && "Configure your share offering and investment terms"}
                      {currentStep === 5 && "Complete legal requirements and compliance"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    {currentStep === 2 && (
                      <>
                        {/* Business Registration */}
                        <div className="space-y-4">
                          <Label className="text-sm font-medium flex items-center">
                            <Upload className="w-4 h-4 mr-2" />
                            Business Registration Certificate <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(file, 'businessRegistration')
                              }}
                              className="hidden"
                              id="businessRegistration"
                            />
                            <label htmlFor="businessRegistration" className="cursor-pointer">
                              <div className="space-y-4">
                                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <Upload className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-lg font-medium">Upload Business Registration</p>
                                  <p className="text-sm text-gray-500">PDF, JPG, PNG up to 10MB</p>
                                </div>
                              </div>
                            </label>
                          </div>

                          {uploadedFiles.businessRegistration && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                  <span className="text-sm font-medium">
                                    {uploadedFiles.businessRegistration.name}
                                  </span>
                                </div>
                              </div>
                              {uploadProgress.businessRegistration !== undefined && (
                                <Progress value={uploadProgress.businessRegistration} className="mt-2" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Registration Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="registrationNumber" className="text-sm font-medium">
                              Registration Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="registrationNumber"
                              value={formData.registrationNumber}
                              onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                              placeholder="REG123456789"
                              className="h-12 border-2 focus:border-blue-500"
                              required
                            />
                            {formErrors.registrationNumber && (
                              <p className="text-red-500 text-sm">{formErrors.registrationNumber}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="incorporationDate" className="text-sm font-medium">
                              Incorporation Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="incorporationDate"
                              type="date"
                              value={formData.incorporationDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, incorporationDate: e.target.value }))}
                              className="h-12 border-2 focus:border-blue-500"
                              required
                            />
                            {formErrors.incorporationDate && (
                              <p className="text-red-500 text-sm">{formErrors.incorporationDate}</p>
                            )}
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="jurisdiction" className="text-sm font-medium">
                              Jurisdiction <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="jurisdiction"
                              value={formData.jurisdiction}
                              onChange={(e) => setFormData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                              placeholder="Delaware, USA"
                              className="h-12 border-2 focus:border-blue-500"
                              required
                            />
                            {formErrors.jurisdiction && (
                              <p className="text-red-500 text-sm">{formErrors.jurisdiction}</p>
                            )}
                          </div>
                        </div>

                        {/* API Integrations */}
                        <div className="border-t pt-6">
                          <h4 className="font-medium mb-4 flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Connect Your Business Platforms
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {apiIntegrations.map((api) => (
                              <div key={api.value} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center">
                                    <span className="text-2xl mr-3">{api.icon}</span>
                                    <div>
                                      <h4 className="font-medium">{api.label}</h4>
                                      <p className="text-sm text-gray-500 capitalize">{api.type} metrics</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {apiConnections[api.value] ? (
                                      <Badge variant="default" className="bg-green-500">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Connected
                                      </Badge>
                                    ) : (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => verifyApiConnection(api.value)}
                                        disabled={isVerifyingApi[api.value]}
                                      >
                                        {isVerifyingApi[api.value] ? (
                                          <>
                                            <Clock className="w-3 h-3 mr-1 animate-spin" />
                                            Connecting...
                                          </>
                                        ) : (
                                          <>
                                            <Link2 className="w-3 h-3 mr-1" />
                                            Connect
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {verifiedMetrics[api.value] && (
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm">
                                    <p className="font-medium mb-2">Verified Metrics:</p>
                                    {Object.entries(verifiedMetrics[api.value]).map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                                        <span className="font-medium">
                                          {typeof value === 'number' && (key.includes('Revenue') || key.includes('Sales') || key.includes('Value'))
                                            ? `$${value.toLocaleString()}`
                                            : typeof value === 'number'
                                              ? value.toLocaleString()
                                              : value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {currentStep === 3 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="valuation" className="text-sm font-medium">
                            Company Valuation ($) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="valuation"
                            type="number"
                            value={formData.valuation}
                            onChange={(e) => setFormData(prev => ({ ...prev, valuation: e.target.value }))}
                            placeholder="1000000"
                            className="h-12 border-2 focus:border-blue-500"
                            required
                          />
                          {formErrors.valuation && (
                            <p className="text-red-500 text-sm">{formErrors.valuation}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="annualRevenue" className="text-sm font-medium">
                            Annual Revenue ($) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="annualRevenue"
                            type="number"
                            value={formData.annualRevenue}
                            onChange={(e) => setFormData(prev => ({ ...prev, annualRevenue: e.target.value }))}
                            placeholder="500000"
                            className="h-12 border-2 focus:border-blue-500"
                            required
                          />
                          {formErrors.annualRevenue && (
                            <p className="text-red-500 text-sm">{formErrors.annualRevenue}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <>
                        <div className="space-y-4">
                          <Label className="text-sm font-medium">
                            Share Type <span className="text-red-500">*</span>
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {shareTypes.map((type) => (
                              <div
                                key={type.value}
                                onClick={() => setFormData(prev => ({ ...prev, shareType: type.value }))}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                  formData.shareType === type.value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="font-medium mb-2">{type.label}</div>
                                  <div className="text-sm text-gray-500">{type.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {formErrors.shareType && (
                            <p className="text-red-500 text-sm">{formErrors.shareType}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="sharesOffered" className="text-sm font-medium">
                              Shares Offered <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="sharesOffered"
                              type="number"
                              value={formData.sharesOffered}
                              onChange={(e) => setFormData(prev => ({ ...prev, sharesOffered: e.target.value }))}
                              placeholder="10000"
                              className="h-12 border-2 focus:border-blue-500"
                              required
                            />
                            {formErrors.sharesOffered && (
                              <p className="text-red-500 text-sm">{formErrors.sharesOffered}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="pricePerShare" className="text-sm font-medium">
                              Price Per Share ($) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="pricePerShare"
                              type="number"
                              value={formData.pricePerShare}
                              onChange={(e) => setFormData(prev => ({ ...prev, pricePerShare: e.target.value }))}
                              placeholder="10"
                              min="10"
                              className="h-12 border-2 focus:border-blue-500"
                              required
                            />
                            {formErrors.pricePerShare && (
                              <p className="text-red-500 text-sm">{formErrors.pricePerShare}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="fundraisingGoal" className="text-sm font-medium">
                              Fundraising Goal ($) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="fundraisingGoal"
                              type="number"
                              value={formData.fundraisingGoal}
                              onChange={(e) => setFormData(prev => ({ ...prev, fundraisingGoal: e.target.value }))}
                              placeholder="100000"
                              className="h-12 border-2 focus:border-blue-500"
                              required
                            />
                            {formErrors.fundraisingGoal && (
                              <p className="text-red-500 text-sm">{formErrors.fundraisingGoal}</p>
                            )}
                          </div>
                        </div>

                        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Fractional Shares Enabled:</strong> Investors can purchase shares starting from $10, making your investment accessible to a wider audience.
                          </AlertDescription>
                        </Alert>
                      </>
                    )}

                    {currentStep === 5 && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="risks" className="text-sm font-medium">
                            Risk Factors <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="risks"
                            value={formData.risks}
                            onChange={(e) => setFormData(prev => ({ ...prev, risks: e.target.value }))}
                            placeholder="Describe the main risks associated with investing in your company..."
                            className="min-h-[120px] border-2 focus:border-blue-500"
                            required
                          />
                          {formErrors.risks && (
                            <p className="text-red-500 text-sm">{formErrors.risks}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="legalDisclaimer" className="text-sm font-medium">
                            Legal Disclaimer <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="legalDisclaimer"
                            value={formData.legalDisclaimer}
                            onChange={(e) => setFormData(prev => ({ ...prev, legalDisclaimer: e.target.value }))}
                            placeholder="Provide comprehensive legal disclaimers and terms..."
                            className="min-h-[120px] border-2 focus:border-blue-500"
                            required
                          />
                          {formErrors.legalDisclaimer && (
                            <p className="text-red-500 text-sm">{formErrors.legalDisclaimer}</p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="gdprCompliance"
                              checked={formData.gdprCompliance}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprCompliance: checked }))}
                            />
                            <Label htmlFor="gdprCompliance" className="text-sm">
                              I confirm GDPR compliance and data protection measures are in place <span className="text-red-500">*</span>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="termsAccepted"
                              checked={formData.termsAccepted}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: checked }))}
                            />
                            <Label htmlFor="termsAccepted" className="text-sm">
                              I accept the terms and conditions and privacy policy <span className="text-red-500">*</span>
                            </Label>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                ← Previous
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Next →
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Registration
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
