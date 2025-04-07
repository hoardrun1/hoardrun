'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cog, Mail, X, Send } from 'lucide-react';

export function DevToolbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-all"
        title="Development Tools"
      >
        {isOpen ? <X size={20} /> : <Cog size={20} />}
      </button>

      {/* Toolbar panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-amber-500 text-white p-3">
            <h3 className="font-medium">Development Tools</h3>
          </div>

          <div className="p-3 space-y-2">
            <Link
              href="/dev/emails"
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md text-sm"
            >
              <Mail size={16} />
              <span>View Development Emails</span>
            </Link>

            <Link
              href="/test-email"
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md text-sm"
            >
              <Send size={16} />
              <span>Test Mailgun Email</span>
            </Link>

            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded-md">
              These tools are only visible in development mode
            </div>
          </div>
        </div>
      )}
    </>
  );
}
