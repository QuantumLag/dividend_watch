import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Supabase redirects here after Google/GitHub OAuth and after email confirmation.
// It exchanges the one-time code for a session and sets the auth cookies.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Where to send the user after a successful login.
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — send them home with an error flag.
  return NextResponse.redirect(`${origin}/?error=auth`)
}
