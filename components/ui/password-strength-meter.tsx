'use client'

import { useState, useEffect } from 'react'
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle } from 'lucide-react'

interface PasswordRequirement {
  label: string
  validator: (password: string) => boolean
}

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0)
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    {
      label: "At least 12 characters long",
      validator: (pass) => pass.length >= 12
    },
    {
      label: "Contains uppercase letter",
      validator: (pass) => /[A-Z]/.test(pass)
    },
    {
      label: "Contains lowercase letter",
      validator: (pass) => /[a-z]/.test(pass)
    },
    {
      label: "Contains number",
      validator: (pass) => /[0-9]/.test(pass)
    },
    {
      label: "Contains special character",
      validator: (pass) => /[^A-Za-z0-9]/.test(pass)
    }
  ])

  useEffect(() => {
    const calculateStrength = () => {
      const passedRequirements = requirements.filter(req => req.validator(password))
      return (passedRequirements.length / requirements.length) * 100
    }
    setStrength(calculateStrength())
  }, [password, requirements])

  const getStrengthColor = () => {
    if (strength <= 20) return "bg-gray-300"
    if (strength <= 40) return "bg-gray-400"
    if (strength <= 60) return "bg-gray-500"
    if (strength <= 80) return "bg-gray-600"
    return "bg-gray-800"
  }

  return (
    <div className={className}>
      <Progress 
        value={strength} 
        className={`h-2 ${getStrengthColor()}`}
      />
      <div className="mt-2 space-y-1">
        {requirements.map((req, index) => (
          <div 
            key={index} 
            className="flex items-center text-sm"
          >
            {req.validator(password) ? (
              <CheckCircle2 className="h-4 w-4 text-gray-800 dark:text-gray-200 mr-2" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-300 mr-2" />
            )}
            <span className={req.validator(password) ? "text-gray-800 dark:text-gray-200" : "text-gray-500"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
