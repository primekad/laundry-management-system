"use client"

import React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Mail, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormFieldError } from "@/components/ui/form-field-error"

import { login } from "@/app/(auth)/login/login-actions"
import { LoginState } from "@/app/(auth)/auth-v-types"
import { LoginSchema } from "@/app/(auth)/auth-schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useServerActionForm } from "@/hooks/use-server-action-form"

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
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

type LoginFormValues = z.infer<typeof LoginSchema>

export function LoginForm() {
  const initialState: LoginState = { message: null, errors: {}, success: false }
  
  const { form, state, isPending, onSubmit, getFieldError } = useServerActionForm<LoginFormValues>({
    action: login,
    initialState,
    formOptions: {
      resolver: zodResolver(LoginSchema),
      defaultValues: {
        email: "",
        password: "",
        rememberMe: false,
      },
      mode: "onTouched",
    }
  })
  
  const emailError = getFieldError("email")
  const passwordError = getFieldError("password")

  return (
    <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        {state.errors?.form && state.errors.form.map((formError: string) => (
          <Alert key={formError} variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ))}
        {state.message && !state.success && !state.errors?.form && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                defaultValue={state.email}
                placeholder="name@example.com"
                className="pl-10 bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                aria-describedby={emailError.hasError ? "email-error" : undefined}
              />
            </div>
            <FormFieldError
              id="email-error"
              clientError={emailError.clientError}
              serverErrors={emailError.serverErrors}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                {...form.register("password")}
                type="password"
                placeholder="••••••••"
                className="pl-10 bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                aria-describedby={passwordError.hasError ? "password-error" : undefined}
                data-testid="password-input"
              />
            </div>
            <FormFieldError
              id="password-error"
              clientError={passwordError.clientError}
              serverErrors={passwordError.serverErrors}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              {...form.register("rememberMe")}
              id="remember"
              data-testid="remember-checkbox"
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>

          <SubmitButton isPending={isPending} />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-center text-sm text-slate-600 mt-2">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Contact your administrator
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
