'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  FingerprintIcon,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  QrCode,
  Smartphone,
  Mail,
  Lock
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check if biometric authentication is available
    const checkBiometricAvailability = async () => {
      try {
        // This is a simplified check - in a real app, you'd use the Web Authentication API
        const available = 'PublicKeyCredential' in window;
        setBiometricAvailable(available);
      } catch (error) {
        console.error('Error checking biometric availability:', error);
        setBiometricAvailable(false);
      }
    };

    checkBiometricAvailability();

    // Check for verification success in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const email = urlParams.get('email');
    const error = urlParams.get('error');

    if (verified === 'true' && email) {
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully. You can now sign in.",
        duration: 5000
      });

      // Pre-fill the email field
      setFormData(prev => ({ ...prev, email }));
    } else if (error === 'verification_failed') {
      toast({
        title: "Verification Failed",
        description: "There was a problem verifying your email. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    }

    // Clean up URL parameters
    if (verified || error) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [toast]);

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (data.requiresVerification) {
        router.push('/verify-signin');
      } else {
        router.push('/home');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Store necessary data for verification
      if (data.requiresVerification) {
        sessionStorage.setItem('auth_email', formData.email);
        sessionStorage.setItem('temp_token', data.tempToken);
        router.push('/verify-signin');
      } else {
        router.push('/home');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-black to-blue-900">
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-black/40 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/10"
        >
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Welcome Back
            </motion.h1>
            <p className="mt-2 text-blue-200">Sign in to access your account</p>
          </div>

          <div className="space-y-4 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20 flex items-center justify-center gap-2"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <Image
                src="/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20 flex items-center justify-center gap-2"
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
            >
              <Image
                src="/apple.svg"
                alt="Apple"
                width={20}
                height={20}
                className="mr-2"
              />
              Continue with Apple
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/40 px-2 text-gray-400">Or continue with</span>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 gap-4 bg-white/5 p-1 rounded-lg">
              <TabsTrigger value="email" className="text-white data-[state=active]:bg-blue-600">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="qr" className="text-white data-[state=active]:bg-blue-600">
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="mobile" className="text-white data-[state=active]:bg-blue-600">
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox id="remember" className="border-white/20" />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="qr">
              <div className="text-center py-8">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <QrCode className="w-32 h-32 text-blue-600" />
                </div>
                <p className="text-gray-300">Scan with mobile app to sign in</p>
              </div>
            </TabsContent>

            <TabsContent value="mobile">
              <div className="space-y-4">
                <Input
                  type="tel"
                  placeholder="Phone number"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Send Code
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-300">
            <span>New to Hoardrun?</span>{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default SignInPage;
