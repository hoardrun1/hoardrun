'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthDebugPage() {
  const { data: session, status } = useSession() || { data: null, status: 'loading' }

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
            <CardDescription>Test NextAuth Google integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Status:</strong> {status}
            </div>
            
            {session ? (
              <div className="space-y-4">
                <div>
                  <strong>User:</strong> {session.user?.name}
                </div>
                <div>
                  <strong>Email:</strong> {session.user?.email}
                </div>
                <div>
                  <strong>Image:</strong> {session.user?.image}
                </div>
                <Button onClick={() => signOut()}>Sign Out</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p>Not signed in</p>
                <div className="space-y-2">
                  <Button onClick={() => signIn('google')}>
                    Sign in with Google
                  </Button>
                  <Button onClick={() => signIn('credentials')} variant="outline">
                    Sign in with Credentials
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded">
              <strong>Environment Check:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || 'Not set'}</li>
                <li>Current URL: {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</li>
                <li>Expected Redirect URI: {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/google` : 'Loading...'}</li>
                <li>Google Client ID: {process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set'}</li>
                <li>Google Client Secret: {process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set'}</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded">
              <strong>Google OAuth Setup Instructions:</strong>
              <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
                <li>Create or select a project</li>
                <li>Enable Google+ API or Google Identity API</li>
                <li>Go to "APIs & Services" → "Credentials"</li>
                <li>Create "OAuth 2.0 Client IDs" for "Web application"</li>
                <li>Add this redirect URI: <code className="bg-gray-200 px-1 rounded">{typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/google` : 'Loading...'}</code></li>
                <li>Copy Client ID and Secret to your .env.local file</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
