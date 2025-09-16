'use client';
import dynamic from 'next/dynamic';
import type { Complaint } from '@/app/employee/dashboard/page';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const EmployeeDashboardContent = dynamic(
  () => import('./employee-dashboard-content').then((mod) => mod.EmployeeDashboardContent),
  {
    ssr: false,
    loading: () => (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between space-y-2">
            <Skeleton className="h-9 w-64" />
             <Skeleton className="h-10 w-28" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
             <Skeleton className="h-24" />
             <Skeleton className="h-24" />
             <Skeleton className="h-24" />
          </div>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
             <Skeleton className="col-span-4 h-96" />
             <Skeleton className="col-span-3 h-96" />
           </div>
            <Skeleton className="mt-4 h-[400px]" />
        </div>
      ),
  }
);

export function EmployeeDashboardClientOnly({ complaints }: { complaints: Complaint[] }) {
  return <EmployeeDashboardContent initialComplaints={complaints} />;
}
