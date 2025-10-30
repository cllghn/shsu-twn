import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Delete the authentication cookie
  response.cookies.delete('authenticated')
  
  return response
}
