"use client"

import React, { useActionState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

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
import { AlertCircle, Loader2, Lock, Receipt, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { resetPassword, type ResetPasswordState } from "./action"

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
          Resetting Password...
        </>
      ) : (
        "Reset Password"
      )}
    </Button>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const initialState: ResetPasswordState = {
    message: null,
    errors: {},
    success: false,
  }
  const [state, formAction, pending] = useActionState(resetPassword, initialState)

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Password reset token is missing or invalid. Please request a new reset
          link.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80 w-full max-w-md">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="text-xl font-semibold">Set a New Password</CardTitle>
        <CardDescription>
          Choose a strong password to protect your account.
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

        {state.success ? (
          <Button asChild className="w-full">
            <Link href="/login">Proceed to Sign In</Link>
          </Button>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                  aria-describedby="password-error"
                />
              </div>
              {state.errors?.password && (
                <div
                  id="password-error"
                  aria-live="polite"
                  className="text-xs text-red-500 mt-1"
                >
                  {state.errors.password.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                  aria-describedby="passwordConfirmation-error"
                />
              </div>
              {state.errors?.passwordConfirmation && (
                <div
                  id="passwordConfirmation-error"
                  aria-live="polite"
                  className="text-xs text-red-500 mt-1"
                >
                  {state.errors.passwordConfirmation.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <SubmitButton isPending={pending} />
          </form>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-slate-600 w-full">
          Need help?{" "}
          <Link
            href="/support"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Contact Support
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-slate-100">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-25"></div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Logo and branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl mb-4">
              <Receipt className="h-8 w-8" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                LaundroTrack
              </h1>
              <p className="text-slate-600 flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                An efficient laundry management system
              </p>
            </div>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.05)'%3e%3cpath d='m0 .5h32m-32 32v-32'/%3e%3c/svg%3e");
        }
      `}</style>
    </div>
  )
}
