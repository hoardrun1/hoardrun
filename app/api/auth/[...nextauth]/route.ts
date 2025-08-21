// NextAuth.js disabled - using Firebase Auth instead
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    error: 'NextAuth.js disabled - using Firebase Authentication'
  }, { status: 404 })
}

export async function POST() {
  return NextResponse.json({
    error: 'NextAuth.js disabled - using Firebase Authentication'
  }, { status: 404 })
}