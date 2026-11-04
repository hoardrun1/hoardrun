import { NextRequest } from 'next/server'

import { API_BASE_URL } from '@/lib/api-url'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    const backendUrl = `${API_BASE_URL}/cards${searchParams ? `?${searchParams}` : ''}`
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Cards API proxy error:', error)
    return Response.json(
      { error: 'Failed to fetch cards data' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${API_BASE_URL}/cards`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Cards API proxy error:', error)
    return Response.json(
      { error: 'Failed to create card' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    const backendUrl = `${API_BASE_URL}/cards${searchParams ? `?${searchParams}` : ''}`
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Cards API proxy error:', error)
    return Response.json(
      { error: 'Failed to update card' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    const backendUrl = `${API_BASE_URL}/cards${searchParams ? `?${searchParams}` : ''}`
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Cards API proxy error:', error)
    return Response.json(
      { error: 'Failed to delete card' }, 
      { status: 500 }
    )
  }
}
