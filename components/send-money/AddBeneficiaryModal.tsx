import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, Building2, Hash, Mail, Phone } from 'lucide-react'
import { useBeneficiaries } from '@/hooks/useBeneficiaries'

const COUNTRIES = [
  ['GH', 'Ghana'], ['KE', 'Kenya'], ['NG', 'Nigeria'], ['TZ', 'Tanzania'], ['UG', 'Uganda'], ['ZA', 'South Africa'],
  ['EG', 'Egypt'], ['US', 'United States'], ['CA', 'Canada'], ['GB', 'United Kingdom'], ['DE', 'Germany'],
  ['FR', 'France'], ['AU', 'Australia'], ['JP', 'Japan'], ['CN', 'China'], ['IN', 'India'], ['BR', 'Brazil'], ['MX', 'Mexico'],
]

interface AddBeneficiaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddBeneficiaryModal({ open, onOpenChange, onSuccess }: AddBeneficiaryModalProps) {
  const { addBeneficiary } = useBeneficiaries()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!name.trim() || !accountNumber.trim() || !bankName.trim() || !addressLine1.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
        throw new Error('Please fill in all the required fields')
      }

      const result = await addBeneficiary({
        name: name.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim(),
        bankCode: bankCode.trim() || undefined,
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim().toUpperCase(),
      })

      if (!result) {
        throw new Error('Failed to add beneficiary')
      }

      // Reset form
      setName('')
      setAccountNumber('')
      setBankName('')
      setBankCode('')
      setEmail('')
      setPhoneNumber('')
      setAddressLine1('')
      setCity('')
      setPostalCode('')
      setCountry('')

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add beneficiary'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setName('')
      setAccountNumber('')
      setBankName('')
      setBankCode('')
      setEmail('')
      setPhoneNumber('')
      setAddressLine1('')
      setCity('')
      setPostalCode('')
      setCountry('')
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Beneficiary
          </DialogTitle>
          <DialogDescription>
            Save someone you send money to. Their account number is encrypted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter beneficiary's full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="accountNumber"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Bank Name */}
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="bankName"
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Enter bank name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Bank Code */}
            <div className="space-y-2">
              <Label htmlFor="bankCode">Bank Code (Optional)</Label>
              <Input
                id="bankCode"
                type="text"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                placeholder="Enter bank code"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Their address *</Label>
              <Input
                id="addressLine1"
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={50}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal code *</Label>
                <Input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  maxLength={20}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Country *</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(([code, label]) => (
                    <SelectItem key={code} value={code}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim() || !accountNumber.trim() || !bankName.trim() || !addressLine1.trim() || !city.trim() || !postalCode.trim() || !country}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Beneficiary'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
