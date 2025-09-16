import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // This is a temporary fix to allow the app to work with the new middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          const newResponse = NextResponse.next();
          newResponse.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          const newResponse = NextResponse.next();
          newResponse.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // If the user is trying to access employee routes
  if (pathname.startsWith('/employee')) {
    // and they are not authenticated, redirect to the login page
    if (!session && pathname !== '/employee/login' && pathname !== '/employee/signup') {
      const url = request.nextUrl.clone();
      url.pathname = '/employee/login';
      return NextResponse.redirect(url);
    }
    // and they are authenticated but on the login/signup page, redirect to the dashboard
    else if (session && (pathname === '/employee/login' || pathname === '/employee/signup')) {
      const url = request.nextUrl.clone();
      url.pathname = '/employee/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // update the session for the next request
  return await updateSession(request);
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
