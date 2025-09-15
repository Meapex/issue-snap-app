'use client';

import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        // If there's no session, redirect to login.
        // The check against the current path prevents a redirect loop on the login page itself.
        if (window.location.pathname !== '/employee/login' && window.location.pathname !== '/employee/signup') {
            router.push('/employee/login');
        }
      }
      setLoading(false);
    });

    // Perform an initial session check
    const checkInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            if (window.location.pathname !== '/employee/login' && window.location.pathname !== '/employee/signup') {
                router.push('/employee/login');
            }
        }
        setLoading(false);
    }
    checkInitialSession();


    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}
