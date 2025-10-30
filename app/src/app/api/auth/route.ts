import { NextResponse } from 'next/server'

// Set your password here or use environment variable
const SITE_PASSWORD = process.env.SITE_PASSWORD || 'your-password-here'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password === SITE_PASSWORD) {
      const response = NextResponse.json({ success: true })
      
      // Set authentication cookie
      response.cookies.set('authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return response
    }

    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    )
  }
}
