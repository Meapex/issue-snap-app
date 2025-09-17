
import { createClient } from '@/lib/supabase/server';
import { EmployeeDashboardClientOnly } from '@/components/employee-dashboard-client-only';

export type Complaint = {
  id: string;
  complaint_number: number;
  issue: string;
  location_description: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Denied';
  image_url: string;
  created_at: string;
  latitude: number;
  longitude: number;
  category: string;
  department: string;
  resolution_image_url: string | null;
  resolved_at: string | null;
};

export default async function EmployeeDashboard() {
  const supabase = createClient();
    const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching complaints:', error);
        return (
            <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
                <p className="text-destructive">Error loading complaints.</p>
            </main>
        );
    }

  return <EmployeeDashboardClientOnly complaints={data as Complaint[]} />;
}
