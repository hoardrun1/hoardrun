'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { CreditCard, Loader2, AlertCircle, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { usePlaid } from '@/hooks/usePlaid'
import { apiClient } from '@/lib/api-client'

interface DebitCardSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
  cardType: string
  street: string
  city: string
  state: string
  zip: string
  country: string
}

const initialFormData: FormData = {
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  cardholderName: '',
  cardType: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: ''
}

interface PlaidDebitCardLinkProps {
  onSuccess: (publicToken: string, metadata: any) => void
  onExit?: (error: any) => void
  children?: React.ReactNode
}

// Separate component for Plaid Link integration
function PlaidDebitCardLink({ onSuccess, onExit, children }: PlaidDebitCardLinkProps) {
  const { createDebitCardLinkToken, verifyDebitCard, isLoading } = usePlaid()
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  // Initialize link token for debit card verification
  const initializeLink = useCallback(async () => {
    if (isInitializing || linkToken) return

    setIsInitializing(true)
    try {
      const response = await createDebitCardLinkToken()
      if (response?.link_token) {
        setLinkToken(response.link_token)
      }
    } catch (error) {
      console.error('Failed to create debit card link token:', error)
    } finally {
      setIsInitializing(false)
    }
  }, [createDebitCardLinkToken, isInitializing, linkToken])

  useEffect(() => {
    initializeLink()
  }, [initializeLink])

  // Handle Plaid Link success
  const handleOnSuccess = useCallback(async (publicToken: string, metadata: any) => {
    try {
      await verifyDebitCard(publicToken)
      onSuccess(publicToken, metadata)
    } catch (error) {
      console.error('Failed to verify debit card:', error)
      onExit?.(error)
    }
  }, [verifyDebitCard, onSuccess, onExit])

  // Handle Plaid Link exit
  const handleOnExit = useCallback((error: any, metadata: any) => {
    console.log('Plaid debit card verification exited:', error, metadata)
    onExit?.(error)
  }, [onExit])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
  })

  const handleClick = useCallback(() => {
    if (ready && linkToken) {
      open()
    } else if (!linkToken && !isInitializing) {
      initializeLink()
    }
  }, [ready, linkToken, open, isInitializing, initializeLink])

  if (children) {
    return (
      <div
        onClick={handleClick}
        style={{ cursor: (ready && linkToken) ? 'pointer' : 'not-allowed' }}
      >
        {children}
      </div>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={!ready || !linkToken || isLoading || isInitializing}
      variant="outline"
      className="w-full"
    >
      {(isLoading || isInitializing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <Shield className="mr-2 h-4 w-4" />
      Verify with Plaid (Secure)
    </Button>
  )
}

export function DebitCardSelectionModal({
  open,
  onOpenChange,
  onSuccess
}: DebitCardSelectionModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [verificationMethod, setVerificationMethod] = useState<'manual' | 'plaid'>('plaid')
  const { addToast } = useToast()

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    // Card number validation (16 digits)
    if (!formData.cardNumber || !/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number must be 16 digits'
    }

    // Expiry validation
    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiryMonth = 'Expiry date is required'
    } else {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1
      const expiryYear = parseInt(formData.expiryYear)
      const expiryMonth = parseInt(formData.expiryMonth)

      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        newErrors.expiryMonth = 'Card has expired'
      }
    }

    // CVV validation (3-4 digits)
    if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3-4 digits'
    }

    // Cardholder name validation
    if (!formData.cardholderName || formData.cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Cardholder name is required'
    }

    // Card type validation
    if (!formData.cardType) {
      newErrors.cardType = 'Card type is required'
    }

    // Address validation
    if (!formData.street || formData.street.trim().length < 5) {
      newErrors.street = 'Street address is required'
    }
    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = 'City is required'
    }
    if (!formData.state || formData.state.trim().length < 2) {
      newErrors.state = 'State is required'
    }
    if (!formData.zip || !/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      newErrors.zip = 'Valid ZIP code is required'
    }
    if (!formData.country || formData.country.trim().length < 2) {
      newErrors.country = 'Country is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value)
    handleInputChange('cardNumber', formatted)
  }

  const addDebitCard = async () => {
    if (verificationMethod === 'manual' && !validateForm()) {
      return
    }

    setLoading(true)

    try {
      const cardNumberClean = formData.cardNumber.replace(/\s/g, '')
      const maskedCardNumber = `****${cardNumberClean.slice(-4)}`

      const response = await apiClient.createPaymentMethod({
        type: 'debit_card',
        card_holder_name: formData.cardholderName,
        card_number_masked: maskedCardNumber,
        expiry_month: parseInt(formData.expiryMonth),
        expiry_year: parseInt(formData.expiryYear),
        card_type: formData.cardType,
        status: 'active'
      })

      if (response.error) {
        throw new Error(response.error)
      }

      addToast({
        title: "Success",
        description: "Debit card added successfully",
        variant: "default",
      })

      setFormData(initialFormData)
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add debit card:', error)
      addToast({
        title: "Error",
        description: "Failed to add debit card",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlaidSuccess = useCallback((publicToken: string, metadata: any) => {
    console.log('Plaid debit card verification successful:', publicToken, metadata)
    addToast({
      title: "Success",
      description: "Debit card verified and added successfully",
      variant: "default",
    })
    onSuccess?.()
    onOpenChange(false)
  }, [addToast, onSuccess, onOpenChange])

  const handlePlaidExit = useCallback((error: any) => {
    if (error) {
      console.error('Plaid debit card verification failed:', error)
      addToast({
        title: "Verification Failed",
        description: "Debit card verification was cancelled or failed",
        variant: "destructive",
      })
    }
  }, [addToast])

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => (currentYear + i).toString())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">Add Debit Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Verification Method Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Verification Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={verificationMethod === 'plaid' ? 'default' : 'outline'}
                onClick={() => setVerificationMethod('plaid')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Shield className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Secure Verification</span>
                <span className="text-xs text-muted-foreground">via Plaid</span>
              </Button>
              <Button
                type="button"
                variant={verificationMethod === 'manual' ? 'default' : 'outline'}
                onClick={() => setVerificationMethod('manual')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Manual Entry</span>
                <span className="text-xs text-muted-foreground">Enter details</span>
              </Button>
            </div>
          </div>

          {verificationMethod === 'plaid' ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Secure Debit Card Verification</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your bank account securely to verify and add your debit card.
                  Your financial data is protected and encrypted.
                </p>
                <PlaidDebitCardLink
                  onSuccess={handlePlaidSuccess}
                  onExit={handlePlaidExit}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {/* Card Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Card Details</h3>

                <div className="grid gap-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    maxLength={19}
                  />
                  {errors.cardNumber && (
                    <p className="text-sm text-destructive">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = (i + 1).toString().padStart(2, '0')
                          return (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expiryYear">Year</Label>
                    <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
                </div>
                {errors.expiryMonth && (
                  <p className="text-sm text-destructive">{errors.expiryMonth}</p>
                )}
                {errors.cvv && (
                  <p className="text-sm text-destructive">{errors.cvv}</p>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={formData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  />
                  {errors.cardholderName && (
                    <p className="text-sm text-destructive">{errors.cardholderName}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cardType">Card Type</Label>
                  <Select value={formData.cardType} onValueChange={(value) => handleInputChange('cardType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="american_express">American Express</SelectItem>
                      <SelectItem value="discover">Discover</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.cardType && (
                    <p className="text-sm text-destructive">{errors.cardType}</p>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Billing Address</h3>

                <div className="grid gap-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    placeholder="123 Main Street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                  />
                  {errors.street && (
                    <p className="text-sm text-destructive">{errors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      placeholder="10001"
                      value={formData.zip}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                    />
                    {errors.zip && (
                      <p className="text-sm text-destructive">{errors.zip}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="United States"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                    />
                    {errors.country && (
                      <p className="text-sm text-destructive">{errors.country}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {verificationMethod === 'manual' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addDebitCard}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Debit Card'
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
