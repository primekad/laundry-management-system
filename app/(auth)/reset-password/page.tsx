import React, { Suspense } from "react"
import { ResetPasswordForm } from "./reset-password-form"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
