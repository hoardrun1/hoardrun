"use client"

import { useState } from "react"
import { Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl" />
          <CardTitle className="text-2xl font-bold">Welcome to HoardRun</CardTitle>
          <CardDescription className="text-lg">
            Sign in to your Account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="name@example.com"
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-12 text-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="text-right">
                <Button
                  variant="link"
                  className="text-sm font-normal text-muted-foreground hover:text-blue-600 p-0 h-auto"
                >
                  Forgot password?
                </Button>
              </div>
            </div>
          </div>

          <Button className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white">
            Sign In
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            <Button variant="outline" className="h-12 text-base font-normal">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
            <Button variant="outline" className="h-12 text-base font-normal">
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Continue with Facebook
            </Button>
            <Button variant="outline" className="h-12 text-base font-normal">
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.7 17.3L17 14.6C16.5 14.1 15.8 13.9 15.2 14L14.1 15.1C14 15.2 13.9 15.2 13.7 15.1C12.3 14.4 11 13.1 10.3 11.7C10.2 11.5 10.2 11.4 10.3 11.3L11.4 10.2C11.5 9.6 11.3 8.9 10.8 8.4L8.1 5.7C7.4 5 6.3 5 5.6 5.6L4.4 6.8C3.6 7.6 3.2 8.7 3.3 9.8C3.6 12.8 5.1 15.7 7.4 18C9.7 20.3 12.6 21.8 15.6 22.1H15.9C16.9 22.1 17.9 21.7 18.6 21L19.8 19.8C20.5 19.1 20.5 18 19.7 17.3Z" />
              </svg>
              Continue with Phone
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>{" "}
            <Button variant="link" className="p-0 h-auto font-normal text-blue-600 hover:text-blue-700">
              Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

