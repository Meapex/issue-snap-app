
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function login(
  formData: z.infer<typeof loginSchema>
): Promise<{ error: string | null }> {
  const validatedFields = loginSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      error: 'Invalid email or password.',
    };
  }

  const { email, password } = validatedFields.data;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  // No redirect here, the client will handle it.
  return { error: null };
}
