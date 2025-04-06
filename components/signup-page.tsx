'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { navigation } from '@/lib/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  UserIcon,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import Image from 'next/image'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import ApiTestSimple from "@/components/api-test-simple"

export function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      console.log('Submitting signup form:', {
        name: formData.name,
        email: formData.email,
        password: '********' // Don't log actual password
      });

      // First, test if the API endpoint is working with a simple GET request
      console.log('Testing API endpoint with GET request...');
      const testResponse = await fetch('/api/auth/signup');
      const testData = await testResponse.text();
      console.log('GET test response:', testData);

      // Now try the actual POST request
      console.log('Sending POST request...');
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Get the response as text first for debugging
      const responseText = await response.text();
      console.log('Response text:', responseText);

      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed JSON data:', data);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Server returned invalid JSON');
      }

      // Show success message
      addToast({
        title: "Success",
        description: "Account created successfully. Please check your email."
      });

      // Connect to check email page
      navigation.connect('signup', 'check-email', { email: formData.email });
      router.push('/check-email');
    } catch (error) {
      setError(error instanceof Error ? error.message : "Signup failed");
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Signup failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Implement social login logic
    console.log(`Logging in with ${provider}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900">
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Updated Logo and Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Begin Your Financial Journey</h1>
            <p className="mt-2 text-blue-200">Experience next-generation mobile banking with AI-powered security</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-8">
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 border-gray-200"
              onClick={() => handleSocialLogin('google')}
            >
              <Image
                src="/google-icon.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 border-gray-200"
              onClick={() => handleSocialLogin('apple')}
            >
              <Image
                src="/apple-icon.svg"
                alt="Apple"
                width={20}
                height={20}
                className="mr-2"
              />
              Continue with Apple
            </Button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 h-12 bg-white border-gray-200"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 h-12 bg-white border-gray-200"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10 h-12 bg-white border-gray-200"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10 h-12 bg-white border-gray-200"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* API Test Component for Debugging */}
          <div className="mt-8 p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-semibold mb-2">API Test Tool</h3>
            <p className="text-sm text-gray-500 mb-4">Use this to test if the API endpoints are working</p>
            <ApiTestSimple />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SignupPage
