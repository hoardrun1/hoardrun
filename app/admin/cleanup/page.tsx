'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { auth } from '@/lib/firebase-config'
import { deleteUser, signOut } from 'firebase/auth'

export default function CleanupPage() {
  const [isClearing, setIsClearing] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const { addToast } = useToast()

  const clearLocalStorage = () => {
    try {
      // Clear all auth-related data from localStorage
      const keysToRemove = [
        'token',
        'refresh_token', 
        'user',
        'auth_token',
        'firebase_user',
        'verification_token'
      ]
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Clear sessionStorage too
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key)
      })
      
      setResults(prev => [...prev, '✅ Local storage cleared'])
      return true
    } catch (error) {
      setResults(prev => [...prev, `❌ Error clearing local storage: ${error}`])
      return false
    }
  }

  const signOutCurrentUser = async () => {
    try {
      if (auth?.currentUser) {
        await signOut(auth)
        setResults(prev => [...prev, '✅ Signed out current user'])
        return true
      } else {
        setResults(prev => [...prev, '✅ No user currently signed in'])
        return true
      }
    } catch (error) {
      setResults(prev => [...prev, `❌ Error signing out: ${error}`])
      return false
    }
  }

  const deleteCurrentUser = async () => {
    try {
      if (auth?.currentUser) {
        await deleteUser(auth.currentUser)
        setResults(prev => [...prev, '✅ Deleted current Firebase user'])
        return true
      } else {
        setResults(prev => [...prev, '✅ No user to delete'])
        return true
      }
    } catch (error) {
      setResults(prev => [...prev, `❌ Error deleting user: ${error}`])
      return false
    }
  }

  const clearBrowserData = () => {
    try {
      // Clear cookies (limited by same-origin policy)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      setResults(prev => [...prev, '✅ Browser cookies cleared'])
      return true
    } catch (error) {
      setResults(prev => [...prev, `❌ Error clearing cookies: ${error}`])
      return false
    }
  }

  const performFullCleanup = async () => {
    setIsClearing(true)
    setResults([])
    
    try {
      setResults(['🧹 Starting cleanup process...'])
      
      // Step 1: Sign out current user
      await signOutCurrentUser()
      
      // Step 2: Clear local storage
      clearLocalStorage()
      
      // Step 3: Clear browser data
      clearBrowserData()
      
      // Step 4: Try to delete current user (might fail if already signed out)
      try {
        await deleteCurrentUser()
      } catch (error) {
        setResults(prev => [...prev, '⚠️ Could not delete user (probably already signed out)'])
      }
      
      setResults(prev => [...prev, '🎉 Cleanup completed successfully!'])
      
      addToast({
        title: "Cleanup Complete",
        description: "All local data has been cleared. You can now test fresh signup/signin.",
      })
      
    } catch (error) {
      setResults(prev => [...prev, `❌ Cleanup failed: ${error}`])
      addToast({
        title: "Cleanup Failed",
        description: "Some cleanup operations failed. Check the results below.",
      })
    } finally {
      setIsClearing(false)
    }
  }

  const refreshPage = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-red-500" />
              Firebase Cleanup Utility
            </CardTitle>
            <CardDescription className="text-gray-300">
              Clear all authentication data and local storage for fresh testing
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-yellow-600 bg-yellow-900/20">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                <strong>Warning:</strong> This will delete all local authentication data and sign you out. 
                Use this only for testing purposes.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">What will be cleared:</h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>Current Firebase authentication session</li>
                <li>Local storage (tokens, user data)</li>
                <li>Session storage</li>
                <li>Browser cookies</li>
                <li>Current Firebase user account (if possible)</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={performFullCleanup}
                disabled={isClearing}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Start Cleanup
                  </>
                )}
              </Button>

              <Button 
                onClick={refreshPage}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Cleanup Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                <div className="space-y-1 font-mono text-sm">
                  {results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`${
                        result.includes('✅') ? 'text-green-400' :
                        result.includes('❌') ? 'text-red-400' :
                        result.includes('⚠️') ? 'text-yellow-400' :
                        result.includes('🎉') ? 'text-blue-400' :
                        'text-gray-300'
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
