import { Suspense } from 'react'
import { CheckEmailPage } from "@/components/check-email-page"

export default function CheckEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckEmailPage />
    </Suspense>
  )
}
