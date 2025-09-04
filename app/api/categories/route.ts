import { NextResponse } from 'next/server'

// Mock categories data
const mockCategories = [
  {
    id: '1',
    name: 'Food & Dining',
    icon: 'utensils',
    color: 'red',
    amount: 720,
    percentage: 90,
    trend: 5,
    transactions: 45
  },
  {
    id: '2',
    name: 'Transportation',
    icon: 'car',
    color: 'blue',
    amount: 380,
    percentage: 76,
    trend: -2,
    transactions: 23
  },
  {
    id: '3',
    name: 'Entertainment',
    icon: 'gamepad2',
    color: 'green',
    amount: 420,
    percentage: 140,
    trend: 15,
    transactions: 18
  },
  {
    id: '4',
    name: 'Shopping',
    icon: 'shopping-cart',
    color: 'purple',
    amount: 350,
    percentage: 87.5,
    trend: -8,
    transactions: 32
  },
  {
    id: '5',
    name: 'Healthcare',
    icon: 'heart',
    color: 'yellow',
    amount: 150,
    percentage: 75,
    trend: 3,
    transactions: 8
  },
  {
    id: '6',
    name: 'Housing',
    icon: 'home',
    color: 'indigo',
    amount: 1850,
    percentage: 92.5,
    trend: 1,
    transactions: 12
  }
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return NextResponse.json({
      success: true,
      data: mockCategories,
      total: mockCategories.length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newCategory = {
      id: Date.now().toString(),
      name: body.name,
      icon: body.icon || 'folder',
      color: body.color || '#666666',
      budgeted: body.budgeted || 0,
      spent: 0,
      percentage: 0,
      transactions: 0
    }
    
    return NextResponse.json({
      success: true,
      data: newCategory
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
