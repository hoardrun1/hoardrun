'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Lock, Globe, Target, Clock, 
  Percent, DollarSign, Shield, Sparkles,
  Info, AlertCircle, CheckCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { InvestmentCategory } from '@/types/collective-capital'

interface CreateCircleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface CircleFormData {
  name: string
  description: string
  category: InvestmentCategory | ''
  isPrivate: boolean
  maxMembers: number
  minimumContribution: number
  votingThreshold: number
  proposalDuration: number
  autoDistribution: boolean
  blockchainNetwork: 'ETHEREUM' | 'POLYGON' | 'BSC'
}

export function CreateCircleModal({ open, onOpenChange, onSuccess }: CreateCircleModalProps) {
  const [formData, setFormData] = useState<CircleFormData>({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    maxMembers: 25,
    minimumContribution: 50,
    votingThreshold: 60,
    proposalDuration: 72,
    autoDistribution: true,
    blockchainNetwork: 'ETHEREUM'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const { addToast } = useToast()

  const categories: { value: InvestmentCategory; label: string; description: string }[] = [
    { value: 'STOCKS', label: 'Stocks', description: 'Traditional equity investments' },
    { value: 'CRYPTO', label: 'Cryptocurrency', description: 'Digital assets and tokens' },
    { value: 'REAL_ESTATE', label: 'Real Estate', description: 'Property and REITs' },
    { value: 'GREEN_TECH', label: 'Green Technology', description: 'Sustainable and clean energy' },
    { value: 'AI_TECH', label: 'AI & Technology', description: 'Artificial intelligence and tech' },
    { value: 'HEALTHCARE', label: 'Healthcare', description: 'Medical and biotech companies' },
    { value: 'ENERGY', label: 'Energy', description: 'Oil, gas, and renewable energy' },
    { value: 'BONDS', label: 'Bonds', description: 'Fixed income securities' },
    { value: 'COMMODITIES', label: 'Commodities', description: 'Gold, silver, and raw materials' },
    { value: 'STARTUPS', label: 'Startups', description: 'Early-stage companies' }
  ]

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.category) {
      addToast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // API call to create circle
      await new Promise(resolve => setTimeout(resolve, 2000)) // Mock delay
      
      addToast({
        title: "Success!",
        description: "Your investment circle has been created successfully",
      })
      
      onSuccess()
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to create investment circle",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof CircleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Circle Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Green Tech Pioneers"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe your investment focus and strategy..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Investment Category *</Label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <Card
              key={category.value}
              className={`cursor-pointer transition-all ${
                formData.category === category.value
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => updateFormData('category', category.value)}
            >
              <CardContent className="p-3">
                <div className="font-medium text-sm">{category.label}</div>
                <div className="text-xs text-gray-500">{category.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Privacy Settings</Label>
          <p className="text-sm text-gray-500">
            Private circles require approval to join
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Globe className={`h-4 w-4 ${!formData.isPrivate ? 'text-green-500' : 'text-gray-400'}`} />
          <Switch
            checked={formData.isPrivate}
            onCheckedChange={(checked) => updateFormData('isPrivate', checked)}
          />
          <Lock className={`h-4 w-4 ${formData.isPrivate ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Maximum Members: {formData.maxMembers}</Label>
        <Slider
          value={[formData.maxMembers]}
          onValueChange={([value]) => updateFormData('maxMembers', value)}
          min={5}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>5 members</span>
          <span>100 members</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minContribution">Minimum Contribution ($)</Label>
        <Input
          id="minContribution"
          type="number"
          placeholder="50"
          value={formData.minimumContribution}
          onChange={(e) => updateFormData('minimumContribution', parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <Label>Blockchain Network</Label>
        <Select
          value={formData.blockchainNetwork}
          onValueChange={(value) => updateFormData('blockchainNetwork', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ETHEREUM">Ethereum (ETH)</SelectItem>
            <SelectItem value="POLYGON">Polygon (MATIC)</SelectItem>
            <SelectItem value="BSC">Binance Smart Chain (BNB)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Voting Threshold: {formData.votingThreshold}%</Label>
        <p className="text-sm text-gray-500">
          Percentage of votes needed to approve investments
        </p>
        <Slider
          value={[formData.votingThreshold]}
          onValueChange={([value]) => updateFormData('votingThreshold', value)}
          min={50}
          max={90}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>50% (Simple majority)</span>
          <span>90% (Super majority)</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Proposal Duration: {formData.proposalDuration} hours</Label>
        <p className="text-sm text-gray-500">
          How long members have to vote on proposals
        </p>
        <Slider
          value={[formData.proposalDuration]}
          onValueChange={([value]) => updateFormData('proposalDuration', value)}
          min={24}
          max={168}
          step={24}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>24h</span>
          <span>7 days</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Auto-Distribution</Label>
          <p className="text-sm text-gray-500">
            Automatically distribute returns to members
          </p>
        </div>
        <Switch
          checked={formData.autoDistribution}
          onCheckedChange={(checked) => updateFormData('autoDistribution', checked)}
        />
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Smart Contract Deployment
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your circle will be deployed as a smart contract on {formData.blockchainNetwork} 
                for transparent and immutable record keeping.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Create Investment Circle
          </DialogTitle>
          <DialogDescription>
            Set up your collective investment circle with customizable parameters
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 py-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step
                )}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1)
                } else {
                  onOpenChange(false)
                }
              }}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button
              onClick={() => {
                if (currentStep < 3) {
                  setCurrentStep(currentStep + 1)
                } else {
                  handleSubmit()
                }
              }}
              disabled={isLoading || (currentStep === 1 && (!formData.name || !formData.description || !formData.category))}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  Creating...
                </>
              ) : currentStep === 3 ? (
                'Create Circle'
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
