'use client'

import { useState } from 'react'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSidebarPage() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Sidebar Test Page
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Test the new sidebar layout that pushes content instead of overlaying
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sidebar Behavior</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click the hamburger menu button to open/close the sidebar. 
                    Notice how the content moves to make space for the sidebar instead of being overlaid.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Responsive Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    On desktop, the content shifts to the right when sidebar opens. 
                    On mobile, the sidebar overlays with a backdrop.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Smooth Animation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The sidebar and content transitions are smooth and use consistent easing curves 
                    for a premium feel.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This content area demonstrates how the layout adapts when the sidebar is open. 
                    The content remains fully accessible and readable.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the sidebar to navigate between different pages. 
                    The active page is highlighted with a white background.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Money</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click the "Add Money" button in the sidebar to test the deposit modal functionality.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional content to show scrolling behavior */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Additional Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle>Content Block {i + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        This is additional content to demonstrate how the layout handles 
                        longer pages with scrolling. The sidebar behavior remains consistent 
                        regardless of content length.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
