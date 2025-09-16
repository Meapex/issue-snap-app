import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // This `updateSession` function is what refreshes the user's session cookie.
  const response = await updateSession(request);

  // We need to create a new client to check the session on the server.
  // We can't use the one from `updateSession` because the response object has been modified.
   const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    }
  )

  const { data: { session }} = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  
  // Define protected routes for employees
  const isEmployeeRoute = pathname.startsWith('/employee');
  const isAuthRoute = pathname === '/employee/login' || pathname === '/employee/signup';
  
  // If trying to access a protected employee route without a session, redirect to login.
  if (isEmployeeRoute && !isAuthRoute && !session) {
    return NextResponse.redirect(new URL('/employee/login', request.url));
  }
  
  // If trying to access login/signup page with a session, redirect to dashboard.
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/employee/dashboard', request.url));
  }

  // Otherwise, continue with the response, which includes the updated session cookie.
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
