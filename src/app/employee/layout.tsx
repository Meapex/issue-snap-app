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
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
         if (window.location.pathname !== '/employee/login' && window.location.pathname !== '/employee/signup') {
            router.push('/employee/login');
        }
      }
      setLoading(false);
      if (!sessionChecked) {
        setSessionChecked(true);
      }
    });

    // Initial check in case the auth state is already settled
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
       if (!session) {
         if (window.location.pathname !== '/employee/login' && window.location.pathname !== '/employee/signup') {
            router.push('/employee/login');
        }
      }
      setLoading(false);
       if (!sessionChecked) {
        setSessionChecked(true);
      }
    })();


    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase, sessionChecked]);

  if (loading || !sessionChecked) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}
