import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // This will refresh the session cookie if it's expired.
  const response = await updateSession(request);

  // We are using a new client here because we want to get the session from the updated request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Protected employee routes
  if (pathname.startsWith('/employee')) {
    // If no session, and not on login/signup, redirect to login
    if (!session && pathname !== '/employee/login' && pathname !== '/employee/signup') {
      const url = request.nextUrl.clone();
      url.pathname = '/employee/login';
      return NextResponse.redirect(url);
    }
    // If there is a session and user is on login/signup, redirect to dashboard
    else if (session && (pathname === '/employee/login' || pathname === '/employee/signup')) {
      const url = request.nextUrl.clone();
      url.pathname = '/employee/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Return the response from updateSession which contains the updated cookies
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
