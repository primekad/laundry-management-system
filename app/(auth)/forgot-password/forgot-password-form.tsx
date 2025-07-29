"use client"

import React, { useActionState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle, Loader2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { requestPasswordReset } from "./forgot-password-actions"
import { RequestPasswordResetState } from "@/app/(auth)/auth-v-types";

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button
      type="submit"
      className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
      disabled={isPending}
      size="lg"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        "Send Reset Link"
      )}
    </Button>
  )
}

export function ForgotPasswordForm() {
  const initialState: RequestPasswordResetState = {
    message: null,
    errors: {},
    success: false,
  }
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState
  )

  return (
    <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="text-xl font-semibold">
          Forgot Your Password?
        </CardTitle>
        <CardDescription>
          No problem. Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.message && (
          <Alert
            variant={state.success ? "default" : "destructive"}
            className="mb-6"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {!state.success && (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                  aria-describedby="email-error"
                />
              </div>
              {state.errors?.email && (
                <div
                  id="email-error"
                  aria-live="polite"
                  className="text-xs text-red-500 mt-1"
                >
                  {state.errors.email.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <SubmitButton isPending={pending} />
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-center text-sm text-slate-600 mt-2">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
