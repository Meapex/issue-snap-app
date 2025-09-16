'use client';

import dynamic from 'next/dynamic';
import type { Complaint } from '@/app/employee/dashboard/page';
import { Skeleton } from './ui/skeleton';

const ComplaintCard = dynamic(
  () => import('./complaint-card-client').then((mod) => mod.ComplaintCard),
  {
    ssr: false,
    loading: () => <ComplaintCardSkeleton />,
  }
);

export function ComplaintCardClientOnly({ complaint }: { complaint: Complaint }) {
  return <ComplaintCard complaint={complaint} />;
}


function ComplaintCardSkeleton() {
    return (
      <div className="p-4 border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3 mt-2" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-1">
               <span className="text-xs font-semibold text-muted-foreground">
                Issue
              </span>
              <Skeleton className="w-[150px] h-[100px] rounded-md" />
            </div>
             <div className="flex flex-col items-center gap-1">
               <span className="text-xs font-semibold text-muted-foreground">
                Resolution
              </span>
              <Skeleton className="w-[150px] h-[100px] rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
