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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       if (!session && pathname !== '/employee/login' && pathname !== '/employee/signup') {
        router.push('/employee/login');
      } else {
        setIsLoading(false);
      }
    });

    // Also check session on initial load, in case auth state change is not fired
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
       if (!session && pathname !== '/employee/login' && pathname !== '/employee/signup') {
        router.push('/employee/login');
      } else {
        setIsLoading(false);
      }
    };
    checkSession();


    return () => {
      subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
