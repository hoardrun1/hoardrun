import { NextResponse } from 'next/server'

// Mock transactions data
const mockTransactions = [
  {
    id: '1',
    description: 'Grocery Store - Whole Foods',
    amount: -125.50,
    category: 'Food & Dining',
    date: '2024-01-15T10:30:00Z',
    type: 'expense',
    merchant: 'Whole Foods Market',
    account: 'Checking Account',
    status: 'completed',
    tags: ['groceries', 'food'],
    location: 'New York, NY'
  },
  {
    id: '2',
    description: 'Salary Deposit',
    amount: 4250.00,
    category: 'Income',
    date: '2024-01-15T09:00:00Z',
    type: 'income',
    merchant: 'ABC Corporation',
    account: 'Checking Account',
    status: 'completed',
    tags: ['salary', 'income'],
    location: null
  },
  {
    id: '3',
    description: 'Gas Station - Shell',
    amount: -45.20,
    category: 'Transportation',
    date: '2024-01-14T16:45:00Z',
    type: 'expense',
    merchant: 'Shell Gas Station',
    account: 'Credit Card',
    status: 'completed',
    tags: ['gas', 'transportation'],
    location: 'Brooklyn, NY'
  },
  {
    id: '4',
    description: 'Netflix Subscription',
    amount: -15.99,
    category: 'Entertainment',
    date: '2024-01-14T12:00:00Z',
    type: 'expense',
    merchant: 'Netflix',
    account: 'Credit Card',
    status: 'completed',
    tags: ['subscription', 'entertainment'],
    location: null
  },
  {
    id: '5',
    description: 'Coffee Shop - Starbucks',
    amount: -8.75,
    category: 'Food & Dining',
    date: '2024-01-13T08:15:00Z',
    type: 'expense',
    merchant: 'Starbucks',
    account: 'Debit Card',
    status: 'completed',
    tags: ['coffee', 'food'],
    location: 'Manhattan, NY'
  },
  {
    id: '6',
    description: 'Online Transfer to Savings',
    amount: -500.00,
    category: 'Transfer',
    date: '2024-01-12T14:30:00Z',
    type: 'transfer',
    merchant: 'Internal Transfer',
    account: 'Checking Account',
    status: 'completed',
    tags: ['savings', 'transfer'],
    location: null
  },
  {
    id: '7',
    description: 'Pharmacy - CVS',
    amount: -32.45,
    category: 'Healthcare',
    date: '2024-01-11T11:20:00Z',
    type: 'expense',
    merchant: 'CVS Pharmacy',
    account: 'Credit Card',
    status: 'completed',
    tags: ['pharmacy', 'healthcare'],
    location: 'Queens, NY'
  },
  {
    id: '8',
    description: 'Uber Ride',
    amount: -18.50,
    category: 'Transportation',
    date: '2024-01-10T19:45:00Z',
    type: 'expense',
    merchant: 'Uber',
    account: 'Credit Card',
    status: 'completed',
    tags: ['rideshare', 'transportation'],
    location: 'Manhattan, NY'
  },
  {
    id: '9',
    description: 'Amazon Purchase',
    amount: -67.99,
    category: 'Shopping',
    date: '2024-01-09T15:30:00Z',
    type: 'expense',
    merchant: 'Amazon',
    account: 'Credit Card',
    status: 'completed',
    tags: ['online', 'shopping'],
    location: null
  },
  {
    id: '10',
    description: 'Freelance Payment',
    amount: 750.00,
    category: 'Income',
    date: '2024-01-08T10:00:00Z',
    type: 'income',
    merchant: 'XYZ Client',
    account: 'Checking Account',
    status: 'completed',
    tags: ['freelance', 'income'],
    location: null
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Simple auth check - in a real app, this would validate JWT tokens
    const authHeader = request.headers.get('authorization')
    if (!authHeader && !process.env.NODE_ENV?.includes('development')) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      )
    }

    let filteredTransactions = [...mockTransactions]

    // Apply filters
    if (category) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.category.toLowerCase().includes(category.toLowerCase())
      )
    }

    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type)
    }

    if (startDate) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) >= new Date(startDate)
      )
    }

    if (endDate) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) <= new Date(endDate)
      )
    }

    // Apply pagination
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return NextResponse.json({
      success: true,
      data: paginatedTransactions,
      pagination: {
        total: filteredTransactions.length,
        limit,
        offset,
        hasMore: offset + limit < filteredTransactions.length
      },
      summary: {
        totalIncome: filteredTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: Math.abs(filteredTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)),
        netAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newTransaction = {
      id: Date.now().toString(),
      description: body.description,
      amount: body.amount,
      category: body.category,
      date: body.date || new Date().toISOString(),
      type: body.amount > 0 ? 'income' : 'expense',
      merchant: body.merchant || 'Manual Entry',
      account: body.account || 'Checking Account',
      status: 'completed',
      tags: body.tags || [],
      location: body.location || null
    }
    
    return NextResponse.json({
      success: true,
      data: newTransaction
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
