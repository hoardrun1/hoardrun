import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Mock beneficiaries data for now
    const mockBeneficiaries = [
      {
        id: '1',
        name: 'John Doe',
        accountNumber: '1234567890',
        bankName: 'Sample Bank',
        email: 'john@example.com',
        phone: '+1234567890',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Jane Smith',
        accountNumber: '0987654321',
        bankName: 'Another Bank',
        email: 'jane@example.com',
        phone: '+0987654321',
        createdAt: new Date().toISOString(),
      },
    ]

    // Simulate pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedBeneficiaries = mockBeneficiaries.slice(startIndex, endIndex)

    return NextResponse.json({
      beneficiaries: paginatedBeneficiaries,
      pagination: {
        page,
        limit,
        total: mockBeneficiaries.length,
        totalPages: Math.ceil(mockBeneficiaries.length / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching beneficiaries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch beneficiaries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock creating a beneficiary
    const newBeneficiary = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(newBeneficiary, { status: 201 })
  } catch (error) {
    console.error('Error creating beneficiary:', error)
    return NextResponse.json(
      { error: 'Failed to create beneficiary' },
      { status: 500 }
    )
  }
}
