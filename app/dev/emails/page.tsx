'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Email {
  id: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  sentAt: Date;
}

export default function DevEmailsPage() {
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const fetchEmails = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/dev/emails?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearEmails = async () => {
    setLoading(true);
    try {
      await fetch(`/api/dev/emails?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });
      setEmails([]);
      setSelectedEmail(null);
    } catch (error) {
      console.error('Error clearing emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Development Email Viewer</h1>
      
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={fetchEmails} disabled={loading || !email}>
            {loading ? 'Loading...' : 'View Emails'}
          </Button>
          <Button 
            variant="destructive" 
            onClick={clearEmails} 
            disabled={loading || !email || emails.length === 0}
          >
            Clear Emails
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Enter the email address you used during signup to view verification emails
        </p>
      </div>
      
      {emails.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Emails ({emails.length})</h2>
            <div className="space-y-2">
              {emails.map((email) => (
                <div 
                  key={email.id}
                  className={`p-3 rounded-md cursor-pointer ${selectedEmail?.id === email.id ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => handleSelectEmail(email)}
                >
                  <div className="font-medium">{email.subject}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(email.sentAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2 border rounded-lg p-4">
            {selectedEmail ? (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">{selectedEmail.subject}</h2>
                  <div className="text-sm text-gray-500">
                    To: {selectedEmail.to} | 
                    Sent: {new Date(selectedEmail.sentAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="mb-2 flex justify-between">
                    <h3 className="font-medium">Email Content:</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(selectedEmail.html);
                          newWindow.document.close();
                        }
                      }}
                    >
                      Open in New Tab
                    </Button>
                  </div>
                  <div className="border rounded-md p-4 bg-white">
                    <iframe
                      srcDoc={selectedEmail.html}
                      className="w-full min-h-[400px] border-0"
                      title="Email Preview"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select an email to view its content
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          {email ? (
            <p>No emails found for {email}</p>
          ) : (
            <p>Enter an email address and click "View Emails" to see any verification emails</p>
          )}
        </div>
      )}
    </div>
  );
}
