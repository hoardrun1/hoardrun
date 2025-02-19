export interface PasswordRequirement {
  label: string
  validator: (password: string) => boolean
}

export class PasswordValidationService {
  static readonly requirements: PasswordRequirement[] = [
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
  ]

  static validatePassword(password: string): {
    isValid: boolean
    score: number
    failedRequirements: string[]
  } {
    const failedRequirements: string[] = []
    let passedCount = 0

    this.requirements.forEach(req => {
      if (!req.validator(password)) {
        failedRequirements.push(req.label)
      } else {
        passedCount++
      }
    })

    const score = (passedCount / this.requirements.length) * 100

    return {
      isValid: failedRequirements.length === 0,
      score,
      failedRequirements
    }
  }
} 