'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Loader2, HelpCircle, AlertCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreateProfilePageComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [age, setAge] = useState<number | null>(null)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    day: '',
    month: '',
    year: '',
    email: '',
    phone: '',
    countryCode: '+233',
    location: '',
    showLocation: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const router = useRouter()

  const interests = [
    'Technology', 'Finance', 'Sports', 'Art', 'Music', 
    'Travel', 'Food', 'Fashion', 'Gaming', 'Reading'
  ]

  // Calculate age whenever date changes
  useEffect(() => {
    if (formData.year && formData.month && formData.day) {
      const birthDate = new Date(
        parseInt(formData.year),
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          .indexOf(formData.month),
        parseInt(formData.day)
      )
      const today = new Date()
      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
      
      setAge(calculatedAge)
    }
  }, [formData.year, formData.month, formData.day])

  // Check username availability
  const checkUsername = async (username: string) => {
    if (username.length < 3) return
    
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsUsernameAvailable(username.length > 3)
    } finally {
      setIsLoading(false)
    }
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required'
      if (!formData.username) newErrors.username = 'Username is required'
      if (age === null || age < 18) newErrors.age = 'You must be 18 or older'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Add your profile creation logic here
      
      // After successful profile creation, redirect to face verification
      router.push('/face-verification')
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          {/* Progress indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-1/3 h-2 rounded-full mx-1 ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Form content based on current step */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {currentStep === 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Full Name
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 ml-2 inline" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Enter your legal full name
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        placeholder="John Doe"
                        disabled={isLoading}
                        required
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-500">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Username with availability check */}
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => {
                            setFormData({...formData, username: e.target.value})
                            checkUsername(e.target.value)
                          }}
                          placeholder="Choose a unique username"
                          disabled={isLoading}
                          required
                        />
                        {isUsernameAvailable !== null && (
                          <Badge
                            className={`absolute right-2 top-2 ${
                              isUsernameAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isUsernameAvailable ? 'Available' : 'Taken'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Date of Birth with age verification */}
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Select disabled={isLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select disabled={isLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select disabled={isLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {age !== null && age < 18 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            You must be 18 or older to create an account
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <div className="flex gap-2">
                        <Select disabled={isLoading}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="+233" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+233">+233</SelectItem>
                            <SelectItem value="+234">+234</SelectItem>
                            <SelectItem value="+235">+235</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="XXXXXXX"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between space-x-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading}
                >
                  Previous
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="ml-auto bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="ml-auto bg-blue-600 hover:bg-blue-700"
                >
                  Complete Profile
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}