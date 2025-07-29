"use client"

import React from "react"
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
import { AlertCircle, Loader2, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormFieldError } from "@/components/ui/form-field-error"

import { resetPassword } from "./reset-password-actions"
import { ResetPasswordState } from "@/app/(auth)/auth-v-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useServerActionForm } from "@/hooks/use-server-action-form"

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
    passwordConfirmation: z.string(),
    token: z.string().min(1, { message: "Reset token is required." }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

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

type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const initialState: ResetPasswordState = { 
    message: null, 
    errors: {}, 
    success: false 
  }

  const { form, state, isPending, onSubmit, getFieldError } = useServerActionForm<ResetPasswordFormValues>({
    action: resetPassword,
    initialState,
    formOptions: {
      resolver: zodResolver(ResetPasswordSchema),
      defaultValues: {
        password: "",
        passwordConfirmation: "",
        token: token || "",
      },
    },
  })

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
          <form onSubmit={onSubmit} className="space-y-4">
            <input type="hidden" {...form.register("token")} />
            
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  {...form.register("password")}
                  aria-describedby="password-error"
                />
              </div>
              <FormFieldError clientError={getFieldError("password")?.clientError} serverErrors={getFieldError("password")?.serverErrors} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="passwordConfirmation"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  {...form.register("passwordConfirmation")}
                  aria-describedby="passwordConfirmation-error"
                />
              </div>
              <FormFieldError clientError={getFieldError("passwordConfirmation")?.clientError} serverErrors={getFieldError("passwordConfirmation")?.serverErrors} />
            </div>

            <SubmitButton isPending={isPending} />
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
