'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Users, Building, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sidebar } from '@/components/ui/sidebar';
import { LayoutWrapper } from '@/components/ui/layout-wrapper';

export default function TransferPage() {
  const [transferType, setTransferType] = useState<'send' | 'receive'>('send');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const transferOptions = [
    {
      id: 'bank',
      title: 'Bank Transfer',
      description: 'Transfer to any bank account',
      icon: Building,
      fee: 'Free',
    },
    {
      id: 'card',
      title: 'Card Transfer',
      description: 'Transfer to debit/credit card',
      icon: CreditCard,
      fee: '$2.99',
    },
    {
      id: 'contact',
      title: 'Send to Contact',
      description: 'Send money to your contacts',
      icon: Users,
      fee: 'Free',
    },
  ];

  return (
    <LayoutWrapper className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Sidebar />

      <div className="container mx-auto px-4 lg:px-6 py-6 max-w-4xl ml-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Money Transfer
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Send and receive money quickly and securely
            </p>
          </div>

          {/* Transfer Type Toggle */}
          <div className="mb-8">
            <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1 w-fit">
              <button
                onClick={() => setTransferType('send')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  transferType === 'send'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                Send Money
              </button>
              <button
                onClick={() => setTransferType('receive')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  transferType === 'receive'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <ArrowDownRight className="h-4 w-4" />
                Receive Money
              </button>
            </div>
          </div>

          {transferType === 'send' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Transfer Options */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Choose Transfer Method
                </h2>
                <div className="space-y-4">
                  {transferOptions.map((option) => (
                    <Card key={option.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                            <option.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {option.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {option.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-green-600">
                              {option.fee}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Transfer Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Send Money</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-2xl font-bold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipient">Recipient</Label>
                      <Input
                        id="recipient"
                        placeholder="Email or phone number"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="note">Note (Optional)</Label>
                      <Input
                        id="note"
                        placeholder="What's this for?"
                      />
                    </div>
                    <Button className="w-full" size="lg">
                      Send ${amount || '0.00'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Receive Money</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowDownRight className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Share Your Details</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Share your email or phone number to receive money
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                    <p className="font-mono text-lg">user@example.com</p>
                  </div>
                  <Button variant="outline">
                    Share Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </LayoutWrapper>
  );
}
