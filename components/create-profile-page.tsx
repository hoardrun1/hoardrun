'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function CreateProfilePageComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <a href="/" className="inline-block mb-8">
            <span className="text-2xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Hoard</span>
              <span className="text-gray-900">run</span>
            </span>
          </a>
          <h1 className="text-2xl font-semibold tracking-tight">Creating your profile</h1>
          <p className="text-sm text-muted-foreground">
            Fill the spaces below to complete setting up your profile
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    disabled={isLoading}
                    required
                  />
                </div>

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

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idNumber">Identification Number</Label>
                  <Input
                    id="idNumber"
                    placeholder="Enter your ID number"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Country Location</Label>
                  <Select disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ghana">Ghana</SelectItem>
                      <SelectItem value="nigeria">Nigeria</SelectItem>
                      <SelectItem value="kenya">Kenya</SelectItem>
                      <SelectItem value="southAfrica">South Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="font-semibold">Emergency Contact</h2>
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    placeholder="Emergency contact name"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyRelation">Relationship</Label>
                  <Select disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Number</Label>
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
                      id="emergencyPhone"
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

          <a href="/face-verification">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </a>
        </form>

        <div className="text-center">
          {/* Removed the link to verify-email */}
          {/* <a href="/verify-email" className="text-sm text-gray-600 hover:text-blue-500">
            Back to Verification
          </a> */}
        </div>
      </div>
    </div>
  )
}