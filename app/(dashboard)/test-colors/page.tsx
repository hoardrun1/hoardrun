'use client'

import { useState } from 'react'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Home, 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  PieChart,
  BarChart3
} from 'lucide-react'

export default function TestColorsPage() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-white p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Black & White Color Test
                </h1>
                <p className="text-black/60 mt-1">
                  Testing the monochrome color scheme across all components
                </p>
              </div>
              <Button className="bg-black text-white hover:bg-black/90">
                Test Button
              </Button>
            </div>

            {/* Color Palette Display */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Color Palette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-black rounded-lg"></div>
                    <p className="text-sm text-black font-medium">Black (#000000)</p>
                    <p className="text-xs text-black/60">Primary, Text, Icons</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-black/80 rounded-lg"></div>
                    <p className="text-sm text-black font-medium">Black 80%</p>
                    <p className="text-xs text-black/60">Secondary Elements</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-black/60 rounded-lg"></div>
                    <p className="text-sm text-black font-medium">Black 60%</p>
                    <p className="text-xs text-black/60">Muted Text</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-white border border-black/20 rounded-lg"></div>
                    <p className="text-sm text-black font-medium">White (#FFFFFF)</p>
                    <p className="text-xs text-black/60">Background, Cards</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Component Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black">Total Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-black/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">$12,345.67</div>
                  <p className="text-xs text-black/60">+2.5% from last month</p>
                  <Progress value={75} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black">Investments</CardTitle>
                  <TrendingUp className="h-4 w-4 text-black/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">$8,901.23</div>
                  <p className="text-xs text-black/60">Portfolio value</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="bg-black/10 text-black">Stocks</Badge>
                    <Badge variant="secondary" className="bg-black/10 text-black">Bonds</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black">Cards</CardTitle>
                  <CreditCard className="h-4 w-4 text-black/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">3</div>
                  <p className="text-xs text-black/60">Active cards</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-black/60">Visa ****1234</span>
                      <span className="text-black">$2,456</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Button Variations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Button Variations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-black text-white hover:bg-black/90">
                    Primary Button
                  </Button>
                  <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                    Outline Button
                  </Button>
                  <Button variant="ghost" className="text-black hover:bg-black/10">
                    Ghost Button
                  </Button>
                  <Button variant="secondary" className="bg-black/10 text-black hover:bg-black/20">
                    Secondary Button
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Typography Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Typography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-black">Heading 1</h1>
                  <h2 className="text-3xl font-bold text-black">Heading 2</h2>
                  <h3 className="text-2xl font-bold text-black">Heading 3</h3>
                  <h4 className="text-xl font-bold text-black">Heading 4</h4>
                </div>
                <div>
                  <p className="text-black">Regular paragraph text in black</p>
                  <p className="text-black/80">Secondary text at 80% opacity</p>
                  <p className="text-black/60">Muted text at 60% opacity</p>
                  <p className="text-black/40">Subtle text at 40% opacity</p>
                </div>
              </CardContent>
            </Card>

            {/* Icon Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Icons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-black" />
                    <span className="text-black">Home</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-black/80" />
                    <span className="text-black/80">Trending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-black/60" />
                    <span className="text-black/60">Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-black/40" />
                    <span className="text-black/40">Reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Status & Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Badge className="bg-black text-white">Active</Badge>
                  <Badge variant="secondary" className="bg-black/10 text-black">Pending</Badge>
                  <Badge variant="outline" className="border-black text-black">Completed</Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                    <span className="text-black">Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-black/40 rounded-full"></div>
                    <span className="text-black/60">Offline</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
