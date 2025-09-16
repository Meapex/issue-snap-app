'use client';

import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If on a protected route and no session, redirect to login.
      if (!session && pathname !== '/employee/login' && pathname !== '/employee/signup') {
        router.replace('/employee/login');
      } else {
        setIsLoading(false);
      }
    };

    // Run the check on initial load.
    checkSession();

    // Listen for auth changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // If a session appears and we're on login/signup, redirect to dashboard.
      if (session && (pathname === '/employee/login' || pathname === '/employee/signup')) {
        router.replace('/employee/dashboard');
      }
      // If the session disappears and we are on a protected route, redirect to login.
      else if (!session && pathname !== '/employee/login' && pathname !== '/employee/signup') {
        router.replace('/employee/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  // We only want to run this on mount and when the path changes.
  // The onAuthStateChange handles all subsequent auth updates.
  }, [pathname, router, supabase.auth]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}
