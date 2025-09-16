'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      error: {
        message: 'Email and password are required.',
      },
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: {
        message: error.message,
      },
    };
  }

  // On success, redirect from the server.
  // The client will not need to handle success navigation.
  redirect('/employee/dashboard');
}
