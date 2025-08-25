'use client'

import { useState } from 'react'
import { X, Filter, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CircleFilters, InvestmentCategory } from '@/types/collective-capital'

interface CircleFiltersPanelProps {
  filters: CircleFilters
  onFiltersChange: (filters: CircleFilters) => void
  onClose: () => void
}

export function CircleFiltersPanel({ filters, onFiltersChange, onClose }: CircleFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<CircleFilters>(filters)

  const categories: { value: InvestmentCategory; label: string }[] = [
    { value: 'STOCKS', label: 'Stocks' },
    { value: 'CRYPTO', label: 'Cryptocurrency' },
    { value: 'REAL_ESTATE', label: 'Real Estate' },
    { value: 'GREEN_TECH', label: 'Green Technology' },
    { value: 'AI_TECH', label: 'AI & Technology' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'ENERGY', label: 'Energy' },
    { value: 'BONDS', label: 'Bonds' },
    { value: 'COMMODITIES', label: 'Commodities' },
    { value: 'STARTUPS', label: 'Startups' }
  ]

  const riskLevels = [
    { value: 'LOW', label: 'Low Risk (0-30)' },
    { value: 'MODERATE', label: 'Moderate Risk (31-60)' },
    { value: 'HIGH', label: 'High Risk (61-80)' },
    { value: 'VERY_HIGH', label: 'Very High Risk (81-100)' }
  ]

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'PENDING', label: 'Pending' }
  ]

  const updateLocalFilters = (field: keyof CircleFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleCategoryChange = (category: InvestmentCategory, checked: boolean) => {
    const currentCategories = localFilters.category || []
    if (checked) {
      updateLocalFilters('category', [...currentCategories, category])
    } else {
      updateLocalFilters('category', currentCategories.filter(c => c !== category))
    }
  }

  const handleRiskLevelChange = (riskLevel: string, checked: boolean) => {
    const currentRiskLevels = localFilters.riskLevel || []
    if (checked) {
      updateLocalFilters('riskLevel', [...currentRiskLevels, riskLevel])
    } else {
      updateLocalFilters('riskLevel', currentRiskLevels.filter(r => r !== riskLevel))
    }
  }

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = localFilters.status || []
    if (checked) {
      updateLocalFilters('status', [...currentStatuses, status])
    } else {
      updateLocalFilters('status', currentStatuses.filter(s => s !== status))
    }
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const resetFilters = () => {
    const emptyFilters: CircleFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.category?.length) count++
    if (localFilters.minPoolValue || localFilters.maxPoolValue) count++
    if (localFilters.memberCount?.min || localFilters.memberCount?.max) count++
    if (localFilters.returns?.min || localFilters.returns?.max) count++
    if (localFilters.riskLevel?.length) count++
    if (localFilters.status?.length) count++
    return count
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Investment Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Investment Categories</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {categories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={category.value}
                  checked={localFilters.category?.includes(category.value) || false}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={category.value} 
                  className="text-sm cursor-pointer"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Pool Value Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Pool Value Range</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Minimum ($)</Label>
              <Slider
                value={[localFilters.minPoolValue || 0]}
                onValueChange={([value]) => updateLocalFilters('minPoolValue', value)}
                min={0}
                max={1000000}
                step={10000}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                ${(localFilters.minPoolValue || 0).toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Maximum ($)</Label>
              <Slider
                value={[localFilters.maxPoolValue || 1000000]}
                onValueChange={([value]) => updateLocalFilters('maxPoolValue', value)}
                min={0}
                max={1000000}
                step={10000}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                ${(localFilters.maxPoolValue || 1000000).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Member Count Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Member Count</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Minimum</Label>
              <Slider
                value={[localFilters.memberCount?.min || 1]}
                onValueChange={([value]) => 
                  updateLocalFilters('memberCount', { 
                    ...localFilters.memberCount, 
                    min: value 
                  })
                }
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                {localFilters.memberCount?.min || 1} members
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Maximum</Label>
              <Slider
                value={[localFilters.memberCount?.max || 100]}
                onValueChange={([value]) => 
                  updateLocalFilters('memberCount', { 
                    ...localFilters.memberCount, 
                    max: value 
                  })
                }
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                {localFilters.memberCount?.max || 100} members
              </div>
            </div>
          </div>
        </div>

        {/* Returns Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Expected Returns (%)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Minimum</Label>
              <Slider
                value={[localFilters.returns?.min || 0]}
                onValueChange={([value]) => 
                  updateLocalFilters('returns', { 
                    ...localFilters.returns, 
                    min: value 
                  })
                }
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                {localFilters.returns?.min || 0}%
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Maximum</Label>
              <Slider
                value={[localFilters.returns?.max || 50]}
                onValueChange={([value]) => 
                  updateLocalFilters('returns', { 
                    ...localFilters.returns, 
                    max: value 
                  })
                }
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                {localFilters.returns?.max || 50}%
              </div>
            </div>
          </div>
        </div>

        {/* Risk Levels */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Risk Levels</Label>
          <div className="grid grid-cols-2 gap-2">
            {riskLevels.map((risk) => (
              <div key={risk.value} className="flex items-center space-x-2">
                <Checkbox
                  id={risk.value}
                  checked={localFilters.riskLevel?.includes(risk.value) || false}
                  onCheckedChange={(checked) => 
                    handleRiskLevelChange(risk.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={risk.value} 
                  className="text-sm cursor-pointer"
                >
                  {risk.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Circle Status</Label>
          <div className="flex gap-2">
            {statusOptions.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={status.value}
                  checked={localFilters.status?.includes(status.value) || false}
                  onCheckedChange={(checked) => 
                    handleStatusChange(status.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={status.value} 
                  className="text-sm cursor-pointer"
                >
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={applyFilters}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
