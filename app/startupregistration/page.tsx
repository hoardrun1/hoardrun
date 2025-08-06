'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Building2, Upload, AlertTriangle,
  DollarSign, Percent, Users, Target,
  Shield, Info, Lock, CheckCircle
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

// Add zod for form validation
import { z } from "zod"
import { useSession } from 'next-auth/react'

const companyTypes = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Manufacturing',
  'Real Estate',
  'Education',
  'Energy',
  'Transportation',
  'Other'
]

const shareTypes = [
  'Ordinary Shares',
  'Preferred Shares',
  'Convertible Preferred Shares',
  'Non-Voting Shares'
]

// Form validation schema
const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyType: z.string().min(1, "Please select a company type"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  missionStatement: z.string().min(20, "Mission statement must be at least 20 characters"),
  registrationNumber: z.string().min(5, "Please enter a valid registration number"),
  incorporationDate: z.string(),
  jurisdiction: z.string().min(2, "Please enter a valid jurisdiction"),
  valuation: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter a valid valuation"),
  annualRevenue: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Please enter a valid revenue"),
  profitMargin: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= -100 && Number(val) <= 100, "Profit margin must be between -100 and 100"),
  availablePercentage: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100, "Percentage must be between 0 and 100"),
  shareType: z.string().min(1, "Please select a share type"),
  sharesAvailable: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter a valid number of shares"),
  pricePerShare: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter a valid share price"),
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
  const [securityChecks, setSecurityChecks] = useState({
    isEmailVerified: false,
    isIdentityVerified: false,
    isCompanyVerified: false,
  })

  // Redirect if not authenticated
  useEffect(() => {
    // Check if we should bypass auth in development mode
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    if (bypassAuth && process.env.NODE_ENV === 'development') {
      console.log('Auth bypass enabled in development mode for startup registration');
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  // Security check simulation
  useEffect(() => {
    // Check if we should bypass auth in development mode
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    if (bypassAuth && process.env.NODE_ENV === 'development') {
      // In development mode, automatically set security checks to true
      setSecurityChecks({
        isEmailVerified: true,
        isIdentityVerified: true,
        isCompanyVerified: true,
      });
      return;
    }

    if (session?.user) {
      // Simulate security checks
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
    // Company Overview
    companyName: '',
    companyType: '',
    description: '',
    missionStatement: '',
    
    // Registration Details
    registrationNumber: '',
    incorporationDate: '',
    jurisdiction: '',
    
    // Company Details
    valuation: '',
    annualRevenue: '',
    profitMargin: '',
    availablePercentage: '',
    
    // Business Pitch
    targetMarket: '',
    competitiveAdvantage: '',
    growthStrategy: '',
    
    // Stock Offering
    shareType: '',
    sharesAvailable: '',
    pricePerShare: '',
    fundraisingGoal: '',
    fundUse: '',
    
    // Risks and Legal
    risks: '',
    legalDisclaimer: '',
    
    // Media
    founderVideo: null,
    companyLogo: null,
    financialDocuments: null,
  })

  const validateStep = (step: number) => {
    const stepFields = {
      1: ['companyName', 'companyType', 'description', 'missionStatement'],
      2: ['registrationNumber', 'incorporationDate', 'jurisdiction'],
      3: ['valuation', 'annualRevenue', 'profitMargin', 'availablePercentage'],
      4: ['shareType', 'sharesAvailable', 'pricePerShare', 'fundraisingGoal', 'fundUse'],
      5: ['risks', 'legalDisclaimer']
    }[step] || []

    const stepData = Object.fromEntries(
      stepFields.map(field => [field, formData[field]])
    )

    try {
      formSchema.pick(stepFields as [keyof typeof formData]).parse(stepData)
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileUpload = async (e) => {
    const { name, files } = e.target
    if (files?.length) {
      // Add file validation
      const file = files[0]
      const maxSize = 5 * 1024 * 1024 // 5MB limit
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      // Check file type
      const allowedTypes = {
        founderVideo: ['video/mp4', 'video/webm'],
        companyLogo: ['image/jpeg', 'image/png', 'image/gif'],
        financialDocuments: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      }

      if (!allowedTypes[name].includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `Please upload a valid ${name.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive",
        })
        return
      }

      setFormData(prev => ({
        ...prev,
        [name]: file
      }))
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)

    try {
      // Security checks
      if (!securityChecks.isEmailVerified || !securityChecks.isIdentityVerified) {
        throw new Error("Please complete security verification first")
      }

      // Create FormData for file upload
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitData.append(key, value)
        } else {
          submitData.append(key, String(value))
        }
      })

      // Add security headers and user info
      submitData.append('userId', session?.user?.id || '')
      submitData.append('timestamp', new Date().toISOString())

      // Here you would typically send the data to your backend
      // await submitStartupRegistration(submitData)
      
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

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  // Show security verification first
  if (!securityChecks.isEmailVerified || !securityChecks.isIdentityVerified) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Register Your Startup
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              List your company and offer shares to potential investors
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full mx-2 ${
                    step <= currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Company Info</span>
              <span>Registration</span>
              <span>Financials</span>
              <span>Offering</span>
              <span>Review</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Company Overview */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Company Overview</CardTitle>
                    <CardDescription>
                      Provide basic information about your company
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors['companyName'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['companyName']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyType">Company Type</Label>
                      <Select
                        name="companyType"
                        value={formData.companyType}
                        onValueChange={(value) => 
                          handleInputChange({ target: { name: 'companyType', value } })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                        <SelectContent>
                          {companyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors['companyType'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['companyType']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Company Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        required
                      />
                      {formErrors['description'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['description']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="missionStatement">Mission Statement</Label>
                      <Textarea
                        id="missionStatement"
                        name="missionStatement"
                        value={formData.missionStatement}
                        onChange={handleInputChange}
                        rows={3}
                        required
                      />
                      {formErrors['missionStatement'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['missionStatement']}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Registration Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Details</CardTitle>
                    <CardDescription>
                      Provide your company's registration information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors['registrationNumber'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['registrationNumber']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incorporationDate">Date of Incorporation</Label>
                      <Input
                        id="incorporationDate"
                        name="incorporationDate"
                        type="date"
                        value={formData.incorporationDate}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors['incorporationDate'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['incorporationDate']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jurisdiction">Jurisdiction</Label>
                      <Input
                        id="jurisdiction"
                        name="jurisdiction"
                        value={formData.jurisdiction}
                        onChange={handleInputChange}
                        placeholder="Country or State of Registration"
                        required
                      />
                      {formErrors['jurisdiction'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['jurisdiction']}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Financial Details */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Details</CardTitle>
                    <CardDescription>
                      Provide your company's financial information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="valuation">Current Valuation ($)</Label>
                      <Input
                        id="valuation"
                        name="valuation"
                        type="number"
                        value={formData.valuation}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors['valuation'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['valuation']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="annualRevenue">Annual Revenue ($)</Label>
                      <Input
                        id="annualRevenue"
                        name="annualRevenue"
                        type="number"
                        value={formData.annualRevenue}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors['annualRevenue'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['annualRevenue']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                      <Input
                        id="profitMargin"
                        name="profitMargin"
                        type="number"
                        value={formData.profitMargin}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors['profitMargin'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['profitMargin']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availablePercentage">
                        Percentage Available for Investment (%)
                      </Label>
                      <Input
                        id="availablePercentage"
                        name="availablePercentage"
                        type="number"
                        value={formData.availablePercentage}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors['availablePercentage'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['availablePercentage']}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Stock Offering */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Offering</CardTitle>
                    <CardDescription>
                      Define your share offering details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shareType">Type of Shares</Label>
                      <Select
                        name="shareType"
                        value={formData.shareType}
                        onValueChange={(value) => 
                          handleInputChange({ target: { name: 'shareType', value } })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select share type" />
                        </SelectTrigger>
                        <SelectContent>
                          {shareTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors['shareType'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['shareType']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sharesAvailable">Number of Shares Available</Label>
                      <Input
                        id="sharesAvailable"
                        name="sharesAvailable"
                        type="number"
                        value={formData.sharesAvailable}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors['sharesAvailable'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['sharesAvailable']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricePerShare">Price per Share ($)</Label>
                      <Input
                        id="pricePerShare"
                        name="pricePerShare"
                        type="number"
                        value={formData.pricePerShare}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors['pricePerShare'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['pricePerShare']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fundraisingGoal">Fundraising Goal ($)</Label>
                      <Input
                        id="fundraisingGoal"
                        name="fundraisingGoal"
                        type="number"
                        value={formData.fundraisingGoal}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors['fundraisingGoal'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['fundraisingGoal']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fundUse">Use of Funds</Label>
                      <Textarea
                        id="fundUse"
                        name="fundUse"
                        value={formData.fundUse}
                        onChange={handleInputChange}
                        rows={4}
                        required
                      />
                      {formErrors['fundUse'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['fundUse']}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 5: Review and Submit */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Review and Submit</CardTitle>
                    <CardDescription>
                      Review your information and submit your registration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Please review all information carefully before submitting. 
                        This information will be visible to potential investors.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Media Upload</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="founderVideo">Founder's Video</Label>
                        <Input
                          id="founderVideo"
                          name="founderVideo"
                          type="file"
                          accept="video/*"
                          onChange={handleFileUpload}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyLogo">Company Logo</Label>
                        <Input
                          id="companyLogo"
                          name="companyLogo"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="financialDocuments">Financial Documents</Label>
                        <Input
                          id="financialDocuments"
                          name="financialDocuments"
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="risks">Investment Risks</Label>
                      <Textarea
                        id="risks"
                        name="risks"
                        value={formData.risks}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="List key investment risks..."
                        required
                      />
                      {formErrors['risks'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['risks']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="legalDisclaimer">Legal Disclaimer</Label>
                      <Textarea
                        id="legalDisclaimer"
                        name="legalDisclaimer"
                        value={formData.legalDisclaimer}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Enter legal disclaimers and regulatory notices..."
                        required
                      />
                      {formErrors['legalDisclaimer'] && (
                        <p className="text-sm text-red-500 mt-1">{formErrors['legalDisclaimer']}</p>
                      )}
                    </div>
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
              >
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 