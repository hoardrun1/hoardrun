'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendTestEmail = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-email');
      const data = await response.json();
      
      setResult({
        success: data.success,
        message: data.success 
          ? `Email sent successfully to ${data.recipient}` 
          : `Failed to send email: ${data.error || 'Unknown error'}`
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Email Configuration</h1>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">About This Page</h2>
            <p className="text-blue-700 text-sm">
              This page allows you to test your Mailgun email configuration. When you click the button below, 
              a test email will be sent to the recipient configured in your environment variables.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input 
                id="recipient" 
                type="email" 
                placeholder="Enter recipient email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                disabled={true}
              />
              <p className="text-sm text-gray-500 mt-1">
                Using recipient from environment variables. To change, update MAILGUN_RECIPIENT in .env.local
              </p>
            </div>
            
            <Button 
              onClick={handleSendTestEmail} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Test Email'
              )}
            </Button>
          </div>
          
          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <AlertDescription>{result.message}</AlertDescription>
              </div>
            </Alert>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Mailgun Sandbox Instructions</h2>
            <p className="text-sm text-gray-600 mb-2">
              When using a Mailgun sandbox domain:
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>You can only send to authorized recipients</li>
              <li>Go to your Mailgun dashboard and add authorized recipients</li>
              <li>Make sure to add your API key to the .env.local file</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
