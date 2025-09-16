'use client';
import dynamic from 'next/dynamic';
import type { Complaint } from '@/app/employee/dashboard/page';
import { Loader2 } from 'lucide-react';

const EmployeeDashboardContent = dynamic(
  () => import('./employee-dashboard-content').then((mod) => mod.EmployeeDashboardContent),
  {
    ssr: false,
    loading: () => (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      ),
  }
);

export function EmployeeDashboardClientOnly({ complaints }: { complaints: Complaint[] }) {
  return <EmployeeDashboardContent initialComplaints={complaints} />;
}
