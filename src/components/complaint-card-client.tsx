
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import type { Complaint } from '@/app/employee/dashboard/page';
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const [reportedDate, setReportedDate] = useState<string | null>(null);
  const [resolvedDate, setResolvedDate] = useState<string | null>(null);

  useEffect(() => {
    // This will only run on the client, preventing hydration mismatch
    setReportedDate(formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true }));
    if (complaint.resolved_at) {
      setResolvedDate(formatDistanceToNow(new Date(complaint.resolved_at), { addSuffix: true }));
    }
  }, [complaint.created_at, complaint.resolved_at]);

  const getStatusVariant = () => {
    switch (complaint.status) {
      case 'New':
        return 'secondary';
      case 'In Progress':
        return 'outline';
      case 'Resolved':
        return 'default';
      case 'Denied':
        return 'destructive';
      default:
        return 'secondary';
    }
  };


  return (
    <Card className="w-full overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-40 w-full">
        <Image
          src={complaint.image_url}
          alt={complaint.issue}
          fill
          className="object-cover"
        />
        {complaint.resolution_image_url && (
            <div className="absolute top-2 right-2">
                <Badge variant='default' className='bg-green-100 text-green-800 border-green-200'>Resolved</Badge>
            </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
            <Badge variant="outline">{complaint.category || 'Other'}</Badge>
            <Badge variant={getStatusVariant()}>{complaint.status}</Badge>
        </div>
        <p className="font-semibold text-foreground mb-2 leading-tight">{complaint.issue}</p>
        <p className="text-sm text-muted-foreground mb-3">
          {complaint.location_description}
        </p>
        <div className="text-xs text-muted-foreground" suppressHydrationWarning>
            {reportedDate ? `Reported ${reportedDate}` : 'Loading...'}
        </div>
        {complaint.resolved_at && (
            <div className="text-xs text-green-600 mt-1" suppressHydrationWarning>
            {resolvedDate ? `Resolved ${resolvedDate}` : ''}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
