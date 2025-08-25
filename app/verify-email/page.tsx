import { Suspense } from 'react'
import { CheckEmailPage } from "@/components/verify-email-page"

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckEmailPage />
    </Suspense>
  )
}