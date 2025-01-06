'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, User, Lock, CreditCard, HelpCircle, LogOut, Loader2, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SettingsPageComponent() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [securityScore, setSecurityScore] = useState(75)
  const { toast } = useToast()

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
    document.documentElement.classList.toggle('dark', !isDarkMode)
  }

  const handleSaveChanges = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Changes saved successfully",
        description: "Your settings have been updated.",
        duration: 3000,
      })
    } catch (_error) {
      toast({
        title: "Error saving changes",
        description: "Please try again later.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden font-bold sm:inline-block"
              >
                Hoardrun
              </motion.span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="transition-colors hover:text-blue-600">Home</Link>
              <Link href="/finance" className="transition-colors hover:text-blue-600">Finance</Link>
              <Link href="/cards" className="transition-colors hover:text-blue-600">Cards</Link>
              <Link href="/investment" className="transition-colors hover:text-blue-600">Investment</Link>
              <Link href="/settings" className="text-blue-600">Settings</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search settings" 
                  className="pl-8 transition-all focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="transition-transform hover:scale-110"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="transition-transform hover:scale-110"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full transition-transform hover:scale-110"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="@johndoe" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Lock className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-8"
        >
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Security Score</CardTitle>
              <CardDescription>Your account security status</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={securityScore} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground">
                Your account is {securityScore}% secure. Complete the recommended actions to improve your security.
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
              <TabsTrigger value="account" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Account</TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Security</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Notifications</TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Billing</TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Support</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="account">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Update your account details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                          id="name" 
                          defaultValue="John Doe" 
                          className="transition-all focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          defaultValue="john@example.com" 
                          className="transition-all focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input 
                          id="bio" 
                          className="transition-all focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <Button 
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving changes...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Add other TabsContent for security, notifications, billing, and support here */}
              </motion.div>
            </AnimatePresence>
          </Tabs>

          <div className="flex justify-end">
            <Button 
              variant="destructive"
              className="group hover:bg-red-700 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform" />
              Log Out
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}